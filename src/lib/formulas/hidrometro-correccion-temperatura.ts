/** Corrección hidrómetro por temperatura (ASBC) */
export interface Inputs { lecturaCruda: number; temperaturaMosto: number; temperaturaCalibracion: number; }
export interface Outputs { densidadCorregida: number; ajuste: string; brix: number; }

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

  return {
    densidadCorregida: Number(corregida.toFixed(4)),
    ajuste,
    brix: Number(brix.toFixed(1)),
  };
}
