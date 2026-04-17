/**
 * Calculadora de grosor de estaño por sección de cable
 */

export interface Inputs {
  tipo: number;
}

export interface Outputs {
  diametro: string; seccionMm2: string; alternativo: string; consejo: string;
}

export function filamentoSoldadorMm2(inputs: Inputs): Outputs {
  const t = Math.round(Number(inputs.tipo));
  const tabla: Record<number, { d: number; alt: string; tip: string }> = {
    1: { d: 0.3, alt: '0.4 mm', tip: 'SMD 0402: estaño fino + flux extra obligatorio.' },
    2: { d: 0.5, alt: '0.6 mm', tip: 'SMD 0603-0805 general: 0.5 mm es el sweet spot.' },
    3: { d: 0.6, alt: '0.8 mm', tip: 'SMD 1206 permite diámetro un poco mayor.' },
    4: { d: 0.8, alt: '1.0 mm', tip: 'THT hobby general. El diámetro más versátil.' },
    5: { d: 1.0, alt: '1.2 mm', tip: 'Electrolíticos y conectores: más estaño para termo-sink.' },
    6: { d: 0.8, alt: '1.0 mm', tip: 'Cables finos: 0.8-1.0 mm con punta chata.' },
    7: { d: 1.2, alt: '1.0 mm', tip: 'Cables medios 14-20 AWG: evitá estaño muy fino.' },
    8: { d: 1.5, alt: '1.2 mm', tip: 'Cables gruesos 10-14 AWG: necesita flux extra y soldador 80W+.' },
    9: { d: 2.0, alt: '3.0 mm', tip: 'Terminal batería: estaño grueso + soldador 100W+ o soplete.' },
  };
  const i = tabla[t] || tabla[4];
  const seccion = Math.PI * Math.pow(i.d / 2, 2);
  return {
    diametro: `${i.d} mm`,
    seccionMm2: `${seccion.toFixed(2)} mm² de sección`,
    alternativo: i.alt,
    consejo: i.tip,
  };
}
