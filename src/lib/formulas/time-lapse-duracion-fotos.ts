/** Calculadora de Time-Lapse */
export interface Inputs { duracionVideo: number; fpsVideo: number; intervalo: number; mbPorFoto: number; }
export interface Outputs { fotosNecesarias: number; tiempoCaptura: string; espacioGb: number; mensaje: string; _insight?: any; }

export function timeLapseDuracionFotos(i: Inputs): Outputs {
  const dur = Number(i.duracionVideo);
  const fps = Number(i.fpsVideo);
  const int = Number(i.intervalo);
  const mb = Number(i.mbPorFoto);
  if (!dur || dur <= 0) throw new Error('Ingresá la duración del video');
  if (!fps || fps <= 0) throw new Error('Ingresá los FPS del video');
  if (!int || int <= 0) throw new Error('Ingresá el intervalo entre fotos');
  if (!mb || mb <= 0) throw new Error('Ingresá el tamaño por foto');

  const fotosNecesarias = Math.ceil(dur * fps);
  const tiempoCapturaSegundos = fotosNecesarias * int;
  const espacioGb = (fotosNecesarias * mb) / 1000;

  const horas = Math.floor(tiempoCapturaSegundos / 3600);
  const minutos = Math.floor((tiempoCapturaSegundos % 3600) / 60);
  const tiempoCaptura = horas > 0 ? `${horas} h ${minutos} min` : `${minutos} min`;

  const horasCaptura = tiempoCapturaSegundos / 3600;
  const esLargo = horasCaptura >= 2 || espacioGb >= 32;

  return {
    fotosNecesarias,
    tiempoCaptura,
    espacioGb: Number(espacioGb.toFixed(1)),
    mensaje: `Para ${dur} seg de video a ${fps} fps: ${fotosNecesarias} fotos, ${tiempoCaptura} de captura, ${espacioGb.toFixed(1)} GB de espacio.`,
    _insight: {
      title: 'Tu sesión de time-lapse',
      text: esLargo
        ? `Necesitás **${fotosNecesarias.toLocaleString('es-AR')} fotos** y **${tiempoCaptura}** de captura continua: asegurate batería/alimentación externa y una tarjeta con al menos **${espacioGb.toFixed(1)} GB** libres.`
        : `Con un intervalo de **${int} s** capturás **${fotosNecesarias.toLocaleString('es-AR')} fotos** en **${tiempoCaptura}**, ocupando solo **${espacioGb.toFixed(1)} GB**. Sesión cómoda para una sola carga de batería.`,
      tone: esLargo ? 'warn' : 'good',
      icon: '📸',
    },
  };
}
