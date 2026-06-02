/** Calculadora de Sensibilidad Mouse DPI entre Juegos */
export interface Inputs {
  dpi: number;
  juegoOrigen: string;
  sensOrigen: number;
  juegoDestino: string;
}
export interface Outputs {
  sensDestino: number;
  cmPor360: number;
  edpi: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

// Factor de conversión: cuántos grados por count (yaw por unidad de sens)
const YAWS: Record<string, number> = {
  cs2: 0.022,
  valorant: 0.07,
  fortnite: 0.5585,
  apex: 0.022,
  overwatch: 0.0066,
};

export function sensibilidadMouseDpiJuego(i: Inputs): Outputs {
  const dpi = Number(i.dpi);
  const sensOrigen = Number(i.sensOrigen);
  if (!dpi || dpi <= 0) throw new Error('Ingresá un DPI válido');
  if (!sensOrigen || sensOrigen <= 0) throw new Error('Ingresá la sensibilidad del juego origen');
  const yo = YAWS[i.juegoOrigen];
  const yd = YAWS[i.juegoDestino];
  if (!yo || !yd) throw new Error('Juego no válido');

  // Convert: sensDestino = sensOrigen * (yawOrigen / yawDestino)
  const sensDestino = sensOrigen * (yo / yd);

  // cm/360 = (360 / (dpi * sensOrigen * yawOrigen)) * 2.54
  const cmPor360 = (360 / (dpi * sensOrigen * yo)) * 2.54;

  const edpi = dpi * sensOrigen;

  const cm = Number(cmPor360.toFixed(1));
  // Estilo de apuntado según cm/360 (referencia comunidad FPS)
  let estilo: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (cm < 20) { estilo = 'muy alta (arcade/twitch)'; insightTone = 'warn'; }
  else if (cm < 35) { estilo = 'alta'; insightTone = 'neutral'; }
  else if (cm <= 50) { estilo = 'media (la más usada por pros)'; insightTone = 'good'; }
  else { estilo = 'baja (precisión, mucho espacio)'; insightTone = 'neutral'; }

  const _insight = {
    title: 'Tu sensibilidad equivalente',
    text: `Pasás a **${sensDestino.toFixed(4)}** en ${String(i.juegoDestino)} manteniendo tu eDPI de **${edpi.toFixed(0)}**. Recorrés **${cm} cm** por giro de 360°, lo que es una sensibilidad **${estilo}**.`,
    tone: insightTone,
    icon: '🖱️',
  };

  // Gauge: cm/360 ubicado en las zonas de estilo de apuntado
  const _chart = {
    type: 'scale',
    marker: cm,
    markerLabel: `${cm} cm`,
    min: 0,
    segments: [
      { nombre: 'Muy alta', max: 20, color: '#fecaca', colorDark: '#991b1b' },
      { nombre: 'Alta', max: 35, color: '#fde68a', colorDark: '#92400e' },
      { nombre: 'Media', max: 50, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Baja', max: Math.max(80, Math.ceil(cm) + 1), color: '#bfdbfe', colorDark: '#1e40af' },
    ],
    ariaLabel: `Sensibilidad: ${cm} cm por giro de 360°, estilo ${estilo}`,
  };

  return {
    sensDestino: Number(sensDestino.toFixed(4)),
    cmPor360: cm,
    edpi: Number(edpi.toFixed(0)),
    mensaje: `Tu sensibilidad convertida es ${sensDestino.toFixed(4)}. Recorrés ${cmPor360.toFixed(1)} cm para un giro de 360°.`,
    _insight,
    _chart,
  };
}
