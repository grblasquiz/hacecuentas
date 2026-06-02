/** Conversor de unidades: longitud, peso, volumen, temperatura */
export interface Inputs {
  valor: number;
  origen: string;
  destino: string;
}
export interface Outputs {
  resultado: number;
  origen: string;
  destino: string;
  factor: number;
  _insight?: any;
}

// Factores a unidad base: metro, gramo, litro
const LONGITUD: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  milla_nautica: 1852,
};
const PESO: Record<string, number> = {
  mg: 0.001, g: 1, kg: 1000, t: 1_000_000,
  oz: 28.3495, lb: 453.592, st: 6350.29,
};
const VOLUMEN: Record<string, number> = {
  ml: 0.001, cl: 0.01, l: 1, m3: 1000,
  tsp: 0.00492892, tbsp: 0.0147868,
  floz: 0.0295735, cup_us: 0.236588,
  pint_us: 0.473176, quart_us: 0.946353,
  gal_us: 3.78541, gal_uk: 4.54609,
};

function tempConvertir(v: number, origen: string, destino: string): number {
  let celsius = v;
  if (origen === 'F') celsius = (v - 32) * 5 / 9;
  else if (origen === 'K') celsius = v - 273.15;
  // de celsius a destino
  if (destino === 'C') return celsius;
  if (destino === 'F') return celsius * 9 / 5 + 32;
  if (destino === 'K') return celsius + 273.15;
  return celsius;
}

export function conversorUnidades(i: Inputs): Outputs {
  const v = Number(i.valor);
  const o = String(i.origen);
  const d = String(i.destino);
  if (isNaN(v)) throw new Error('Ingresá un valor');

  // Temperatura
  if (['C', 'F', 'K'].includes(o) && ['C', 'F', 'K'].includes(d)) {
    const res = tempConvertir(v, o, d);
    const resRound = Number(res.toFixed(4));
    return {
      resultado: resRound,
      origen: o,
      destino: d,
      factor: 0,
      _insight: {
        title: 'Conversión de temperatura',
        text: '**' + v + ' °' + o + '** equivalen a **' + resRound + ' °' + d + '**. La temperatura no escala con un factor fijo: cada conversión aplica su propia fórmula (offset + pendiente), por eso 0 °C son 32 °F y 100 °C son 212 °F.',
        tone: 'neutral',
        icon: '🌡️'
      }
    };
  }

  let factor = 0;
  let categoria = '';
  if (LONGITUD[o] && LONGITUD[d]) {
    factor = LONGITUD[o] / LONGITUD[d];
    categoria = 'longitud';
  } else if (PESO[o] && PESO[d]) {
    factor = PESO[o] / PESO[d];
    categoria = 'peso';
  } else if (VOLUMEN[o] && VOLUMEN[d]) {
    factor = VOLUMEN[o] / VOLUMEN[d];
    categoria = 'volumen';
  } else {
    throw new Error('Unidades incompatibles');
  }

  const resultado = v * factor;
  const resRound = Number(resultado.toFixed(6));
  const factorRound = Number(factor.toFixed(8));
  const sentido = factor >= 1
    ? 'Cada ' + o + ' contiene **' + factorRound + ' ' + d + '**, así que el número crece al convertir.'
    : 'Cada ' + o + ' es apenas **' + factorRound + ' ' + d + '**, así que el número se achica al convertir.';

  return {
    resultado: resRound,
    origen: o,
    destino: d,
    factor: factorRound,
    _insight: {
      title: 'Conversión de ' + categoria,
      text: '**' + v + ' ' + o + '** = **' + resRound + ' ' + d + '**. ' + sentido,
      tone: 'neutral',
      icon: categoria === 'longitud' ? '📏' : (categoria === 'peso' ? '⚖️' : '🧪')
    }
  };
}
