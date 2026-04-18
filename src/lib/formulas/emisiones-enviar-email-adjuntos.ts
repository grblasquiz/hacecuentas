export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function emisionesEnviarEmailAdjuntos(i: Inputs): Outputs {
  const e = Number(i.emailsPorDia) || 0; const p = Number(i.porcentajeConAdjunto) || 0;
  const sin = e * (1 - p/100) * 4;
  const con = e * (p/100) * 50;
  const gDia = sin + con; const kgAño = gDia * 365 / 1000;
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Año: kgAño.toFixed(1) + ' kg', resumen: `${e} emails/día (${p}% adjunto) = ${gDia.toFixed(0)}g/día = ${kgAño.toFixed(0)} kg/año.` };
}
