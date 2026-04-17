/** Twitch Horas para Partner */
export interface Inputs { avgViewersActual: number; horasStream30d: number; diasUnicos30d: number; }
export interface Outputs { viewersFaltantes: string; horasFaltantes: string; diasFaltantes: string; proyeccion: string; }

export function twitchHorasParaPartner(i: Inputs): Outputs {
  const v = Number(i.avgViewersActual) || 0;
  const h = Number(i.horasStream30d) || 0;
  const d = Number(i.diasUnicos30d) || 0;
  const faltV = Math.max(0, 75 - v);
  const faltH = Math.max(0, 25 - h);
  const faltD = Math.max(0, 12 - d);
  let proy = '';
  if (v >= 75 && h >= 25 && d >= 12) proy = 'Cumplís requisitos: aplicá en el dashboard Path to Partner';
  else if (v >= 50) proy = 'Estás cerca — sostené el ritmo 2-3 meses';
  else if (v >= 25) proy = '6-12 meses si sostenés growth de 5-10% mensual';
  else proy = 'Necesitás aumentar avg viewers primero — priorizá eso sobre horas';
  return {
    viewersFaltantes: faltV === 0 ? 'Cumplido ✅' : `${faltV.toFixed(1)} viewers promedio más`,
    horasFaltantes: faltH === 0 ? 'Cumplido ✅' : `${faltH.toFixed(1)} horas más`,
    diasFaltantes: faltD === 0 ? 'Cumplido ✅' : `${faltD} días únicos más`,
    proyeccion: proy,
  };
}
