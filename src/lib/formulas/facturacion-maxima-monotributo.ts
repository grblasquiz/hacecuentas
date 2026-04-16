/** Facturación máxima antes de pasar a Responsable Inscripto */

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
}

interface CatInfo {
  letra: string;
  factServicios: number;
  factVenta: number;
  cuota: number;
}

const CATS: CatInfo[] = [
  { letra: 'A', factServicios: 7_813_063, factVenta: 7_813_063, cuota: 33_235 },
  { letra: 'B', factServicios: 11_447_046, factVenta: 11_447_046, cuota: 37_869 },
  { letra: 'C', factServicios: 16_050_091, factVenta: 16_050_091, cuota: 44_261 },
  { letra: 'D', factServicios: 19_926_340, factVenta: 19_926_340, cuota: 53_334 },
  { letra: 'E', factServicios: 23_439_192, factVenta: 27_688_614, cuota: 66_280 },
  { letra: 'F', factServicios: 29_374_695, factVenta: 34_610_768, cuota: 78_399 },
  { letra: 'G', factServicios: 35_128_502, factVenta: 41_532_922, cuota: 91_324 },
  { letra: 'H', factServicios: 52_692_753, factVenta: 57_609_911, cuota: 131_494 },
  { letra: 'I', factServicios: 0, factVenta: 66_111_165, cuota: 155_780 },
  { letra: 'J', factServicios: 0, factVenta: 76_227_802, cuota: 175_948 },
  { letra: 'K', factServicios: 0, factVenta: 86_344_440, cuota: 196_393 },
];

export function facturacionMaximaMonotributo(i: Inputs): Outputs {
  const catActual = String(i.categoriaActual || 'A').toUpperCase();
  const actividad = String(i.actividad || 'servicios');
  const facActual = Number(i.facturacionActual) || 0;
  const meses = Math.max(1, Number(i.mesesTranscurridos) || 6);

  const esServicios = actividad === 'servicios';
  const catInfo = CATS.find(c => c.letra === catActual);
  if (!catInfo) throw new Error('Categoría no válida');

  const topeCategoria = esServicios ? catInfo.factServicios : catInfo.factVenta;
  if (topeCategoria === 0) throw new Error(`Categoría ${catActual} no disponible para servicios`);

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

  return {
    topeCategoria,
    facturacionProyectada: Math.round(facturacionProyectada),
    margenRestante: Math.round(margenRestante),
    mesesHastaExceder,
    proximaCategoria,
    costoResponsableInscripto: Math.round(costoResponsableInscripto),
    formula,
    explicacion,
  };
}
