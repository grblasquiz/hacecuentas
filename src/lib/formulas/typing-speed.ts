export interface Inputs { nivel: string; horasDiarias?: number; }
export interface Outputs { wpmEstimado: number; palabrasDia: number; tiempoAhorrado: string; mensaje: string; _insight?: any; _chart?: any; }
const WPM: Record<string,number> = { principiante:20, medio:40, rapido:55, profesional:75, experto:110 };
export function typingSpeed(i: Inputs): Outputs {
  const nivel = String(i.nivel||'medio');
  const horas = Number(i.horasDiarias)||4;
  const wpm = WPM[nivel]||40;
  const palabrasDia = Math.round(wpm * 60 * horas);
  const wpmMejor = wpm + 20;
  const horasConMejora = palabrasDia / (wpmMejor * 60);
  const ahorro = horas - horasConMejora;
  const ahorroMin = Math.round(ahorro * 60);
  const ahorroAnual = Math.round(ahorro * 250);
  const tiempoAhorrado = `Si mejoraras a ${wpmMejor} WPM, ahorrarías ~${ahorroMin} minutos por día (${ahorroAnual} horas al año).`;
  let msg = `Tu velocidad estimada: ${wpm} WPM. `;
  if(wpm<30) msg+='Nivel principiante — un curso de touch typing te cambiaría la vida.';
  else if(wpm<50) msg+='Nivel medio — bien, pero con práctica podrías duplicar tu velocidad.';
  else if(wpm<70) msg+='Nivel rápido — por encima del promedio. Buen trabajo.';
  else if(wpm<100) msg+='Nivel profesional — muy rápido. Podrías competir.';
  else msg+='Nivel experto — velocidad de élite.';

  const tone = wpm < 40 ? 'warn' : wpm >= 70 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu velocidad de tipeo',
    text: `A **${wpm} WPM** escribís unas **${palabrasDia.toLocaleString('es-AR')} palabras** en tus ${horas} h diarias. Subiendo a **${wpmMejor} WPM** ahorrarías ~**${ahorroAnual} horas al año**.`,
    tone,
    icon: '⌨️',
  };
  const _chart = {
    type: 'scale',
    marker: wpm,
    markerLabel: `${wpm} WPM`,
    min: 0,
    segments: [
      { nombre: 'Principiante', max: 30, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Medio', max: 50, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Rápido', max: 70, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Profesional', max: 100, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Experto', max: 130, color: '#10b981', colorDark: '#059669' },
    ],
    ariaLabel: `Tu velocidad de ${wpm} palabras por minuto en una escala de niveles de tipeo`,
  };

  return { wpmEstimado: wpm, palabrasDia, tiempoAhorrado, mensaje: msg, _insight, _chart };
}
