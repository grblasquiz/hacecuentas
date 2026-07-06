/**
 * "Fracción a decimal" — conversor de matemática.
 *
 * El usuario ingresa un numerador y un denominador y devolvemos el decimal
 * (numerador ÷ denominador) y su equivalente en porcentaje. No hay datos que
 * caduquen → `dataUpdate.frequency` = never (sin source/sourceUrl).
 *
 * Detecta si el decimal es exacto o periódico (y en ese caso el período) usando
 * división larga con detección de restos repetidos. Todo en TS puro, sin
 * dependencias externas.
 *
 * Devuelve outputs + _insight (resumen con aviso de periódico) + _table (pasos).
 */

export interface FraccionADecimalInputs {
  numerador: string | number;
  denominador: string | number;
  __lang?: string;
}

export interface FraccionADecimalOutputs {
  decimal: number;
  porcentaje: number;
  _insight?: any;
  _table?: any;
}

// Máximo de dígitos de la parte fraccionaria que examinamos para detectar
// periodicidad. 4000 cubre denominadores grandes sin colgar el navegador.
const MAX_DIGITOS = 4000;

/**
 * Analiza la parte decimal de |numerador| / |denominador| (ambos enteros > 0)
 * con división larga. Devuelve si es exacto y, si es periódico, el período
 * (los dígitos que se repiten) y la parte no periódica previa.
 */
function analizarPeriodicidad(num: number, den: number): {
  exacto: boolean;
  periodo: string;
  noPeriodica: string;
} {
  let resto = num % den;
  if (resto === 0) {
    return { exacto: true, periodo: '', noPeriodica: '' };
  }
  const digitos: number[] = [];
  // Mapea cada resto visto → posición en `digitos` donde apareció, para
  // detectar cuándo empieza a repetirse el ciclo.
  const restosVistos = new Map<number, number>();
  let posCiclo = -1;

  for (let i = 0; i < MAX_DIGITOS; i++) {
    if (resto === 0) {
      // Terminó exacto (decimal finito).
      return { exacto: true, periodo: '', noPeriodica: digitos.join('') };
    }
    if (restosVistos.has(resto)) {
      posCiclo = restosVistos.get(resto)!;
      break;
    }
    restosVistos.set(resto, i);
    resto *= 10;
    digitos.push(Math.floor(resto / den));
    resto = resto % den;
  }

  if (posCiclo === -1) {
    // No cerró el ciclo dentro del límite: lo tratamos como no periódico
    // detectable (denominador demasiado grande). Devolvemos como no exacto sin
    // período para no afirmar algo que no verificamos.
    return { exacto: false, periodo: '', noPeriodica: digitos.join('') };
  }

  const noPeriodica = digitos.slice(0, posCiclo).join('');
  const periodo = digitos.slice(posCiclo).join('');
  return { exacto: false, periodo, noPeriodica };
}

export function fraccionADecimal(inputs: FraccionADecimalInputs): FraccionADecimalOutputs {
  const numerador = typeof inputs.numerador === 'number' ? inputs.numerador : parseFloat(String(inputs.numerador));
  const denominador = typeof inputs.denominador === 'number' ? inputs.denominador : parseFloat(String(inputs.denominador));

  if (!isFinite(numerador) || !isFinite(denominador)) {
    throw new Error('Ingresá un numerador y un denominador numéricos.');
  }
  if (denominador === 0) {
    throw new Error('El denominador no puede ser cero: la división por cero no está definida.');
  }

  const decimal = numerador / denominador;
  const porcentaje = decimal * 100;

  const nf = (n: number) =>
    n.toLocaleString('es-AR', { maximumFractionDigits: 6 });

  // Análisis de periodicidad sólo cuando numerador y denominador son enteros
  // (con decimales en la entrada, "periódico" no aplica de forma limpia).
  const enteros = Number.isInteger(numerador) && Number.isInteger(denominador);
  let periodico = false;
  let periodo = '';
  let noPeriodica = '';
  if (enteros && numerador !== 0) {
    const analisis = analizarPeriodicidad(Math.abs(numerador), Math.abs(denominador));
    periodico = !analisis.exacto && analisis.periodo !== '';
    periodo = analisis.periodo;
    noPeriodica = analisis.noPeriodica;
  }

  const signo = decimal < 0 ? '-' : '';
  const enteroTxt = signo + Math.floor(Math.abs(numerador) / Math.abs(denominador)).toLocaleString('es-AR');

  // Insight: resumen humano + aviso de decimal periódico cuando corresponde.
  let narrativa: string;
  if (numerador === 0) {
    narrativa = `La fracción ${nf(numerador)}/${nf(denominador)} equivale a 0 (cero dividido por cualquier número distinto de cero da cero), es decir 0 %.`;
  } else if (periodico) {
    const muestra = `${enteroTxt},${noPeriodica}${periodo}${periodo}…`;
    narrativa = `${nf(numerador)}/${nf(denominador)} es un decimal periódico: ${muestra} — el bloque "${periodo}" se repite al infinito. En notación con arco se escribe con una raya sobre el período. Redondeado, es aproximadamente ${nf(decimal)}.`;
  } else if (enteros) {
    narrativa = `${nf(numerador)}/${nf(denominador)} es igual a ${nf(decimal)} (un decimal exacto, la división termina) y equivale al ${nf(porcentaje)} %.`;
  } else {
    narrativa = `${nf(numerador)}/${nf(denominador)} es igual a ${nf(decimal)}, que equivale al ${nf(porcentaje)} %.`;
  }

  // Detalle de conversión a porcentaje para reforzar el "cómo".
  const filas: any[] = [
    ['Fracción', `${nf(numerador)}/${nf(denominador)}`],
    ['División', `${nf(numerador)} ÷ ${nf(denominador)}`],
    ['Decimal', nf(decimal)],
    ['Porcentaje', `${nf(porcentaje)} %`],
    ['Tipo de decimal', periodico ? `Periódico (se repite "${periodo}")` : (enteros ? 'Exacto (termina)' : 'Con decimales en la entrada')],
  ];

  return {
    decimal,
    porcentaje,
    _insight: { type: 'highlight', icon: '➗', text: narrativa },
    _table: {
      title: 'Paso a paso de la conversión',
      headers: ['Paso', 'Valor'],
      rows: filas,
      note: 'Para pasar una fracción a decimal se divide el numerador por el denominador. Para pasar el decimal a porcentaje se multiplica por 100 (se corre la coma dos lugares a la derecha). Un decimal es periódico cuando un bloque de cifras se repite sin fin (por ejemplo 1/3 = 0,333…).',
    },
  };
}
