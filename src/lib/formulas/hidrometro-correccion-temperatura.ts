/** Corrección hidrómetro por temperatura (ASBC) */
export interface Inputs { lecturaCruda: number; temperaturaMosto: number; temperaturaCalibracion: number; }
export interface Outputs { densidadCorregida: number; ajuste: string; brix: number; _insight?: any; }

export function hidrometroCorreccionTemperatura(i: Inputs): Outputs {
  const sg = Number(i.lecturaCruda);
  const tC = Number(i.temperaturaMosto);
  const tCal = Number(i.temperaturaCalibracion) || 20;
  if (!sg || sg < 0.9) throw new Error('Ingresá lectura válida');
  if (!isFinite(tC)) throw new Error('Ingresá temperatura');

  const tF = tC * 9 / 5 + 32;
  const calF = tCal * 9 / 5 + 32;
  const f = (T: number) => 1.00130346 - 0.000134722 * T + 0.00000204052 * T * T - 0.00000000232820 * T * T * T;
  const corregida = sg * f(tF) / f(calF);

  const delta = corregida - sg;
  const ajuste = (delta >= 0 ? '+' : '') + delta.toFixed(4);
  const brix = ((corregida - 1) * 1000) / 4;

  const corregidaR = Number(corregida.toFixed(4));
  const absDelta = Math.abs(delta);
  const sentido = delta >= 0 ? 'subió' : 'bajó';

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (absDelta >= 0.003) {
    insightText = `La temperatura te desviaba bastante: la densidad real es **${corregidaR.toFixed(4)}** (${sentido} ${ajuste}). Medí más cerca de ${tCal}°C o usá siempre la corregida para no errar el ABV.`;
    insightTone = 'warn';
  } else if (absDelta >= 0.0005) {
    insightText = `Densidad corregida: **${corregidaR.toFixed(4)}** (${sentido} ${ajuste} respecto a la lectura cruda). Ese ajuste ya pesa en el cálculo de alcohol, usá este valor.`;
    insightTone = 'neutral';
  } else {
    insightText = `Mediste casi a temperatura de calibración: la corrección es mínima (${ajuste}) y la densidad real queda en **${corregidaR.toFixed(4)}**.`;
    insightTone = 'good';
  }

  return {
    densidadCorregida: corregidaR,
    ajuste,
    brix: Number(brix.toFixed(1)),
    _insight: {
      title: 'Lectura corregida',
      text: insightText,
      tone: insightTone,
      icon: '🌡️',
    },
  };
}
