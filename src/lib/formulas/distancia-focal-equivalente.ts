/** Calculadora de Distancia Focal Equivalente */
export interface Inputs { focalReal: number; sensorOrigen: string; sensorDestino: string; }
export interface Outputs { focalEquivalente: number; focalFF: number; anguloCampo: number; tipo: string; _insight?: any; _chart?: any; }

export function distanciaFocalEquivalente(i: Inputs): Outputs {
  const focal = Number(i.focalReal);
  const cropOrigen = Number(i.sensorOrigen);
  const cropDestino = Number(i.sensorDestino);
  if (!focal || focal <= 0) throw new Error('Ingresá la distancia focal');
  if (!cropOrigen) throw new Error('Seleccioná el sensor origen');
  if (!cropDestino) throw new Error('Seleccioná el sensor destino');

  const focalFF = focal * cropOrigen;
  const focalEquivalente = focalFF / cropDestino;

  // Horizontal angle of view (for full frame equivalent)
  // Using 36mm sensor width
  const anguloCampo = 2 * Math.atan(36 / (2 * focalFF)) * (180 / Math.PI);

  let tipo: string;
  if (focalFF < 20) tipo = 'Ultra gran angular — paisajes extremos, arquitectura';
  else if (focalFF < 35) tipo = 'Gran angular — paisajes, interiores, street';
  else if (focalFF < 50) tipo = 'Angular moderado — reportaje, street photography';
  else if (focalFF <= 60) tipo = 'Normal — se acerca a la visión humana, versátil';
  else if (focalFF < 85) tipo = 'Tele corto — retratos de medio cuerpo';
  else if (focalFF < 135) tipo = 'Tele medio — retratos, deportes cercanos';
  else if (focalFF < 300) tipo = 'Teleobjetivo — deportes, fauna, eventos';
  else tipo = 'Super teleobjetivo — fauna lejana, astronomía';

  const ffR = Number(focalFF.toFixed(1));
  const eqR = Number(focalEquivalente.toFixed(1));
  const _insight = {
    title: 'Cómo se ve esa lente',
    text: `Tu **${focal} mm** en este sensor encuadra como un **${eqR} mm** equivalente full frame (${ffR} mm FF, ${Number(anguloCampo.toFixed(1))}° de ángulo horizontal). ${tipo}.`,
    tone: 'neutral',
    icon: '📷',
  };
  const lastMax = Math.max(400, Math.ceil(ffR / 100) * 100 + 50);
  const _chart = {
    type: 'scale',
    marker: ffR,
    markerLabel: `${ffR} mm FF`,
    min: 0,
    segments: [
      { nombre: 'Ultra gran angular', max: 20, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Gran angular', max: 35, color: '#34d399', colorDark: '#10b981' },
      { nombre: 'Angular / normal', max: 60, color: '#a3e635', colorDark: '#84cc16' },
      { nombre: 'Tele corto', max: 135, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Teleobjetivo', max: 300, color: '#fb923c', colorDark: '#f97316' },
      { nombre: 'Super tele', max: lastMax, color: '#f87171', colorDark: '#ef4444' },
    ],
    ariaLabel: `Distancia focal equivalente full frame de ${ffR} mm ubicada en la escala de tipos de lente`,
  };

  return {
    focalEquivalente: eqR,
    focalFF: ffR,
    anguloCampo: Number(anguloCampo.toFixed(1)),
    tipo,
    _insight,
    _chart,
  };
}
