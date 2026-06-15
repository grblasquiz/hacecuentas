/**
 * Renta de Segunda Categoría (ganancia de capital) — Perú 2026.
 * Calcula el Impuesto a la Renta de 2da categoría por:
 *   - Venta de INMUEBLES: 5% sobre la ganancia (valor venta − costo computable). Sin deducción del 20%.
 *   - Venta de ACCIONES / valores mobiliarios: 6,25% sobre la renta neta (= 80% de la ganancia tras
 *     deducción del 20%) → 5% efectivo sobre la ganancia. CAVALI retiene el 5% en operaciones locales.
 *   - DIVIDENDOS: 5% de retención sobre el monto distribuido (no hay costo ni deducción).
 *
 * Fuentes 2026:
 *   - SUNAT — Rentas de 2da categoría (inmuebles): tasa 5% sobre la ganancia, Formulario Virtual 1665.
 *     https://personas.sunat.gob.pe/vendo-mi-casa/rentas-segunda-categoria
 *   - SUNAT — Venta de valores mobiliarios: 6,25% sobre renta neta (renta bruta − 20%) = 5% efectivo.
 *     https://www.gob.pe/8248-calcular-el-impuesto-a-la-renta-de-segunda-categoria-para-venta-de-valores-mobiliarios-y-ganancias-en-fondos-mutuos
 *   - Exoneración BVL (Ley 30341 / Ley 31662) VENCIÓ el 31/12/2023 y NO fue prorrogada → desde 2024 las
 *     ganancias en bolsa están gravadas. (EY Perú / Gestión, 2024.)
 *   - Dividendos: retención 5% (Art. 52-A y 73-A TUO Ley del Impuesto a la Renta).
 *   - UIT 2026: S/ 5.500 (DS 301-2025-EF), vía src/lib/data/peru-2026.ts.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Tasas y parámetros de la renta de 2da categoría (ganancia de capital) — Perú 2026.
// fuente: SUNAT, https://personas.sunat.gob.pe/vendo-mi-casa/rentas-segunda-categoria, 2026
const TASA_EFECTIVA = 0.05;        // 5% efectivo sobre la ganancia (inmuebles directo; valores = 6,25% sobre 80%)
const TASA_RENTA_NETA = 0.0625;    // 6,25% sobre la renta neta (valores mobiliarios)
const DEDUCCION_VALORES = 0.20;    // 20% de deducción sobre la renta bruta (solo valores mobiliarios)
const TASA_DIVIDENDOS = 0.05;      // 5% de retención sobre dividendos

export interface Inputs {
  tipo: string;            // 'inmueble' | 'acciones' | 'dividendos'
  precioVenta?: number;    // valor de venta (inmueble/acciones) o monto de dividendo distribuido
  costoAdquisicion?: number; // costo computable (inmueble/acciones); ignorado en dividendos
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipo || 'inmueble');
  const precioVenta = Number(i.precioVenta) || 0;
  const costo = Number(i.costoAdquisicion) || 0;

  if (precioVenta <= 0) {
    throw new Error('Ingresá el precio de venta (o el monto del dividendo) en soles');
  }

  // ---- DIVIDENDOS: 5% directo sobre el monto distribuido, sin costo ni deducción ----
  if (tipo === 'dividendos') {
    const impuesto = precioVenta * TASA_DIVIDENDOS;
    const neto = precioVenta - impuesto;
    const _insight = {
      title: 'Retención de 5% sobre tus dividendos',
      text: `Sobre dividendos de **${fmtPEN(precioVenta)}**, la empresa (o CAVALI) retiene **${fmtPEN(impuesto)}** (5%) y recibís **${fmtPEN(neto)}** netos. Es una retención **definitiva**: no tenés que volver a declararla ni sumarla a otras rentas.`,
      tone: 'neutral',
      icon: '💰',
    };
    const _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Dividendo neto', value: Math.round(neto) },
        { label: 'Retención 5%', value: Math.round(impuesto) },
      ].filter((s) => s.value > 0),
      prefix: 'S/ ',
      centerValue: fmtPEN(impuesto),
      centerLabel: 'Impuesto (5%)',
      ariaLabel: `Retención de ${fmtPEN(impuesto)} (5%) sobre dividendos de ${fmtPEN(precioVenta)}.`,
    };
    return {
      impuesto: fmtPEN(impuesto),
      ganancia: fmtPEN(precioVenta),
      neto: fmtPEN(neto),
      tasaAplicada: '5% (retención definitiva sobre el dividendo)',
      detalle: `Dividendo ${fmtPEN(precioVenta)} × 5% = ${fmtPEN(impuesto)} de impuesto · te queda ${fmtPEN(neto)}.`,
      _insight,
      _chart,
    };
  }

  // ---- INMUEBLES y ACCIONES: ganancia = precio de venta − costo de adquisición ----
  const ganancia = precioVenta - costo;

  if (ganancia <= 0) {
    const _insight = {
      title: 'No hay impuesto: no hubo ganancia',
      text: `Vendiste en **${fmtPEN(precioVenta)}** y tu costo fue **${fmtPEN(costo)}**, así que **no hubo ganancia de capital**. La renta de 2da categoría grava solo la ganancia, por lo que el impuesto es **S/ 0**.`,
      tone: 'good',
      icon: '✅',
    };
    return {
      impuesto: fmtPEN(0),
      ganancia: fmtPEN(0),
      neto: fmtPEN(precioVenta),
      tasaAplicada: tipo === 'acciones' ? '6,25% sobre renta neta (5% efectivo)' : '5% sobre la ganancia',
      detalle: `Sin ganancia (vendés en ${fmtPEN(precioVenta)} y tu costo es ${fmtPEN(costo)}) → impuesto S/ 0.`,
      _insight,
    };
  }

  let impuesto: number;
  let baseImponible: number;
  let tasaTexto: string;

  if (tipo === 'acciones') {
    // Valores mobiliarios: renta neta = 80% de la ganancia (deducción 20%); 6,25% sobre esa neta = 5% efectivo.
    const rentaNeta = ganancia * (1 - DEDUCCION_VALORES);
    baseImponible = rentaNeta;
    impuesto = rentaNeta * TASA_RENTA_NETA;
    tasaTexto = '6,25% sobre la renta neta (80% de la ganancia) = 5% efectivo';
  } else {
    // Inmuebles: 5% directo sobre la ganancia (sin deducción del 20%).
    baseImponible = ganancia;
    impuesto = ganancia * TASA_EFECTIVA;
    tasaTexto = '5% sobre la ganancia (valor de venta − costo computable)';
  }

  const tasaEfectivaReal = ganancia > 0 ? (impuesto / ganancia) * 100 : 0;
  const netoFinal = precioVenta - impuesto;

  const _insight = {
    title: tipo === 'acciones' ? 'Impuesto por venta de acciones' : 'Impuesto por venta de inmueble',
    text:
      tipo === 'acciones'
        ? `Tu ganancia fue **${fmtPEN(ganancia)}**. Tras la deducción del 20%, la renta neta es **${fmtPEN(baseImponible)}** y el impuesto (6,25%) es **${fmtPEN(impuesto)}** — un **5% efectivo** sobre la ganancia. En operaciones en la BVL, **CAVALI retiene** ese 5% automáticamente; la exoneración bursátil **venció en 2023**.`
        : `Tu ganancia fue **${fmtPEN(ganancia)}** y el impuesto es **${fmtPEN(impuesto)}** (5% sobre la ganancia). Se paga con el **Formulario Virtual 1665**, normalmente **antes** de firmar la escritura (el notario lo exige). Si el inmueble es tu **casa habitación** (más de 2 años) o lo compraste **antes de 2004**, está exonerado.`,
    tone: 'warn',
    icon: tipo === 'acciones' ? '📈' : '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Te queda (neto de venta)', value: Math.round(netoFinal) },
      { label: 'Impuesto 2da categoría', value: Math.round(impuesto) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(impuesto),
    centerLabel: 'Impuesto a pagar',
    ariaLabel: `Impuesto de ${fmtPEN(impuesto)} sobre una ganancia de ${fmtPEN(ganancia)} (${tipo}).`,
  };

  return {
    impuesto: fmtPEN(impuesto),
    ganancia: fmtPEN(ganancia),
    baseImponible: fmtPEN(baseImponible),
    neto: fmtPEN(netoFinal),
    tasaAplicada: tasaTexto,
    tasaEfectiva: tasaEfectivaReal.toFixed(2).replace('.', ',') + '% efectivo sobre la ganancia',
    detalle:
      tipo === 'acciones'
        ? `Ganancia ${fmtPEN(ganancia)} → renta neta ${fmtPEN(baseImponible)} (−20%) × 6,25% = ${fmtPEN(impuesto)} (5% efectivo).`
        : `Ganancia ${fmtPEN(ganancia)} × 5% = ${fmtPEN(impuesto)}. UIT 2026: ${fmtPEN(PERU_2026.uit)}.`,
    _insight,
    _chart,
  };
}
