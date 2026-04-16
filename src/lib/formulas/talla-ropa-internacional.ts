/** Conversor de tallas de ropa (US/EU/UK/AR) */
export interface Inputs {
  tipoRopa: string;
  sistema: string;
  talla: string;
  sexo: string;
}
export interface Outputs {
  tallaUS: string;
  tallaEU: string;
  tallaUK: string;
  tallaAR: string;
  mensaje: string;
}

export function tallaRopaInternacional(i: Inputs): Outputs {
  const tipoRopa = String(i.tipoRopa || 'remera');
  const sistema = String(i.sistema || 'AR');
  const talla = String(i.talla || 'M');
  const sexo = String(i.sexo || 'f');

  // Tablas de conversión simplificadas
  const mujerRemera: Record<string, { US: string; EU: string; UK: string; AR: string }> = {
    XS: { US: 'XS (0-2)', EU: '32-34', UK: '4-6', AR: 'XS' },
    S: { US: 'S (4-6)', EU: '36-38', UK: '8-10', AR: 'S' },
    M: { US: 'M (8-10)', EU: '40-42', UK: '12-14', AR: 'M' },
    L: { US: 'L (12-14)', EU: '44-46', UK: '16-18', AR: 'L' },
    XL: { US: 'XL (16-18)', EU: '48-50', UK: '20-22', AR: 'XL' },
    XXL: { US: 'XXL (20)', EU: '52-54', UK: '24', AR: 'XXL' },
  };

  const hombreRemera: Record<string, { US: string; EU: string; UK: string; AR: string }> = {
    XS: { US: 'XS (32-34)', EU: '42-44', UK: '32-34', AR: 'XS' },
    S: { US: 'S (36-38)', EU: '46-48', UK: '36-38', AR: 'S' },
    M: { US: 'M (40-42)', EU: '50-52', UK: '40-42', AR: 'M' },
    L: { US: 'L (44-46)', EU: '54-56', UK: '44-46', AR: 'L' },
    XL: { US: 'XL (48-50)', EU: '58-60', UK: '48-50', AR: 'XL' },
    XXL: { US: 'XXL (52)', EU: '62-64', UK: '52', AR: 'XXL' },
  };

  const tabla = sexo === 'f' ? mujerRemera : hombreRemera;
  const normalizada = talla.toUpperCase();
  const resultado = tabla[normalizada] || tabla['M'];

  return {
    tallaUS: resultado.US,
    tallaEU: resultado.EU,
    tallaUK: resultado.UK,
    tallaAR: resultado.AR,
    mensaje: `Talla ${normalizada}: US ${resultado.US} | EU ${resultado.EU} | UK ${resultado.UK} | AR ${resultado.AR}.`,
  };
}
