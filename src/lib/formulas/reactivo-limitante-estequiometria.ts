export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function reactivoLimitanteEstequiometria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const molA = Number(i.molA); const coefA = Number(i.coefA);
  const molB = Number(i.molB); const coefB = Number(i.coefB); const coefP = Number(i.coefP);
  if (!molA || !coefA || !molB || !coefB || !coefP) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const qA = molA / coefA;
  const qB = molB / coefB;
  const xi = Math.min(qA, qB);
  const aLimita = qA <= qB;
  const nombreLim = aLimita ? 'A' : 'B';
  const producto = xi * coefP;
  const sobra = aLimita ? molB - xi * coefB : molA - xi * coefA;
  const nombreExc = aLimita ? 'B' : 'A';
  const exacto = Math.abs(qA - qB) < 1e-9;
  const resumen = exacto
    ? (__lang === 'en'
        ? `Both reactants are in exact stoichiometric ratio: nothing is left over. ${producto.toFixed(3)} mol of product form.`
        : `Los dos reactivos están en proporción estequiométrica exacta: no sobra nada. Se forman ${producto.toFixed(3)} mol de producto.`)
    : (__lang === 'en'
        ? `Reactant ${nombreLim} is limiting (ratio ${xi.toFixed(3)}). ${producto.toFixed(3)} mol of product form and ${sobra.toFixed(3)} mol of ${nombreExc} are left unreacted.`
        : `El reactivo ${nombreLim} es el limitante (cociente ${xi.toFixed(3)}). Se forman ${producto.toFixed(3)} mol de producto y sobran ${sobra.toFixed(3)} mol de ${nombreExc}.`);
  const _insight = {
    title: __lang === 'en' ? (exacto ? 'Stoichiometric ratio' : `Reactant ${nombreLim} limits`) : (exacto ? 'Proporción estequiométrica' : `Limita el reactivo ${nombreLim}`),
    text: __lang === 'en'
      ? `Ratios: A = ${qA.toFixed(3)}, B = ${qB.toFixed(3)}. The smaller one sets the reaction extent (ξ = ${xi.toFixed(3)}), so the theoretical yield is **${producto.toFixed(3)} mol**.${exacto ? '' : ` The ${sobra.toFixed(3)} mol of ${nombreExc} left over do not react no matter how long you wait.`}`
      : `Cocientes: A = ${qA.toFixed(3)}, B = ${qB.toFixed(3)}. El menor fija el avance de reacción (ξ = ${xi.toFixed(3)}), así que el rendimiento teórico es **${producto.toFixed(3)} mol**.${exacto ? '' : ` Los ${sobra.toFixed(3)} mol de ${nombreExc} que sobran no reaccionan por más tiempo que esperes.`}`,
    tone: 'neutral',
    icon: '🔬',
  };
  return {
    limitante: exacto ? (__lang === 'en' ? 'None (exact ratio)' : 'Ninguno (proporción exacta)') : (__lang === 'en' ? `Reactant ${nombreLim}` : `Reactivo ${nombreLim}`),
    producto: producto.toFixed(3) + ' mol',
    sobra: sobra.toFixed(3) + ' mol ' + (__lang === 'en' ? 'of ' : 'de ') + nombreExc,
    resumen, _insight,
  };
}
