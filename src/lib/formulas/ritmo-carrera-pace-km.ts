/** Calculadora de pace - ritmo de carrera */
export interface Inputs {
  distancia: number;
  horas: number;
  minutos: number;
  segundos: number;
}
export interface Outputs {
  pace: string;
  velocidad: number;
  tiempo5k: string;
  tiempo10k: string;
  tiempoMedia: string;
  tiempoMaraton: string;
  _insight?: any;
}

function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ritmoCarreraPaceKm(i: Inputs): Outputs {
  const distancia = Number(i.distancia);
  const horas = Number(i.horas) || 0;
  const minutos = Number(i.minutos) || 0;
  const segundos = Number(i.segundos) || 0;
  if (!distancia || distancia <= 0) throw new Error('Ingresá la distancia');

  const totalSegundos = horas * 3600 + minutos * 60 + segundos;
  if (totalSegundos <= 0) throw new Error('Ingresá un tiempo válido');

  const paceSegundos = totalSegundos / distancia;
  const paceMin = Math.floor(paceSegundos / 60);
  const paceSec = Math.round(paceSegundos % 60);
  const pace = `${paceMin}:${String(paceSec).padStart(2, '0')} min/km`;

  const velocidad = Number(((distancia / totalSegundos) * 3600).toFixed(1));

  // Categoría aproximada del ritmo (min/km) para corredores
  let nivel: string; let tone: string;
  if (paceSegundos < 270) { nivel = 'un ritmo de élite (sub 4:30 min/km)'; tone = 'good'; }
  else if (paceSegundos < 330) { nivel = 'un ritmo rápido de corredor entrenado'; tone = 'good'; }
  else if (paceSegundos < 420) { nivel = 'un buen ritmo recreativo'; tone = 'neutral'; }
  else { nivel = 'un ritmo suave, ideal para base aeróbica'; tone = 'neutral'; }

  const _insight = {
    title: 'Tu ritmo de carrera',
    text: `Corrés a **${pace}** (**${velocidad} km/h**), ${nivel}. A ese pace, un 10K te llevaría **${formatTime(paceSegundos * 10)}** y una maratón completa unas **${formatTime(paceSegundos * 42.195)}**.`,
    tone,
    icon: '🏃',
  };

  return {
    pace,
    velocidad,
    tiempo5k: formatTime(paceSegundos * 5),
    tiempo10k: formatTime(paceSegundos * 10),
    tiempoMedia: formatTime(paceSegundos * 21.0975),
    tiempoMaraton: formatTime(paceSegundos * 42.195),
    _insight,
  };
}