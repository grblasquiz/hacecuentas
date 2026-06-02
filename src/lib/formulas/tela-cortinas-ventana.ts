/**
 * Calculadora de tela para cortinas por ancho de ventana
 */

export interface Inputs {
  anchoVentana: number; largoCortina: number; frunce: number; anchoTela: number; paneles: number;
}

export interface Outputs {
  metrosTotales: string; panosNecesarios: number; anchoTotalTela: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function telaCortinasVentana(inputs: Inputs): Outputs {
  const av = Number(inputs.anchoVentana);
  const lc = Number(inputs.largoCortina);
  const fr = Number(inputs.frunce);
  const at = Number(inputs.anchoTela);
  const p = Math.round(Number(inputs.paneles));
  if (!av || !lc || !fr || !at || !p) throw new Error('Completá los campos');
  const anchoTotalTela = av * fr;
  const panos = Math.ceil(anchoTotalTela / at);
  const largoPano = (lc + 25) / 100; // +25 cm dobladillos, a m
  const metros = panos * largoPano;
  let tip = '';
  if (fr < 1.8) tip = 'Frunce bajo: cortina se verá algo plana.';
  else if (fr < 2.3) tip = 'Frunce estándar, ideal la mayoría de casos ✅';
  else if (fr < 2.8) tip = 'Frunce confortable: mucha caída y textura.';
  else tip = 'Frunce lujoso: grandes dobleces, estilo hotelero.';

  // --- Insight: metros a comprar, según frunce y paños ---
  const insightTone = fr < 1.8 ? 'warn' : 'neutral';
  const frunceTxt = fr < 1.8
    ? `con frunce **bajo (×${fr})** la cortina cae algo plana`
    : fr < 2.3
      ? `con frunce **estándar (×${fr})**, el más usado`
      : fr < 2.8
        ? `con frunce **confortable (×${fr})**, mucha caída`
        : `con frunce **lujoso (×${fr})**, estilo hotelero`;
  const _insight = {
    title: 'Tela a comprar',
    text: `Para una ventana de ${av} cm ${frunceTxt}, necesitás **${metros.toFixed(2)} m** de tela: ${panos} paño(s) de ${at} cm de ancho que suman ${anchoTotalTela.toFixed(0)} cm fruncidos. Incluye +25 cm por paño para dobladillos.`,
    tone: insightTone,
    icon: '🪟',
  };

  // --- Gauge: zona del frunce elegido ---
  const _chart = {
    type: 'scale' as const,
    marker: fr,
    markerLabel: `Frunce ×${fr}`,
    min: 1,
    segments: [
      { nombre: 'Plano', max: 1.8, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Estándar', max: 2.3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Confortable', max: 2.8, color: '#bae6fd', colorDark: '#075985' },
      { nombre: 'Lujoso', max: Math.max(3.2, Math.round(fr * 100) / 100 + 0.2), color: '#ddd6fe', colorDark: '#5b21b6' },
    ],
    ariaLabel: 'Escala del multiplicador de frunce de la cortina, desde plano hasta lujoso.',
  };

  return {
    metrosTotales: `${metros.toFixed(2)} m`,
    panosNecesarios: panos,
    anchoTotalTela: `${anchoTotalTela.toFixed(0)} cm tela total`,
    consejo: tip,
    _insight,
    _chart,
  };
}
