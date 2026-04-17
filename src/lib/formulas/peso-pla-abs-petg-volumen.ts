/**
 * Calculadora de peso de PLA, ABS y PETG por volumen
 */

export interface Inputs {
  volumen: number; infill: number;
}

export interface Outputs {
  pla: string; petg: string; abs: string; tpu: string; asa: string; ranking: string;
}

export function pesoPlaAbsPetgVolumen(inputs: Inputs): Outputs {
  const vol = Number(inputs.volumen);
  const infill = Number(inputs.infill);
  if (!vol || vol <= 0) throw new Error('Ingresá volumen');
  const volEf = vol * (0.30 + (infill / 100) * 0.70);
  const dens = { pla: 1.24, petg: 1.27, abs: 1.04, tpu: 1.20, asa: 1.07 };
  const pesos: Array<[string, number]> = [
    ['PLA', volEf * dens.pla],
    ['PETG', volEf * dens.petg],
    ['ABS', volEf * dens.abs],
    ['TPU', volEf * dens.tpu],
    ['ASA', volEf * dens.asa],
  ];
  pesos.sort((a, b) => a[1] - b[1]);
  const rk = pesos.map(([n, p]) => `${n} ${p.toFixed(1)} g`).join(' < ');
  return {
    pla: `${(volEf * dens.pla).toFixed(1)} g`,
    petg: `${(volEf * dens.petg).toFixed(1)} g`,
    abs: `${(volEf * dens.abs).toFixed(1)} g`,
    tpu: `${(volEf * dens.tpu).toFixed(1)} g`,
    asa: `${(volEf * dens.asa).toFixed(1)} g`,
    ranking: rk,
  };
}
