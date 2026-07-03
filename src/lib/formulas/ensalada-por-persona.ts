/** Ensalada por persona: kilos totales y unidades aproximadas de verdura. */
export interface Inputs {
  personas?: number | string;
  rol?: string;
  __country?: string;
}

export interface Outputs {
  ensalada_kg: number;
  lechugas: number;
  tomates: number;
  resumen: string;
  lista_compras: string;
  _insight?: any;
}

export function ensaladaPorPersona(i: Inputs): Outputs {
  const p = Math.max(0, Math.floor(Number(i.personas) || 0));
  const rol = String(i.rol || 'guarnicion');

  const gPersona = rol === 'principal' ? 220 : 110; // g de ensalada por persona
  const total_g = p * gPersona;
  const ensalada_kg = p > 0 ? Math.ceil((total_g / 1000) * 4) / 4 : 0;

  // ensalada mixta base: lechuga 40%, tomate 45%, cebolla 15%
  const lechugaG = total_g * 0.40;
  const tomateG = total_g * 0.45;
  const cebollaG = Math.round(total_g * 0.15);
  const lechugas = p > 0 ? Math.max(1, Math.ceil(lechugaG / 300)) : 0; // lechuga ~300 g
  const tomates = p > 0 ? Math.max(1, Math.ceil(tomateG / 120)) : 0; // tomate ~120 g

  const resumen = p > 0
    ? `Para ${p} personas (${rol === 'principal' ? 'plato principal' : 'guarnición'}): ~${ensalada_kg.toFixed(2)} kg de ensalada.`
    : 'Cargá la cantidad de personas para calcular la ensalada.';

  const lista_compras = p > 0
    ? `${lechugas} lechuga(s), ${tomates} tomate(s) y ~${cebollaG} g de cebolla como base de una ensalada mixta.`
    : '';

  const out: Outputs = { ensalada_kg, lechugas, tomates, resumen, lista_compras };

  if (p > 0) {
    out._insight = {
      title: 'Cuánta ensalada preparar',
      text: `Para **${p}** personas calculá **${ensalada_kg.toFixed(2)} kg** de ensalada (${rol === 'principal' ? '220' : '110'} g por persona). Como base mixta: ${lechugas} lechuga(s) y ${tomates} tomate(s).`,
      tone: 'neutral',
      icon: '🥗',
    };
  }

  return out;
}
