/** Monotributo vs Responsable Inscripto — cuál conviene por facturación */
export interface Inputs {
  facturacionAnual: number;
  tipoActividad: 'servicios' | 'comercio' | string;
  gastosAnuales?: number;
}
export interface Outputs {
  monotributoAnual: number;
  cuotaMensualMonotributo: number;
  categoriaSugerida: string;
  inscriptoAnual: number;
  ivaInscripto: number;
  gananciasInscripto: number;
  iibbInscripto: number;
  diferencia: number;
  recomendacion: string;
}

// Categorías monotributo 2026 (aproximadas — actualizadas semestralmente)
const CATEGORIAS = [
  { letra: 'A', topeFactServ: 7_800_000, topeFactCom: 7_800_000, cuota: 60_000 },
  { letra: 'B', topeFactServ: 11_400_000, topeFactCom: 11_400_000, cuota: 70_000 },
  { letra: 'C', topeFactServ: 16_200_000, topeFactCom: 16_200_000, cuota: 85_000 },
  { letra: 'D', topeFactServ: 20_000_000, topeFactCom: 20_000_000, cuota: 100_000 },
  { letra: 'E', topeFactServ: 23_500_000, topeFactCom: 23_500_000, cuota: 130_000 },
  { letra: 'F', topeFactServ: 30_000_000, topeFactCom: 30_000_000, cuota: 170_000 },
  { letra: 'G', topeFactServ: 37_000_000, topeFactCom: 37_000_000, cuota: 210_000 },
  { letra: 'H', topeFactServ: 56_000_000, topeFactCom: 56_000_000, cuota: 400_000 },
  { letra: 'I', topeFactServ: 68_000_000, topeFactCom: 82_000_000, cuota: 600_000 },
  { letra: 'J', topeFactServ: 0, topeFactCom: 94_000_000, cuota: 750_000 },
  { letra: 'K', topeFactServ: 82_000_000, topeFactCom: 113_000_000, cuota: 1_000_000 },
];

export function monotributoVsInscripto(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnual);
  const tipo = String(i.tipoActividad || 'servicios');
  const gastos = Number(i.gastosAnuales) || 0;
  if (!fact || fact <= 0) throw new Error('Ingresá la facturación anual');

  // Encontrar categoría monotributo
  let categoria = null;
  for (const c of CATEGORIAS) {
    const tope = tipo === 'servicios' ? c.topeFactServ : c.topeFactCom;
    if (tope > 0 && fact <= tope) {
      categoria = c;
      break;
    }
  }

  const monoAnual = categoria ? categoria.cuota * 12 : 0;
  const cuotaMens = categoria ? categoria.cuota : 0;
  const catLetra = categoria ? categoria.letra : 'Fuera (RI)';

  // Responsable inscripto: IVA + Ganancias + IIBB
  // IVA: si cobra a consumidor final, 21 % del neto. Asumimos neutralidad (créditos=débitos) — simplificación
  const ivaDebito = fact * 0.21;
  const ivaCredito = gastos * 0.21;
  const ivaNeto = Math.max(0, ivaDebito - ivaCredito);

  // Ganancias: ingresos - gastos - MNI, sobre la escala aprox 35 % marginal media
  const baseGan = Math.max(0, fact - gastos - 2_280_000 * 12);
  const gananciasAnual = baseGan * 0.25; // aproximación simple

  // IIBB: 3.5 % promedio
  const iibb = fact * 0.035;

  const inscriptoAnual = ivaNeto + gananciasAnual + iibb;
  const diferencia = inscriptoAnual - monoAnual;

  let recomendacion = '';
  if (!categoria) {
    recomendacion = 'Superás el tope de monotributo — tenés que inscribirte como Responsable Inscripto.';
  } else if (diferencia > 0) {
    recomendacion = `Monotributo te ahorra ~$${Math.round(diferencia / 1000).toLocaleString('es-AR')}k al año.`;
  } else {
    recomendacion = `Inscripto te ahorra ~$${Math.round(-diferencia / 1000).toLocaleString('es-AR')}k al año gracias a la deducción de IVA y gastos.`;
  }

  return {
    monotributoAnual: monoAnual,
    cuotaMensualMonotributo: cuotaMens,
    categoriaSugerida: catLetra,
    inscriptoAnual: Math.round(inscriptoAnual),
    ivaInscripto: Math.round(ivaNeto),
    gananciasInscripto: Math.round(gananciasAnual),
    iibbInscripto: Math.round(iibb),
    diferencia: Math.round(diferencia),
    recomendacion,
  };
}
