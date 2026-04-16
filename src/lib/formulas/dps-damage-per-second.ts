/** Calculadora de DPS — Daño por Segundo */
export interface Inputs {
  danoBase: number;
  ataquesSegundo: number;
  critChance: number;
  critMult: number;
}
export interface Outputs {
  dps: number;
  dpsSinCrit: number;
  bonusCrit: number;
  danoPromedio: number;
  mensaje: string;
}

export function dpsDamagePerSecond(i: Inputs): Outputs {
  const dano = Number(i.danoBase);
  const aps = Number(i.ataquesSegundo);
  const cc = Number(i.critChance) / 100;
  const cm = Number(i.critMult);

  if (!dano || dano <= 0) throw new Error('Ingresá el daño base');
  if (!aps || aps <= 0) throw new Error('Ingresá ataques por segundo');
  if (cc < 0 || cc > 1) throw new Error('Crit chance debe estar entre 0 y 100%');
  if (cm < 1) throw new Error('Multiplicador crítico debe ser al menos 1');

  const critFactor = 1 + cc * (cm - 1);
  const danoPromedio = dano * critFactor;
  const dps = danoPromedio * aps;
  const dpsSinCrit = dano * aps;
  const bonusCrit = (critFactor - 1) * 100;

  return {
    dps: Number(dps.toFixed(1)),
    dpsSinCrit: Number(dpsSinCrit.toFixed(1)),
    bonusCrit: Number(bonusCrit.toFixed(1)),
    danoPromedio: Number(danoPromedio.toFixed(1)),
    mensaje: `Tu DPS efectivo es ${dps.toFixed(0)}. El crítico aporta +${bonusCrit.toFixed(1)}% de daño sobre el DPS base de ${dpsSinCrit.toFixed(0)}.`,
  };
}
