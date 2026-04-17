/**
 * Calculadora de divisor de tensión con fórmula R1 R2
 */

export interface Inputs {
  vIn: number; r1: number; r2: number; modo: number; vOutDeseado: number;
}

export interface Outputs {
  vOut: string; r1Sugerido: string; corriente: string; potenciaTotal: string;
}

export function divisorTensionFormula(inputs: Inputs): Outputs {
  const vin = Number(inputs.vIn);
  const r1 = Number(inputs.r1);
  const r2 = Number(inputs.r2);
  const modo = Math.round(Number(inputs.modo));
  const vOutDes = Number(inputs.vOutDeseado);
  if (!vin) throw new Error('Completá la tensión de entrada');
  const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82, 100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200, 10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000, 100000, 150000, 220000, 330000, 470000, 680000, 1000000];
  let vout = 0, r1Sug = '—', corriente = 0, pot = 0;
  if (modo === 1) {
    if (!r1 || !r2) throw new Error('Completá R1 y R2');
    vout = vin * r2 / (r1 + r2);
    corriente = vin / (r1 + r2);
    pot = vin * corriente;
    r1Sug = `(usando R1 ${r1}Ω, R2 ${r2}Ω)`;
  } else {
    if (!r2 || !vOutDes) throw new Error('Completá R2 y Vout deseado');
    if (vOutDes >= vin) throw new Error('Vout debe ser menor que Vin');
    const r1Calc = r2 * (vin - vOutDes) / vOutDes;
    const r1Com = e12.find(v => v >= r1Calc) || Math.ceil(r1Calc);
    vout = vin * r2 / (r1Com + r2);
    corriente = vin / (r1Com + r2);
    pot = vin * corriente;
    r1Sug = `${r1Com} Ω (calculado ${r1Calc.toFixed(0)})`;
  }
  const iMa = corriente * 1000;
  return {
    vOut: `${vout.toFixed(3)} V`,
    r1Sugerido: r1Sug,
    corriente: iMa < 1 ? `${(iMa * 1000).toFixed(1)} µA` : `${iMa.toFixed(2)} mA`,
    potenciaTotal: `${(pot * 1000).toFixed(2)} mW`,
  };
}
