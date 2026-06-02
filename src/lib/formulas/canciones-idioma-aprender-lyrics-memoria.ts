export interface Inputs { [k: string]: number | string; }
export interface Outputs { canciones: string; beneficio: string; resumen: string; _insight?: any; }
export function cancionesIdiomaAprenderLyricsMemoria(i: Inputs): Outputs {
  const m=Number(i.min)||0;
  const c=Math.floor(m/3.5);
  const _insight = {
    title: 'Tu dosis diaria de música',
    text: m <= 0
      ? 'Ingresá cuántos minutos por día le vas a dedicar a escuchar música en el idioma que estás aprendiendo y te digo cuántas canciones entran.'
      : `Con **${m} minutos al día** entran unas **${c} canciones**, y al mes habrás trabajado pronunciación y vocabulario emocional con cerca de **${c * 30} reproducciones**. La clave no es entender todo, sino repetir las mismas canciones hasta que la letra te salga sola.`,
    tone: 'neutral',
    icon: '🎵'
  };
  return { canciones:`${c} canciones`, beneficio:'Pronunciación, ritmo, vocab emocional', resumen:`${m}min/día música: ~${c} canciones.`, _insight };
}
