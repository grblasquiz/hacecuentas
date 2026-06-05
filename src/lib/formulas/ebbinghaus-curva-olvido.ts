/** Curva del Olvido de Ebbinghaus
 *
 * Modelo de potencias calibrado con los datos empíricos originales de Ebbinghaus (1885):
 * R = e^(−a × t^b)   donde a = 0,7284, b = 0,1276
 * Fuente: Ebbinghaus H. (1885) Über das Gedächtnis. Duncker & Humblot, Leipzig.
 * Valores empíricos: 20min≈58%, 1h≈44%, 9h≈36%, 24h≈34%, 2d≈28%, 6d≈25%, 31d≈21%
 *
 * Cada repaso bien hecho divide a por 2 (duplica la estabilidad S).
 * Con t en horas; outputs en porcentaje (0-100).
 */
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

// Parámetros calibrados a datos empíricos de Ebbinghaus 1885
const A = 0.7284; // coeficiente de decaimiento base
const B = 0.1276; // exponente temporal (la curva NO es exponencial simple)

export function ebbinghausCurvaOlvido(i: Inputs): Outputs {
  const horas = Math.max(0, Number(i.horasDesdeEstudio) || 24);
  const repasos = Math.min(10, Math.max(0, Number(i.cantidadRepasos) || 0));

  // Cada repaso bien hecho reduce a a la mitad (dobla la estabilidad)
  const effectiveA = A / Math.pow(2, repasos);
  const retencionRaw = horas === 0
    ? 1
    : Math.exp(-effectiveA * Math.pow(horas, B));
  const ret = Math.min(100, Math.max(0, Math.round(retencionRaw * 100)));
  const olv = 100 - ret;

  let proximoRepaso = '';
  if (ret > 80) proximoRepaso = 'Podés esperar 1-3 días más antes de repasar';
  else if (ret > 60) proximoRepaso = 'Repasá en las próximas 24 h';
  else if (ret > 35) proximoRepaso = 'Repasá hoy mismo — estás en zona crítica';
  else proximoRepaso = 'Urge repasar: más tarde es casi reaprender desde cero';

  let interp = '';
  if (repasos === 0 && horas > 168) interp = 'Curva al piso: el material entra casi como nuevo. Reaprender aprovecha el efecto de ahorro de Ebbinghaus.';
  else if (repasos >= 3) interp = 'Buena consolidación. Seguí con intervalos de repaso cada vez más largos.';
  else if (repasos >= 1) interp = 'La curva frenó con tus repasos. Un repaso más bien ubicado la estabiliza a largo plazo.';
  else interp = 'Curva en caída libre: cada repaso activo a tiempo aplana la pendiente de forma acumulativa.';

  const tone = ret > 60 ? 'good' : ret >= 30 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu memoria ahora',
    text: `A las **${horas}h** del estudio${repasos > 0 ? ` y con **${repasos} repaso${repasos === 1 ? '' : 's'}** activos` : ' y sin repasos'}, retenés ~**${ret}%** y ya olvidaste ~**${olv}%**. ${proximoRepaso}.`,
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
    ariaLabel: `Memoria a las ${horas} horas con ${repasos} repasos: ${ret}% retenido y ${olv}% olvidado`,
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
