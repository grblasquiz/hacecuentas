/** Beta de acción — sensibilidad respecto al mercado */

export interface Inputs {
  rendimientoAccion: number;
  rendimientoMercado: number;
  correlacion: number;
  desvioAccion: number;
  desvioMercado: number;
}

export interface Outputs {
  beta: number;
  tipoRiesgo: string;
  rendimientoEsperado: number;
  formula: string;
  explicacion: string;
}

export function betaAccionRiesgo(i: Inputs): Outputs {
  const rendAccion = Number(i.rendimientoAccion) || 0;
  const rendMercado = Number(i.rendimientoMercado) || 0;
  const correlacion = Number(i.correlacion);
  const desvioAccion = Number(i.desvioAccion);
  const desvioMercado = Number(i.desvioMercado);

  if (desvioMercado === undefined || desvioMercado <= 0) throw new Error('Ingresá el desvío estándar del mercado');
  if (desvioAccion === undefined || desvioAccion <= 0) throw new Error('Ingresá el desvío estándar de la acción');
  if (correlacion === undefined) throw new Error('Ingresá la correlación');

  // Beta = correlación × (desvío acción / desvío mercado)
  // O equivalentemente: Beta = Cov(acción, mercado) / Var(mercado)
  const beta = correlacion * (desvioAccion / desvioMercado);

  let tipoRiesgo: string;
  if (beta < 0) tipoRiesgo = 'Beta negativo — se mueve inversamente al mercado';
  else if (beta < 0.5) tipoRiesgo = 'Bajo riesgo — muy defensiva';
  else if (beta < 1) tipoRiesgo = 'Riesgo menor al mercado — defensiva';
  else if (beta === 1) tipoRiesgo = 'Riesgo igual al mercado';
  else if (beta < 1.5) tipoRiesgo = 'Riesgo mayor al mercado — agresiva';
  else tipoRiesgo = 'Alto riesgo — muy agresiva';

  // CAPM: E(Ri) = Rf + β × (E(Rm) - Rf), asumiendo Rf = 4.5%
  const rf = 4.5;
  const rendimientoEsperado = rf + beta * (rendMercado - rf);

  const formula = `β = ${correlacion} × (${desvioAccion}% / ${desvioMercado}%) = ${beta.toFixed(4)}`;
  const explicacion = `Beta: ${beta.toFixed(4)}. ${tipoRiesgo}. Si el mercado sube 10%, esta acción se espera que ${beta >= 0 ? 'suba' : 'baje'} ~${Math.abs(beta * 10).toFixed(1)}%. Rendimiento esperado (CAPM): ${rendimientoEsperado.toFixed(2)}% (Rf=${rf}%, prima de riesgo ${(rendMercado - rf).toFixed(1)}%).`;

  return {
    beta: Number(beta.toFixed(4)),
    tipoRiesgo,
    rendimientoEsperado: Number(rendimientoEsperado.toFixed(2)),
    formula,
    explicacion,
  };
}
