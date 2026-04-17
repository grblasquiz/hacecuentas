/**
 * Calculadora de mejor época para viajar por destino.
 * Puntúa cada mes combinando clima (temperatura + lluvia) y temporada turística.
 */

export interface MejorEpocaClimaDestinoInputs {
  destino: string;
  prioridad: string;
}

export interface MejorEpocaClimaDestinoOutputs {
  mejorMes: string;
  alternativas: string;
  evitar: string;
  detalle: string;
}

type MesData = {
  tempMin: number;
  tempMax: number;
  lluviaMm: number; // mm promedio
  temporada: 'baja' | 'media' | 'alta';
};

const MESES_NOMBRE = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DESTINOS: Record<string, MesData[]> = {
  paris: [
    { tempMin: 3, tempMax: 7, lluviaMm: 51, temporada: 'baja' },
    { tempMin: 3, tempMax: 9, lluviaMm: 41, temporada: 'baja' },
    { tempMin: 5, tempMax: 13, lluviaMm: 48, temporada: 'media' },
    { tempMin: 7, tempMax: 16, lluviaMm: 53, temporada: 'media' },
    { tempMin: 11, tempMax: 20, lluviaMm: 65, temporada: 'media' },
    { tempMin: 14, tempMax: 23, lluviaMm: 55, temporada: 'alta' },
    { tempMin: 16, tempMax: 26, lluviaMm: 63, temporada: 'alta' },
    { tempMin: 15, tempMax: 25, lluviaMm: 52, temporada: 'alta' },
    { tempMin: 12, tempMax: 21, lluviaMm: 52, temporada: 'media' },
    { tempMin: 9, tempMax: 16, lluviaMm: 62, temporada: 'media' },
    { tempMin: 5, tempMax: 10, lluviaMm: 54, temporada: 'baja' },
    { tempMin: 3, tempMax: 8, lluviaMm: 58, temporada: 'media' },
  ],
  londres: [
    { tempMin: 2, tempMax: 8, lluviaMm: 55, temporada: 'baja' },
    { tempMin: 2, tempMax: 8, lluviaMm: 40, temporada: 'baja' },
    { tempMin: 4, tempMax: 11, lluviaMm: 41, temporada: 'media' },
    { tempMin: 5, tempMax: 14, lluviaMm: 43, temporada: 'media' },
    { tempMin: 8, tempMax: 17, lluviaMm: 49, temporada: 'media' },
    { tempMin: 12, tempMax: 20, lluviaMm: 45, temporada: 'alta' },
    { tempMin: 14, tempMax: 22, lluviaMm: 44, temporada: 'alta' },
    { tempMin: 13, tempMax: 22, lluviaMm: 49, temporada: 'alta' },
    { tempMin: 11, tempMax: 19, lluviaMm: 49, temporada: 'media' },
    { tempMin: 8, tempMax: 14, lluviaMm: 69, temporada: 'media' },
    { tempMin: 4, tempMax: 10, lluviaMm: 59, temporada: 'baja' },
    { tempMin: 2, tempMax: 8, lluviaMm: 55, temporada: 'media' },
  ],
  nyc: [
    { tempMin: -3, tempMax: 3, lluviaMm: 82, temporada: 'baja' },
    { tempMin: -2, tempMax: 5, lluviaMm: 76, temporada: 'baja' },
    { tempMin: 2, tempMax: 10, lluviaMm: 109, temporada: 'media' },
    { tempMin: 7, tempMax: 16, lluviaMm: 106, temporada: 'media' },
    { tempMin: 13, tempMax: 22, lluviaMm: 100, temporada: 'media' },
    { tempMin: 18, tempMax: 27, lluviaMm: 88, temporada: 'alta' },
    { tempMin: 21, tempMax: 29, lluviaMm: 100, temporada: 'alta' },
    { tempMin: 20, tempMax: 29, lluviaMm: 102, temporada: 'alta' },
    { tempMin: 16, tempMax: 25, lluviaMm: 91, temporada: 'media' },
    { tempMin: 10, tempMax: 18, lluviaMm: 96, temporada: 'media' },
    { tempMin: 5, tempMax: 12, lluviaMm: 93, temporada: 'baja' },
    { tempMin: 0, tempMax: 6, lluviaMm: 93, temporada: 'alta' },
  ],
  madrid: [
    { tempMin: 2, tempMax: 10, lluviaMm: 33, temporada: 'baja' },
    { tempMin: 3, tempMax: 13, lluviaMm: 35, temporada: 'baja' },
    { tempMin: 5, tempMax: 17, lluviaMm: 25, temporada: 'media' },
    { tempMin: 7, tempMax: 18, lluviaMm: 45, temporada: 'media' },
    { tempMin: 11, tempMax: 23, lluviaMm: 45, temporada: 'media' },
    { tempMin: 16, tempMax: 29, lluviaMm: 22, temporada: 'alta' },
    { tempMin: 19, tempMax: 33, lluviaMm: 11, temporada: 'alta' },
    { tempMin: 19, tempMax: 32, lluviaMm: 13, temporada: 'alta' },
    { tempMin: 15, tempMax: 27, lluviaMm: 26, temporada: 'media' },
    { tempMin: 10, tempMax: 20, lluviaMm: 51, temporada: 'media' },
    { tempMin: 6, tempMax: 13, lluviaMm: 52, temporada: 'baja' },
    { tempMin: 3, tempMax: 10, lluviaMm: 46, temporada: 'media' },
  ],
  barcelona: [
    { tempMin: 4, tempMax: 13, lluviaMm: 32, temporada: 'baja' },
    { tempMin: 5, tempMax: 14, lluviaMm: 38, temporada: 'baja' },
    { tempMin: 7, tempMax: 17, lluviaMm: 42, temporada: 'media' },
    { tempMin: 9, tempMax: 18, lluviaMm: 46, temporada: 'media' },
    { tempMin: 13, tempMax: 22, lluviaMm: 48, temporada: 'media' },
    { tempMin: 17, tempMax: 26, lluviaMm: 30, temporada: 'alta' },
    { tempMin: 20, tempMax: 28, lluviaMm: 23, temporada: 'alta' },
    { tempMin: 20, tempMax: 29, lluviaMm: 50, temporada: 'alta' },
    { tempMin: 17, tempMax: 26, lluviaMm: 76, temporada: 'alta' },
    { tempMin: 13, tempMax: 22, lluviaMm: 87, temporada: 'media' },
    { tempMin: 8, tempMax: 17, lluviaMm: 52, temporada: 'baja' },
    { tempMin: 5, tempMax: 14, lluviaMm: 52, temporada: 'media' },
  ],
  roma: [
    { tempMin: 4, tempMax: 13, lluviaMm: 66, temporada: 'baja' },
    { tempMin: 4, tempMax: 14, lluviaMm: 73, temporada: 'baja' },
    { tempMin: 6, tempMax: 17, lluviaMm: 57, temporada: 'media' },
    { tempMin: 9, tempMax: 19, lluviaMm: 55, temporada: 'alta' },
    { tempMin: 13, tempMax: 24, lluviaMm: 31, temporada: 'alta' },
    { tempMin: 16, tempMax: 28, lluviaMm: 18, temporada: 'alta' },
    { tempMin: 19, tempMax: 31, lluviaMm: 11, temporada: 'alta' },
    { tempMin: 19, tempMax: 31, lluviaMm: 26, temporada: 'alta' },
    { tempMin: 16, tempMax: 27, lluviaMm: 79, temporada: 'media' },
    { tempMin: 12, tempMax: 22, lluviaMm: 95, temporada: 'media' },
    { tempMin: 8, tempMax: 17, lluviaMm: 108, temporada: 'baja' },
    { tempMin: 5, tempMax: 13, lluviaMm: 80, temporada: 'media' },
  ],
  tokio: [
    { tempMin: 1, tempMax: 10, lluviaMm: 52, temporada: 'media' },
    { tempMin: 1, tempMax: 10, lluviaMm: 56, temporada: 'media' },
    { tempMin: 4, tempMax: 13, lluviaMm: 117, temporada: 'alta' },
    { tempMin: 9, tempMax: 19, lluviaMm: 124, temporada: 'alta' },
    { tempMin: 14, tempMax: 23, lluviaMm: 137, temporada: 'media' },
    { tempMin: 18, tempMax: 26, lluviaMm: 167, temporada: 'baja' },
    { tempMin: 22, tempMax: 30, lluviaMm: 153, temporada: 'media' },
    { tempMin: 23, tempMax: 31, lluviaMm: 168, temporada: 'media' },
    { tempMin: 20, tempMax: 27, lluviaMm: 209, temporada: 'media' },
    { tempMin: 14, tempMax: 22, lluviaMm: 198, temporada: 'alta' },
    { tempMin: 9, tempMax: 17, lluviaMm: 92, temporada: 'alta' },
    { tempMin: 3, tempMax: 12, lluviaMm: 51, temporada: 'media' },
  ],
  bali: [
    { tempMin: 24, tempMax: 30, lluviaMm: 345, temporada: 'media' },
    { tempMin: 24, tempMax: 30, lluviaMm: 274, temporada: 'media' },
    { tempMin: 24, tempMax: 31, lluviaMm: 215, temporada: 'media' },
    { tempMin: 24, tempMax: 31, lluviaMm: 75, temporada: 'alta' },
    { tempMin: 24, tempMax: 31, lluviaMm: 79, temporada: 'alta' },
    { tempMin: 23, tempMax: 30, lluviaMm: 63, temporada: 'alta' },
    { tempMin: 23, tempMax: 29, lluviaMm: 50, temporada: 'alta' },
    { tempMin: 22, tempMax: 29, lluviaMm: 27, temporada: 'alta' },
    { tempMin: 23, tempMax: 30, lluviaMm: 58, temporada: 'alta' },
    { tempMin: 24, tempMax: 31, lluviaMm: 90, temporada: 'media' },
    { tempMin: 24, tempMax: 31, lluviaMm: 146, temporada: 'media' },
    { tempMin: 24, tempMax: 30, lluviaMm: 306, temporada: 'alta' },
  ],
  bangkok: [
    { tempMin: 22, tempMax: 32, lluviaMm: 13, temporada: 'alta' },
    { tempMin: 24, tempMax: 33, lluviaMm: 20, temporada: 'alta' },
    { tempMin: 25, tempMax: 34, lluviaMm: 42, temporada: 'alta' },
    { tempMin: 27, tempMax: 36, lluviaMm: 92, temporada: 'media' },
    { tempMin: 26, tempMax: 34, lluviaMm: 216, temporada: 'baja' },
    { tempMin: 26, tempMax: 33, lluviaMm: 209, temporada: 'baja' },
    { tempMin: 25, tempMax: 32, lluviaMm: 182, temporada: 'baja' },
    { tempMin: 25, tempMax: 32, lluviaMm: 212, temporada: 'baja' },
    { tempMin: 25, tempMax: 32, lluviaMm: 344, temporada: 'baja' },
    { tempMin: 25, tempMax: 32, lluviaMm: 292, temporada: 'baja' },
    { tempMin: 23, tempMax: 32, lluviaMm: 46, temporada: 'alta' },
    { tempMin: 21, tempMax: 31, lluviaMm: 7, temporada: 'alta' },
  ],
  dubai: [
    { tempMin: 15, tempMax: 24, lluviaMm: 16, temporada: 'alta' },
    { tempMin: 17, tempMax: 25, lluviaMm: 29, temporada: 'alta' },
    { tempMin: 19, tempMax: 29, lluviaMm: 20, temporada: 'alta' },
    { tempMin: 22, tempMax: 33, lluviaMm: 9, temporada: 'media' },
    { tempMin: 26, tempMax: 38, lluviaMm: 2, temporada: 'baja' },
    { tempMin: 29, tempMax: 40, lluviaMm: 0, temporada: 'baja' },
    { tempMin: 31, tempMax: 42, lluviaMm: 1, temporada: 'baja' },
    { tempMin: 31, tempMax: 42, lluviaMm: 1, temporada: 'baja' },
    { tempMin: 28, tempMax: 39, lluviaMm: 0, temporada: 'baja' },
    { tempMin: 24, tempMax: 36, lluviaMm: 2, temporada: 'media' },
    { tempMin: 20, tempMax: 30, lluviaMm: 3, temporada: 'alta' },
    { tempMin: 17, tempMax: 26, lluviaMm: 16, temporada: 'alta' },
  ],
  rio: [
    { tempMin: 23, tempMax: 30, lluviaMm: 114, temporada: 'alta' },
    { tempMin: 23, tempMax: 31, lluviaMm: 114, temporada: 'alta' },
    { tempMin: 23, tempMax: 29, lluviaMm: 116, temporada: 'alta' },
    { tempMin: 21, tempMax: 28, lluviaMm: 99, temporada: 'media' },
    { tempMin: 20, tempMax: 26, lluviaMm: 70, temporada: 'media' },
    { tempMin: 18, tempMax: 25, lluviaMm: 46, temporada: 'baja' },
    { tempMin: 18, tempMax: 25, lluviaMm: 39, temporada: 'baja' },
    { tempMin: 18, tempMax: 26, lluviaMm: 41, temporada: 'baja' },
    { tempMin: 19, tempMax: 26, lluviaMm: 59, temporada: 'media' },
    { tempMin: 20, tempMax: 27, lluviaMm: 79, temporada: 'media' },
    { tempMin: 21, tempMax: 28, lluviaMm: 92, temporada: 'media' },
    { tempMin: 22, tempMax: 29, lluviaMm: 134, temporada: 'alta' },
  ],
  cartagena: [
    { tempMin: 24, tempMax: 31, lluviaMm: 1, temporada: 'alta' },
    { tempMin: 24, tempMax: 31, lluviaMm: 1, temporada: 'alta' },
    { tempMin: 24, tempMax: 32, lluviaMm: 2, temporada: 'alta' },
    { tempMin: 25, tempMax: 32, lluviaMm: 18, temporada: 'media' },
    { tempMin: 26, tempMax: 32, lluviaMm: 94, temporada: 'media' },
    { tempMin: 26, tempMax: 32, lluviaMm: 78, temporada: 'media' },
    { tempMin: 26, tempMax: 33, lluviaMm: 64, temporada: 'media' },
    { tempMin: 26, tempMax: 33, lluviaMm: 105, temporada: 'baja' },
    { tempMin: 26, tempMax: 32, lluviaMm: 145, temporada: 'baja' },
    { tempMin: 26, tempMax: 32, lluviaMm: 223, temporada: 'baja' },
    { tempMin: 25, tempMax: 32, lluviaMm: 93, temporada: 'media' },
    { tempMin: 25, tempMax: 31, lluviaMm: 20, temporada: 'alta' },
  ],
  cancun: [
    { tempMin: 20, tempMax: 28, lluviaMm: 72, temporada: 'alta' },
    { tempMin: 20, tempMax: 29, lluviaMm: 42, temporada: 'alta' },
    { tempMin: 22, tempMax: 30, lluviaMm: 40, temporada: 'alta' },
    { tempMin: 23, tempMax: 32, lluviaMm: 36, temporada: 'alta' },
    { tempMin: 25, tempMax: 33, lluviaMm: 95, temporada: 'media' },
    { tempMin: 26, tempMax: 33, lluviaMm: 141, temporada: 'media' },
    { tempMin: 26, tempMax: 34, lluviaMm: 89, temporada: 'media' },
    { tempMin: 26, tempMax: 34, lluviaMm: 122, temporada: 'media' },
    { tempMin: 26, tempMax: 33, lluviaMm: 197, temporada: 'baja' },
    { tempMin: 25, tempMax: 31, lluviaMm: 189, temporada: 'baja' },
    { tempMin: 23, tempMax: 30, lluviaMm: 82, temporada: 'media' },
    { tempMin: 21, tempMax: 29, lluviaMm: 86, temporada: 'alta' },
  ],
  lima: [
    { tempMin: 20, tempMax: 27, lluviaMm: 1, temporada: 'alta' },
    { tempMin: 20, tempMax: 28, lluviaMm: 0, temporada: 'alta' },
    { tempMin: 20, tempMax: 27, lluviaMm: 0, temporada: 'media' },
    { tempMin: 18, tempMax: 25, lluviaMm: 0, temporada: 'media' },
    { tempMin: 16, tempMax: 22, lluviaMm: 2, temporada: 'baja' },
    { tempMin: 15, tempMax: 20, lluviaMm: 2, temporada: 'baja' },
    { tempMin: 15, tempMax: 19, lluviaMm: 2, temporada: 'baja' },
    { tempMin: 14, tempMax: 19, lluviaMm: 4, temporada: 'baja' },
    { tempMin: 15, tempMax: 20, lluviaMm: 2, temporada: 'baja' },
    { tempMin: 16, tempMax: 22, lluviaMm: 1, temporada: 'media' },
    { tempMin: 17, tempMax: 24, lluviaMm: 1, temporada: 'media' },
    { tempMin: 18, tempMax: 26, lluviaMm: 1, temporada: 'alta' },
  ],
};

function puntajeMes(m: MesData, prioridad: string): number {
  const tempProm = (m.tempMin + m.tempMax) / 2;

  // Clima (0-50)
  const idealMin = 15;
  const idealMax = 25;
  let pTemp: number;
  if (tempProm >= idealMin && tempProm <= idealMax) {
    pTemp = 30;
  } else {
    const distancia = tempProm < idealMin ? idealMin - tempProm : tempProm - idealMax;
    pTemp = Math.max(0, 30 - distancia * 2);
  }
  const pLluvia = Math.max(0, 20 - (m.lluviaMm / 200) * 20);
  const climaScore = pTemp + pLluvia;

  // Temporada (0-30)
  let temporadaScore: number;
  if (m.temporada === 'media') temporadaScore = 30;
  else if (m.temporada === 'baja') temporadaScore = 20;
  else temporadaScore = 10;

  // Precio (0-20)
  let precioScore: number;
  if (m.temporada === 'baja') precioScore = 20;
  else if (m.temporada === 'media') precioScore = 14;
  else precioScore = 5;

  if (prioridad === 'clima') return climaScore * 1.5 + temporadaScore * 0.3 + precioScore * 0.1;
  if (prioridad === 'precio') return climaScore * 0.6 + temporadaScore * 0.5 + precioScore * 2;
  return climaScore + temporadaScore + precioScore;
}

export function mejorEpocaClimaDestino(inputs: MejorEpocaClimaDestinoInputs): MejorEpocaClimaDestinoOutputs {
  const meses = DESTINOS[inputs.destino] ?? DESTINOS.paris;
  const scores = meses.map((m, i) => ({
    idx: i,
    nombre: MESES_NOMBRE[i],
    score: puntajeMes(m, inputs.prioridad),
    data: m,
  }));

  const ordenados = [...scores].sort((a, b) => b.score - a.score);
  const mejor = ordenados[0];
  const alternativas = ordenados.slice(1, 4).map((x) => x.nombre).join(', ');
  const evitar = ordenados.slice(-2).map((x) => x.nombre).join(', ');

  const tempProm = Math.round((mejor.data.tempMin + mejor.data.tempMax) / 2);
  const temporadaTxt =
    mejor.data.temporada === 'baja'
      ? 'temporada baja (precios más bajos)'
      : mejor.data.temporada === 'media'
        ? 'temporada media'
        : 'temporada alta (precios altos)';

  const detalle = `${tempProm}°C promedio · ${mejor.data.lluviaMm} mm de lluvia · ${temporadaTxt}`;

  return {
    mejorMes: mejor.nombre,
    alternativas,
    evitar,
    detalle,
  };
}
