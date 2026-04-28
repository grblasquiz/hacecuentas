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
}

export function compute(i: Inputs): Outputs {
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

  return {
    costo_total: Math.round(costo_total * 100) / 100,
    ingreso_neto: Math.round(ingreso_neto * 100) / 100,
    ganancia_bruta: Math.round(ganancia_bruta * 100) / 100,
    retension_valor: Math.round(retension_valor * 100) / 100,
    base_gravable: Math.round(base_gravable * 100) / 100,
    impuesto_causado: Math.round(impuesto_causado * 100) / 100,
    impuesto_neto: Math.round(impuesto_neto * 100) / 100,
    rentabilidad_neta: Math.round(rentabilidad_neta * 100) / 100,
    clasificacion: clasificacion
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
