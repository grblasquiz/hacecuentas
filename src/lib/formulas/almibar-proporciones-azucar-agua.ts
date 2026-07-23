/** Almíbar: proporciones azúcar/agua, puntos clásicos y °Brix */
export interface Inputs {
  modo?: string;
  cantidad?: number;
  tipo?: string;
  __lang?: string;
}
export interface Outputs {
  azucar: number;
  agua: number;
  temperatura: string;
  brix: number;
  volumenAprox: number;
  _insight?: any;
}

interface Tipo {
  ratioAgua: number; // ml de agua por g de azúcar (inicial)
  brix: number; // concentración final aprox (% azúcar en peso)
  temp: string;
  label: string;
}

const TIPOS: Record<string, Tipo> = {
  liviano: { ratioAgua: 2, brix: 33.3333, temp: '100 °C — disolver y hervir 1 min', label: 'almíbar liviano (1:2)' },
  medio: { ratioAgua: 1, brix: 50, temp: '100 °C — disolver y hervir 1-2 min', label: 'almíbar medio / simple syrup (1:1)' },
  denso: { ratioAgua: 0.5, brix: 66.6667, temp: '103-105 °C', label: 'almíbar denso (2:1)' },
  'hilo-flojo': { ratioAgua: 1 / 3, brix: 75, temp: '103-105 °C (hilo flojo)', label: 'punto hilo flojo' },
  'hilo-fuerte': { ratioAgua: 1 / 3, brix: 80, temp: '106-110 °C (hilo fuerte)', label: 'punto hilo fuerte' },
  'bolita-blanda': { ratioAgua: 1 / 3, brix: 85, temp: '112-116 °C (bolita blanda)', label: 'punto bolita blanda' },
  'bolita-dura': { ratioAgua: 1 / 3, brix: 90, temp: '121-124 °C (bolita dura)', label: 'punto bolita dura' },
  caramelo: { ratioAgua: 1 / 3, brix: 99, temp: '150-160 °C (caramelo)', label: 'caramelo' },
};

export function almibarProporcionesAzucarAgua(i: Inputs): Outputs {
  const modo = String(i.modo || 'azucar');
  const cantidad = Number(i.cantidad) || 0;
  const tipo = String(i.tipo || 'medio');

  if (cantidad <= 0) throw new Error('Ingresá una cantidad mayor a 0');
  const cfg = TIPOS[tipo] || TIPOS['medio'];

  const densidad = 1 + 0.005 * cfg.brix; // aprox g/ml del almíbar terminado

  let azucar = 0;
  if (modo === 'volumen') {
    // cantidad = ml de almíbar terminado deseado
    azucar = cantidad * densidad * (cfg.brix / 100);
  } else {
    // cantidad = g de azúcar disponibles
    azucar = cantidad;
  }

  const agua = azucar * cfg.ratioAgua;
  const masaFinal = azucar / (cfg.brix / 100);
  const volumenAprox = masaFinal / densidad;

  const azucarR = Number(azucar.toFixed(1));
  const aguaR = Number(agua.toFixed(1));
  const volR = Number(volumenAprox.toFixed(0));

  return {
    azucar: azucarR,
    agua: aguaR,
    temperatura: cfg.temp,
    brix: Number(cfg.brix.toFixed(1)),
    volumenAprox: volR,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Para ${cfg.label} usá **${azucarR.toLocaleString('es-AR')} g de azúcar y ${aguaR.toLocaleString('es-AR')} ml de agua** (rinde ~${volR.toLocaleString('es-AR')} ml a ~${Number(cfg.brix.toFixed(0))} °Brix). Cociná hasta ${cfg.temp}. No revuelvas una vez que hierve: cristaliza.`,
      tone: 'neutral',
      icon: '🍯',
    },
  };
}
