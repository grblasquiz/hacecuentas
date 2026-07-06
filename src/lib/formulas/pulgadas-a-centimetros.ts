/**
 * "Pulgadas a centímetros" — conversor de longitud bidireccional.
 *
 * El usuario ingresa un valor y elige la dirección (pulgadas→cm o cm→pulgadas)
 * y devolvemos el resultado convertido. La equivalencia es exacta y estable:
 * 1 pulgada = 2,54 cm (definición internacional del pulgada desde 1959).
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source).
 *
 * El input `valor` llega como string o number desde el formulario. Coercionamos
 * a Number defensivamente. Un valor no numérico o negativo → throw.
 *
 * Devuelve outputs + _insight (equivalencia legible) + _table (referencia).
 */

export interface PulgadasInputs {
  valor: string | number;
  direccion?: string;
  __lang?: string;
}

export interface PulgadasOutputs {
  resultado: number;
  _insight?: any;
  _table?: any;
}

// Factor exacto por definición internacional (1959): 1 in = 2,54 cm exactos.
const CM_POR_PULGADA = 2.54;

export function pulgadasACentimetros(inputs: PulgadasInputs): PulgadasOutputs {
  // Coerción defensiva: el input puede llegar como string desde FormData.
  const valorNum =
    typeof inputs.valor === 'number' ? inputs.valor : Number(String(inputs.valor ?? '').trim());

  if (!Number.isFinite(valorNum)) {
    throw new Error('Ingresá un valor numérico válido.');
  }
  if (valorNum < 0) {
    throw new Error('El valor no puede ser negativo.');
  }

  const direccion = inputs.direccion === 'cm-a-pulgadas' ? 'cm-a-pulgadas' : 'pulgadas-a-cm';

  // pulgadas→cm: multiplicar por 2,54. cm→pulgadas: dividir por 2,54.
  const resultado =
    direccion === 'cm-a-pulgadas' ? valorNum / CM_POR_PULGADA : valorNum * CM_POR_PULGADA;

  // Redondeo a 4 decimales para evitar ruido de punto flotante en la salida.
  const resultadoRedondeado = Math.round(resultado * 10000) / 10000;

  const nf = (n: number) =>
    n.toLocaleString('es-AR', { maximumFractionDigits: 4 });

  const unidadEntrada = direccion === 'cm-a-pulgadas' ? 'centímetros' : 'pulgadas';
  const unidadSalida = direccion === 'cm-a-pulgadas' ? 'pulgadas' : 'centímetros';
  const abrevEntrada = direccion === 'cm-a-pulgadas' ? 'cm' : 'in';
  const abrevSalida = direccion === 'cm-a-pulgadas' ? 'in' : 'cm';

  const pluralEntrada = valorNum === 1 ? unidadEntrada.replace(/s$/, '') : unidadEntrada;
  const pluralSalida =
    resultadoRedondeado === 1 ? unidadSalida.replace(/s$/, '') : unidadSalida;

  const narrativa =
    `${nf(valorNum)} ${pluralEntrada} (${abrevEntrada}) equivalen a ` +
    `${nf(resultadoRedondeado)} ${pluralSalida} (${abrevSalida}). ` +
    `La conversión usa el factor exacto 1 pulgada = 2,54 cm.`;

  return {
    resultado: resultadoRedondeado,
    _insight: { type: 'highlight', icon: '📏', text: narrativa },
    _table: {
      title: 'Cómo se hizo la conversión',
      headers: ['Dato', 'Valor'],
      rows: [
        ['Valor ingresado', `${nf(valorNum)} ${abrevEntrada}`],
        ['Dirección', direccion === 'cm-a-pulgadas' ? 'cm → pulgadas' : 'pulgadas → cm'],
        ['Factor', '1 pulgada = 2,54 cm'],
        [
          'Operación',
          direccion === 'cm-a-pulgadas'
            ? `${nf(valorNum)} ÷ 2,54`
            : `${nf(valorNum)} × 2,54`,
        ],
        ['Resultado', `${nf(resultadoRedondeado)} ${abrevSalida}`],
      ],
      note: 'El factor 2,54 cm por pulgada es exacto por la definición internacional de 1959. El resultado se redondea a cuatro decimales.',
    },
  };
}
