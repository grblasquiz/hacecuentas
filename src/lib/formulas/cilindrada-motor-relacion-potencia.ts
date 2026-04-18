export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cilindradaMotorRelacionPotencia(i: Inputs): Outputs {
  const cc=Number(i.cc)||0; const tb=String(i.turbo||'no');
  const l=cc/1000; const hp=tb==='si'?l*150:l*85;
  let cat='Económico'; if (hp>400) cat='Supercar'; else if (hp>200) cat='Sport'; else if (hp>130) cat='Medio';
  return { hpAprox:`${hp.toFixed(0)} HP`, categoria:cat, resumen:`${cc}cc ${tb==='si'?'turbo':'atm'}: ~${hp.toFixed(0)} HP (${cat}).` };
}
