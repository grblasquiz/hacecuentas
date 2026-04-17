/** Twitch Horas para Afiliado */
export interface Inputs { minutosActuales: number; diasActuales: number; followersActuales: number; avgViewers: number; }
export interface Outputs { minutosFaltantes: string; diasFaltantes: string; followersFaltantes: string; viewersFaltantes: string; }

export function twitchHorasParaAfiliado(i: Inputs): Outputs {
  const m = Number(i.minutosActuales) || 0;
  const d = Number(i.diasActuales) || 0;
  const f = Number(i.followersActuales) || 0;
  const v = Number(i.avgViewers) || 0;
  const faltMin = Math.max(0, 500 - m);
  const faltDias = Math.max(0, 7 - d);
  const faltFol = Math.max(0, 50 - f);
  const faltView = Math.max(0, 3 - v);
  return {
    minutosFaltantes: faltMin === 0 ? 'Cumplido ✅' : `${faltMin} minutos (~${(faltMin/60).toFixed(1)} h)`,
    diasFaltantes: faltDias === 0 ? 'Cumplido ✅' : `${faltDias} días únicos`,
    followersFaltantes: faltFol === 0 ? 'Cumplido ✅' : `${faltFol} followers`,
    viewersFaltantes: faltView === 0 ? 'Cumplido ✅' : `${faltView.toFixed(1)} viewers promedio más`,
  };
}
