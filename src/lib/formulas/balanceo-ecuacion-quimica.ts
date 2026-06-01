/** Calculadora de Estequiometría */
export interface Inputs { masaConocida: number; masaMolarConocida: number; coefConocido: number; masaMolarBuscado: number; coefBuscado: number; }
export interface Outputs { masaBuscada: number; molesConocido: number; molesBuscado: number; formula: string; _insight?: any; }

export function balanceoEcuacionQuimica(i: Inputs): Outputs {
  const masa = Number(i.masaConocida);
  const Mc = Number(i.masaMolarConocida);
  const cc = Number(i.coefConocido);
  const Mb = Number(i.masaMolarBuscado);
  const cb = Number(i.coefBuscado);
  if (masa <= 0) throw new Error('La masa debe ser mayor a 0');
  if (Mc <= 0 || Mb <= 0) throw new Error('Las masas molares deben ser mayores a 0');
  if (cc <= 0 || cb <= 0) throw new Error('Los coeficientes deben ser mayores a 0');

  const molesC = masa / Mc;
  const molesB = molesC * (cb / cc);
  const masaB = molesB * Mb;

  const relacion = cb / cc;
  const _insight = {
    title: "Lo que dice la estequiometría",
    text:
      `Partiendo de **${masa} g** del reactivo conocido (${molesC.toFixed(4)} mol) y una relación molar **${cb}:${cc}**, ` +
      `obtenés **${masaB.toFixed(4)} g** de la sustancia buscada (${molesB.toFixed(4)} mol). ` +
      (relacion === 1
        ? `Como la relación es 1:1, los moles se conservan y solo cambia la masa por el peso molar.`
        : relacion > 1
        ? `Por cada mol conocido se forman **${relacion.toFixed(2)} mol** del producto, así que su masa escala con ese factor.`
        : `Por cada mol conocido se forman solo **${relacion.toFixed(2)} mol** del producto: rinde menos en moles.`),
    tone: "neutral",
    icon: "⚗️",
  };

  return {
    masaBuscada: Number(masaB.toFixed(4)),
    molesConocido: Number(molesC.toFixed(6)),
    molesBuscado: Number(molesB.toFixed(6)),
    formula: `${masa}g ÷ ${Mc} g/mol = ${molesC.toFixed(4)} mol → × (${cb}/${cc}) = ${molesB.toFixed(4)} mol → × ${Mb} g/mol = ${masaB.toFixed(4)} g`,
    _insight,
  };
}
