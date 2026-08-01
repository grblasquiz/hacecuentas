/**
 * Simulador monotributo INTEGRAL — multicálculo.
 * Una sola entrada (facturación mensual) → categoría + cuota + neto en mano +
 * carga % + margen hasta el tope de tu categoría y hasta la exclusión (K) +
 * recordatorio de recategorización.
 *
 * HUB: no compite con `calculadora-monotributo-2026` (intención "categorías/
 * tabla/topes", landing paga) — acá la intención es "cuánto me queda neto
 * siendo monotributista". Enlaza a las calcs dedicadas.
 *
 * Data: importa TODO de src/lib/data/monotributo-2026.ts (fuente única ARCA,
 * vigencia 2026-08-01). Cero números hardcodeados acá.
 */

import {
  TOPES,
  CATEGORIAS,
  cuota as cuotaMono,
  type Actividad,
  type Cat,
} from '../data/monotributo-2026';

export interface Inputs {
  facturacionMensual: number;
  actividad?: string; // 'servicios' | 'bienes'
  gastosMensuales?: number | string; // gastos del negocio (opcional)
  __lang?: string;
}

export interface Outputs {
  categoria: string;
  cuotaMensual: number;
  netoMensual: number;
  netoAnual: number;
  cargaPct: number;
  margenCategoria: number;
  margenExclusion: number;
  proximaRecategorizacion: string;
  _chart?: any;
  _insight?: any;
}

export function simuladorMonotributoNeto(inputs: Inputs): Outputs {
  const fact = Number(inputs.facturacionMensual);
  if (!fact || fact <= 0) throw new Error('Ingresá tu facturación mensual');

  const act: Actividad = inputs.actividad === 'bienes' ? 'bienes' : 'servicios';
  // '' del form se trata como 0 (default de campo numérico opcional).
  const gastos = Math.max(0, Number(inputs.gastosMensuales) || 0);
  const anual = fact * 12;

  // Categoría: primera cuyo tope anual cubre la facturación proyectada.
  const cat: Cat | undefined = CATEGORIAS.find((c) => anual <= TOPES[c]);
  if (!cat) {
    throw new Error(
      `Con $${Math.round(anual).toLocaleString('es-AR')} anuales superás el tope de la categoría K ` +
        `($${Math.round(TOPES.K).toLocaleString('es-AR')}): quedás excluido del monotributo y pasás al Régimen General (Responsable Inscripto).`
    );
  }

  const cuotaMensual = cuotaMono(cat, act);
  const netoMensual = fact - cuotaMensual - gastos;
  const netoAnual = netoMensual * 12;
  const cargaPct = (cuotaMensual / fact) * 100;
  const margenCategoria = TOPES[cat] - anual;
  const margenExclusion = TOPES.K - anual;

  const f = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto en mano', value: Math.round(netoMensual) },
      { label: 'Cuota monotributo', value: Math.round(cuotaMensual) },
      ...(gastos > 0 ? [{ label: 'Gastos del negocio', value: Math.round(gastos) }] : []),
    ],
    prefix: '$',
    centerValue: f(fact),
    centerLabel: 'Facturación',
    ariaLabel: 'Composición de la facturación mensual: neto en mano, cuota de monotributo y gastos',
  };

  // Aviso si está cerca del tope de su categoría (menos de 10% de margen).
  const cercaDelTope = margenCategoria < anual * 0.1;
  const insight = {
    title: 'Tu monotributo, de un vistazo',
    text:
      `Facturando ${f(fact)}/mes (${act}) sos categoría **${cat}**: pagás ${f(cuotaMensual)} de cuota ` +
      `(${cargaPct.toFixed(1)}% de tu facturación) y te quedan **${f(netoMensual)}** netos por mes` +
      (gastos > 0 ? ` (ya descontados ${f(gastos)} de gastos)` : '') +
      `. Te queda ${f(margenCategoria)} de margen anual antes de subir de categoría` +
      (cercaDelTope ? ' — **estás cerca del tope, ojo en la próxima recategorización**' : '') +
      `. La recategorización es semestral (enero y julio).`,
    tone: cercaDelTope ? 'warn' : 'neutral',
    icon: '🧾',
  };

  return {
    categoria: cat,
    cuotaMensual: Math.round(cuotaMensual),
    netoMensual: Math.round(netoMensual),
    netoAnual: Math.round(netoAnual),
    cargaPct: Number(cargaPct.toFixed(2)),
    margenCategoria: Math.round(margenCategoria),
    margenExclusion: Math.round(margenExclusion),
    proximaRecategorizacion: 'Enero y julio (semestral) — la de julio 2026 cierra el 5/8/2026',
    _chart: chart,
    _insight: insight,
  };
}
