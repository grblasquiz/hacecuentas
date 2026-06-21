/**
 * "Calculadora de tokens por modelo de IA" — estima cuántos TOKENS son un texto
 * (o un número de palabras / caracteres) y cuánto costaría procesarlo en input
 * y output según el modelo de IA elegido.
 *
 * El conteo es una ESTIMACIÓN: cada modelo usa su propio tokenizer (BPE), así que
 * el número exacto varía. Heurística: ~1 token ≈ 4 caracteres en inglés; en español
 * un poco más (más tokens por palabra) → usamos ~1 token ≈ 3,7 caracteres como
 * punto medio razonable, equivalente a ~0,75 palabras/token.
 *
 * Precios = USD por 1.000.000 de tokens (input y output), vigentes a junio 2026.
 * Fuente: páginas oficiales de pricing (OpenAI, Anthropic, Google) + proveedores
 * para modelos open-weight. `dataUpdate.frequency` = quarterly (los precios de IA
 * cambian; revisar cada trimestre). Devuelve outputs + _insight + _table.
 */

export interface TokensInputs {
  texto?: string;
  palabras?: number | string;
  caracteres?: number | string;
  modelo?: string;
  tipoUso?: string;
  __lang?: string;
}

export interface TokensOutputs {
  tokensEstimados: number;
  costoInput: number;
  costoOutput: number;
  costoTotal: number;
  _insight?: any;
  _table?: any;
}

// Precio USD por 1M de tokens: [input, output]. Vigentes junio 2026.
const PRECIOS: Record<string, { nombre: string; emoji: string; in: number; out: number }> = {
  'gpt-4o':         { nombre: 'GPT-4o',            emoji: '🟢', in: 2.5,  out: 10 },
  'gpt-4o-mini':    { nombre: 'GPT-4o mini',       emoji: '🟢', in: 0.15, out: 0.6 },
  'o3':             { nombre: 'OpenAI o3',          emoji: '🟢', in: 2,    out: 8 },
  'opus-4':         { nombre: 'Claude Opus 4.x',    emoji: '🟣', in: 5,    out: 25 },
  'sonnet-4':       { nombre: 'Claude Sonnet 4.x',  emoji: '🟣', in: 3,    out: 15 },
  'haiku-4':        { nombre: 'Claude Haiku 4.x',   emoji: '🟣', in: 1,    out: 5 },
  'gemini-25-pro':  { nombre: 'Gemini 2.5 Pro',     emoji: '🔵', in: 1.25, out: 10 },
  'gemini-25-flash':{ nombre: 'Gemini 2.5 Flash',   emoji: '🔵', in: 0.3,  out: 2.5 },
  'llama-3':        { nombre: 'Llama 3.x (70B)',    emoji: '🦙', in: 0.88, out: 0.88 },
  'deepseek':       { nombre: 'DeepSeek V3',        emoji: '🐳', in: 0.27, out: 1.1 },
};

// Heurística de tokenización (estimación; cada modelo usa su propio BPE).
const CHARS_POR_TOKEN = 3.7;   // español ≈ entre 3,5 y 4 chars/token
const PALABRAS_POR_TOKEN = 0.75; // ~1 token cada 0,75 palabras

function estimarTokens(inputs: TokensInputs): number {
  const texto = (inputs.texto || '').trim();
  if (texto.length > 0) {
    return Math.max(1, Math.round(texto.length / CHARS_POR_TOKEN));
  }
  const caracteres = Math.max(0, Number(inputs.caracteres) || 0);
  if (caracteres > 0) {
    return Math.max(1, Math.round(caracteres / CHARS_POR_TOKEN));
  }
  const palabras = Math.max(0, Number(inputs.palabras) || 0);
  if (palabras > 0) {
    return Math.max(1, Math.round(palabras / PALABRAS_POR_TOKEN));
  }
  return 0;
}

function fmtUSD(n: number): string {
  if (n === 0) return '$0';
  if (n < 0.01) return '$' + n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  if (n < 1) return '$' + n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function tokensPorModeloDeIa(inputs: TokensInputs): TokensOutputs {
  const tokensInput = estimarTokens(inputs);
  const modeloKey = (inputs.modelo || 'gpt-4o').toLowerCase();
  const modelo = PRECIOS[modeloKey] || PRECIOS['gpt-4o'];

  // "input+output estimado" asume que la respuesta del modelo es ~el mismo tamaño
  // que el prompt (factor 1×). "Solo input" no genera costo de salida.
  const incluyeOutput = (inputs.tipoUso || 'input') === 'input_output';
  const tokensOutput = incluyeOutput ? tokensInput : 0;

  const costoInput = (tokensInput / 1_000_000) * modelo.in;
  const costoOutput = (tokensOutput / 1_000_000) * modelo.out;
  const costoTotal = costoInput + costoOutput;

  // Tabla comparativa: el MISMO texto/tokens en TODOS los modelos (el hook).
  const filas = Object.keys(PRECIOS).map((k) => {
    const m = PRECIOS[k];
    const cIn = (tokensInput / 1_000_000) * m.in;
    const cOut = (tokensOutput / 1_000_000) * m.out;
    return {
      nombre: `${m.emoji} ${m.nombre}`,
      cIn,
      cOut,
      total: cIn + cOut,
      esSel: k === modeloKey,
    };
  }).sort((a, b) => a.total - b.total);

  const tableRows = filas.map((f) => [
    f.nombre + (f.esSel ? ' ◄' : ''),
    fmtUSD(f.cIn),
    incluyeOutput ? fmtUSD(f.cOut) : '—',
    fmtUSD(f.total),
  ]);

  const masBarato = filas[0];
  const masCaro = filas[filas.length - 1];

  // Narrativa
  let narrativa: string;
  if (tokensInput === 0) {
    narrativa = 'Pegá un texto, o ingresá palabras o caracteres, para estimar los tokens y el costo en cada modelo de IA.';
  } else {
    const palabrasAprox = Math.round(tokensInput * PALABRAS_POR_TOKEN);
    narrativa = `Tu texto son ~${tokensInput.toLocaleString('es-AR')} tokens (unas ${palabrasAprox.toLocaleString('es-AR')} palabras). `;
    if (incluyeOutput) {
      narrativa += `Procesarlo en ${modelo.nombre} con una respuesta de tamaño similar cuesta ~${fmtUSD(costoTotal)} (${fmtUSD(costoInput)} de entrada + ${fmtUSD(costoOutput)} de salida). `;
    } else {
      narrativa += `Enviarlo como entrada a ${modelo.nombre} cuesta ~${fmtUSD(costoInput)}. `;
    }
    if (masBarato.nombre !== masCaro.nombre) {
      narrativa += `El más barato para este texto es ${masBarato.nombre} (${fmtUSD(masBarato.total)}); el más caro, ${masCaro.nombre} (${fmtUSD(masCaro.total)}) — hasta ${(masCaro.total / Math.max(masBarato.total, 1e-9)).toFixed(0)}× de diferencia.`;
    }
  }

  return {
    tokensEstimados: tokensInput,
    costoInput,
    costoOutput,
    costoTotal,
    _insight: { type: 'highlight', icon: '🤖', text: narrativa },
    _table: {
      title: tokensInput > 0
        ? `Tu texto (~${tokensInput.toLocaleString('es-AR')} tokens) en cada modelo`
        : 'Costo por 1M de tokens en cada modelo',
      headers: ['Modelo', 'Costo entrada', incluyeOutput ? 'Costo salida' : 'Salida', 'Costo total'],
      rows: tableRows,
      note: 'Tokens estimados (~1 token ≈ 3,7 caracteres ≈ 0,75 palabras); el conteo exacto depende del tokenizer BPE de cada modelo. Precios en USD por 1M de tokens, vigentes a junio 2026 — verificá siempre la página oficial de pricing. "◄" marca el modelo que elegiste.',
    },
  };
}
