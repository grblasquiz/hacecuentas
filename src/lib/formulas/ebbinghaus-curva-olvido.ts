/** Curva del Olvido de Ebbinghaus */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  porcentajeRetenido: number;
  porcentajeOlvidado: number;
  proximoRepaso: string;
  interpretacion: string;
}

export function ebbinghausCurvaOlvido(i: Inputs): Outputs {
  const horas = Number(i.horasDesdeEstudio) || 24;
  const repasos = Number(i.cantidadRepasos) || 0;
  if (horas < 0) throw new Error('Horas inválidas');

  // Stability aumenta con repasos
  const S = 24 * Math.pow(2, repasos); // horas de 'vida media' aprox
  const retencion = Math.exp(-horas / S) * 100;

  let proximoRepaso = '';
  if (retencion > 80) proximoRepaso = 'Esperá 1-3 días más antes de repasar';
  else if (retencion > 50) proximoRepaso = 'Repasá en las próximas 24h';
  else if (retencion > 25) proximoRepaso = 'Repasá hoy mismo';
  else proximoRepaso = 'Urge repasar: más tarde es reaprender';

  let interp = '';
  if (repasos === 0 && horas > 48) interp = 'Curva al piso: el material entra casi como nuevo.';
  else if (repasos >= 3) interp = 'Buena consolidación. Seguí con intervalos largos.';
  else interp = 'Curva en caída: cada repaso a tiempo aplana la pendiente.';

  return {
    porcentajeRetenido: Math.round(retencion),
    porcentajeOlvidado: Math.round(100 - retencion),
    proximoRepaso,
    interpretacion: interp,
  };

}
