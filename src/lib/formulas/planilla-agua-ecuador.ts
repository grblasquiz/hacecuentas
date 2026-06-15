/**
 * Planilla de agua potable en Ecuador 2026 — estimador por m³ (EPMAPS Quito / Interagua Guayaquil).
 *
 * Ecuador está dolarizado: todos los montos en USD ("$"), sin conversión.
 *
 * Fuentes (verificado 2026-06):
 * - EPMAPS (Quito): pliego tarifario residencial progresivo. Bloque A (0–10 m³) $0,40/m³,
 *   Bloque B (10–25 m³) $0,448/m³; rango residencial reportado $0,41–$0,73/m³.
 *   Costo fijo residencial 2026: $0,72/mes ($0,51 agua + $0,21 saneamiento).
 *   https://www.aguaquito.gob.ec/sites/default/files/documentos/pliego_tarifario_epmaps.pdf
 *   y https://www.primicias.ec/quito/cobro-planilla-agua-potable-tasa-nomenclatura-recoleccion-basura-quito-municipio-114961/
 * - Interagua (Guayaquil): estructura tarifaria progresiva por bloques (0–15, 16–30, 31–60 m³…),
 *   regulada por ECAPAG. Tarifa residencial agua: $0,322/m³ (0–15), $0,477/m³ (16–30),
 *   $0,675/m³ (31–60). El alcantarillado se factura como el 80% del valor del agua consumida,
 *   más un cargo fijo de comercialización según diámetro de la acometida (1/2" residencial ≈ $1,26/mes).
 *   https://www.interagua.com.ec/preguntas-frecuentes
 *
 * NOTA: los pliegos completos por bloque pueden ajustarse trimestralmente; este estimador usa
 * los valores residenciales publicados como referencia. El valor oficial es el de tu planilla.
 */

export interface Inputs {
  metrosCubicos: number;        // m³ consumidos en el mes
  empresa?: string;             // 'epmaps' (Quito) | 'interagua' (Guayaquil)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

interface Bloque { hasta: number; precio: number; }

/** EPMAPS (Quito) — tarifa residencial de agua por bloques ($/m³). El alcantarillado va incluido
 *  en la progresividad de los bloques (no se factura aparte). Costo fijo mensual: $0,72.
 *  fuente: EPMAPS pliego tarifario residencial 2026. */
const EPMAPS = {
  bloques: [
    { hasta: 10, precio: 0.40 },   // Bloque A (0–10 m³)
    { hasta: 25, precio: 0.448 },  // Bloque B (10–25 m³)
    { hasta: 50, precio: 0.55 },   // Bloque C (25–50 m³)
    { hasta: Infinity, precio: 0.73 }, // Bloque D (>50 m³) — tope residencial
  ] as Bloque[],
  cargoFijo: 0.72,        // costo fijo mensual residencial ($0,51 agua + $0,21 saneamiento)
  alcantarilladoIncluido: true,
};

/** Interagua (Guayaquil) — tarifa residencial de agua por bloques de 15 m³ ($/m³).
 *  El alcantarillado se cobra como el 80% del valor del agua. Cargo fijo de comercialización.
 *  fuente: Interagua / ECAPAG, estructura tarifaria residencial. */
const INTERAGUA = {
  bloques: [
    { hasta: 15, precio: 0.322 },  // Rango 1 (0–15 m³)
    { hasta: 30, precio: 0.477 },  // Rango 2 (16–30 m³)
    { hasta: 60, precio: 0.675 },  // Rango 3 (31–60 m³)
    { hasta: 100, precio: 0.925 }, // Rango 4 (61–100 m³)
    { hasta: Infinity, precio: 1.042 }, // Rango 5 (>100 m³)
  ] as Bloque[],
  cargoFijo: 1.26,           // cargo fijo de comercialización, acometida residencial 1/2" ($1,26/mes)
  alcantarilladoPct: 0.80,   // alcantarillado = 80% del valor del agua
};

/** Costo del agua aplicando bloques marginales progresivos. */
function costoAgua(m3: number, bloques: Bloque[]): number {
  let restante = m3;
  let desde = 0;
  let total = 0;
  for (const b of bloques) {
    if (restante <= 0) break;
    const tramo = Math.min(restante, b.hasta - desde);
    total += tramo * b.precio;
    restante -= tramo;
    desde = b.hasta;
  }
  return total;
}

const fmt = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function compute(i: Inputs): Outputs {
  const m3 = Number(i.metrosCubicos);
  if (!Number.isFinite(m3) || m3 <= 0) throw new Error('Ingresá los metros cúbicos (m³) consumidos en el mes');

  const empresa = String(i.empresa || 'epmaps').toLowerCase();
  const esGuayaquil = empresa === 'interagua' || empresa === 'guayaquil';
  const cfg = esGuayaquil ? INTERAGUA : EPMAPS;
  const nombre = esGuayaquil ? 'Interagua (Guayaquil)' : 'EPMAPS (Quito)';

  const agua = costoAgua(m3, cfg.bloques);

  // Alcantarillado: en Guayaquil es el 80% del agua; en Quito va incluido en los bloques.
  const alcantarillado = esGuayaquil ? agua * (cfg as typeof INTERAGUA).alcantarilladoPct : 0;

  const comercializacion = cfg.cargoFijo;

  const total = agua + alcantarillado + comercializacion;
  const costoPorM3 = total / m3;

  const desglose = esGuayaquil
    ? `Agua ${fmt(agua)} + Alcantarillado (80%) ${fmt(alcantarillado)} + Comercialización ${fmt(comercializacion)} = ${fmt(total)}.`
    : `Agua + alcantarillado (bloques) ${fmt(agua)} + Costo fijo ${fmt(comercializacion)} = ${fmt(total)}.`;

  const _insight = {
    title: 'Tu planilla de agua estimada',
    text: `Con **${m3} m³** en **${nombre}**, tu planilla ronda los **${fmt(total)}** al mes. Eso equivale a **${fmt(costoPorM3)} por m³** todo incluido. ${esGuayaquil ? 'El alcantarillado suma el 80% del valor del agua.' : 'El alcantarillado ya va dentro de los bloques progresivos.'} La tasa de recolección de basura y otros rubros municipales pueden sumarse aparte en la planilla real.`,
    tone: m3 > 30 ? 'warn' : 'neutral',
    icon: '🚰',
  };

  const segmentos = esGuayaquil
    ? [
        { label: 'Agua', value: Math.round(agua * 100) / 100 },
        { label: 'Alcantarillado (80%)', value: Math.round(alcantarillado * 100) / 100 },
        { label: 'Comercialización', value: Math.round(comercializacion * 100) / 100 },
      ]
    : [
        { label: 'Agua + alcantarillado', value: Math.round(agua * 100) / 100 },
        { label: 'Costo fijo', value: Math.round(comercializacion * 100) / 100 },
      ];

  const _chart = {
    type: 'donut',
    segments: segmentos.filter((s) => s.value > 0),
    centerValue: fmt(total),
    centerLabel: 'Total mes',
    ariaLabel: `Planilla de agua de ${fmt(total)} para ${m3} metros cúbicos en ${nombre}.`,
  };

  return {
    total: fmt(total),
    agua: fmt(agua),
    alcantarillado: fmt(alcantarillado),
    comercializacion: fmt(comercializacion),
    costoPorM3: fmt(costoPorM3),
    detalle: `${nombre} — ${desglose}`,
    _insight,
    _chart,
  };
}
