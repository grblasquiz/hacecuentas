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

  return {
    sensDestino: Number(sensDestino.toFixed(4)),
    cmPor360: Number(cmPor360.toFixed(1)),
    edpi: Number(edpi.toFixed(0)),
    mensaje: `Tu sensibilidad convertida es ${sensDestino.toFixed(4)}. Recorrés ${cmPor360.toFixed(1)} cm para un giro de 360°.`,
  };
}
