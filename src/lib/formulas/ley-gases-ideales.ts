/** Calculadora Ley de Gases Ideales — PV = nRT */
export interface Inputs { presion?: number; volumen?: number; moles?: number; temperatura?: number; }
export interface Outputs { resultado: string; presionAtm: number; volumenL: number; molesN: number; temperaturaK: number; _insight?: any; }

export function leyGasesIdeales(i: Inputs): Outputs {
  const R = 0.082057; // L·atm/(mol·K)
  const pVal = i.presion != null && String(i.presion) !== '' ? Number(i.presion) : null;
  const vVal = i.volumen != null && String(i.volumen) !== '' ? Number(i.volumen) : null;
  const nVal = i.moles != null && String(i.moles) !== '' ? Number(i.moles) : null;
  const tCVal = i.temperatura != null && String(i.temperatura) !== '' ? Number(i.temperatura) : null;

  // Count nulls
  const vals = [pVal, vVal, nVal, tCVal];
  const nullCount = vals.filter(x => x === null).length;
  if (nullCount !== 1) throw new Error('Ingresá exactamente 3 de los 4 valores y dejá 1 vacío');

  let P: number, V: number, n: number, TK: number;
  let incognita: string, valorTxt: string;

  if (pVal === null) {
    V = vVal!; n = nVal!; TK = tCVal! + 273.15;
    if (V <= 0) throw new Error('El volumen debe ser mayor a 0');
    P = n * R * TK / V;
    incognita = 'la presión'; valorTxt = `${P.toFixed(4)} atm`;
  } else if (vVal === null) {
    P = pVal; n = nVal!; TK = tCVal! + 273.15;
    if (P <= 0) throw new Error('La presión debe ser mayor a 0');
    V = n * R * TK / P;
    incognita = 'el volumen'; valorTxt = `${V.toFixed(4)} L`;
  } else if (nVal === null) {
    P = pVal; V = vVal; TK = tCVal! + 273.15;
    n = P * V / (R * TK);
    incognita = 'los moles'; valorTxt = `${n.toFixed(4)} mol`;
  } else {
    P = pVal; V = vVal; n = nVal;
    TK = P * V / (n * R);
    incognita = 'la temperatura'; valorTxt = `${TK.toFixed(2)} K (${(TK - 273.15).toFixed(2)} °C)`;
  }

  const _insight = {
    title: 'Resultado despejado',
    text: `Despejando de **PV = nRT** con R = 0,0821 L·atm/(mol·K), ${incognita} es **${valorTxt}**. Recordá que la temperatura entra siempre en Kelvin (K = °C + 273,15).`,
    tone: 'neutral',
    icon: '🧪',
  };

  return {
    resultado: `P = ${P.toFixed(4)} atm, V = ${V.toFixed(4)} L, n = ${n.toFixed(6)} mol, T = ${TK.toFixed(2)} K (${(TK - 273.15).toFixed(2)} °C)`,
    presionAtm: Number(P.toFixed(6)),
    volumenL: Number(V.toFixed(6)),
    molesN: Number(n.toFixed(6)),
    temperaturaK: Number(TK.toFixed(2)),
    _insight,
  };
}
