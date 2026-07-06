/**
 * "¿Qué porcentaje es un número de otro?" — cálculo de porcentaje relativo.
 *
 * El usuario ingresa una `parte` y un `total`, y devolvemos qué porcentaje
 * representa la parte respecto del total: porcentaje = parte / total × 100.
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source).
 *
 * Los inputs pueden llegar como string desde el formulario (FormData) o como
 * number si el runtime de Calculator los coerciona. Normalizamos a Number
 * defensivamente. `total` = 0 es inválido (división por cero).
 *
 * Devuelve outputs + _insight (planteo humano) + _table (regla de tres).
 */

export interface QuePorcentajeInputs {
  parte: number | string;
  total: number | string;
  __lang?: string;
}

export interface QuePorcentajeOutputs {
  porcentaje: number;
  parte: number;
  total: number;
  _insight?: any;
  _table?: any;
}

function aNumero(valor: number | string | undefined | null): number {
  if (valor == null || valor === '') return NaN;
  if (typeof valor === 'number') return valor;
  // Aceptar tanto coma como punto decimal y separadores de miles suaves.
  const limpio = String(valor).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(limpio);
  // Si el reemplazo de miles rompió un decimal con punto (ej. "12.5"), reintentar.
  return Number.isNaN(n) ? Number(String(valor).trim()) : n;
}

export function quePorcentajeEsUnNumero(inputs: QuePorcentajeInputs): QuePorcentajeOutputs {
  const parte = aNumero(inputs.parte);
  const total = aNumero(inputs.total);

  if (Number.isNaN(parte) || Number.isNaN(total)) {
    throw new Error('Ingresá dos números válidos: la parte y el total.');
  }
  if (total === 0) {
    throw new Error('El total no puede ser cero: no se puede calcular un porcentaje respecto de cero.');
  }

  const porcentaje = (parte / total) * 100;

  // Formateo de números para la prosa (es-AR: miles con punto, decimales con coma).
  const nf = (n: number, dec = 2) =>
    n.toLocaleString('es-AR', { maximumFractionDigits: dec, minimumFractionDigits: 0 });

  // Porcentaje redondeado a 2 decimales para mostrar en el insight/tabla.
  const pctRedondeado = Math.round(porcentaje * 100) / 100;

  // Insight: el planteo humano ("45 es el 30% de 150") + matices.
  let narrativa = `${nf(parte)} es el ${nf(pctRedondeado)}% de ${nf(total)}.`;
  if (porcentaje > 100) {
    narrativa += ` Como la parte (${nf(parte)}) es mayor que el total (${nf(total)}), el porcentaje supera el 100%: la parte representa ${nf(pctRedondeado)}% del total, es decir, más de una vez el total.`;
  } else if (porcentaje === 100) {
    narrativa += ` La parte es igual al total, por eso da exactamente 100%.`;
  } else if (porcentaje < 0) {
    narrativa += ` El resultado es negativo porque uno de los dos valores lo es.`;
  } else {
    narrativa += ` Se calcula dividiendo ${nf(parte)} entre ${nf(total)} y multiplicando por 100.`;
  }

  return {
    porcentaje: pctRedondeado,
    parte,
    total,
    _insight: { type: 'highlight', icon: '📊', text: narrativa },
    _table: {
      title: 'El cálculo paso a paso (regla de tres)',
      headers: ['Paso', 'Operación', 'Resultado'],
      rows: [
        ['1. Dividir la parte entre el total', `${nf(parte)} ÷ ${nf(total)}`, nf(parte / total, 4)],
        ['2. Multiplicar por 100', `${nf(parte / total, 4)} × 100`, `${nf(pctRedondeado)}%`],
      ],
      note: 'Fórmula: porcentaje = (parte ÷ total) × 100. Si la parte es mayor que el total, el porcentaje supera el 100%.',
    },
  };
}
