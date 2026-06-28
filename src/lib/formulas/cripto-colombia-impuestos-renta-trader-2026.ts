export interface Inputs {
  monto_compra: number;
  monto_venta: number;
  fees_compra: number;
  fees_venta: number;
  tipo_operacion: 'ocasional' | 'frecuente';
  renta_anual_otros: number;
  retension_plataforma: boolean;
}

export interface Outputs {
  costo_total: number;
  ingreso_neto: number;
  ganancia_bruta: number;
  retension_valor: number;
  base_gravable: number;
  impuesto_causado: number;
  impuesto_neto: number;
  rentabilidad_neta: number;
  clasificacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).retension_plataforma = (i as any).retension_plataforma === true || (i as any).retension_plataforma === 'true';
  // Constantes 2026 DIAN
  // Fuente: DIAN Resolución tarifa renta 2026
  const TARIFA_GO = 0.10; // Ganancia ocasional: 10%
  const TASA_RETENCION = 0.004; // Retención plataforma: 0.4%
  
  // Tramos de renta progresiva 2026 Colombia
  // Fuente: Ministerio de Hacienda - Resolución 4 de 2023
  const TRAMOS_RENTA = [
    { limite: 40600000, tasa: 0.0 },
    { limite: 75100000, tasa: 0.08 },
    { limite: 148200000, tasa: 0.14 },
    { limite: 207500000, tasa: 0.17 },
    { limite: 414600000, tasa: 0.26 },
    { limite: 622900000, tasa: 0.33 },
    { limite: 932800000, tasa: 0.35 },
    { limite: 1865500000, tasa: 0.37 },
    { limite: Infinity, tasa: 0.39 }
  ];

  // 1. Costo total
  const costo_total = i.monto_compra + i.fees_compra;

  // 2. Retención en plataforma (0.4% del monto de venta)
  const retension_valor = i.retension_plataforma ? i.monto_venta * TASA_RETENCION : 0;

  // 3. Ingreso neto
  const ingreso_neto = i.monto_venta - i.fees_venta - retension_valor;

  // 4. Ganancia bruta
  const ganancia_bruta = ingreso_neto - costo_total;

  // 5. Base gravable según tipo de operación
  let base_gravable = 0;
  let clasificacion = '';
  
  if (i.tipo_operacion === 'ocasional') {
    // Ganancia ocasional: base es la ganancia bruta
    base_gravable = Math.max(0, ganancia_bruta);
    clasificacion = 'Ganancia ocasional';
  } else {
    // Renta ordinaria: ganancia + otros ingresos
    base_gravable = Math.max(0, ganancia_bruta + i.renta_anual_otros);
    clasificacion = 'Renta ordinaria (trading frecuente)';
  }

  // 6. Cálculo de impuesto según tipo de operación
  let impuesto_causado = 0;

  if (i.tipo_operacion === 'ocasional') {
    // GO: 10% fijo
    impuesto_causado = base_gravable * TARIFA_GO;
  } else {
    // Renta ordinaria: tarifa progresiva 2026
    impuesto_causado = calcularImpuestoProgresivo(base_gravable, TRAMOS_RENTA);
  }

  // 7. Impuesto neto (después retención)
  const impuesto_neto = impuesto_causado - retension_valor;

  // 8. Rentabilidad neta (%)
  let rentabilidad_neta = 0;
  if (costo_total > 0) {
    const utilidad_neta = ingreso_neto - costo_total - Math.max(0, impuesto_neto);
    rentabilidad_neta = (utilidad_neta / costo_total) * 100;
  }

  const gananciaBrutaR = Math.round(ganancia_bruta * 100) / 100;
  const impCausadoR = Math.round(impuesto_causado * 100) / 100;
  const impNetoR = Math.round(impuesto_neto * 100) / 100;
  const rentR = Math.round(rentabilidad_neta * 100) / 100;
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const ocasional = i.tipo_operacion === 'ocasional';

  let insightTexto: string;
  let insightTono: 'good' | 'warn' | 'neutral';
  if (gananciaBrutaR <= 0) {
    insightTono = 'warn';
    insightTexto = `La operación cierra sin ganancia (**${fmtCOP(gananciaBrutaR)}**): no se genera impuesto, pero tampoco utilidad sobre los ${fmtCOP(costo_total)} invertidos.`;
  } else if (ocasional) {
    insightTono = 'good';
    insightTexto = `Como **ganancia ocasional** tributás el **10%**: **${fmtCOP(impCausadoR)}** sobre una utilidad de ${fmtCOP(gananciaBrutaR)}, para una rentabilidad neta del **${rentR}%**.`;
  } else {
    insightTono = 'warn';
    insightTexto = `Como **renta ordinaria** (trading frecuente) tu ganancia se suma a los demás ingresos y tributa por tabla progresiva: **${fmtCOP(impCausadoR)}** de impuesto causado, rentabilidad neta **${rentR}%**.`;
  }

  // Donut sólo cuando el impuesto causado es atribuible a esta ganancia (no arrastra renta de otros ingresos)
  const teQueda = gananciaBrutaR - impCausadoR;
  const _chart =
    gananciaBrutaR > 0 && impCausadoR >= 0 && teQueda >= 0
      ? {
          type: 'doughnut',
          slices: [
            { label: 'Utilidad después de impuesto', value: teQueda },
            { label: 'Impuesto causado', value: impCausadoR },
          ].filter((s) => s.value > 0),
          prefix: '$',
          centerValue: fmtCOP(gananciaBrutaR),
          centerLabel: 'Ganancia bruta',
          ariaLabel: `Ganancia bruta ${fmtCOP(gananciaBrutaR)}: te quedan ${fmtCOP(teQueda)} tras un impuesto de ${fmtCOP(impCausadoR)}`,
        }
      : undefined;

  return {
    costo_total: Math.round(costo_total * 100) / 100,
    ingreso_neto: Math.round(ingreso_neto * 100) / 100,
    ganancia_bruta: gananciaBrutaR,
    retension_valor: Math.round(retension_valor * 100) / 100,
    base_gravable: Math.round(base_gravable * 100) / 100,
    impuesto_causado: impCausadoR,
    impuesto_neto: impNetoR,
    rentabilidad_neta: rentR,
    clasificacion: clasificacion,
    _insight: {
      title: 'Impuesto cripto en Colombia',
      text: insightTexto,
      tone: insightTono,
      icon: '🇨🇴',
    },
    _chart,
  };
}

// Función auxiliar: calcula impuesto progresivo 2026 Colombia
function calcularImpuestoProgresivo(
  baseGravable: number,
  tramos: Array<{ limite: number; tasa: number }>
): number {
  if (baseGravable <= 0) return 0;

  let impuesto = 0;
  let baseAnterior = 0;

  for (let i = 0; i < tramos.length; i++) {
    const { limite, tasa } = tramos[i];
    const baseSiguiente = Math.min(baseGravable, limite);

    if (baseSiguiente > baseAnterior) {
      const exceso = baseSiguiente - baseAnterior;
      impuesto += exceso * tasa;
    }

    if (baseGravable <= limite) {
      break;
    }

    baseAnterior = limite;
  }

  return impuesto;
}
