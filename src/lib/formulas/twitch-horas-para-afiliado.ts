/** Twitch Horas para Afiliado */
export interface Inputs { minutosActuales: number; diasActuales: number; followersActuales: number; avgViewers: number; }
export interface Outputs { minutosFaltantes: string; diasFaltantes: string; followersFaltantes: string; viewersFaltantes: string; _insight?: any; }

export function twitchHorasParaAfiliado(i: Inputs): Outputs {
  const m = Number(i.minutosActuales) || 0;
  const d = Number(i.diasActuales) || 0;
  const f = Number(i.followersActuales) || 0;
  const v = Number(i.avgViewers) || 0;
  const faltMin = Math.max(0, 500 - m);
  const faltDias = Math.max(0, 7 - d);
  const faltFol = Math.max(0, 50 - f);
  const faltView = Math.max(0, 3 - v);
  const cumplidos = [faltMin, faltDias, faltFol, faltView].filter(x => x === 0).length;
  const _insight = {
    title: cumplidos === 4 ? 'Listo para Afiliado' : 'Camino a Afiliado',
    text: cumplidos === 4
      ? `Cumplís los **4 requisitos** (500 min, 7 días, 50 followers y 3 viewers promedio): Twitch debería mandarte la invitación a **Afiliado** automáticamente.`
      : `Llevás **${cumplidos} de 4 requisitos**. Te falta(n): ${[
          faltMin > 0 ? `**${(faltMin/60).toFixed(1)} h** de stream` : '',
          faltDias > 0 ? `**${faltDias} días** únicos` : '',
          faltFol > 0 ? `**${faltFol} followers**` : '',
          faltView > 0 ? `**${faltView.toFixed(1)}** viewers de promedio` : '',
        ].filter(Boolean).join(', ')}.`,
    tone: (cumplidos === 4 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🎮',
  };
  return {
    minutosFaltantes: faltMin === 0 ? 'Cumplido ✅' : `${faltMin} minutos (~${(faltMin/60).toFixed(1)} h)`,
    diasFaltantes: faltDias === 0 ? 'Cumplido ✅' : `${faltDias} días únicos`,
    followersFaltantes: faltFol === 0 ? 'Cumplido ✅' : `${faltFol} followers`,
    viewersFaltantes: faltView === 0 ? 'Cumplido ✅' : `${faltView.toFixed(1)} viewers promedio más`,
    _insight,
  };
}
