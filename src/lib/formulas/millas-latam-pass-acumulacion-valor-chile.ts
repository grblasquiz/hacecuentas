/** Acumulación y valor de millas LATAM Pass (Chile) 2026.
 *  Orientativo, NO oficial. Sin afiliación con LATAM Airlines.
 *  Base de acumulación: millas ≈ USD gastado (neto de tasas) × factor de tarifa.
 *  Fuente factores: LATAM Pass "Acumula volando en LATAM" (es_cl) — Reglamento 2025/2026.
 *  Los factores reales varían por tarifa, ruta y promociones vigentes. */
import { fmtCLP } from '../data/chile-2026.ts';

// Factor base de millas por USD según tipo de tarifa (orientativo, es_cl).
// Tarifas económicas Light suman ~0,6; a mayor tarifa, mayor factor.
const FACTOR_TARIFA: Record<string, number> = {
  light: 0.6,      // económica básica
  plus: 1.0,       // económica flexible
  top: 1.5,        // económica top / promo
  premium: 2.0,    // premium economy / business promo
};

// Bonus de acumulación por categoría Elite (orientativo — % adicional sobre millas base).
// Verificá el reglamento LATAM Pass vigente; los % exactos varían.
const BONUS_CATEGORIA: Record<string, number> = {
  base: 0,          // socio sin categoría
  gold: 0.25,       // Gold (+25%)
  platinum: 0.5,    // Platinum (+50%)
  black: 0.8,       // Black (+80%)
};

// Valor de referencia de la milla LATAM Pass ≈ 1,4 ¢USD (benchmark de canje).
const VALOR_CENTAVOS_USD_POR_MILLA = 1.4;

export interface Inputs {
  gastoUsd: number;         // USD gastado en el pasaje, neto de tasas
  tipoTarifa?: string;      // light | plus | top | premium
  categoria?: string;       // base | gold | platinum | black
  dolarPeso?: number;       // valor del dólar en CLP para expresar el valor en pesos
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const gasto = Number(i.gastoUsd) || 0;
  const tarifa = (i.tipoTarifa && FACTOR_TARIFA[i.tipoTarifa] != null) ? i.tipoTarifa : 'light';
  const categoria = (i.categoria && BONUS_CATEGORIA[i.categoria] != null) ? i.categoria : 'base';
  const dolar = Number(i.dolarPeso) || 950; // CLP por USD (referencial)

  if (gasto <= 0) throw new Error('Ingresá el gasto en USD del pasaje (neto de tasas)');
  if (dolar <= 0) throw new Error('Ingresá un valor de dólar válido en pesos');

  const factor = FACTOR_TARIFA[tarifa];
  const bonus = BONUS_CATEGORIA[categoria];

  const millasBase = gasto * factor;
  const millasBonus = millasBase * bonus;
  const millasTotales = millasBase + millasBonus;

  // Valor de esas millas al canjearlas (benchmark 1,4 ¢USD/milla).
  const valorUsd = millasTotales * (VALOR_CENTAVOS_USD_POR_MILLA / 100);
  const valorPesos = valorUsd * dolar;

  // "Retorno" del gasto en valor de millas (%): valor de millas / gasto.
  const retornoPct = gasto > 0 ? (valorUsd / gasto) * 100 : 0;

  const nombreCat = categoria === 'base' ? 'sin categoría' : categoria.charAt(0).toUpperCase() + categoria.slice(1);

  const _insight = {
    title: 'Millas que acumulás y cuánto valen',
    text: `Con un gasto de **US$ ${gasto.toLocaleString('es-CL')}** en tarifa **${tarifa}** y categoría **${nombreCat}**, acumulás alrededor de **${Math.round(millasTotales).toLocaleString('es-CL')} millas** LATAM Pass. A un valor de canje de referencia (1,4 ¢USD/milla) eso equivale a **${fmtCLP(valorPesos)}** en pasajes. Es un cálculo orientativo: el valor real de la milla varía según el canje.`,
    tone: 'neutral',
    icon: '✈️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Millas base', value: Math.round(millasBase) },
      { label: 'Bonus categoría', value: Math.round(millasBonus) },
    ],
    ariaLabel: `Millas base ${Math.round(millasBase)}, bonus por categoría ${Math.round(millasBonus)}, total ${Math.round(millasTotales)}.`,
  };

  return {
    millasTotales: Math.round(millasTotales).toLocaleString('es-CL') + ' millas',
    millasBase: Math.round(millasBase).toLocaleString('es-CL') + ' millas',
    millasBonus: Math.round(millasBonus).toLocaleString('es-CL') + ' millas',
    valorMillas: fmtCLP(valorPesos),
    retorno: retornoPct.toFixed(1).replace('.', ',') + '%',
    detalle: `Millas base = US$ ${gasto.toLocaleString('es-CL')} × ${factor} = ${Math.round(millasBase).toLocaleString('es-CL')}. Bonus ${nombreCat} (+${Math.round(bonus * 100)}%) = ${Math.round(millasBonus).toLocaleString('es-CL')}. Total = ${Math.round(millasTotales).toLocaleString('es-CL')} millas ≈ ${fmtCLP(valorPesos)} (a 1,4 ¢USD/milla y dólar $${dolar.toLocaleString('es-CL')}).`,
    _insight,
    _chart,
  };
}
