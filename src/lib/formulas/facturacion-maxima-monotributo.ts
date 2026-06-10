/** Facturación máxima antes de pasar a Responsable Inscripto.
 *  Topes/cuotas ARCA 2026 desde la fuente única src/lib/data/monotributo-2026.ts
 *  (desde 2026 los topes son iguales para servicios y venta de bienes, y
 *  servicios alcanza hasta la categoría K). */
import { CATEGORIAS, TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, type Cat } from '../data/monotributo-2026';

export interface Inputs {
  categoriaActual: string;
  actividad: string;
  facturacionActual: number;
  mesesTranscurridos: number;
}

export interface Outputs {
  topeCategoria: number;
  facturacionProyectada: number;
  margenRestante: number;
  mesesHastaExceder: number;
  proximaCategoria: string;
  costoResponsableInscripto: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

interface CatInfo {
  letra: Cat;
  factServicios: number;
  factVenta: number;
  cuota: number;
}

// Tabla ARCA 2026 (vigente 2026-02-01): topes iguales para ambas actividades;
// la cuota difiere (acá es informativa, el cálculo usa los topes).
const CATS: CatInfo[] = CATEGORIAS.map((letra) => ({
  letra,
  factServicios: TOPES[letra],
  factVenta: TOPES[letra],
  cuota: CUOTA_SERVICIOS[letra] ?? CUOTA_BIENES[letra],
}));

export function facturacionMaximaMonotributo(i: Inputs): Outputs {
  const catActual = String(i.categoriaActual || 'A').toUpperCase();
  const actividad = String(i.actividad || 'servicios');
  const facActual = Number(i.facturacionActual) || 0;
  const meses = Math.max(1, Number(i.mesesTranscurridos) || 6);

  const esServicios = actividad === 'servicios';
  const catInfo = CATS.find(c => c.letra === catActual);
  if (!catInfo) throw new Error('Categoría no válida');

  // 2026: topes iguales para servicios y bienes; servicios alcanza hasta K.
  const topeCategoria = esServicios ? catInfo.factServicios : catInfo.factVenta;

  // Proyectar facturación anual
  const facMensualPromedio = facActual / meses;
  const facturacionProyectada = facMensualPromedio * 12;
  const margenRestante = topeCategoria - facturacionProyectada;

  // Meses hasta exceder el tope
  const mesesHastaExceder = facMensualPromedio > 0
    ? Math.max(0, Math.floor((topeCategoria - facActual) / facMensualPromedio))
    : 999;

  // Próxima categoría
  const catIdx = CATS.findIndex(c => c.letra === catActual);
  const proximaCat = catIdx < CATS.length - 1 ? CATS[catIdx + 1] : null;
  const proximaCategoria = proximaCat ? proximaCat.letra : 'Responsable Inscripto';

  // Costo estimado como RI (IVA 21% + Ganancias ~25% efectivo + IIBB ~3.5%)
  const costoResponsableInscripto = facturacionProyectada * 0.295;

  const formula = `Tope ${catActual}: $${topeCategoria.toLocaleString()} — Proyectado: $${Math.round(facturacionProyectada).toLocaleString()}`;
  const explicacion = `Categoría ${catActual} (${actividad}): tope $${topeCategoria.toLocaleString()}/año. Facturación actual: $${facActual.toLocaleString()} en ${meses} meses (promedio $${Math.round(facMensualPromedio).toLocaleString()}/mes). Proyección anual: $${Math.round(facturacionProyectada).toLocaleString()}. ${margenRestante > 0 ? `Margen: $${Math.round(margenRestante).toLocaleString()} (podés facturar ~$${Math.round(margenRestante / Math.max(1, 12 - meses)).toLocaleString()} más por mes).` : `¡Excedés el tope! Debés recategorizarte a ${proximaCategoria}.`}${mesesHastaExceder < 12 ? ` Al ritmo actual, en ${mesesHastaExceder} meses excedés esta categoría.` : ''} Si pasaras a RI, la carga fiscal estimada sería ~$${Math.round(costoResponsableInscripto).toLocaleString()}/año.`;

  // ========== INSIGHT ==========
  const proyFmt = Math.round(facturacionProyectada).toLocaleString();
  const topeFmt = topeCategoria.toLocaleString();
  const pctTope = topeCategoria > 0 ? (facturacionProyectada / topeCategoria) * 100 : 0;
  let insightTitle: string;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (margenRestante < 0) {
    insightTitle = 'Excedés el tope';
    insightText = `Tu proyección anual de **$${proyFmt}** supera el tope de la categoría ${catActual} (**$${topeFmt}**). Tenés que recategorizarte a **${proximaCategoria}** o pasar a Responsable Inscripto.`;
    insightTone = 'warn';
    insightIcon = '🚨';
  } else if (pctTope >= 80) {
    insightTitle = 'Cerca del límite';
    insightText = `Proyectás **$${proyFmt}** al año, un **${pctTope.toFixed(0)}%** del tope de la categoría ${catActual} (**$${topeFmt}**). Te quedan **$${Math.round(margenRestante).toLocaleString()}** de margen${mesesHastaExceder < 12 ? `; al ritmo actual lo superás en **${mesesHastaExceder} meses**` : ''}.`;
    insightTone = 'warn';
    insightIcon = '⚠️';
  } else {
    insightTitle = 'Margen holgado';
    insightText = `Tu proyección de **$${proyFmt}** está en el **${pctTope.toFixed(0)}%** del tope de la categoría ${catActual}. Podés facturar hasta **$${Math.round(margenRestante).toLocaleString()}** más este año sin recategorizar.`;
    insightTone = 'good';
    insightIcon = '✅';
  }

  // ========== GAUGE: proyección dentro del tope ==========
  const segMax = Math.max(topeCategoria * 1.1, facturacionProyectada * 1.05);
  const chart = {
    type: 'scale',
    marker: Math.round(facturacionProyectada),
    markerLabel: `Proyección $${proyFmt}`,
    min: 0,
    segments: [
      { nombre: 'Margen holgado', max: Math.round(topeCategoria * 0.8), color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Cerca del tope', max: topeCategoria, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Excedido', max: Math.round(segMax), color: '#dc2626', colorDark: '#ef4444' }
    ],
    ariaLabel: `Facturación proyectada de $${proyFmt} sobre un tope de $${topeFmt} para la categoría ${catActual}`
  };

  return {
    topeCategoria,
    facturacionProyectada: Math.round(facturacionProyectada),
    margenRestante: Math.round(margenRestante),
    mesesHastaExceder,
    proximaCategoria,
    costoResponsableInscripto: Math.round(costoResponsableInscripto),
    formula,
    explicacion,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: insightIcon
    },
    _chart: chart,
  };
}
