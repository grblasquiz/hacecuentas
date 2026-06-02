/** Horas de secado de ropa al aire libre según viento + temp + humedad + prenda. */
export interface Inputs {
  temperatura: number;     // °C
  humedad: number;         // %
  vientoKmh: number;       // km/h
  prenda: 'remera' | 'camisa' | 'jean' | 'toalla' | 'sabana' | 'medias' | 'buzo';
  sol: 'pleno' | 'parcial' | 'sombra';
}
export interface Outputs {
  horas: string;
  horasNumero: number;
  categoria: string;
  recomendacion: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const BASE: Record<string, number> = {
  remera: 3,
  camisa: 3,
  medias: 2,
  buzo: 6,
  jean: 6,
  toalla: 9,
  sabana: 5,
};

export function tiempoSecadoRopaAire(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const H = Number(i.humedad);
  const v = Number(i.vientoKmh);
  if (!Number.isFinite(T) || T < -15 || T > 50) throw new Error('Temperatura fuera de rango.');
  if (!Number.isFinite(H) || H <= 0 || H > 100) throw new Error('Humedad fuera de rango.');
  if (!Number.isFinite(v) || v < 0 || v > 150) throw new Error('Viento fuera de rango.');
  const base = BASE[i.prenda];
  if (!base) throw new Error('Prenda inválida.');

  // Factor temperatura (más calor → menos horas)
  let fT = 1.0;
  if (T >= 30) fT = 0.55;
  else if (T >= 25) fT = 0.7;
  else if (T >= 20) fT = 0.85;
  else if (T >= 15) fT = 1.0;
  else if (T >= 10) fT = 1.3;
  else if (T >= 5) fT = 1.7;
  else fT = 2.3;

  // Factor humedad (más humedad → más horas)
  let fH = 1.0;
  if (H <= 30) fH = 0.7;
  else if (H <= 50) fH = 0.85;
  else if (H <= 70) fH = 1.0;
  else if (H <= 85) fH = 1.4;
  else fH = 2.0;

  // Factor viento (más viento → menos horas) — saturación en 30+ km/h
  let fV = 1.0;
  if (v < 2) fV = 1.4;
  else if (v < 8) fV = 1.1;
  else if (v < 15) fV = 0.9;
  else if (v < 25) fV = 0.75;
  else fV = 0.6;

  // Factor sol
  const fSol = i.sol === 'pleno' ? 0.8 : i.sol === 'parcial' ? 0.95 : 1.2;

  const horas = Math.max(0.3, base * fT * fH * fV * fSol);

  let categoria = 'Normal';
  let rec = 'Colgar extendido y con separación entre prendas para maximizar ventilación.';
  if (horas < 2) { categoria = 'Muy rápido'; rec = 'Condiciones óptimas, secado express.'; }
  else if (horas < 5) { categoria = 'Normal'; rec = 'Colgar sin doblar y con ganchos para que el viento lo ayude.'; }
  else if (horas < 10) { categoria = 'Lento'; rec = 'Evaluá interior con ventilador o deshumidificador si está muy húmedo.'; }
  else { categoria = 'Muy lento'; rec = 'Riesgo de mal olor si pasa >24 h. Mejor secado bajo techo ventilado o secarropa.'; }

  // Identificar el factor dominante (el que más aleja de 1, sea acelerando o frenando).
  const factores: Array<{nombre: string; valor: number}> = [
    { nombre: 'la temperatura baja', valor: fT },
    { nombre: 'la humedad alta', valor: fH },
    { nombre: 'el poco viento', valor: fV },
    { nombre: 'la falta de sol', valor: fSol },
  ];
  // El que más frena (mayor factor) si seca lento; el que más ayuda (menor factor) si seca rápido.
  const masFrena = factores.reduce((a, b) => (b.valor > a.valor ? b : a));
  const masAyuda = factores.reduce((a, b) => (b.valor < a.valor ? b : a));

  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  if (horas < 2) {
    insTone = 'good';
    insText = `Secado **express**: tu ${i.prenda} estaría lista en **~${horas.toFixed(1)} h**. Las condiciones juegan a favor y suma especialmente la baja humedad y el calor. Tendela ya.`;
  } else if (horas < 5) {
    insTone = 'neutral';
    insText = `Tiempo **normal** de **~${horas.toFixed(1)} h** para una ${i.prenda} con ${H.toFixed(0)}% de humedad y ${v.toFixed(0)} km/h de viento. Colgala separada para que el aire circule.`;
  } else if (horas < 10) {
    insTone = 'warn';
    insText = `Secado **lento** (**~${horas.toFixed(1)} h**): lo que más frena es **${masFrena.nombre}**. Si está muy húmedo, un ventilador o deshumidificador puede ayudar más que esperar afuera.`;
  } else {
    insTone = 'warn';
    insText = `Secado **muy lento** (**~${horas.toFixed(1)} h**): con **${masFrena.nombre}**, hay riesgo de mal olor si pasa más de 24 h. Conviene techo ventilado o secarropa.`;
  }
  // Para casos rápidos, mencionar el factor que más ayuda.
  if (horas < 2 && masAyuda.valor < 0.8) {
    insText = `Secado **express**: tu ${i.prenda} estaría lista en **~${horas.toFixed(1)} h**, sobre todo gracias a **${masAyuda.nombre.replace('la falta de sol', 'el sol pleno').replace('el poco viento', 'el viento')}**. Tendela ya.`;
  }

  // Gauge: horas de secado en zonas (Muy rápido / Normal / Lento / Muy lento).
  const topEscala = Math.max(14, Math.ceil(horas) + 1);
  const chart = {
    type: 'scale' as const,
    marker: Number(horas.toFixed(1)),
    markerLabel: `~${horas.toFixed(1)} h`,
    min: 0,
    unit: 'h',
    segments: [
      { nombre: 'Muy rápido', max: 2, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Normal', max: 5, color: '#a7f3d0', colorDark: '#047857' },
      { nombre: 'Lento', max: 10, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Muy lento', max: topEscala, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Escala de tiempo de secado al aire: muy rápido hasta 2h, normal hasta 5h, lento hasta 10h y muy lento por encima. Marcador en ~${horas.toFixed(1)} h.`,
  };

  return {
    horas: `${horas.toFixed(1)} h`,
    horasNumero: Number(horas.toFixed(2)),
    categoria,
    recomendacion: rec,
    mensaje: `${i.prenda} a ${T.toFixed(1)} °C, ${H.toFixed(0)}% HR, ${v.toFixed(0)} km/h viento, sol ${i.sol}: ~${horas.toFixed(1)} h (${categoria}).`,
    _insight: {
      title: 'Tu tiempo de secado',
      text: insText,
      tone: insTone,
      icon: '👕',
    },
    _chart: chart,
  };
}
