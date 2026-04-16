/** Efecto de diversificación por correlación en un portafolio de 2 activos */

export interface Inputs {
  pesoActivo1: number;
  rendimientoActivo1: number;
  desvioActivo1: number;
  rendimientoActivo2: number;
  desvioActivo2: number;
  correlacion: number;
}

export interface Outputs {
  rendimientoPortafolio: number;
  riesgoPortafolio: number;
  riesgoSinDiversificacion: number;
  beneficioDiversificacion: number;
  formula: string;
  explicacion: string;
}

export function diversificacionPortafolioCorrelacion(i: Inputs): Outputs {
  const w1 = Number(i.pesoActivo1) / 100;
  const r1 = Number(i.rendimientoActivo1);
  const s1 = Number(i.desvioActivo1);
  const r2 = Number(i.rendimientoActivo2);
  const s2 = Number(i.desvioActivo2);
  const corr = Number(i.correlacion);

  if (w1 === undefined || w1 < 0 || w1 > 1) throw new Error('Ingresá el peso del activo 1 (0-100%)');
  if (s1 === undefined || s1 < 0) throw new Error('Ingresá el desvío del activo 1');
  if (s2 === undefined || s2 < 0) throw new Error('Ingresá el desvío del activo 2');
  if (corr === undefined || corr < -1 || corr > 1) throw new Error('La correlación debe estar entre -1 y 1');

  const w2 = 1 - w1;

  // Rendimiento del portafolio (promedio ponderado)
  const rendimientoPortafolio = w1 * r1 + w2 * r2;

  // Riesgo del portafolio: σp = √(w1²σ1² + w2²σ2² + 2×w1×w2×σ1×σ2×ρ)
  const varianza = Math.pow(w1 * s1, 2) + Math.pow(w2 * s2, 2) + 2 * w1 * w2 * s1 * s2 * corr;
  const riesgoPortafolio = Math.sqrt(Math.max(0, varianza));

  // Sin diversificación (correlación = 1)
  const riesgoSinDiversificacion = w1 * s1 + w2 * s2;

  // Beneficio de diversificación
  const beneficioDiversificacion = riesgoSinDiversificacion - riesgoPortafolio;

  const formula = `σp = √((${(w1 * 100).toFixed(0)}%×${s1}%)² + (${(w2 * 100).toFixed(0)}%×${s2}%)² + 2×${(w1 * 100).toFixed(0)}%×${(w2 * 100).toFixed(0)}%×${s1}%×${s2}%×${corr}) = ${riesgoPortafolio.toFixed(2)}%`;
  const explicacion = `Portafolio: ${(w1 * 100).toFixed(0)}% activo 1 (rend. ${r1}%, riesgo ${s1}%) + ${(w2 * 100).toFixed(0)}% activo 2 (rend. ${r2}%, riesgo ${s2}%). Correlación: ${corr}. Rendimiento esperado: ${rendimientoPortafolio.toFixed(2)}%. Riesgo diversificado: ${riesgoPortafolio.toFixed(2)}% (vs ${riesgoSinDiversificacion.toFixed(2)}% sin diversificación). Beneficio de diversificación: ${beneficioDiversificacion.toFixed(2)} puntos de menor riesgo.${corr < 0 ? ' La correlación negativa amplifica el efecto de diversificación.' : corr > 0.8 ? ' La alta correlación reduce el beneficio de diversificar.' : ''}`;

  return {
    rendimientoPortafolio: Number(rendimientoPortafolio.toFixed(2)),
    riesgoPortafolio: Number(riesgoPortafolio.toFixed(4)),
    riesgoSinDiversificacion: Number(riesgoSinDiversificacion.toFixed(4)),
    beneficioDiversificacion: Number(beneficioDiversificacion.toFixed(4)),
    formula,
    explicacion,
  };
}
