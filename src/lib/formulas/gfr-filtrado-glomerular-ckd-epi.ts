export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
    },
    en: {
      g1etapa: 'G1 Normal',        g1rec: 'Annual check-ups',
      g2etapa: 'G2 Mild',          g2rec: 'Identify cause, monitor',
      g3aetapa: 'G3a Moderate',    g3arec: 'Nephrology referral',
      g3betapa: 'G3b Moderate-severe', g3brec: 'Active nephrology care',
      g4etapa: 'G4 Severe',        g4rec: 'Prepare for renal therapy',
      g5etapa: 'G5 Kidney failure', g5rec: 'Dialysis or transplant',
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
  return { gfr:`${Math.round(gfr)} mL/min/1.73m²`, etapa:etapa, recomendacion:rec };
}
