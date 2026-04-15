/** Velocidad de disparo en fútbol */
export interface Inputs {
  distancia: number;
  tiempo: number;
}

export interface Outputs {
  result: number;
  velocidadMs: number;
  tiempoReaccion: string;
  detalle: string;
}

export function velocidadPelotaFutbolTiro(i: Inputs): Outputs {
  const dist = Number(i.distancia);
  const t = Number(i.tiempo);

  if (!dist || dist <= 0) throw new Error('Ingresá la distancia al arco en metros');
  if (!t || t <= 0) throw new Error('Ingresá el tiempo de vuelo en segundos');

  const ms = dist / t;
  const kmh = ms * 3.6;

  let reaccion = '';
  if (t < 0.5) {
    reaccion = 'Inatajable — el arquero no tiene tiempo de reaccionar';
  } else if (t < 0.8) {
    reaccion = 'Muy difícil — el arquero debe anticipar la dirección';
  } else if (t < 1.2) {
    reaccion = 'Difícil — el arquero puede reaccionar si va hacia él';
  } else {
    reaccion = 'Atajable — el arquero tiene tiempo suficiente para reaccionar';
  }

  let nivel = '';
  if (kmh >= 120) nivel = 'Nivel élite profesional';
  else if (kmh >= 100) nivel = 'Nivel profesional';
  else if (kmh >= 80) nivel = 'Nivel amateur competitivo';
  else if (kmh >= 50) nivel = 'Nivel recreativo';
  else nivel = 'Baja potencia';

  return {
    result: Number(kmh.toFixed(1)),
    velocidadMs: Number(ms.toFixed(2)),
    tiempoReaccion: reaccion,
    detalle: `Disparo a **${kmh.toFixed(1)} km/h** (${ms.toFixed(2)} m/s) desde ${dist}m en ${t}s. ${nivel}. ${reaccion}.`,
  };
}
