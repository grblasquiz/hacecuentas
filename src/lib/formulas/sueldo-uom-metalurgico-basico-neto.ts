import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoUomMetalurgicoBasicoNeto(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'1');
  // Básicos mensuales (200 hs) UOM Rama 17 metalmecánica, escala CCT 260/75 vigente mayo 2026 (paritaria homologada).
  // Cambian por paritaria trimestral; verificá la escala vigente en uom.org.ar.
  const BASICOS: Record<string, number> = {
    '1': 862686,   // Ingresante / peón
    '2': 934548,   // Operario calificado
    '3': 1007216,  // Medio oficial
    '4': 1077490,  // Operario especializado
    '5': 1139126,  // Operario especializado múltiple
    '6': 1191768,  // Oficial
    '7': 1191768,  // Oficial (categoría superior — mismo tope de escala homologada)
  };
  const basico = BASICOS[categoria] ?? BASICOS['1'];
  const plusAntig=basico*0.01*antig;
  const bruto=basico+plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const cuotaSind = bruto * 0.02; // cuota sindical UOM
  const neto=bruto-jubilacion-obraSocial-pami-cuotaSind;
  const sac=bruto/12;
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
  const insight={
    title:'Tu sueldo en mano',
    text:`Sobre un bruto de **$${Math.round(bruto).toLocaleString('es-AR')}** te quedan **$${Math.round(neto).toLocaleString('es-AR')}** netos: los descuentos de ley se llevan el **${pctDesc.toFixed(1)}%**.${plusAntig>0?` El plus por antigüedad (${antig} años, 1% anual) suma **$${Math.round(plusAntig).toLocaleString('es-AR')}** al básico.`:''}`,
    tone:'neutral' as const,
    icon:'🔧',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años y cargas: neto ~$${neto.toFixed(0)}.`,
    _chart: chart,
    _insight: insight
  };
}
