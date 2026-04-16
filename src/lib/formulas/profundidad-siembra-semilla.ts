/** Profundidad de siembra por especie */
export interface Inputs {
  especie: string;
  tipoSuelo?: string;
}
export interface Outputs {
  profundidadCm: number;
  metodoSiembra: string;
  diasGerminacion: string;
  consejo: string;
}

interface SemillaData {
  profBase: number;
  metodo: string;
  diasMin: number;
  diasMax: number;
  consejo: string;
}

const SEMILLAS: Record<string, SemillaData> = {
  tomate: { profBase: 1.0, metodo: 'Almácigo', diasMin: 7, diasMax: 14, consejo: 'Sembrá en almácigo a 20-25°C. Trasplantá con 4-6 hojas verdaderas.' },
  lechuga: { profBase: 0.5, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 7, consejo: 'Necesita algo de luz: cubrí apenas con sustrato fino. No enterrar.' },
  zanahoria: { profBase: 0.5, metodo: 'Siembra directa', diasMin: 14, diasMax: 21, consejo: 'Sembrá en hilera, mantené húmedo. Raleá cuando tengan 5 cm.' },
  pimiento: { profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 20, consejo: 'Necesita calor para germinar (25°C). Sembrá en almácigo cubierto.' },
  maiz: { profBase: 4.0, metodo: 'Siembra directa', diasMin: 5, diasMax: 10, consejo: 'Sembrá de a 2-3 semillas por hoyo, luego raleá dejando la más fuerte.' },
  poroto: { profBase: 3.0, metodo: 'Siembra directa', diasMin: 5, diasMax: 8, consejo: 'No remojes antes, puede pudrirse. Sembrá directo en suelo húmedo.' },
  haba: { profBase: 5.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Sembrá en otoño. Es resistente al frío pero no a encharcamientos.' },
  arveja: { profBase: 3.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Poné tutor desde el inicio. Sembrá en otoño-invierno.' },
  calabaza: { profBase: 3.0, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 10, consejo: 'Necesita mucho espacio. 1 planta cada 1-2 metros.' },
  pepino: { profBase: 2.0, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 8, consejo: 'Sensible al frío. No sembrar hasta que pase riesgo de heladas.' },
  espinaca: { profBase: 1.5, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Prefiere fresco. Si hace calor, se espiga rápido.' },
  acelga: { profBase: 2.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Cada semilla da 2-3 plantines. Raleá dejando 15 cm entre plantas.' },
  rabanito: { profBase: 1.0, metodo: 'Siembra directa', diasMin: 3, diasMax: 5, consejo: 'El más rápido de la huerta. Cosechá a los 30 días.' },
  remolacha: { profBase: 2.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Cada fruto tiene varias semillas. Raleá a los 10 días.' },
  cebolla: { profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 15, consejo: 'Sembrá en almácigo y trasplantá a los 60 días cuando el tallo tenga grosor de lápiz.' },
  ajo: { profBase: 4.0, metodo: 'Siembra directa (diente)', diasMin: 10, diasMax: 20, consejo: 'Enterrá el diente con punta hacia arriba. Sembrá en abril-mayo.' },
  perejil: { profBase: 0.5, metodo: 'Siembra directa', diasMin: 15, diasMax: 30, consejo: 'El más lento en germinar. Remojá las semillas 24h antes para acelerar.' },
  albahaca: { profBase: 0.5, metodo: 'Almácigo', diasMin: 7, diasMax: 14, consejo: 'Muy sensible al frío. No sembrar hasta que haga 15°C sostenidos.' },
  rucula: { profBase: 0.5, metodo: 'Siembra directa', diasMin: 4, diasMax: 7, consejo: 'Germina rápido. Cosechá las hojas externas y sigue produciendo.' },
  berenjena: { profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 20, consejo: 'Necesita mucho calor (25-30°C). Sembrá en almácigo protegido.' },
};

const FACTOR_SUELO: Record<string, number> = {
  arenoso: 1.2,
  franco: 1.0,
  arcilloso: 0.8,
};

export function profundidadSiembraSemilla(i: Inputs): Outputs {
  const especie = String(i.especie || 'tomate');
  const suelo = String(i.tipoSuelo || 'franco');
  const data = SEMILLAS[especie];
  if (!data) throw new Error('Especie no encontrada');

  const factor = FACTOR_SUELO[suelo] || 1;
  const prof = data.profBase * factor;

  return {
    profundidadCm: Number(prof.toFixed(1)),
    metodoSiembra: data.metodo,
    diasGerminacion: `${data.diasMin}–${data.diasMax} días`,
    consejo: data.consejo,
  };
}
