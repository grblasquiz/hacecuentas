/** Sustituto vegano de huevo por cantidad necesaria en receta */
export interface Inputs {
  huevosReemplazar: number;
  sustituto: string; // linaza | chia | banana | tofuSedoso | yogurSoja | aquafaba | manzana
  proposito: string; // ligante | leudante | humedad (para recomendar mejor sustituto)
}

interface Sust {
  nombre: string;
  porHuevo: string;
  mejorPara: string;
}

const SUSTITUTOS: Record<string, Sust> = {
  linaza: {
    nombre: 'Linaza molida + agua',
    porHuevo: '1 cda (7 g) linaza molida + 3 cdas (45 ml) agua tibia, reposar 5 min',
    mejorPara: 'Ligante (galletitas, panes, brownies, hamburguesas veg)',
  },
  chia: {
    nombre: 'Chía + agua',
    porHuevo: '1 cda (12 g) chía molida + 3 cdas (45 ml) agua, reposar 10 min',
    mejorPara: 'Ligante (panes, muffins, panqueques)',
  },
  banana: {
    nombre: 'Banana madura pisada',
    porHuevo: '1/2 banana (~60 g)',
    mejorPara: 'Humedad + dulzor (tortas, muffins, panqueques)',
  },
  tofuSedoso: {
    nombre: 'Tofu sedoso (silken)',
    porHuevo: '1/4 taza (60 g)',
    mejorPara: 'Humedad/textura cremosa (quiches, tartas saladas, flanes)',
  },
  yogurSoja: {
    nombre: 'Yogur de soja natural',
    porHuevo: '1/4 taza (60 g)',
    mejorPara: 'Humedad (tortas, bizcochos)',
  },
  aquafaba: {
    nombre: 'Aquafaba (líquido de garbanzos)',
    porHuevo: '3 cdas (45 ml)',
    mejorPara: 'Claras (merengues, mousses, macarons). Batir 5-7 min hasta picos.',
  },
  manzana: {
    nombre: 'Puré de manzana sin azúcar',
    porHuevo: '1/4 taza (60 g)',
    mejorPara: 'Humedad (bizcochos dulces, muffins)',
  },
  polvoHornear: {
    nombre: 'Mezcla bicarbonato + vinagre',
    porHuevo: '1 cdita bicarbonato + 1 cda vinagre de manzana',
    mejorPara: 'Leudante (tortas, cupcakes livianos)',
  },
};

export interface Outputs {
  sustitutoNombre: string;
  porHuevoUnidad: string;
  totalNecesario: string;
  mejorPara: string;
  recomendacion: string;
  resumen: string;
}

function parseCantidad(porHuevo: string, n: number): string {
  // Intento de escalar cantidades comunes. Detectamos 'x cda', 'x g', 'x ml', '1/2', '1/4'
  return porHuevo.replace(/(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(cda|cdas|cdita|cditas|g|ml|taza|tazas)/gi, (_m, num: string, un: string) => {
    let val: number;
    if (num.includes('/')) {
      const [a, b] = num.split('/').map(Number);
      val = a / b;
    } else {
      val = parseFloat(num.replace(',', '.'));
    }
    const total = val * n;
    const shown = total % 1 === 0 ? String(total) : total.toFixed(2).replace('.', ',');
    return `${shown} ${un}`;
  });
}

export function sustitutoHuevoVegano(i: Inputs): Outputs {
  const n = Number(i.huevosReemplazar) || 0;
  const key = (i.sustituto || 'linaza') as keyof typeof SUSTITUTOS;
  const proposito = String(i.proposito || 'ligante');

  if (n <= 0) throw new Error('Ingresá cantidad de huevos a reemplazar.');

  const s = SUSTITUTOS[key];
  if (!s) throw new Error('Sustituto no reconocido');

  const escalado = parseCantidad(s.porHuevo, n);

  // Recomendación cruzada
  let recomendacion = '';
  if (proposito === 'leudante' && key !== 'polvoHornear') {
    recomendacion = 'Para leudantes (tortas livianas) conviene bicarbonato + vinagre o sumar 1/2 cdita polvo hornear extra.';
  } else if (proposito === 'clara' && key !== 'aquafaba') {
    recomendacion = 'Para merengues/claras usá aquafaba — es el único sustituto que monta picos firmes.';
  } else if (proposito === 'ligante' && ['banana', 'manzana', 'yogurSoja'].includes(key)) {
    recomendacion = 'Para ligar mejor usá linaza o chía (forman gel). Banana/manzana aportan humedad pero no ligan igual.';
  } else {
    recomendacion = `${s.nombre} funciona bien para: ${s.mejorPara}.`;
  }

  return {
    sustitutoNombre: s.nombre,
    porHuevoUnidad: `Por 1 huevo: ${s.porHuevo}`,
    totalNecesario: `Para ${n} huevo(s): ${escalado}`,
    mejorPara: s.mejorPara,
    recomendacion,
    resumen: `Reemplazar ${n} huevo(s) con ${s.nombre}: ${escalado}. ${s.mejorPara}.`,
  };
}
