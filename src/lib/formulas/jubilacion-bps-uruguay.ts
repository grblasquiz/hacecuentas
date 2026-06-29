import { fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  sbj: number;          // Sueldo Básico Jubilatorio: promedio de los mejores 20 años
  aniosServicio: number;
  edad: number;
}

export interface Outputs {
  tasaReemplazo: number; // en %
  haberEstimado: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Tasas de reemplazo régimen mixto BPS (Ley 20.130, reforma 2023):
// base 45% a los 30 años de servicio, +1% por año entre 31 y 35, +2% por año
// desde el 36° si se jubila con 65+, tope 82,5%. VERIFICADO.
// ⚠️ Esta estimación cubre SOLO la jubilación común BPS (solidaria); IGNORA el
// tramo de ahorro individual AFAP, que se suma aparte para quienes aportan a una
// administradora. El haber real puede ser mayor por ese componente.
const TASA_BASE = 0.45;
const ANIOS_BASE = 30;
const TOPE_TASA = 0.825;

function calcularTasa(anios: number, edad: number): number {
  if (anios < ANIOS_BASE) return 0;
  let tasa = TASA_BASE
    + Math.min(Math.max(anios - 30, 0), 5) * 0.01
    + (edad >= 65 ? Math.max(anios - 35, 0) * 0.02 : 0);
  return Math.min(tasa, TOPE_TASA);
}

export function compute(i: Inputs): Outputs {
  const sbj = Math.max(0, i.sbj || 0);
  const anios = Math.max(0, i.aniosServicio || 0);
  const edad = Math.max(0, i.edad || 0);

  const tasa = calcularTasa(anios, edad);
  const haberEstimado = sbj * tasa;
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const sinDerecho = anios < ANIOS_BASE;
  const _insight = sinDerecho
    ? {
        title: 'Aún no alcanzás los 30 años de servicio',
        text: `Con **${anios} años** de aportes todavía no se configura causal jubilatoria común (se necesitan **30 años**). Te faltan **${ANIOS_BASE - anios} años** de servicio.`,
        tone: 'warn' as const,
        icon: '⏳',
      }
    : {
        title: `Jubilación estimada: ${fmtUYU(haberEstimado)}`,
        text: `Con **${anios} años** de servicio y **${edad} años** de edad, tu tasa de reemplazo es **${(tasa * 100).toLocaleString('es-UY')}%** sobre un sueldo básico jubilatorio de **${fmtUYU(sbj)}** → **${fmtUYU(haberEstimado)}** mensuales (solo tramo BPS, sin AFAP).`,
        tone: 'info' as const,
        icon: '👴',
      };

  const _chart = {
    type: 'scale',
    marker: r2(tasa * 100),
    markerLabel: `${(tasa * 100).toLocaleString('es-UY')}%`,
    min: 0,
    segments: [
      { nombre: 'Sin causal', max: 45, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: '45–50%', max: 50, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '50–82,5%', max: 82.5, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Tasa de reemplazo de ${(tasa * 100).toLocaleString('es-UY')}% sobre el tope de 82,5%`,
  };

  // Tabla: tasa y haber por años de servicio (jubilando a los 65).
  const anclas = [30, 33, 35, 38, 41];
  const _table = {
    title: 'Tasa de reemplazo BPS por años de servicio (a los 65 años)',
    headers: ['Años de servicio', 'Tasa de reemplazo', `Haber sobre ${fmtUYU(sbj || 0)}`],
    align: ['right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: anclas.map((a) => {
      const t = calcularTasa(a, 65);
      return [
        `${a} años${a === anios ? ' (tu caso)' : ''}`,
        `${(t * 100).toLocaleString('es-UY')}%`,
        fmtUYU(sbj * t),
      ];
    }),
    note: 'Ley 20.130: 45% a los 30 años, +1% por año hasta los 35, +2% por año desde el 36° (con 65 años), tope 82,5%. No incluye el tramo de ahorro AFAP.',
  };

  return {
    tasaReemplazo: r2(tasa * 100),
    haberEstimado: r2(haberEstimado),
    _insight,
    _chart,
    _table,
  };
}
