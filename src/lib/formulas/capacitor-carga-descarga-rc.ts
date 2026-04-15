/** Constante de tiempo RC y voltajes de carga de capacitor */
export interface Inputs { resistenciaOhm: number; capacitanciaUf: number; voltajeFuente: number; }
export interface Outputs { tauSegundos: number; tiempoCarga99: number; voltaje1Tau: number; voltaje3Tau: number; detalle: string; }

export function capacitorCargaDescargaRc(i: Inputs): Outputs {
  const r = Number(i.resistenciaOhm);
  const cUf = Number(i.capacitanciaUf);
  const vf = Number(i.voltajeFuente);

  if (!r || r <= 0) throw new Error('Ingresá la resistencia en ohms');
  if (!cUf || cUf <= 0) throw new Error('Ingresá la capacitancia en μF');
  if (!vf || vf <= 0) throw new Error('Ingresá el voltaje de la fuente');

  const cF = cUf / 1_000_000;
  const tau = r * cF;
  const tiempoCarga99 = tau * 5;
  const voltaje1Tau = vf * (1 - Math.exp(-1));
  const voltaje3Tau = vf * (1 - Math.exp(-3));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
  const fmtV = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let tauTexto: string;
  if (tau < 0.001) {
    tauTexto = `${fmt.format(tau * 1_000_000)} μs`;
  } else if (tau < 1) {
    tauTexto = `${fmt.format(tau * 1000)} ms`;
  } else {
    tauTexto = `${fmt.format(tau)} s`;
  }

  return {
    tauSegundos: Number(tau.toFixed(6)),
    tiempoCarga99: Number(tiempoCarga99.toFixed(6)),
    voltaje1Tau: Number(voltaje1Tau.toFixed(2)),
    voltaje3Tau: Number(voltaje3Tau.toFixed(2)),
    detalle: `τ = ${fmt.format(r)} Ω × ${fmt.format(cUf)} μF = ${tauTexto}. Carga al 99%: ${fmt.format(tiempoCarga99)} s. Voltaje a 1τ: ${fmtV.format(voltaje1Tau)}V (63%). Voltaje a 3τ: ${fmtV.format(voltaje3Tau)}V (95%).`,
  };
}
