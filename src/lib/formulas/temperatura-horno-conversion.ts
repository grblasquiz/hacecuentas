/** Conversión entre °C, °F y número de gas (1-9 horno francés/UK) */
export interface Inputs {
  valor: number;
  unidadOrigen: string; // celsius | fahrenheit | gas
}
export interface Outputs {
  celsius: number;
  fahrenheit: number;
  gas: number;
  nombreTemperatura: string;
  usoRecomendado: string;
  resumen: string;
}

// Tabla de equivalencias gas-mark ↔ °C
// gas 1 = 140°C, gas 2 = 150°C ... gas 9 = 240°C + (hay variaciones)
const GAS_A_CELSIUS: Record<number, number> = {
  1: 140, 2: 150, 3: 165, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240,
};

function celsiusAGas(c: number): number {
  if (c < 140) return 0;
  if (c >= 240) return 9;
  let mejor = 1;
  let minDiff = Infinity;
  for (const [g, temp] of Object.entries(GAS_A_CELSIUS)) {
    const diff = Math.abs(c - temp);
    if (diff < minDiff) { minDiff = diff; mejor = Number(g); }
  }
  return mejor;
}

function nombreTemp(c: number): string {
  if (c < 120) return 'Muy bajo (deshidratar/secar)';
  if (c < 150) return 'Bajo (merengues, pasta seca)';
  if (c < 170) return 'Moderado bajo (bizcochos, flanes)';
  if (c < 190) return 'Moderado (panes, tartas, pollo)';
  if (c < 210) return 'Moderado alto (pizzas domésticas, scones)';
  if (c < 230) return 'Alto (pan artesanal, lomo)';
  if (c < 260) return 'Muy alto (pizza napoletana, grill)';
  return 'Extremo (horno a piedra)';
}

function usoRec(c: number): string {
  if (c < 120) return 'Deshidratación de frutas, tostar frutos secos, carnes de cocción muy larga.';
  if (c < 150) return 'Merengue seco, pavlova, macarons (secado inicial).';
  if (c < 170) return 'Bizcochos tipo pound cake, flan de baño María, galletas suaves.';
  if (c < 190) return 'Bizcochuelo, torta, tartas dulces, pollo entero.';
  if (c < 210) return 'Scones, empanadas, facturas, tartas saladas, panes rápidos.';
  if (c < 230) return 'Pan artesanal, pizza estilo argentino a la piedra.';
  if (c < 260) return 'Pizza napoletana, grill de carnes (biftec), horno a leña.';
  return 'Horno de piedra profesional (pizza 60-90 s).';
}

export function temperaturaHornoConversion(i: Inputs): Outputs {
  const v = Number(i.valor);
  const uo = String(i.unidadOrigen);
  if (v === undefined || v === null || Number.isNaN(v)) throw new Error('Ingresá un valor numérico');

  let celsius = 0, fahrenheit = 0, gas = 0;

  if (uo === 'celsius') {
    celsius = v;
    fahrenheit = (v * 9) / 5 + 32;
    gas = celsiusAGas(v);
  } else if (uo === 'fahrenheit') {
    fahrenheit = v;
    celsius = ((v - 32) * 5) / 9;
    gas = celsiusAGas(celsius);
  } else if (uo === 'gas') {
    if (v < 1 || v > 9) throw new Error('El gas mark está entre 1 y 9');
    gas = Math.round(v);
    celsius = GAS_A_CELSIUS[gas];
    fahrenheit = (celsius * 9) / 5 + 32;
  } else {
    throw new Error('Unidad no válida');
  }

  return {
    celsius: Number(celsius.toFixed(1)),
    fahrenheit: Number(fahrenheit.toFixed(1)),
    gas,
    nombreTemperatura: nombreTemp(celsius),
    usoRecomendado: usoRec(celsius),
    resumen: `${celsius.toFixed(0)} °C = ${fahrenheit.toFixed(0)} °F = gas ${gas}. ${nombreTemp(celsius)}.`,
  };
}
