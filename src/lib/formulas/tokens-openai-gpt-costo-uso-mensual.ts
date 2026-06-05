export interface Outputs { [k: string]: string | number | undefined | any; _insight?: any; _chart?: any; }
export function tokensOpenaiGptCostoUsoMensual(i: Inputs): Outputs {
  const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0; const m=String(i.modelo||'gpt_4o_mini');
  // Precios por millón de tokens (USD), fuente: openai.com/api/pricing — junio 2026
  // [input, output]
  const pricingMap: Record<string, [number,number]> = {
    'gpt_4o':        [2.50, 10.00],
    'gpt_4o_mini':   [0.15,  0.60],
    'o1':            [15.00, 60.00],
    'o1_mini':       [3.00,  12.00],
    'gpt_4_turbo':   [10.00, 30.00],
    'gpt_35_turbo':  [0.50,   1.50],
  };
  const pricing = pricingMap[m] ?? pricingMap['gpt_4o_mini'];
  // ti y to están en millones de tokens
  const costoIn = ti * pricing[0];
  const costoOut = to * pricing[1];
  const total = costoIn + costoOut;
  // Estimación de requests: asumiendo 1000 tokens promedio por request (input+output combinados)
  const avgTokensPerRequest = 1000;
  const requests = (ti + to) * 1_000_000 / avgTokensPerRequest;
  const porReq = requests > 0 ? total / requests : 0;

  const inShare = total > 0 ? (costoIn / total) * 100 : 0;
  const heavySide = costoOut >= costoIn ? 'salida' : 'entrada';
  const _insight = {
    title: 'De dónde sale tu factura',
    text: `Vas a gastar **USD ${total.toFixed(2)}/mes** con ${m.replace(/_/g,'-')}. El **${inShare.toFixed(0)}%** es entrada y el resto salida; los tokens de **${heavySide}** son los que más pesan. Como la salida cuesta 4× más que la entrada en GPT-4o, recortar respuestas largas baja el costo más rápido que recortar el prompt.`,
    tone: total >= 100 ? 'warn' : 'neutral',
    icon: '🤖',
  };
  const _chart = total > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tokens de entrada', value: Number(costoIn.toFixed(4)) },
      { label: 'Tokens de salida', value: Number(costoOut.toFixed(4)) },
    ],
    prefix: '$',
    centerValue: '$' + total.toFixed(2),
    centerLabel: 'Costo mensual',
    ariaLabel: `Composición del costo mensual de USD ${total.toFixed(2)}: USD ${costoIn.toFixed(2)} por tokens de entrada y USD ${costoOut.toFixed(2)} por tokens de salida.`,
  } : undefined;

  return {
    costoMensual: `USD ${total.toFixed(2)}`,
    porRequest: `USD ${porReq.toFixed(6)}`,
    observacion: `In ${ti}M × USD ${pricing[0]} + Out ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mes. Estimado en ~${Math.round(requests).toLocaleString('es-AR')} requests/mes.`,
    _insight,
    _chart,
  };
}
