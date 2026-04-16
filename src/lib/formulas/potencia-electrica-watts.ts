/** Calculadora watts / amperes / volts */
export interface Inputs { voltaje: number; conocido: string; valor: number; }
export interface Outputs { watts: string; amperes: string; voltaje: string; info: string; }

export function potenciaElectricaWatts(i: Inputs): Outputs {
  const v = Number(i.voltaje);
  const val = Number(i.valor);
  if (!v || v <= 0) throw new Error('Ingresá el voltaje');
  if (!val || val <= 0) throw new Error('Ingresá el valor conocido');

  let w: number, a: number;
  if (i.conocido === 'watts') { w = val; a = val / v; }
  else { a = val; w = val * v; }

  let cableRecomendado = '1.5 mm2';
  if (a > 32) cableRecomendado = '10 mm2';
  else if (a > 25) cableRecomendado = '6 mm2';
  else if (a > 16) cableRecomendado = '4 mm2';
  else if (a > 10) cableRecomendado = '2.5 mm2';

  return {
    watts: `${w.toFixed(0)} W`,
    amperes: `${a.toFixed(2)} A`,
    voltaje: `${v} V`,
    info: `Cable recomendado: ${cableRecomendado}. Termomagnética mínima: ${Math.ceil(a / 4) * 4}A.`,
  };
}
