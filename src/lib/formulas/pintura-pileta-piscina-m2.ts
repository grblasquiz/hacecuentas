/** Pintura para pileta o piscina: litros y baldes según las dimensiones y las manos. */
export interface Inputs {
  largo_m?: number | string;
  ancho_m?: number | string;
  profundidad_prom_m?: number | string;
  manos?: number | string;
  __country?: string;
}

export interface Outputs {
  pintura_litros: number;
  area_m2: number;
  baldes_4l: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function pinturaPiletaPiscinaM2(i: Inputs): Outputs {
  const largo_m = Math.max(0, Number(i.largo_m) || 0);
  const ancho_m = Math.max(0, Number(i.ancho_m) || 0);
  const profundidad_prom_m = Math.max(0, Number(i.profundidad_prom_m) || 0);
  const manos = Math.max(1, Math.floor(Number(i.manos) || 1));

  if (largo_m <= 0 || ancho_m <= 0) {
    return {
      pintura_litros: 0,
      area_m2: 0,
      baldes_4l: 0,
      resumen: 'Cargá el largo y el ancho de la pileta para calcular la pintura.',
    };
  }

  const fondo = largo_m * ancho_m;
  const paredes = 2 * (largo_m + ancho_m) * profundidad_prom_m;
  const area_m2 = Math.round((fondo + paredes) * 100) / 100;
  // Pintura para piletas rinde ~5 m² por litro y por mano.
  const pintura_litros = Math.ceil((area_m2 * manos) / 5 * 100) / 100;
  const baldes_4l = Math.ceil(pintura_litros / 4);

  const resumen = `Para una pileta de ${largo_m} × ${ancho_m} m (${area_m2} m² a pintar) con ${manos} mano${manos === 1 ? '' : 's'}: ${pintura_litros} litros de pintura, unos ${baldes_4l} baldes de 4 L.`;

  const out: Outputs = { pintura_litros, area_m2, baldes_4l, resumen };

  out._insight = {
    title: 'Cuánta pintura para la pileta',
    text: `La superficie a pintar (fondo + paredes) es de **${area_m2} m²**. Con **${manos} mano${manos === 1 ? '' : 's'}** vas a necesitar **${pintura_litros} litros** de pintura para piletas, o sea unos **${baldes_4l} baldes de 4 L**. Usá siempre pintura específica para piscinas: la común no resiste el agua clorada.`,
    tone: 'neutral',
    icon: '🏊',
  };

  out._chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fondo', value: Math.round(fondo * 100) / 100 },
      { label: 'Paredes', value: Math.round(paredes * 100) / 100 },
    ],
    centerValue: `${area_m2} m²`,
    centerLabel: 'A pintar',
    ariaLabel: `Fondo ${Math.round(fondo * 100) / 100} m² y paredes ${Math.round(paredes * 100) / 100} m².`,
  };

  return out;
}
