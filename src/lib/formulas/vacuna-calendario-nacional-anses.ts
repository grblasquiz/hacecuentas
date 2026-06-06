export interface Inputs { [k: string]: number | string; }
export interface Outputs { _insight?: any; [k: string]: string | number | undefined; }
export function vacunaCalendarioNacionalAnses(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  // Calendario Nacional de Vacunación Argentina 2026 (Res. 2883/2021 y actualizaciones)
  const cal: Record<number,string> = {
    0: 'BCG + Hepatitis B (recién nacido, dentro de las 12 h)',
    2: 'Pentavalente (DTP+Hib+HepB) + OPV + Rotavirus + Neumococo conjugada + Meningococo',
    4: 'Pentavalente + OPV + Rotavirus + Neumococo conjugada',
    6: 'Pentavalente + OPV + Influenza (anual, 1ra dosis)',
    12: 'Triple Viral (SRP) + Hepatitis A + Varicela + Neumococo refuerzo + Meningococo refuerzo',
    18: 'Quíntuple (DTP+Hib+HepB) o DTP + OPV + Hepatitis A refuerzo',
    60: 'Triple bacteriana (DTP) + Sabin + Triple Viral 2da dosis + Varicela 2da dosis (5-6 años)',
    132: 'dTpa (tétanos, difteria, pertussis acelular) + VPH (2 dosis) + Meningococo ACWY (11 años)',
  };
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let c=keys[0]; for (const k of keys) if (k<=m) c=k;
  const dosisHito = cal[c] || 'Sin vacunas programadas en este hito';
  const prox = keys.find(k => k > c);
  const proxLabel = prox !== undefined
    ? (prox >= 12 ? `${Math.round(prox/12)} ${prox===12?'año':'años'} (${prox} meses)` : `${prox} meses`)
    : undefined;
  const _insight = {
    title: 'Hito del Calendario Nacional',
    text: prox !== undefined
      ? `A los **${m} meses** corresponde el control de **${c === 0 ? 'recién nacido' : c + ' meses'}**: ${dosisHito}. El próximo hito con vacunas es a los **${proxLabel}**.`
      : `A los **${m} meses** corresponde el último hito pediátrico sistematizado (**${c} meses**): ${dosisHito}. Después continúan refuerzos de adultos (dT cada 10 años, Influenza anual) y vacunas en embarazo.`,
    tone: 'neutral' as const,
    icon: '💉',
  };
  const hitoLabel = c === 0 ? 'Recién nacido' : `${c} meses${c >= 12 ? ` (${Math.round(c/12)} ${c===12?'año':'años'})` : ''}`;
  return {
    vacunas: dosisHito,
    resumen: `Hito de ${hitoLabel}: ${dosisHito}`,
    _insight,
  };
}
