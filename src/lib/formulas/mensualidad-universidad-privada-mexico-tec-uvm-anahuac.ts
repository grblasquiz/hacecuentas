export interface Inputs {
  universidad: 'tec' | 'uvm' | 'anahuac' | 'itam' | 'otras';
  carrera_duracion_cuatrimestres: number;
  costo_mensualidad_estimada: number;
  porcentaje_beca: number;
  uso_credito_educativo: 'no' | 'sofimex' | 'fira' | 'banco';
  tasa_interes_anual_credito: number;
  cobertura_credito: number;
  plazo_pago_meses: number;
}

export interface Outputs {
  costo_total_sin_beca: number;
  costo_total_con_beca: number;
  monto_beca: number;
  costo_por_cuatrimestre: number;
  monto_credito: number;
  cuota_mensual_credito: number;
  interes_total_credito: number;
  costo_final_con_credito: number;
  ahorro_vs_universidad_publica: number;
  comparativa_universidades: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México
  const MESES_POR_CUATRIMESTRE = 3;
  const COSTO_UNAM_ANUAL = 100; // cuota simbólica anual
  
  // Rangos de costo por universidad (cuatrimestres) 2026
  const RANGOS_UNIVERSIDAD: Record<string, { min: number; max: number }> = {
    'tec': { min: 45000, max: 65000 },
    'uvm': { min: 15000, max: 25000 },
    'anahuac': { min: 40000, max: 60000 },
    'itam': { min: 30000, max: 40000 },
    'otras': { min: 18000, max: 45000 }
  };

  // 1. Costo total sin beca
  const meses_totales = i.carrera_duracion_cuatrimestres * MESES_POR_CUATRIMESTRE;
  const costo_total_sin_beca = i.costo_mensualidad_estimada * meses_totales;

  // 2. Aplicar beca
  const monto_beca = costo_total_sin_beca * (i.porcentaje_beca / 100);
  const costo_total_con_beca = costo_total_sin_beca - monto_beca;

  // 3. Costo por cuatrimestre
  const costo_por_cuatrimestre = costo_total_sin_beca / i.carrera_duracion_cuatrimestres;

  // 4. Crédito educativo
  let monto_credito = 0;
  let cuota_mensual_credito = 0;
  let interes_total_credito = 0;
  let costo_final_con_credito = costo_total_con_beca;

  if (i.uso_credito_educativo !== 'no') {
    monto_credito = costo_total_con_beca * (i.cobertura_credito / 100);
    
    if (monto_credito > 0 && i.plazo_pago_meses > 0) {
      // Fórmula de amortización: cuota = P × [i(1+i)^n] / [(1+i)^n - 1]
      const tasa_mensual = (i.tasa_interes_anual_credito / 100) / 12;
      const n = i.plazo_pago_meses;
      
      if (tasa_mensual > 0) {
        const factor = (Math.pow(1 + tasa_mensual, n) * tasa_mensual) / 
                       (Math.pow(1 + tasa_mensual, n) - 1);
        cuota_mensual_credito = monto_credito * factor;
      } else {
        cuota_mensual_credito = monto_credito / n;
      }
      
      interes_total_credito = (cuota_mensual_credito * n) - monto_credito;
      costo_final_con_credito = costo_total_con_beca + interes_total_credito;
    }
  }

  // 5. Diferencia vs. universidad pública
  const costo_universidad_publica = COSTO_UNAM_ANUAL * (i.carrera_duracion_cuatrimestres / 4);
  const ahorro_vs_universidad_publica = costo_final_con_credito - costo_universidad_publica;

  // 6. Comparativa de universidades
  const rango = RANGOS_UNIVERSIDAD[i.universidad] || RANGOS_UNIVERSIDAD['otras'];
  const costo_min_4anos = rango.min * i.carrera_duracion_cuatrimestres;
  const costo_max_4anos = rango.max * i.carrera_duracion_cuatrimestres;
  
  const comparativa = `Para ${i.universidad.toUpperCase()}, rango estimado de 4 años: $${costo_min_4anos.toLocaleString('es-MX')}–$${costo_max_4anos.toLocaleString('es-MX')} MXN. ` +
                      `Tec Monterrey: $2,160,000–$3,120,000 (más cara). UVM: $720,000–$1,200,000 (más económica). ` +
                      `ITAM/Anáhuac: $1,440,000–$2,880,000 (intermedio).`;

  // Valores redondeados (para insight y gráfico, coherentes con los outputs)
  const r_sin_beca = Math.round(costo_total_sin_beca);
  const r_con_beca = Math.round(costo_total_con_beca);
  const r_beca = Math.round(monto_beca);
  const r_credito = Math.round(monto_credito);
  const r_cuota = Math.round(cuota_mensual_credito);
  const r_interes = Math.round(interes_total_credito);
  const r_final = Math.round(costo_final_con_credito);
  const fmt = (n: number) => `$${n.toLocaleString('es-MX')}`;

  // Insight dinámico
  let _insight: any;
  if (i.uso_credito_educativo !== 'no' && r_credito > 0) {
    _insight = {
      title: 'Costo con crédito educativo',
      text: `Financiando **${fmt(r_credito)}** a ${i.plazo_pago_meses} meses pagás **${fmt(r_cuota)}/mes** y sumás **${fmt(r_interes)}** de intereses. El costo final de la carrera trepa a **${fmt(r_final)}** MXN.`,
      tone: 'warn',
      icon: '🏦',
    };
  } else if (i.porcentaje_beca > 0) {
    _insight = {
      title: 'Tu costo con beca',
      text: `La beca del **${i.porcentaje_beca}%** te ahorra **${fmt(r_beca)}**, dejando el costo de la carrera en **${fmt(r_con_beca)}** MXN (≈ **${fmt(Math.round(costo_por_cuatrimestre))}** por cuatrimestre).`,
      tone: 'good',
      icon: '🎓',
    };
  } else {
    _insight = {
      title: 'Costo total de la carrera',
      text: `Sin beca, ${i.carrera_duracion_cuatrimestres} cuatrimestres en ${i.universidad.toUpperCase()} cuestan **${fmt(r_sin_beca)}** MXN, es decir **${fmt(Math.round(costo_por_cuatrimestre))}** por cuatrimestre. Una beca de mérito puede bajarlo bastante.`,
      tone: 'neutral',
      icon: '🎓',
    };
  }

  // Donut: costo sin beca = costo con beca + beca (sólo si hay beca)
  let _chart: any;
  if (r_beca > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Pagás (con beca)', value: r_con_beca },
        { label: 'Cubre la beca', value: r_beca },
      ],
      prefix: '$',
      centerValue: fmt(r_sin_beca),
      centerLabel: 'Costo sin beca',
      ariaLabel: `Costo total de ${fmt(r_sin_beca)} dividido entre lo que pagás y lo que cubre la beca`,
    };
  }

  return {
    costo_total_sin_beca: r_sin_beca,
    costo_total_con_beca: r_con_beca,
    monto_beca: r_beca,
    costo_por_cuatrimestre: Math.round(costo_por_cuatrimestre),
    monto_credito: r_credito,
    cuota_mensual_credito: r_cuota,
    interes_total_credito: r_interes,
    costo_final_con_credito: r_final,
    ahorro_vs_universidad_publica: Math.round(ahorro_vs_universidad_publica),
    comparativa_universidades: comparativa,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
