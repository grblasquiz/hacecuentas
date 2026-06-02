export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function gfrFiltradoGlomerularCkdEpi(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      g1etapa: 'G1 Normal',        g1rec: 'Controles anuales',
      g2etapa: 'G2 Leve',          g2rec: 'Identificar causa, controlar',
      g3aetapa: 'G3a Moderada',    g3arec: 'Nefrólogo',
      g3betapa: 'G3b Moderada-severa', g3brec: 'Nefrólogo activo',
      g4etapa: 'G4 Severa',        g4rec: 'Preparar terapia renal',
      g5etapa: 'G5 Falla renal',   g5rec: 'Diálisis o trasplante',
      insTitle: 'Qué dice tu filtrado',
      insGood: (g: number, et: string, rec: string) => `Tu filtrado estimado es **${g} mL/min/1.73m²** (**${et}**): la función renal está en buen nivel. Recomendación: ${rec.toLowerCase()}.`,
      insWarn: (g: number, et: string, rec: string) => `Tu filtrado estimado es **${g} mL/min/1.73m²** (**${et}**): indica función renal reducida. Recomendación: ${rec.toLowerCase()}. Es una estimación, confirmá con tu médico.`,
      segNorm: 'Normal', segMild: 'Leve', segMod: 'Moderada', segSev: 'Severa', segFail: 'Falla',
      ariaPrefix: 'Filtrado glomerular estimado',
    },
    en: {
      g1etapa: 'G1 Normal',        g1rec: 'Annual check-ups',
      g2etapa: 'G2 Mild',          g2rec: 'Identify cause, monitor',
      g3aetapa: 'G3a Moderate',    g3arec: 'Nephrology referral',
      g3betapa: 'G3b Moderate-severe', g3brec: 'Active nephrology care',
      g4etapa: 'G4 Severe',        g4rec: 'Prepare for renal therapy',
      g5etapa: 'G5 Kidney failure', g5rec: 'Dialysis or transplant',
      insTitle: 'What your eGFR means',
      insGood: (g: number, et: string, rec: string) => `Your estimated GFR is **${g} mL/min/1.73m²** (**${et}**): kidney function is at a good level. Recommendation: ${rec.toLowerCase()}.`,
      insWarn: (g: number, et: string, rec: string) => `Your estimated GFR is **${g} mL/min/1.73m²** (**${et}**): it points to reduced kidney function. Recommendation: ${rec.toLowerCase()}. This is an estimate — confirm with your doctor.`,
      segNorm: 'Normal', segMild: 'Mild', segMod: 'Moderate', segSev: 'Severe', segFail: 'Failure',
      ariaPrefix: 'Estimated glomerular filtration rate',
    },
  } as const)[__lang];
  const c=Number(i.creatinina)||0; const e=Number(i.edad)||0; const sx=String(i.sexo||'hombre');
  const k=sx==='hombre'?0.9:0.7; const a=sx==='hombre'?-0.302:-0.241;
  const min=Math.min(c/k,1); const max=Math.max(c/k,1);
  const gfr=142*Math.pow(min,a)*Math.pow(max,-1.200)*Math.pow(0.9938,e)*(sx==='mujer'?1.012:1);
  let etapa='', rec='';
  if(gfr>=90){etapa=T.g1etapa;rec=T.g1rec}
  else if(gfr>=60){etapa=T.g2etapa;rec=T.g2rec}
  else if(gfr>=45){etapa=T.g3aetapa;rec=T.g3arec}
  else if(gfr>=30){etapa=T.g3betapa;rec=T.g3brec}
  else if(gfr>=15){etapa=T.g4etapa;rec=T.g4rec}
  else {etapa=T.g5etapa;rec=T.g5rec}
  const gfrR = Math.round(gfr);
  const _good = gfr >= 60;
  const _insight = {
    title: T.insTitle,
    text: _good ? T.insGood(gfrR, etapa, rec) : T.insWarn(gfrR, etapa, rec),
    tone: (_good ? 'good' : 'warn') as 'good' | 'warn',
    icon: '🫘',
  };
  const _chart = {
    type: 'scale',
    marker: gfrR,
    markerLabel: `${gfrR}`,
    min: 0,
    segments: [
      { nombre: T.segFail, max: 15, color: '#b91c1c', colorDark: '#dc2626' },
      { nombre: T.segSev, max: 30, color: '#ef4444', colorDark: '#f87171' },
      { nombre: T.segMod, max: 60, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: T.segMild, max: 90, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: T.segNorm, max: Math.max(140, gfrR + 10), color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `${T.ariaPrefix}: ${gfrR} mL/min/1.73m²`,
  };
  return { gfr:`${gfrR} mL/min/1.73m²`, etapa:etapa, recomendacion:rec, _insight, _chart };
}
