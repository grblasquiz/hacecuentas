/** Pan para una comida o evento según comensales y tipo de comida. */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  tipo_comida?: string;
  __country?: string;
}

export interface Outputs {
  pan_kg: number;
  mignones: number;
  flautas: number;
  resumen: string;
  _insight?: any;
}

export function panParaComidaEvento(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const tipo = String(i.tipo_comida || 'comida');

  // gramos de pan por adulto según el tipo de comida
  const gAdulto = tipo === 'asado' ? 150 : tipo === 'picada' ? 120 : tipo === 'sandwiches' ? 200 : 90;
  const totalG = adultos * gAdulto + ninos * gAdulto * 0.5;
  const personas = adultos + ninos;

  const pan_kg = personas > 0 ? Math.ceil((totalG / 1000) * 4) / 4 : 0; // redondeo 0,25 kg
  const mignones = personas > 0 ? Math.ceil(totalG / 60) : 0; // mignón ~60 g
  const flautas = personas > 0 ? Math.ceil(totalG / 250) : 0; // flauta/baguette ~250 g

  const resumen = personas > 0
    ? `Para ${personas} personas necesitás ~${pan_kg.toFixed(2)} kg de pan: unos ${mignones} mignones o ${flautas} flautas/baguettes.`
    : 'Cargá los comensales para calcular el pan.';

  const out: Outputs = { pan_kg, mignones, flautas, resumen };

  if (personas > 0) {
    out._insight = {
      title: 'Cuánto pan comprar',
      text: `Para **${personas}** comensales calculá **${pan_kg.toFixed(2)} kg** de pan (${mignones} mignones o ${flautas} flautas). Base: ${gAdulto} g por adulto para "${tipo}".`,
      tone: 'neutral',
      icon: '🥖',
    };
  }

  return out;
}
