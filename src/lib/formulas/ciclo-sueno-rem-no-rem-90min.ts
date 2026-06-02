export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cicloSuenoRemNoRem90min(i: Inputs): Outputs {
  const h=String(i.horaDormir||'22:00'); const c=Number(i.ciclosObjetivo)||5;
  const [hh,mm]=h.split(':').map(Number);
  const minutos=(hh*60+mm+c*90+15)%1440; // +15 min fall asleep
  const hd=Math.floor(minutos/60); const md=minutos%60;
  const horaDespertarStr=`${String(hd).padStart(2,'0')}:${String(md).padStart(2,'0')}`;
  const horas=c*90/60;
  // Zonas de horas de sueño (adultos: 7-9 h recomendadas)
  const tone = horas < 6 ? 'warn' : (horas >= 7 && horas <= 9) ? 'good' : 'neutral';
  const icon = horas < 6 ? '⚠️' : '😴';
  const lectura = horas < 6
    ? 'queda por debajo de las 7-9 h recomendadas para un adulto: es sueño insuficiente'
    : (horas >= 7 && horas <= 9)
    ? 'cae dentro de las 7-9 h recomendadas para un adulto'
    : horas > 9
    ? 'supera las 9 h: más sueño no siempre suma descanso'
    : 'está cerca del piso recomendado de 7 h para un adulto';
  return {
    horaDespertar: horaDespertarStr,
    horasSueno: `${horas.toFixed(1)} h`,
    interpretacion: `Dormí a las ${h}, levantate a las ${horaDespertarStr} tras ${c} ciclos de 90 min.`,
    _insight: {
      title: 'Tu descanso en números',
      text: `Con **${c} ciclos** completos dormís **${horas.toFixed(1)} h** y despertás al final de un ciclo, sin cortar una fase profunda. Ese total ${lectura}.`,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: Number(horas.toFixed(1)),
      markerLabel: `${horas.toFixed(1)} h`,
      min: 0,
      segments: [
        { nombre: 'Insuficiente', max: 7, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Óptimo', max: 9, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Excesivo', max: Math.max(12, horas + 1), color: '#f59e0b', colorDark: '#d97706' },
      ],
      ariaLabel: `${horas.toFixed(1)} horas de sueño ubicadas en la zona ${horas < 7 ? 'insuficiente' : horas <= 9 ? 'óptima' : 'excesiva'} para un adulto.`,
    },
  };
}
