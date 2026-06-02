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
  _insight?: any;
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

  const spread = tea - tna; // cuánto suma la capitalización sobre la nominal
  const insight = {
    title: 'El interés compuesto manda',
    text: `Una **${tipo} ${fmt(tasa)}%** equivale a una **TEA de ${fmt(tea)}%**. ` +
      (spread > 0.05
        ? `La capitalización mensual agrega **${fmt(spread)}pp** sobre la tasa nominal anual (${fmt(tna)}%): para comparar productos mirá siempre la TEA.`
        : `Para comparar préstamos o plazos fijos usá la TEA, que ya incluye la capitalización.`),
    tone: 'neutral',
    icon: '📈',
  };

  return {
    tna: Number(fmt(tna)),
    tem: Number(fmt(tem)),
    tea: Number(fmt(tea)),
    detalle,
    _insight: insight,
  };
}
