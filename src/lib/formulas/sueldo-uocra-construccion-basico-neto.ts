import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoUocraConstruccionBasicoNeto(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'ayudante');
  const zona=String(i.zona||'general');
  const HORAS_MES = 200; // jornada estándar 8 hs × 25 días
  // Escala oficial CCT 76/75 vigente desde 01/08/2026, UOCRA (Anexo I).
  // El sereno se liquida mensual; el resto son jornales horarios.
  const ESCALA: Record<string, Record<string, number>> = {
    ayudante:      { general: 5399, patagonia: 6020, 'santa-cruz': 10007, tdf: 10798 },
    mediof:        { general: 5866, patagonia: 6502, 'santa-cruz': 10306, tdf: 11732 },
    oficial:       { general: 6348, patagonia: 7049, 'santa-cruz': 10680, tdf: 12695 },
    especializado: { general: 7420, patagonia: 8237, 'santa-cruz': 11392, tdf: 14841 },
    sereno:        { general: 980858, patagonia: 1092719, 'santa-cruz': 1639782, tdf: 1961716 },
  };
  const escalaCategoria = ESCALA[categoria] ?? ESCALA.ayudante;
  const basicoUnidad = escalaCategoria[zona] ?? escalaCategoria.general;
  const basicoMes = categoria === 'sereno' ? basicoUnidad : basicoUnidad * HORAS_MES;
  const plusAntig = basicoMes * 0.01 * antig; // 1% del básico por año (CCT 76/75)
  const bruto = basicoMes + plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const cuotaSind = bruto * 0.02; // cuota sindical UOCRA
  const neto = bruto - jubilacion - obraSocial - pami - cuotaSind;
  const sac = bruto/12;
  // Fondo de Cese Laboral (Ley 22.250 art.15): 12% el primer año, 8% desde el segundo. Va al IERIC, fuera del recibo.
  const fcl = bruto * (antig < 1 ? 0.12 : 0.08);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Cuota sindical', value: cuotaSind },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y cuota sindical.',
  };
  const totalDesc=jubilacion+obraSocial+pami+cuotaSind;
  const pctDesc=bruto>0?totalDesc/bruto*100:0;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight={
    title:'Tu sueldo en mano',
    text:`Sobre un bruto de **$${fmt(bruto)}** te quedan **$${fmt(neto)}** netos: los descuentos de ley se llevan el **${pctDesc.toFixed(1)}%**.${plusAntig>0?` El plus por antigüedad (${antig} años, 1% anual) suma **$${fmt(plusAntig)}**.`:''} Además, el empleador deposita **$${fmt(fcl)}/mes** en tu Fondo de Cese Laboral (IERIC).`,
    tone:'neutral' as const,
    icon:'👷',
  };
  return {
    basico: '$'+Math.round(basicoUnidad).toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    fcl: '$'+fcl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `${categoria === 'sereno' ? 'Básico mensual' : 'Básico por hora'}: $${fmt(basicoUnidad)} (Zona ${zona}, escala agosto 2026). Bruto mensual ~$${fmt(bruto)}, neto ~$${fmt(neto)}. FCL ~$${fmt(fcl)}/mes al IERIC.`,
    _chart: chart,
    _insight: insight
  };
}
