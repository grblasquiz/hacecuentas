export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function equivalenciaToeflIeltsCambridgeMcer(i: Inputs): Outputs {
  const e=String(i.examen||'toefl'); const s=Number(i.score)||0;
  let toefl=0, ielts=0, cam='', mcer='';
  if (e==='toefl') { toefl=s; ielts=s>=100?7.5:s>=80?6.5:s>=60?5.5:4.5; cam=s>=100?'CAE':s>=80?'FCE':'PET'; mcer=s>=100?'C1':s>=80?'B2':s>=60?'B1':'A2'; }
  else if (e==='ielts') { ielts=s; toefl=Math.round(s*14.3); cam=s>=7.5?'CAE':s>=5.5?'FCE':'PET'; mcer=s>=7.5?'C1':s>=5.5?'B2':s>=4?'B1':'A2'; }
  else { cam=s.toString(); toefl=100; ielts=7; mcer='C1'; }

  // --- Insight narrativo según nivel MCER ---
  const mcerDesc: Record<string, string> = {
    A2: 'usuario básico: te manejás en situaciones cotidianas simples',
    B1: 'usuario independiente umbral: suficiente para viajar y trabajos no especializados',
    B2: 'usuario independiente avanzado: el nivel que piden la mayoría de universidades y empleos',
    C1: 'usuario competente: dominio operativo, válido para posgrados y trabajos exigentes',
  };
  const examenLabel: Record<string, string> = { toefl: 'TOEFL', ielts: 'IELTS', cambridge: 'Cambridge' };
  const _insight = {
    title: 'Tu nivel equivalente',
    text: `Un **${examenLabel[e] || e} ${s}** equivale a un nivel **${mcer}** del MCER (Cambridge ${cam}): ${mcerDesc[mcer] || 'nivel de competencia en el idioma'}. En otros exámenes ronda **TOEFL ${toefl}** / **IELTS ${ielts}**.`,
    tone: 'neutral',
    icon: '🗣️',
  };

  return { toefl:toefl.toString(), ielts:ielts.toString(), cambridge:cam, mcer, resumen:`${e} ${s} ≈ MCER ${mcer}.`, _insight };
}
