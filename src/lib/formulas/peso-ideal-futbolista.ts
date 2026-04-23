/** Peso ideal para futbolista según altura y posición (IMC 21-23 base elite + ajustes) */
export interface Inputs {
  alturaCm: number;
  posicion: string;
}

export interface Outputs {
  pesoIdealKg: number;
  pesoMinKg: number;
  pesoMaxKg: number;
  imcObjetivo: number;
  ajustePosicion: number;
  posicionNombre: string;
  detalle: string;
}

// Ajustes sobre IMC base 22 por posición
const POSICIONES: Record<string, { imcBase: number; ajuste: number; nombre: string }> = {
  'arquero':         { imcBase: 22.5, ajuste:  2.0, nombre: 'Arquero (fuerza + estatura)' },
  'defensor-central':{ imcBase: 22.5, ajuste:  2.5, nombre: 'Defensor central' },
  'lateral':         { imcBase: 21.5, ajuste: -1.5, nombre: 'Lateral (velocidad)' },
  'mediocampista':   { imcBase: 22.0, ajuste:  0.0, nombre: 'Mediocampista' },
  'volante-externo': { imcBase: 21.5, ajuste: -1.0, nombre: 'Volante externo / extremo' },
  'delantero':       { imcBase: 22.0, ajuste:  0.5, nombre: 'Delantero centro' },
};

export function pesoIdealFutbolista(i: Inputs): Outputs {
  const alt = Number(i.alturaCm);
  const pos = String(i.posicion || 'mediocampista');

  if (!alt || alt < 140 || alt > 220) throw new Error('Ingresá una altura válida (140-220 cm)');

  const info = POSICIONES[pos] || POSICIONES['mediocampista'];
  const mts = alt / 100;

  // IMC base + ajuste específico posicion
  const imc = info.imcBase;
  const pesoBase = imc * (mts * mts);
  const pesoIdeal = pesoBase + info.ajuste;

  // Rango razonable: ±3 kg
  const pMin = pesoIdeal - 3;
  const pMax = pesoIdeal + 3;

  return {
    pesoIdealKg: Number(pesoIdeal.toFixed(1)),
    pesoMinKg: Number(pMin.toFixed(1)),
    pesoMaxKg: Number(pMax.toFixed(1)),
    imcObjetivo: imc,
    ajustePosicion: info.ajuste,
    posicionNombre: info.nombre,
    detalle: `**${info.nombre}**, altura ${alt} cm: peso ideal **${pesoIdeal.toFixed(1)} kg** (rango ${pMin.toFixed(1)}-${pMax.toFixed(1)} kg). IMC objetivo ${imc} con ajuste ${info.ajuste > 0 ? '+' : ''}${info.ajuste} kg por demanda de la posición.`,
  };
}
