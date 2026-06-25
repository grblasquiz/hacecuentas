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
  _table?: any;
}

// Constantes FSP — fuente única: src/lib/data/colombia-2026.ts (escala Ley 100 art. 27).
const UMBRAL_MINIMO_SMMLV = COLOMBIA_2026.fsp[0].desdeSmlmv; // aplica a partir de 4 SMMLV

// Helper puro: resuelve tramo + tarifa + aporte para un salario dado.
// Es la MISMA lógica que produce el resultado principal y cada fila de la tabla
// (mismos tramos/porcentajes de COLOMBIA_2026.fsp; no inventa ni cambia nada).
function calcularFsp(salarioBase: number, smmlv: number) {
  const salario = Math.max(0, salarioBase || 0);
  const rangoSmmlv = salario / smmlv;

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

  const aporteMensual = salario * tarifaAplicada;
  const aporteAnual = aporteMensual * 12;

  return { salario, rangoSmmlv, aplicaFsp, tarifaAplicada, rangoDescripcion, aporteMensual, aporteAnual };
}

export function compute(i: Inputs): Outputs {
  const SMMLV = i.smmlv_2026 || COLOMBIA_2026.smlmv; // SMLMV 2026 = $1.750.905 (Decreto 1469/2025)

  // Determinar tarifa según la escala oficial (4-16: 1%; 16-17: 1,2%; 17-18: 1,4%;
  // 18-19: 1,6%; 19-20: 1,8%; >20: 2% — reforma pensional suspendida, rige Ley 100).
  const r = calcularFsp(i.salario_base || 0, SMMLV);
  const salario = r.salario;
  const rangoSmmlv = r.rangoSmmlv;
  const aplicaFsp = r.aplicaFsp;
  const tarifaAplicada = r.tarifaAplicada;
  const rangoDescripcion = r.rangoDescripcion;
  const aporteMensual = r.aporteMensual;
  const aporteAnual = r.aporteAnual;

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

  // Tabla computada: aporte FSP por nivel de salario, recorriendo los tramos oficiales.
  // Cada fila pasa por el MISMO helper (calcularFsp) → tramos/porcentajes idénticos al
  // resultado principal; sin números fabricados. La fila "(tu caso)" usa tu salario real.
  const fmtSmmlv = (n: number) => (Math.round(n * 100) / 100).toLocaleString('es-CO', { maximumFractionDigits: 2 });
  // Salarios ancla: cubren exento + un tramo de cada tarifa (1 %, 1,2 %, 1,6 %, 2 %),
  // expresados como múltiplos de SMMLV. Son 6 → con "tu caso" la tabla queda en ≤7 filas.
  const anclasSmmlv = [3, 5, 16.5, 18.5, 21];
  type Fila = { salario: number; tuCaso: boolean };
  const filas: Fila[] = anclasSmmlv.map((m) => ({ salario: Math.round(m * SMMLV), tuCaso: false }));
  if (salario > 0) filas.push({ salario, tuCaso: true });
  // Dedup por salario (prioriza "tu caso"), ordena ascendente y limita a 7 filas.
  const porSalario = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porSalario.set(f.salario, f);
  const filasFinales = Array.from(porSalario.values()).sort((a, b) => a.salario - b.salario).slice(0, 7);
  const tableRows = filasFinales.map((f) => {
    const c = calcularFsp(f.salario, SMMLV);
    const pct = c.aplicaFsp ? `${(c.tarifaAplicada * 100).toLocaleString('es-CO')} %` : 'Exento';
    return [
      `${fmtCOP(c.salario)}${f.tuCaso ? ' (tu caso)' : ''}`,
      `${fmtSmmlv(c.rangoSmmlv)} SMMLV`,
      pct,
      fmtCOP(c.aporteMensual),
      fmtCOP(c.aporteAnual),
    ];
  });
  const _table = {
    title: `Aporte al FSP por nivel de salario (SMMLV 2026 = ${fmtCOP(SMMLV)})`,
    headers: ['Salario mensual', 'En SMMLV', 'Tarifa FSP', 'Aporte mensual', 'Aporte anual'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Fondo de Solidaridad Pensional (Ley 100 art. 27): exento bajo 4 SMMLV; 1 % entre 4 y 16; luego sube 0,2 % por tramo hasta 2 % sobre 20 SMMLV. Se descuenta además de tu cotización a pensión.',
  };

  return {
    aporte_fsp_mensual: Math.round(aporteMensual * 100) / 100,
    tarifa_aplicada: tarifaAplicada * 100, // En porcentaje para display
    rango_smmlv: rangoDescripcion,
    aporte_anual: Math.round(aporteAnual * 100) / 100,
    aplica_fsp: aplicaFsp ? "Sí, aplica FSP" : "No aplica FSP (salario < 4 SMMLV)",
    _insight,
    _chart,
    _table
  };
}
