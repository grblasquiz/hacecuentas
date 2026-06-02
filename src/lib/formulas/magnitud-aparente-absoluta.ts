/** Calculadora Magnitud Estelar — m - M = 5·log₁₀(d/10) */
export interface Inputs { magnitudAparente?: number; magnitudAbsoluta?: number; distanciaPc?: number; }
export interface Outputs { resultado: string; moduloDistancia: number; distanciaLy: number; formula: string; _insight?: any; }

export function magnitudAparenteAbsoluta(i: Inputs): Outputs {
  const m = i.magnitudAparente != null && String(i.magnitudAparente) !== '' ? Number(i.magnitudAparente) : null;
  const M = i.magnitudAbsoluta != null && String(i.magnitudAbsoluta) !== '' ? Number(i.magnitudAbsoluta) : null;
  const d = i.distanciaPc != null && Number(i.distanciaPc) > 0 ? Number(i.distanciaPc) : null;
  const filled = [m, M, d].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let mOut: number, MOut: number, dOut: number;
  if (d === null) {
    mOut = m!; MOut = M!;
    dOut = Math.pow(10, (mOut - MOut + 5) / 5);
  } else if (M === null) {
    mOut = m!; dOut = d;
    MOut = mOut - 5 * Math.log10(dOut / 10);
  } else {
    MOut = M; dOut = d;
    mOut = MOut + 5 * Math.log10(dOut / 10);
  }

  const modDist = mOut - MOut;
  const dLy = dOut * 3.26156;

  const lyFmt = dLy.toLocaleString('es-AR', { maximumFractionDigits: dLy < 100 ? 2 : 0 });
  const visibleAOjo = mOut <= 6;
  const insightText = visibleAOjo
    ? `Con magnitud aparente **${mOut.toFixed(2)}** este objeto es **visible a ojo desnudo** (límite ≈ 6). Su luz tardó unos **${lyFmt} años luz** en llegar: lo ves tal como era hace ese tiempo.`
    : `Con magnitud aparente **${mOut.toFixed(2)}** este objeto es **demasiado tenue para verlo a ojo desnudo** (límite ≈ 6); necesitás binoculares o telescopio. Está a unos **${lyFmt} años luz**.`;

  return {
    resultado: `m=${mOut.toFixed(2)} · M=${MOut.toFixed(2)} · d=${dOut.toFixed(2)} pc`,
    moduloDistancia: Number(modDist.toFixed(4)),
    distanciaLy: Number(dLy.toFixed(4)),
    formula: `m - M = 5·log₁₀(${dOut.toFixed(2)}/10) = ${modDist.toFixed(4)}`,
    _insight: {
      title: visibleAOjo ? 'Visible a ojo desnudo' : 'Fuera del alcance del ojo',
      text: insightText,
      tone: 'neutral',
      icon: visibleAOjo ? '✨' : '🔭',
    },
  };
}
