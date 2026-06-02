export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoUocraConstruccionBasicoNeto(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico=1050000;
  const plusAntig=basico*0.005*antig;
  const bruto=basico+plusAntig;
  const jubilacion=bruto*0.11;
  const obraSocial=bruto*0.03;
  const pami=bruto*0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
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
  const totalDesc=jubilacion+obraSocial+pami+ganancias;
  const pctDesc=bruto>0?totalDesc/bruto*100:0;
  const insight={
    title:'Tu sueldo en mano',
    text:`Sobre un bruto de **$${Math.round(bruto).toLocaleString('es-AR')}** te quedan **$${Math.round(neto).toLocaleString('es-AR')}** netos: los descuentos de ley se llevan el **${pctDesc.toFixed(1)}%**.${plusAntig>0?` El plus por antigüedad (${antig} años) suma **$${Math.round(plusAntig).toLocaleString('es-AR')}** al básico.`:''}`,
    tone:'neutral' as const,
    icon:'👷',
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
