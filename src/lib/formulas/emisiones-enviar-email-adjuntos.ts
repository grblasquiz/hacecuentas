export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function emisionesEnviarEmailAdjuntos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e = Number(i.emailsPorDia) || 0; const p = Number(i.porcentajeConAdjunto) || 0;
  const sin = e * (1 - p/100) * 4;
  const con = e * (p/100) * 50;
  const gDia = sin + con; const kgAño = gDia * 365 / 1000;
  const resumen = __lang === 'en'
    ? `${e} emails/day (${p}% with attachments) = ${gDia.toFixed(0)}g/day = ${kgAño.toFixed(0)} kg/year.`
    : `${e} emails/día (${p}% adjunto) = ${gDia.toFixed(0)}g/día = ${kgAño.toFixed(0)} kg/año.`;
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Año: kgAño.toFixed(1) + ' kg', resumen };
}
