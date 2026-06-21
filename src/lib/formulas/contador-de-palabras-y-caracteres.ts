/**
 * "Contador de palabras y caracteres" — herramienta de texto.
 *
 * El usuario pega un texto y devolvemos: palabras, caracteres (con y sin
 * espacios), oraciones, párrafos y el tiempo de lectura estimado. No hay datos
 * que caduquen → `dataUpdate.frequency` = never (sin source/sourceUrl).
 *
 * El input llega como string desde el formulario (FormData). OJO: el runtime de
 * Calculator convierte a número cualquier valor que parsee como número (ej. si
 * el usuario pega sólo "123"), así que coercionamos a String defensivamente.
 *
 * Devuelve outputs + _insight (resumen) + _table (desglose).
 */

export interface ContadorInputs {
  texto: string | number;
  __lang?: string;
}

export interface ContadorOutputs {
  tiempoLectura: string;
  palabras: number;
  caracteresConEspacios: number;
  caracteresSinEspacios: number;
  oraciones: number;
  parrafos: number;
  _insight?: any;
  _table?: any;
}

// ~200 palabras por minuto = velocidad de lectura silenciosa promedio de un
// adulto (la cifra de referencia más usada; lectura en voz alta ≈ 130).
const PALABRAS_POR_MINUTO = 200;

function formatTiempo(minutosDecimal: number): string {
  if (minutosDecimal <= 0) return '0 min';
  // Menos de 1 minuto → mostrar en segundos (más honesto que "1 min").
  if (minutosDecimal < 1) {
    const seg = Math.max(1, Math.round(minutosDecimal * 60));
    return seg === 1 ? '1 seg' : `${seg} seg`;
  }
  const totalMin = Math.round(minutosDecimal);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function contadorDePalabrasYCaracteres(inputs: ContadorInputs): ContadorOutputs {
  // Coerción defensiva: el input puede llegar como number si el usuario pegó
  // sólo dígitos. Normalizamos a string sin recortar (los espacios cuentan).
  const texto = inputs.texto == null ? '' : String(inputs.texto);

  // Palabras: separar por cualquier whitespace y descartar vacíos.
  const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).filter(Boolean).length;

  // Caracteres con espacios = largo total tal cual.
  const caracteresConEspacios = texto.length;
  // Caracteres sin espacios = sacar todo whitespace (espacios, tabs, saltos).
  const caracteresSinEspacios = texto.replace(/\s/g, '').length;

  // Oraciones: cortar por uno o más signos de cierre (. ! ?), descartar vacíos.
  // Cubre "…", "?!", "...". Si hay texto pero sin puntuación final, cuenta 1.
  const trozosOracion = texto.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  let oraciones = trozosOracion.length;
  if (oraciones === 0 && texto.trim() !== '') oraciones = 1;

  // Párrafos: bloques separados por una o más líneas en blanco; si el texto no
  // tiene dobles saltos, contamos las líneas no vacías (cada línea = 1 párrafo).
  let parrafos: number;
  if (texto.trim() === '') {
    parrafos = 0;
  } else if (/\n\s*\n/.test(texto)) {
    parrafos = texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length;
  } else {
    parrafos = texto.split(/\n/).map((l) => l.trim()).filter(Boolean).length || 1;
  }

  const minutos = palabras / PALABRAS_POR_MINUTO;
  const tiempoLectura = formatTiempo(minutos);

  const nf = (n: number) => n.toLocaleString('es-AR');

  // Insight: resumen humano + el dato accionable más común (límites de texto).
  let narrativa: string;
  if (palabras === 0) {
    narrativa = 'Pegá o escribí un texto arriba y te muestro al instante las palabras, los caracteres (con y sin espacios), las oraciones, los párrafos y el tiempo de lectura.';
  } else {
    narrativa = `Tu texto tiene ${nf(palabras)} palabra${palabras === 1 ? '' : 's'} y ${nf(caracteresConEspacios)} caracteres con espacios (${nf(caracteresSinEspacios)} sin espacios), repartidos en ${nf(oraciones)} ${oraciones === 1 ? 'oración' : 'oraciones'} y ${nf(parrafos)} párrafo${parrafos === 1 ? '' : 's'}. Se lee en aproximadamente ${tiempoLectura} a 200 palabras por minuto.`;
    // Pistas de límites frecuentes (Twitter/X, meta description, title SEO).
    const avisos: string[] = [];
    if (caracteresConEspacios > 280) {
      avisos.push(`te pasás del límite de 280 caracteres de un tuit por ${nf(caracteresConEspacios - 280)}`);
    }
    if (caracteresConEspacios > 160) {
      avisos.push('superás los ~160 caracteres recomendados para una meta description');
    } else if (caracteresConEspacios >= 120 && caracteresConEspacios <= 160) {
      avisos.push('estás en el rango ideal (120-160) para una meta description');
    }
    if (avisos.length) narrativa += ' ' + avisos.join('; ') + '.';
  }

  return {
    tiempoLectura,
    palabras,
    caracteresConEspacios,
    caracteresSinEspacios,
    oraciones,
    parrafos,
    _insight: { type: 'highlight', icon: '🔤', text: narrativa },
    _table: {
      title: 'Desglose del texto',
      headers: ['Métrica', 'Valor'],
      rows: [
        ['Palabras', nf(palabras)],
        ['Caracteres (con espacios)', nf(caracteresConEspacios)],
        ['Caracteres (sin espacios)', nf(caracteresSinEspacios)],
        ['Oraciones', nf(oraciones)],
        ['Párrafos', nf(parrafos)],
        ['Tiempo de lectura (~200 ppm)', tiempoLectura],
      ],
      note: 'Palabras: separadas por espacios. Oraciones: cortadas por . ! ? Párrafos: bloques separados por línea en blanco (o cada línea no vacía si no hay). Tiempo de lectura a 200 palabras por minuto (lectura silenciosa de un adulto promedio).',
    },
  };
}
