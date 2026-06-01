export interface Inputs {
  sueldo_bruto: number;
  afp_seleccionada: 'modelo' | 'uno' | 'habitat' | 'provida' | 'capital' | 'cuprum' | 'planvital';
  fondo_seleccionado: 'A' | 'B' | 'C' | 'D' | 'E';
  edad: number;
}

export interface Outputs {
  salario_imponible: number;
  aporte_obligatorio_10: number;
  comision_afp: number;
  seguro_sis: number;
  descuento_total_mensual: number;
  descuento_anual: number;
  rentabilidad_fondo_historica: number;
  proyeccion_10_anos: number;
  comparativa_afp_ventaja: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 SII
  const TASA_IMPONIBLE = 0.98; // Aproximación: salario imponible ~98% bruto
  const APORTE_OBLIGATORIO = 0.10; // 10% obligatorio AFP
  const TASA_SIS_BASE = 0.0075; // SIS base ~0,75% (variable por edad, aquí promedio)
  
  // Comisiones AFP 2026 según SII
  const COMISIONES_AFP: Record<string, number> = {
    'capital': 0.0057,
    'uno': 0.0076,
    'habitat': 0.0080,
    'planvital': 0.0089,
    'modelo': 0.0119,
    'provida': 0.0148,
    'cuprum': 0.0149
  };
  
  // Rentabilidades históricas 2024 por fondo (anual)
  const RENTABILIDADES_FONDO: Record<string, number> = {
    'A': 8.5,
    'B': 7.2,
    'C': 6.1,
    'D': 5.5,
    'E': 5.2
  };
  
  // Ajuste SIS por edad (simplificado)
  const getSIS = (edad: number, base: number): number => {
    if (edad < 35) return base * 0.8; // Menor prima jóvenes
    if (edad < 50) return base;
    if (edad < 60) return base * 1.3;
    return base * 1.6; // Mayores 60 pagan más
  };
  
  // Cálculos
  const salario_imponible = i.sueldo_bruto * TASA_IMPONIBLE;
  const aporte_obligatorio_10 = salario_imponible * APORTE_OBLIGATORIO;
  const comision_afp = salario_imponible * (COMISIONES_AFP[i.afp_seleccionada] || COMISIONES_AFP['uno']);
  const seguro_sis = salario_imponible * getSIS(i.edad, TASA_SIS_BASE);
  const descuento_total_mensual = aporte_obligatorio_10 + comision_afp + seguro_sis;
  const descuento_anual = descuento_total_mensual * 12;
  const rentabilidad_fondo_historica = RENTABILIDADES_FONDO[i.fondo_seleccionado] || 6.1;
  
  // Proyección 10 años: suma aportes anuales + rendimiento compuesto
  const aporte_anual = descuento_total_mensual * 12;
  const tasa_rentabilidad_proyectada = 0.05; // 5% promedio anual para proyección lineal
  let saldo_proyectado = 0;
  for (let año = 0; año < 10; año++) {
    saldo_proyectado += aporte_anual;
    saldo_proyectado = saldo_proyectado * (1 + tasa_rentabilidad_proyectada);
  }
  const proyeccion_10_anos = Math.round(saldo_proyectado);
  
  // Comparativa vs AFP Cuprum (más cara)
  const comision_cuprum = salario_imponible * COMISIONES_AFP['cuprum'];
  const comparativa_afp_ventaja = Math.round(comision_cuprum - comision_afp);

  // Valores redondeados para el desglose y el gráfico (las partes suman el total exacto).
  const r_aporte = Math.round(aporte_obligatorio_10);
  const r_comision = Math.round(comision_afp);
  const r_total = Math.round(descuento_total_mensual);
  const r_sis = Math.max(0, r_total - r_aporte - r_comision);
  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  // Insight: peso de la comisión de tu AFP. Tasa de comisión seleccionada vs el rango del mercado.
  const tasaComisionPct = (COMISIONES_AFP[i.afp_seleccionada] || COMISIONES_AFP['uno']) * 100;
  const comisionMin = Math.min(...Object.values(COMISIONES_AFP)) * 100; // Capital 0,57%
  const comisionMax = Math.max(...Object.values(COMISIONES_AFP)) * 100; // Cuprum 1,49%
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightCalif: string;
  if (tasaComisionPct <= 0.80) { insightTone = 'good'; insightCalif = 'baja'; }
  else if (tasaComisionPct <= 1.10) { insightTone = 'neutral'; insightCalif = 'media'; }
  else { insightTone = 'warn'; insightCalif = 'alta'; }
  const ahorroTxt = comparativa_afp_ventaja > 0
    ? ` Frente a la AFP más cara (Cuprum) ahorrás **${fmtCLP(comparativa_afp_ventaja)}/mes** solo en comisión.`
    : ` Es la comisión más alta del mercado: cambiarte podría ahorrarte hasta **${fmtCLP(comision_afp - salario_imponible * comisionMin / 100)}/mes**.`;
  const insightText = `Tu AFP cobra una comisión **${insightCalif}** de **${tasaComisionPct.toFixed(2)}%** (el mercado va de ${comisionMin.toFixed(2)}% a ${comisionMax.toFixed(2)}%), o sea **${fmtCLP(r_comision)}/mes** sobre un descuento total de **${fmtCLP(r_total)}/mes**.${ahorroTxt}`;

  return {
    salario_imponible: Math.round(salario_imponible),
    aporte_obligatorio_10: Math.round(aporte_obligatorio_10),
    comision_afp: Math.round(comision_afp),
    seguro_sis: Math.round(seguro_sis),
    descuento_total_mensual: Math.round(descuento_total_mensual),
    descuento_anual: Math.round(descuento_anual),
    rentabilidad_fondo_historica: rentabilidad_fondo_historica,
    proyeccion_10_anos: proyeccion_10_anos,
    comparativa_afp_ventaja: comparativa_afp_ventaja,
    _insight: {
      title: 'Cuánto pesa la comisión',
      text: insightText,
      tone: insightTone,
      icon: '🇨🇱',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Aporte obligatorio (10%)', value: r_aporte },
        { label: 'Comisión AFP', value: r_comision },
        { label: 'Seguro SIS', value: r_sis },
      ],
      prefix: '$',
      centerValue: fmtCLP(r_total),
      centerLabel: 'descuento mensual',
      ariaLabel: `Composición del descuento mensual de ${fmtCLP(r_total)}: aporte obligatorio ${fmtCLP(r_aporte)}, comisión AFP ${fmtCLP(r_comision)} y seguro SIS ${fmtCLP(r_sis)}.`,
    },
  };
}
