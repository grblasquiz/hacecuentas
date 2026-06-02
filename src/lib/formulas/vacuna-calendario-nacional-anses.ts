export interface Inputs { [k: string]: number | string; }
export interface Outputs { _insight?: any; [k: string]: string | number | undefined; }
export function vacunaCalendarioNacionalAnses(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  const cal: Record<number,string> = {
    0:'BCG + Hepatitis B (RN)',
    2:'Pentavalente + OPV + Rotavirus + Neumococo + Meningo',
    4:'Pentavalente + OPV + Rotavirus + Neumococo',
    6:'Pentavalente + OPV + Neumococo + Antigripal anual',
    12:'Triple Viral + Hep A + Varicela + Neumococo refuerzo',
    15:'Varicela + Hep A refuerzo',
    18:'DTP + OPV + Triple Viral refuerzo',
    72:'Triple bacteriana + OPV + Varicela refuerzo (6 años)'
  };
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let c=keys[0]; for (const k of keys) if (k<=m) c=k;
  const dosisHito = cal[c] || 'Sin vacunas programadas';
  const prox = keys.find(k => k > c);
  const _insight = {
    title: 'Dosis de este control',
    text: prox !== undefined
      ? `A los **${m} meses** el hito vigente es el de **${c} meses**: ${dosisHito}. El próximo control con vacunas del Calendario Nacional es a los **${prox} meses**.`
      : `A los **${m} meses** corresponde el último hito pediátrico del Calendario Nacional (**${c} meses**): ${dosisHito}. Después siguen los refuerzos de adolescencia y adultos.`,
    tone: 'neutral' as const,
    icon: '💉',
  };
  return { vacunas:dosisHito, resumen:`A los ${m} meses: ${cal[c]||'—'}.`, _insight };
}
