/** Monotributo vs Responsable Inscripto — cuál conviene por facturación */
import { TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, CATEGORIAS as CATS_MONO } from '../data/monotributo-2026';

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
  _chart?: any;
  _insight?: any;
}

// Categorías monotributo — fuente única src/lib/data/monotributo-2026.ts (ARCA 2026).
// Servicios topea en H; I-J-K son exclusivas de venta de bienes (cuota CUOTA_BIENES).
// Para servicios usamos la cuota de servicios; para comercio/bienes la de bienes.
const CATEGORIAS = CATS_MONO.map((letra) => {
  const esBienesExclusiva = letra === 'I' || letra === 'J' || letra === 'K';
  return {
    letra,
    topeFactServ: esBienesExclusiva ? 0 : TOPES[letra],
    topeFactCom: TOPES[letra],
    cuotaServ: CUOTA_SERVICIOS[letra],
    cuotaCom: CUOTA_BIENES[letra],
  };
});

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

  const cuotaMens = categoria ? (tipo === 'servicios' ? categoria.cuotaServ : categoria.cuotaCom) : 0;
  const monoAnual = cuotaMens * 12;
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

  const slicesRI = [
    { label: 'IVA', value: Math.round(ivaNeto) },
    { label: 'Ganancias', value: Math.round(gananciasAnual) },
    { label: 'Ingresos Brutos', value: Math.round(iibb) },
  ].filter((s) => s.value > 0);

  const chart = slicesRI.length >= 2 ? {
    type: 'doughnut' as const,
    slices: slicesRI,
    prefix: '$',
    centerValue: '$' + Math.round(inscriptoAnual).toLocaleString('es-AR'),
    centerLabel: 'RI anual',
    ariaLabel: 'Composición de impuestos como Responsable Inscripto: IVA, Ganancias e Ingresos Brutos',
  } : undefined;

  let _insight;
  const fmtMiles = (n: number) => '$' + Math.round(Math.abs(n)).toLocaleString('es-AR');
  if (!categoria) {
    _insight = {
      title: 'Superás el monotributo',
      text: `Con **${fmtMiles(fact)}** de facturación anual quedás fuera del monotributo: tenés que inscribirte como **Responsable Inscripto** y tributar IVA, Ganancias e Ingresos Brutos.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (diferencia > 0) {
    _insight = {
      title: 'Te conviene el Monotributo',
      text: `Como **Monotributo categoría ${catLetra}** pagás **${fmtMiles(monoAnual)}/año**, contra **${fmtMiles(inscriptoAnual)}** que pagarías como Responsable Inscripto. El monotributo te ahorra **${fmtMiles(diferencia)}** al año.`,
      tone: 'good',
      icon: '✅',
    };
  } else {
    _insight = {
      title: 'Te conviene ser Responsable Inscripto',
      text: `Aun pudiendo ser **Monotributo ${catLetra}** ($${Math.round(monoAnual).toLocaleString('es-AR')}/año), como Responsable Inscripto pagarías **${fmtMiles(inscriptoAnual)}** y ahorrarías **${fmtMiles(diferencia)}** al año gracias a deducir IVA y gastos.`,
      tone: 'neutral',
      icon: '📊',
    };
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
    _chart: chart,
    _insight,
  };
}
