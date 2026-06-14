import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoUocraConstruccionBasicoNeto(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'ayudante');
  const zona=String(i.zona||'general');
  const HORAS_MES = 200; // jornada estándar 8 hs × 25 días
  // Valor hora UOCRA Zona A (general) — escala CCT 76/75 vigente mayo 2026 (paritaria homologada).
  // Cambian por paritaria; verificá la escala vigente del mes en uocra.org / IERIC.
  const VALOR_HORA: Record<string, number> = {
    ayudante: 4698,
    mediof: 5183,
    oficial: 5776,
    especializado: 7080,
    sereno: 4698, // el sereno se liquida mensualizado; tomamos jornal de referencia equivalente
  };
  const valorHora = VALOR_HORA[categoria] ?? VALOR_HORA.ayudante;
  const ZONA: Record<string, number> = { general: 0, patagonia: 0.23, tdf: 0.50 };
  const adicZona = ZONA[zona] ?? 0;
  const basicoHora = valorHora * (1 + adicZona);
  const basicoMes = basicoHora * HORAS_MES;
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
    basico: '$'+Math.round(basicoHora).toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    fcl: '$'+fcl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico por hora: $${fmt(basicoHora)} (Zona ${zona}). Bruto mensual ~$${fmt(bruto)}, neto ~$${fmt(neto)}. FCL ~$${fmt(fcl)}/mes al IERIC.`,
    _chart: chart,
    _insight: insight
  };
}
