import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_base: number;
  smmlv_2026: number;
}

export interface Outputs {
  aporte_fsp_mensual: number;
  tarifa_aplicada: number;
  rango_smmlv: string;
  aporte_anual: number;
  aplica_fsp: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes FSP — fuente única: src/lib/data/colombia-2026.ts (escala Ley 100 art. 27).
  const UMBRAL_MINIMO_SMMLV = COLOMBIA_2026.fsp[0].desdeSmlmv; // aplica a partir de 4 SMMLV
  const SMMLV = i.smmlv_2026 || COLOMBIA_2026.smlmv; // SMLMV 2026 = $1.750.905 (Decreto 1469/2025)

  // Validar inputs
  const salario = Math.max(0, i.salario_base || 0);

  // Calcular rango en SMMLV
  const rangoSmmlv = salario / SMMLV;

  // Determinar tarifa según la escala oficial (4-16: 1%; 16-17: 1,2%; 17-18: 1,4%;
  // 18-19: 1,6%; 19-20: 1,8%; >20: 2% — reforma pensional suspendida, rige Ley 100).
  let aplicaFsp = false;
  let tarifaAplicada = 0;
  let rangoDescripcion = "Sin aplica";

  if (rangoSmmlv < UMBRAL_MINIMO_SMMLV) {
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (< 4 SMMLV - Exento)`;
  } else {
    for (const tramo of COLOMBIA_2026.fsp) {
      if (rangoSmmlv >= tramo.desdeSmlmv && rangoSmmlv < tramo.hastaSmlmv) {
        aplicaFsp = true;
        tarifaAplicada = tramo.tasa;
        const pct = (tramo.tasa * 100).toLocaleString('es-CO');
        const hasta = tramo.hastaSmlmv === Infinity ? '+' : `-${tramo.hastaSmlmv}`;
        rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (${tramo.desdeSmlmv}${hasta} SMMLV - Tarifa ${pct}%)`;
        break;
      }
    }
  }
  
  // Calcular aportes
  const aporteMensual = salario * tarifaAplicada;
  const aporteAnual = aporteMensual * 12;
  
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = aplicaFsp
    ? {
        title: 'Pagás Fondo de Solidaridad',
        text: `Con un salario de **${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV** te aplica la tarifa del **${(tarifaAplicada * 100).toLocaleString('es-CO')}%**: **${fmtCOP(aporteMensual)}** al mes (**${fmtCOP(aporteAnual)}** al año) que se suman a tu cotización a pensión.`,
        tone: 'warn' as const,
        icon: '🤝',
      }
    : {
        title: 'Estás exento del FSP',
        text: `Tu salario equivale a **${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV**, por debajo del umbral de **4 SMMLV**. No pagás el Fondo de Solidaridad Pensional: **$0** de aporte extra.`,
        tone: 'good' as const,
        icon: '🤝',
      };

  const _chart = {
    type: 'scale',
    marker: Math.round(rangoSmmlv * 100) / 100,
    markerLabel: `${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV`,
    min: 0,
    segments: [
      { nombre: 'Exento', max: 4, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: '1%', max: 16, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: '1,2%', max: 17, color: '#eab308', colorDark: '#facc15' },
      { nombre: '1,4%', max: 18, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '1,6%', max: 19, color: '#f97316', colorDark: '#fb923c' },
      { nombre: '1,8%', max: 20, color: '#ea580c', colorDark: '#f97316' },
      { nombre: '2%', max: Math.max(24, Math.ceil(rangoSmmlv) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Salario de ${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV ubicado en el tramo de tarifa del FSP`,
  };

  return {
    aporte_fsp_mensual: Math.round(aporteMensual * 100) / 100,
    tarifa_aplicada: tarifaAplicada * 100, // En porcentaje para display
    rango_smmlv: rangoDescripcion,
    aporte_anual: Math.round(aporteAnual * 100) / 100,
    aplica_fsp: aplicaFsp ? "Sí, aplica FSP" : "No aplica FSP (salario < 4 SMMLV)",
    _insight,
    _chart
  };
}
