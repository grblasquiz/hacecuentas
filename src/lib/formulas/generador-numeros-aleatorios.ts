/**
 * "Generador de números aleatorios" — herramienta de sorteo.
 *
 * El usuario define un rango [minimo, maximo], una cantidad y si permite
 * repetidos, y devolvemos una lista de enteros aleatorios inclusive en ese
 * rango. Sirve para sorteos, rifas, amigo invisible, elegir ganadores, etc.
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source).
 *
 * Los inputs llegan como string/number desde el formulario (FormData). El
 * runtime de Calculator suele coercionar a número lo que parsea como número,
 * pero coercionamos defensivamente igual.
 *
 * Devuelve `numeros` (lista separada por comas) + _insight (resumen del
 * sorteo) + _table (desglose de la configuración).
 */

export interface GeneradorInputs {
  minimo: string | number;
  maximo: string | number;
  cantidad?: string | number;
  sin_repetir?: string;
  __lang?: string;
}

export interface GeneradorOutputs {
  numeros: string;
  _insight?: any;
  _table?: any;
}

// Tope de números a generar de una sola vez (evita listas gigantes ilegibles).
const CANTIDAD_MAXIMA = 100;

function aEntero(valor: string | number | undefined, porDefecto: number): number {
  if (valor == null || valor === '') return porDefecto;
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  if (!Number.isFinite(n)) return porDefecto;
  return Math.trunc(n);
}

// Entero aleatorio inclusive en [min, max] usando Math.random().
function enteroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generadorNumerosAleatorios(inputs: GeneradorInputs): GeneradorOutputs {
  const minimo = aEntero(inputs.minimo, NaN);
  const maximo = aEntero(inputs.maximo, NaN);

  if (!Number.isFinite(minimo) || !Number.isFinite(maximo)) {
    throw new Error('Ingresá un mínimo y un máximo válidos (números enteros).');
  }
  if (minimo > maximo) {
    throw new Error('El mínimo no puede ser mayor que el máximo. Revisá el rango.');
  }

  let cantidad = aEntero(inputs.cantidad, 1);
  if (cantidad < 1) {
    throw new Error('La cantidad de números a generar tiene que ser al menos 1.');
  }
  if (cantidad > CANTIDAD_MAXIMA) {
    throw new Error(`Podés generar hasta ${CANTIDAD_MAXIMA} números por vez. Reducí la cantidad.`);
  }

  const sinRepetir = String(inputs.sin_repetir ?? 'no').toLowerCase() === 'si';
  const totalDisponibles = maximo - minimo + 1;

  if (sinRepetir && cantidad > totalDisponibles) {
    throw new Error(
      `No se pueden generar ${cantidad} números distintos entre ${minimo} y ${maximo}: en ese rango solo hay ${totalDisponibles} valores posibles. Ampliá el rango o permití repetidos.`
    );
  }

  const resultados: number[] = [];

  if (sinRepetir) {
    // Sin repetir: mezcla parcial tipo Fisher–Yates sobre el conjunto de valores
    // disponibles y tomamos los primeros `cantidad`.
    const pool: number[] = [];
    for (let v = minimo; v <= maximo; v++) pool.push(v);
    for (let i = 0; i < cantidad; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
      resultados.push(pool[i]);
    }
  } else {
    for (let i = 0; i < cantidad; i++) {
      resultados.push(enteroAleatorio(minimo, maximo));
    }
  }

  const nf = (n: number) => n.toLocaleString('es-AR');
  const numeros = resultados.join(', ');

  // Insight: describe el sorteo realizado y el valor accionable.
  let narrativa: string;
  if (cantidad === 1) {
    narrativa = `El número ganador entre ${nf(minimo)} y ${nf(maximo)} es ${nf(resultados[0])}. Cada valor del rango tenía la misma probabilidad (1 en ${nf(totalDisponibles)}). Volvé a sortear para obtener otro resultado.`;
  } else {
    narrativa = `Sorteo de ${nf(cantidad)} números entre ${nf(minimo)} y ${nf(maximo)}${sinRepetir ? ' sin repetir' : ' (se permiten repetidos)'}: ${numeros}. ${sinRepetir ? `Se eligieron ${nf(cantidad)} valores distintos de los ${nf(totalDisponibles)} posibles del rango.` : `Como se permiten repetidos, un mismo número puede salir más de una vez.`} Volvé a sortear para una nueva tanda.`;
  }

  return {
    numeros,
    _insight: { type: 'highlight', icon: '🎲', text: narrativa },
    _table: {
      title: 'Configuración del sorteo',
      headers: ['Parámetro', 'Valor'],
      rows: [
        ['Rango', `${nf(minimo)} a ${nf(maximo)}`],
        ['Valores posibles', nf(totalDisponibles)],
        ['Cantidad generada', nf(cantidad)],
        ['Permite repetidos', sinRepetir ? 'No' : 'Sí'],
        ['Resultado', numeros],
      ],
      note: 'Cada número se elige al azar con probabilidad uniforme (todos los valores del rango tienen la misma chance). El rango es inclusive: incluye tanto el mínimo como el máximo. "Sin repetir" garantiza que ningún número salga dos veces.',
    },
  };
}
