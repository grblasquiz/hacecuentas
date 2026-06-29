import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_actual: number;
  criterio: string; // "minimo" | "ipc" | "personalizado"
  porcentaje_personalizado: number;
}

export interface Outputs {
  porcentaje_aplicado: number;
  aumento: number;
  salario_nuevo: number;
  aumento_anual: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Incremento del salario mínimo 2026: +23% (Decreto 1469/2025).
const INCREMENTO_MINIMO_2026 = 0.23;
// IPC 2025 referencial (~5,2%, DANE). Editable: criterio "ipc" usa este valor de referencia.
const IPC_2025_REFERENCIAL = 0.052;

function pctPorCriterio(criterio: string, porcentajePersonalizado: number): number {
  if (criterio === 'minimo') return INCREMENTO_MINIMO_2026;
  if (criterio === 'ipc') return IPC_2025_REFERENCIAL;
  return Math.max(0, (porcentajePersonalizado || 0)) / 100;
}

export function compute(i: Inputs): Outputs {
  const salarioActual = Math.max(0, i.salario_actual || 0);
  const criterio = i.criterio || 'minimo';
  const pct = pctPorCriterio(criterio, i.porcentaje_personalizado);

  const aumento = salarioActual * pct;
  const salarioNuevo = salarioActual + aumento;
  const aumentoAnual = aumento * 12;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const fmtPct = (n: number) => (n * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 }) + '%';

  const etiquetaCriterio =
    criterio === 'minimo'
      ? 'incremento del salario mínimo (+23%, Decreto 1469/2025)'
      : criterio === 'ipc'
      ? 'IPC 2025 referencial (~5,2%)'
      : 'porcentaje personalizado';

  const _insight = {
    title: `Tu sueldo sube ${fmtCOP(aumento)}`,
    text: `Aplicando un **${fmtPct(pct)}** (${etiquetaCriterio}), tu salario pasa de **${fmtCOP(salarioActual)}** a **${fmtCOP(salarioNuevo)}**. Son **${fmtCOP(aumento)}** más al mes y **${fmtCOP(aumentoAnual)}** más en el año.`,
    tone: 'good' as const,
    icon: '📈',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Salario actual', value: Math.round(salarioActual) },
      { label: 'Salario nuevo', value: Math.round(salarioNuevo) },
    ],
    format: 'currency' as const,
    ariaLabel: `Comparación entre el salario actual (${fmtCOP(salarioActual)}) y el nuevo (${fmtCOP(salarioNuevo)})`,
  };

  // Tabla computada: el mismo salario actual bajo los tres criterios, con el MISMO helper
  // pctPorCriterio → porcentajes idénticos al resultado principal. El criterio elegido se marca.
  type Esc = { clave: string; nombre: string; pct: number };
  const escenarios: Esc[] = [
    { clave: 'minimo', nombre: 'Igual al salario mínimo', pct: INCREMENTO_MINIMO_2026 },
    { clave: 'ipc', nombre: 'Según IPC 2025 (referencial)', pct: IPC_2025_REFERENCIAL },
  ];
  if (criterio === 'personalizado' && pct > 0) {
    escenarios.push({ clave: 'personalizado', nombre: 'Tu porcentaje', pct });
  }
  const tableRows = escenarios.map((e) => {
    const inc = salarioActual * e.pct;
    return [
      `${e.nombre}${e.clave === criterio ? ' (elegido)' : ''}`,
      fmtPct(e.pct),
      fmtCOP(inc),
      fmtCOP(salarioActual + inc),
      fmtCOP(inc * 12),
    ];
  });
  const _table = {
    title: 'Tu aumento bajo cada criterio',
    headers: ['Criterio', 'Porcentaje', 'Aumento mensual', 'Salario nuevo', 'Aumento anual'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'El incremento legal del salario mínimo (23% en 2026) NO obliga a subir todos los salarios en ese porcentaje: solo aplica a quien gana el mínimo. Para salarios por encima del mínimo, el aumento se negocia y suele referenciarse al IPC del año anterior (~5,2% para 2025, DANE) salvo pacto distinto.',
  };

  return {
    porcentaje_aplicado: Math.round(pct * 10000) / 100, // en %
    aumento: Math.round(aumento),
    salario_nuevo: Math.round(salarioNuevo),
    aumento_anual: Math.round(aumentoAnual),
    _insight,
    _chart,
    _table,
  };
}
