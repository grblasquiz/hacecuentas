/**
 * Calculadora de ganancia amplificador operacional
 */

export interface Inputs {
  config: number; r1: number; rf: number; vIn: number;
}

export interface Outputs {
  ganancia: string; ganancia_dB: string; vOut: string; consejo: string;
}

export function amplificadorOperacionalGanancia(inputs: Inputs): Outputs {
  const c = Math.round(Number(inputs.config));
  const r1 = Number(inputs.r1);
  const rf = Number(inputs.rf);
  const vIn = Number(inputs.vIn);
  if (!c || vIn === null || vIn === undefined) throw new Error('Completá los campos');
  let g = 1;
  let tipo = '';
  if (c === 1) {
    if (!r1 || !rf) throw new Error('Completá R1 y Rf');
    g = 1 + rf / r1;
    tipo = 'No inversor';
  } else if (c === 2) {
    if (!r1 || !rf) throw new Error('Completá R1 y Rf');
    g = -rf / r1;
    tipo = 'Inversor';
  } else {
    g = 1;
    tipo = 'Buffer (seguidor)';
  }
  const absG = Math.abs(g);
  const dB = 20 * Math.log10(absG);
  const vOut = vIn * g;
  let consejo = '';
  if (absG > 1000) consejo = '⚠️ Ganancia muy alta: GBP limita BW, considerar dos etapas.';
  else if (absG < 1) consejo = 'Atenuación: mejor usar divisor resistivo pasivo.';
  else if (c === 2) consejo = 'Inversión de fase: Vout opuesta a Vin.';
  else consejo = `${tipo}: Vout sigue polaridad de Vin.`;
  return {
    ganancia: `${g.toFixed(2)} V/V (${tipo})`,
    ganancia_dB: `${dB.toFixed(2)} dB`,
    vOut: `${vOut.toFixed(3)} V`,
    consejo,
  };
}
