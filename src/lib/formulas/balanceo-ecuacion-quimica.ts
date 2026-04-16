/** Calculadora de Estequiometría */
export interface Inputs { masaConocida: number; masaMolarConocida: number; coefConocido: number; masaMolarBuscado: number; coefBuscado: number; }
export interface Outputs { masaBuscada: number; molesConocido: number; molesBuscado: number; formula: string; }

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

  return {
    masaBuscada: Number(masaB.toFixed(4)),
    molesConocido: Number(molesC.toFixed(6)),
    molesBuscado: Number(molesB.toFixed(6)),
    formula: `${masa}g ÷ ${Mc} g/mol = ${molesC.toFixed(4)} mol → × (${cb}/${cc}) = ${molesB.toFixed(4)} mol → × ${Mb} g/mol = ${masaB.toFixed(4)} g`,
  };
}
