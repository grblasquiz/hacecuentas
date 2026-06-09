import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
import { aplicarEscalaMensual, MNI_MENSUAL_BASE, INCREMENTO_HIJO_MENSUAL, INCREMENTO_CONYUGE_MENSUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoGastronomicoUthgraMozoCocinero(i: Inputs): Outputs {
  const antig = Number(i.antiguedad) || 0;
  const cargas = Number(i.cargas) || 0;
  const conyuge = Number(i.conyuge) || 0;
  // Básico Mozo de Primera (Cat D tramo 1) junio 2026 según acuerdo UTHGRA-FEHGRA
  // CCT 389/04 homologado abril 2026. Fuente: calcularsueldo.com.ar/paritarias/14416
  const basico = 990_000;
  const plusAntig = basico * 0.01 * antig;
  const bruto = basico + plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const baseGanancias = Math.max(0, bruto - jubilacion - obraSocial - pami - MNI_MENSUAL_BASE - cargas * INCREMENTO_HIJO_MENSUAL - conyuge * INCREMENTO_CONYUGE_MENSUAL);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const pctNeto = bruto > 0 ? Math.round((neto / bruto) * 100) : 0;
  const fmt = (n: number) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const insight = {
    title: 'De tu bruto, cuánto te queda',
    text: `Como mozo/cocinero UTHGRA con ${antig} años de antigüedad, tu bruto es **$${fmt(bruto)}** y cobrás **$${fmt(neto)}** de bolsillo (**${pctNeto}%**). Los aportes de ley descuentan **$${fmt(jubilacion + obraSocial + pami)}**${ganancias > 0 ? ` y Ganancias se lleva otros $${fmt(ganancias)}` : '; con este sueldo todavía no pagás Ganancias'}.`,
    tone: ganancias > 0 ? 'warn' : 'neutral',
    icon: '🍽️',
  };
  return {
    basico: '$' + basico.toLocaleString('es-AR'),
    bruto: '$' + bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    neto: '$' + neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    sac: '$' + sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años: neto ~$${neto.toFixed(0)}.`,
    _chart: chart,
    _insight: insight,
  };
}
