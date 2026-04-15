/** Conversión entre TNA, TEM y TEA */

export interface Inputs {
  tasa: number;
  tipoOrigen: string;
}

export interface Outputs {
  tna: number;
  tem: number;
  tea: number;
  detalle: string;
}

export function conversionTnaTem(i: Inputs): Outputs {
  const tasa = Number(i.tasa);
  const tipo = String(i.tipoOrigen).toUpperCase();

  if (isNaN(tasa) || tasa < 0) throw new Error('Ingresá una tasa válida');
  if (!['TNA', 'TEM', 'TEA'].includes(tipo)) throw new Error('Seleccioná el tipo de tasa (TNA, TEM o TEA)');

  let tna: number;
  let tem: number;
  let tea: number;

  const tasaDecimal = tasa / 100;

  if (tipo === 'TNA') {
    tna = tasa;
    tem = tasa / 12;
    tea = (Math.pow(1 + tasaDecimal / 12, 12) - 1) * 100;
  } else if (tipo === 'TEM') {
    tem = tasa;
    tna = tasa * 12;
    tea = (Math.pow(1 + tasaDecimal, 12) - 1) * 100;
  } else {
    // TEA
    tea = tasa;
    tem = (Math.pow(1 + tasaDecimal, 1 / 12) - 1) * 100;
    tna = tem * 12;
  }

  const fmt = (n: number) => n.toFixed(2);

  const detalle =
    `TNA: ${fmt(tna)}% | TEM: ${fmt(tem)}% | TEA: ${fmt(tea)}%. ` +
    `Ingresaste ${tipo} ${fmt(tasa)}%.`;

  return {
    tna: Number(fmt(tna)),
    tem: Number(fmt(tem)),
    tea: Number(fmt(tea)),
    detalle,
  };
}
