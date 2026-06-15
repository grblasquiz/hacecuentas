/**
 * Recibo de agua Sedapal (Perú) 2026 — agua potable + alcantarillado + cargo fijo + IGV.
 *
 * Estructura del recibo (Sedapal explica el detalle de facturación):
 *   Total = (Volumen de agua + Servicio de alcantarillado + Cargo fijo) × (1 + IGV 18%)
 *
 * El consumo se factura por BLOQUES (tarifa creciente por m³). Cada categoría
 * (social, doméstico, comercial, industrial, estatal) tiene su propia tabla.
 * El alcantarillado se calcula "con el mismo procedimiento" sobre el mismo
 * consumo: en la estructura tarifaria de Sedapal la tarifa de alcantarillado
 * es aproximadamente proporcional a la de agua potable, por eso se modela como
 * un factor sobre el cargo de agua (ALCANTARILLADO_FACTOR), calibrado para que
 * el consumo doméstico promedio quede cerca de la tarifa media de S/ 5/m³.
 *
 * Fuentes (verificadas 2026-06-15):
 *  - Sunass / El Comercio: nueva estructura tarifaria Sedapal vigente desde el
 *    siguiente recibo tras la publicación en El Peruano (23-dic-2025). Tarifa
 *    media Sedapal-Lima sube de S/ 4,37 a S/ 5,00 por m³ (+14,5%).
 *    https://elcomercio.pe/economia/peru/recibos-de-agua-en-lima-y-callao-sufririan-alza-este-2026-conoce-cuales-seran-los-nuevos-montos-l-ultimas-noticia/
 *  - Infobae: bloques domésticos y cargo fijo S/ 6,32.
 *    https://www.infobae.com/peru/2025/12/23/oficializan-cambios-en-tarifas-de-agua-sedapal-sedapar-y-sedalib-aplicaran-nuevos-cobros-desde-el-proximo-recibo/
 *  - Sunass — Yakúmetro (cálculo oficial de facturación agua + alcantarillado).
 *    https://www.gob.pe/39636-calcular-facturacion-mensual-de-agua-potable-y-alcantarillado-yakumetro
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// IGV general (18% = 16% IGV + 2% IPM). Definido en la tabla maestra PE.
const IGV = PERU_2026.igv; // 0.18

// Cargo fijo mensual Sedapal 2026 (S/) — independiente del consumo.
// fuente: Infobae/Sunass, dic-2025, S/ 6,32.
const CARGO_FIJO = 6.32;

// Factor de alcantarillado sobre el cargo de agua potable. En la estructura
// de Sedapal el cargo de alcantarillado es ~proporcional al de agua; con este
// factor el consumo doméstico promedio (~16 m³) queda en el orden de la tarifa
// media S/ 5/m³ reportada por Sunass. fuente: Sunass estructura tarifaria Sedapal 2026.
const ALCANTARILLADO_FACTOR = 0.86;

type Bloque = { hasta: number; tarifa: number }; // hasta = límite superior del bloque (m³), Infinity = sin tope

// Tarifas de AGUA POTABLE por m³ y bloque, por categoría. Vigentes 2026 (S/).
// fuente: El Comercio / Infobae (estructura tarifaria Sedapal 2026), 23-dic-2025.
const TARIFAS: Record<string, { label: string; bloques: Bloque[] }> = {
  social: {
    label: 'Tarifa social',
    // Tarifa social: S/ 1,92 por m³ en el primer tramo (usuarios vulnerables).
    bloques: [
      { hasta: 10, tarifa: 1.92 },
      { hasta: 20, tarifa: 2.36 },
      { hasta: 50, tarifa: 3.22 },
      { hasta: Infinity, tarifa: 7.32 },
    ],
  },
  domestico: {
    label: 'Doméstico / residencial',
    // 0-10: 2,20 · 10-20: 2,36 · 20-50: 3,22 · >50: 7,32
    bloques: [
      { hasta: 10, tarifa: 2.20 },
      { hasta: 20, tarifa: 2.36 },
      { hasta: 50, tarifa: 3.22 },
      { hasta: Infinity, tarifa: 7.32 },
    ],
  },
  comercial: {
    label: 'Comercial y otros',
    // Hasta 1.000 m³: 8,82 · más de 1.000 m³: 9,46
    bloques: [
      { hasta: 1000, tarifa: 8.82 },
      { hasta: Infinity, tarifa: 9.46 },
    ],
  },
  industrial: {
    label: 'Industrial',
    // S/ 9,46 por m³ (tarifa única).
    bloques: [{ hasta: Infinity, tarifa: 9.46 }],
  },
  estatal: {
    label: 'Estatal',
    // S/ 5,80 por m³ (entidades del Estado).
    bloques: [{ hasta: Infinity, tarifa: 5.80 }],
  },
};

/** Aplica las tarifas por bloque (marginal/escalonado) a un consumo en m³. */
function costoPorBloques(consumo: number, bloques: Bloque[]): number {
  let costo = 0;
  let anterior = 0;
  for (const b of bloques) {
    const limite = b.hasta;
    const ancho = limite - anterior;
    const enBloque = Math.min(consumo - anterior, ancho);
    if (enBloque <= 0) break;
    costo += enBloque * b.tarifa;
    anterior = limite;
    if (consumo <= limite) break;
  }
  return costo;
}

export interface Inputs {
  consumo: number;        // consumo mensual en m³
  categoria?: string;     // social | domestico | comercial | industrial | estatal
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const consumo = Number(i.consumo);
  if (!Number.isFinite(consumo) || consumo <= 0) {
    throw new Error('Ingresá tu consumo mensual de agua en m³ (mayor a 0)');
  }

  const cat = String(i.categoria || 'domestico');
  const tarifa = TARIFAS[cat] || TARIFAS.domestico;

  // 1) Agua potable por bloques
  const agua = costoPorBloques(consumo, tarifa.bloques);
  // 2) Alcantarillado (proporcional al agua según estructura Sedapal)
  const alcantarillado = agua * ALCANTARILLADO_FACTOR;
  // 3) Cargo fijo mensual (independiente del consumo)
  const cargoFijo = CARGO_FIJO;
  // 4) Subtotal e IGV
  const subtotal = agua + alcantarillado + cargoFijo;
  const igv = subtotal * IGV;
  const total = subtotal + igv;

  const costoPorM3 = total / consumo; // costo "todo incluido" por m³

  const tone = costoPorM3 > 6 ? 'warning' : 'good';
  const _insight = {
    title: 'Tu recibo de agua mensual',
    text: `Con un consumo de **${consumo} m³** en categoría **${tarifa.label.toLowerCase()}**, tu recibo Sedapal es **${fmtPEN(total)}** al mes (incluye agua, alcantarillado, cargo fijo y 18% de IGV). Eso equivale a **${fmtPEN(costoPorM3)} por m³** todo incluido. La tarifa media de Sedapal en 2026 subió a **S/ 5,00 por m³** (+14,5%), reflejando el reajuste del DL 1620.`,
    tone,
    icon: '🚰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Agua potable', value: Math.round(agua * 100) / 100 },
      { label: 'Alcantarillado', value: Math.round(alcantarillado * 100) / 100 },
      { label: 'Cargo fijo', value: Math.round(cargoFijo * 100) / 100 },
      { label: 'IGV (18%)', value: Math.round(igv * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Recibo mensual',
    ariaLabel: `Recibo de agua de ${fmtPEN(total)} mensuales: agua ${fmtPEN(agua)}, alcantarillado ${fmtPEN(alcantarillado)}, cargo fijo ${fmtPEN(cargoFijo)} e IGV ${fmtPEN(igv)}.`,
  };

  return {
    total: fmtPEN(total),
    agua: fmtPEN(agua),
    alcantarillado: fmtPEN(alcantarillado),
    cargoFijo: fmtPEN(cargoFijo),
    igv: fmtPEN(igv),
    costoPorM3: fmtPEN(costoPorM3),
    detalle: `Agua ${fmtPEN(agua)} + alcantarillado ${fmtPEN(alcantarillado)} + cargo fijo ${fmtPEN(cargoFijo)} = ${fmtPEN(subtotal)}; + IGV 18% (${fmtPEN(igv)}) = ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
