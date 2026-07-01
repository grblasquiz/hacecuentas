/** Cuánto tenés que facturar por mes para que te quede un neto deseado
 * siendo monotributista, después de pagar la cuota del monotributo,
 * los gastos fijos y los gastos variables.
 *
 * Data: importa TODO de src/lib/data/monotributo-2026.ts (fuente única ARCA,
 * vigencia 2026-02-01). Cero números hardcodeados acá.
 *
 * Algoritmo: la cuota depende de la categoría y la categoría depende de la
 * facturación anual (F×12), así que se recorre A→K buscando el primer punto
 * fijo: F_cat = (neto + gastos + cuota_cat) / (1 − var%/100) tal que
 * F_cat × 12 entre en el tope de esa categoría. Como la cuota es una función
 * escalonada creciente, el primer punto fijo es el mínimo.
 * Si ni con la cuota de K entra en el tope de K → excede el monotributo. */

import {
  CATEGORIAS,
  TOPES,
  cuota as cuotaMono,
  fmtARS,
  type Actividad,
  type Cat,
} from '../data/monotributo-2026';

export interface Inputs {
  netoDeseado: number;
  actividad?: string; // 'servicios' | 'bienes'
  gastosFijos?: number;
  gastosVariablesPct?: number;
}

export interface Outputs {
  facturacionNecesaria: number;
  categoria: string;
  cuotaMensual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function cuantoFacturarParaGanarXNeto(i: Inputs): Outputs {
  const neto = Number(i.netoDeseado);
  const actividad: Actividad = i.actividad === 'bienes' ? 'bienes' : 'servicios';
  const gastos = Number(i.gastosFijos) || 0;
  const varPct = Number(i.gastosVariablesPct) || 0;

  if (isNaN(neto) || neto <= 0) throw new Error('Ingresá el neto mensual que querés que te quede');
  if (gastos < 0) throw new Error('Los gastos fijos no pueden ser negativos');
  if (isNaN(varPct) || varPct < 0 || varPct >= 100) throw new Error('Los gastos variables deben estar entre 0% y 99% de la facturación');

  // Buscar la categoría mínima cuyo tope banca la facturación resultante.
  let solucion: { cat: Cat; facturacion: number; cuota: number } | null = null;
  for (const cat of CATEGORIAS) {
    const cuotaCat = cuotaMono(cat, actividad);
    const facturacion = (neto + gastos + cuotaCat) / (1 - varPct / 100);
    if (facturacion * 12 <= TOPES[cat]) {
      solucion = { cat, facturacion, cuota: cuotaCat };
      break;
    }
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  if (!solucion) {
    // Ni con la cuota de K la facturación anual entra en el tope de K.
    const cuotaK = cuotaMono('K', actividad);
    const facturacionK = (neto + gastos + cuotaK) / (1 - varPct / 100);
    throw new Error(
      `Para que te queden $${fmt.format(neto)} netos necesitarías facturar ~$${fmt.format(facturacionK)}/mes ` +
      `($${fmt.format(facturacionK * 12)}/año), y eso supera el tope de la categoría K del monotributo (${fmtARS(TOPES.K)} anuales). ` +
      `Con ese nivel de ingresos te corresponde el Régimen General (autónomo + IVA + Ganancias): consultá con un contador.`
    );
  }

  const { cat, facturacion, cuota } = solucion;
  const gastosVariables = facturacion * (varPct / 100);
  const margenTope = TOPES[cat] - facturacion * 12;

  const detalle =
    `Para que te queden $${fmt.format(neto)} netos por mes tenés que facturar $${fmt.format(facturacion)}/mes ` +
    `($${fmt.format(facturacion * 12)}/año): pagás $${fmt.format(cuota)} de cuota de monotributo (categoría ${cat}, ${actividad})` +
    (gastos > 0 ? `, $${fmt.format(gastos)} de gastos fijos` : '') +
    (varPct > 0 ? ` y $${fmt.format(gastosVariables)} de gastos variables (${varPct}% de lo facturado)` : '') +
    `. Te queda margen de ${fmtARS(margenTope)} anuales hasta el tope de la categoría ${cat} (${fmtARS(TOPES[cat])}).`;

  const cercaDelTope = facturacion * 12 > TOPES[cat] * 0.9;
  const insight = {
    title: `Categoría ${cat} del monotributo`,
    text: `Facturando **$${fmt.format(facturacion)}/mes** caés en la **categoría ${cat}** (${actividad}) y pagás **$${fmt.format(cuota)}** de cuota mensual. ` +
      (cercaDelTope
        ? `Ojo: quedás a ${fmtARS(margenTope)} anuales del tope — si facturás un poco más, en la próxima recategorización saltás de categoría y la cuota sube.`
        : cat === 'K'
          ? `Estás en la última categoría del régimen: si tu facturación crece, lo que sigue es el Régimen General.`
          : `Tenés ${fmtARS(margenTope)} anuales de margen antes de saltar a la categoría siguiente en la recategorización semestral.`),
    tone: cercaDelTope || cat === 'K' ? 'warn' : 'good',
    icon: '🧾',
  };

  const slices = [
    { label: 'Tu neto', value: Math.round(neto) },
    { label: `Cuota monotributo (${cat})`, value: Math.round(cuota) },
  ];
  if (gastos > 0) slices.push({ label: 'Gastos fijos', value: Math.round(gastos) });
  if (gastosVariables > 0) slices.push({ label: 'Gastos variables', value: Math.round(gastosVariables) });

  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(facturacion)),
    centerLabel: 'Facturación/mes',
    ariaLabel: 'En qué se reparte la facturación mensual: neto, cuota de monotributo y gastos.',
  };

  return {
    facturacionNecesaria: Math.round(facturacion),
    categoria: `Categoría ${cat} (${actividad === 'bienes' ? 'venta de bienes' : 'servicios'})`,
    cuotaMensual: Math.round(cuota),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
