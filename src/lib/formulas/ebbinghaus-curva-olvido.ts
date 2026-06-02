/** Curva del Olvido de Ebbinghaus */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  porcentajeRetenido: number;
  porcentajeOlvidado: number;
  proximoRepaso: string;
  interpretacion: string;
  _insight?: any;
  _chart?: any;
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

  const ret = Math.round(retencion);
  const olv = 100 - ret;
  const tone = ret > 60 ? 'good' : ret >= 30 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu memoria ahora',
    text: `A las **${horas}h** del estudio${repasos > 0 ? ` y con **${repasos} repaso${repasos === 1 ? '' : 's'}**` : ' y sin repasos'}, retenés ~**${ret}%** y ya olvidaste **${olv}%**. ${proximoRepaso}.`,
    tone,
    icon: '🧠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Retenido', value: ret },
      { label: 'Olvidado', value: olv },
    ],
    centerValue: `${ret}%`,
    centerLabel: 'Retenido',
    ariaLabel: `Memoria a las ${horas} horas: ${ret}% retenido y ${olv}% olvidado`,
  };

  return {
    porcentajeRetenido: ret,
    porcentajeOlvidado: olv,
    proximoRepaso,
    interpretacion: interp,
    _insight,
    _chart,
  };

}
