export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined | any; _insight?: any; _chart?: any; }
export function tokensOpenaiGptCostoUsoMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const ti = Number(i.tokensEntrada) || 0; // millones de tokens de entrada / millions of input tokens
  const to = Number(i.tokensSalida) || 0;  // millones de tokens de salida / millions of output tokens
  const m = String(i.modelo || 'gpt_4o');

  // Precios por millón de tokens (USD). Fuente: platform.openai.com/docs/pricing — verificado junio 2026.
  // [input, output]
  const pricingMap: Record<string, [number, number]> = {
    'gpt_55':        [5.00, 30.00],
    'gpt_54':        [2.50, 15.00],
    'gpt_5':         [1.25, 10.00],
    'gpt_5_mini':    [0.25,  2.00],
    'gpt_41':        [2.00,  8.00],
    'gpt_41_mini':   [0.40,  1.60],
    'gpt_41_nano':   [0.10,  0.40],
    'gpt_4o':        [2.50, 10.00],
    'gpt_4o_mini':   [0.15,  0.60],
    'o3':            [2.00,  8.00],
    'o4_mini':       [1.10,  4.40],
    'gpt_4_turbo':   [10.00, 30.00],
    'gpt_4':         [30.00, 60.00],
    'gpt_35_turbo':  [0.50,  1.50],
    'o1':            [15.00, 60.00],
    'o1_mini':       [3.00, 12.00],
  };
  const pricing = pricingMap[m] ?? pricingMap['gpt_4o'];

  const costoIn = ti * pricing[0];
  const costoOut = to * pricing[1];
  const total = costoIn + costoOut;

  // Estimación de requests: ~5.000 tokens promedio por request (input+output combinados)
  const avgTokensPerRequest = 5000;
  const requests = (ti + to) * 1_000_000 / avgTokensPerRequest;
  const porReq = requests > 0 ? total / requests : 0;

  const inShare = total > 0 ? (costoIn / total) * 100 : 0;
  const modelLabelMap: Record<string, string> = {
    gpt_55: 'GPT-5.5', gpt_54: 'GPT-5.4', gpt_5: 'GPT-5', gpt_5_mini: 'GPT-5 mini',
    gpt_41: 'GPT-4.1', gpt_41_mini: 'GPT-4.1 mini', gpt_41_nano: 'GPT-4.1 nano',
    gpt_4o: 'GPT-4o', gpt_4o_mini: 'GPT-4o mini', o3: 'o3', o4_mini: 'o4-mini',
    gpt_4_turbo: 'GPT-4 Turbo', gpt_4: 'GPT-4', gpt_35_turbo: 'GPT-3.5 Turbo',
  };
  const modelLabel = modelLabelMap[m] ?? m.replace(/_/g, '-').replace('gpt-', 'GPT-');
  const locale = __lang === 'es' ? 'es-AR' : __lang === 'pt' ? 'pt-BR' : 'en-US';

  const insightByLang: Record<string, any> = {
    es: {
      title: 'De dónde sale tu factura',
      text: `Vas a gastar **USD ${total.toFixed(2)}/mes** con ${modelLabel}. El **${inShare.toFixed(0)}%** es entrada y el resto salida. Como la salida cuesta 3–4× más que la entrada, recortar respuestas largas baja el costo más rápido que recortar el prompt.`,
    },
    en: {
      title: 'Where your bill comes from',
      text: `You'll spend **USD ${total.toFixed(2)}/month** with ${modelLabel}. **${inShare.toFixed(0)}%** is input and the rest output. Since output costs 3–4× more than input, trimming long responses cuts cost faster than shortening the prompt.`,
    },
    pt: {
      title: 'De onde vem sua fatura',
      text: `Você vai gastar **USD ${total.toFixed(2)}/mês** com ${modelLabel}. **${inShare.toFixed(0)}%** é entrada e o resto saída. Como a saída custa 3–4× mais que a entrada, cortar respostas longas reduz o custo mais rápido que encurtar o prompt.`,
    },
  };
  const _insight = { ...insightByLang[__lang], tone: total >= 100 ? 'warn' : 'neutral', icon: '🤖' };

  const chartLabels: Record<string, [string, string, string]> = {
    es: ['Tokens de entrada', 'Tokens de salida', 'Costo mensual'],
    en: ['Input tokens', 'Output tokens', 'Monthly cost'],
    pt: ['Tokens de entrada', 'Tokens de saída', 'Custo mensal'],
  };
  const cl = chartLabels[__lang];
  const _chart = total > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: cl[0], value: Number(costoIn.toFixed(4)) },
      { label: cl[1], value: Number(costoOut.toFixed(4)) },
    ],
    prefix: '$',
    centerValue: '$' + total.toFixed(2),
    centerLabel: cl[2],
    ariaLabel: `${cl[2]} USD ${total.toFixed(2)}: USD ${costoIn.toFixed(2)} ${cl[0]}, USD ${costoOut.toFixed(2)} ${cl[1]}.`,
  } : undefined;

  const obs: Record<string, string> = {
    es: `Entrada ${ti}M × USD ${pricing[0]} + Salida ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mes. Estimado en ~${Math.round(requests).toLocaleString(locale)} requests/mes (5.000 tokens c/u).`,
    en: `Input ${ti}M × USD ${pricing[0]} + Output ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/month. Estimated ~${Math.round(requests).toLocaleString(locale)} requests/month (5,000 tokens each).`,
    pt: `Entrada ${ti}M × USD ${pricing[0]} + Saída ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mês. Estimado em ~${Math.round(requests).toLocaleString(locale)} requisições/mês (5.000 tokens cada).`,
  };

  return {
    costoMensual: `USD ${total.toFixed(2)}`,
    porRequest: `USD ${porReq.toFixed(6)}`,
    observacion: obs[__lang],
    _insight,
    _chart,
  };
}
