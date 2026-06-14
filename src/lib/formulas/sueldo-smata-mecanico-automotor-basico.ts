import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoSmataMecanicoAutomotorBasico(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const categoria=String(i.categoria||'oper');
  // Básicos mensuales de referencia SMATA — escala concesionarias/talleres ACARA-ACA, vigencia jun-2026.
  // Valores de paritaria homologada; verificá la escala vigente en smata.com.ar/convenios-y-escalas
  const BASICOS: Record<string, number> = {
    oper: 1297732,    // Operario / Semi-Oficial
    mediof: 1397000,  // Medio Oficial
    oficial: 1447446, // Oficial de taller
    maestro: 1604838, // Maestro / Oficial Especialista Superior
  };
  const basico = BASICOS[categoria] ?? BASICOS.oper;
  const plusAntig=basico*0.01*antig;
  const bruto=basico+plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const cuotaSind = bruto * 0.02; // cuota sindical SMATA
  const neto=bruto-jubilacion-obraSocial-pami-cuotaSind;
  const sac=bruto/12;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Tu sueldo SMATA',
    text: `Con **${antig} años** de antigüedad sumás **$${fmt(plusAntig)}** (1% por año) sobre el básico y cobrás bruto **$${fmt(bruto)}**. Tras los aportes de ley (~19%), de bolsillo te quedan **$${fmt(neto)}**.`,
    tone: 'neutral' as const,
    icon: '🔧',
  };
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
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años y cargas: neto ~$${neto.toFixed(0)}.`,
    _insight: insight,
    _chart: chart
  };
}
