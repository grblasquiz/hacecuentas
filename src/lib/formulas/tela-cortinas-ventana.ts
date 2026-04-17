/**
 * Calculadora de tela para cortinas por ancho de ventana
 */

export interface Inputs {
  anchoVentana: number; largoCortina: number; frunce: number; anchoTela: number; paneles: number;
}

export interface Outputs {
  metrosTotales: string; panosNecesarios: number; anchoTotalTela: string; consejo: string;
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
  return {
    metrosTotales: `${metros.toFixed(2)} m`,
    panosNecesarios: panos,
    anchoTotalTela: `${anchoTotalTela.toFixed(0)} cm tela total`,
    consejo: tip,
  };
}
