export interface Inputs { nivel: string; horasDiarias?: number; }
export interface Outputs { wpmEstimado: number; palabrasDia: number; tiempoAhorrado: string; mensaje: string; }
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
  return { wpmEstimado: wpm, palabrasDia, tiempoAhorrado, mensaje: msg };
}
