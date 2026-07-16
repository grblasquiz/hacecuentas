/**
 * Validar CBU/CVU e identificar el banco — Argentina.
 *
 * Utilidad determinística antifraude (frequency:"never"). Implementa la
 * validación REAL de los dos dígitos verificadores del CBU (norma BCRA):
 *
 *   CBU = 22 dígitos = Bloque 1 (8) + Bloque 2 (14)
 *   - Bloque 1: 3 dígitos de entidad + 4 de sucursal + 1 dígito verificador (DV1).
 *   - Bloque 2: 13 dígitos de cuenta + 1 dígito verificador (DV2).
 *
 *   DV1: se ponderan los 7 primeros dígitos del bloque 1 por [7,1,3,9,7,1,3],
 *        se suma, y DV = (10 − (suma mod 10)) mod 10.
 *   DV2: se ponderan los 13 primeros dígitos del bloque 2 por
 *        [3,9,7,1,3,9,7,1,3,9,7,1,3], y DV = (10 − (suma mod 10)) mod 10.
 *
 * El CVU (billeteras virtuales tipo Mercado Pago, Ualá, Personal Pay) usa el
 * MISMO esquema de 22 dígitos y los mismos verificadores; cambia el tipo de
 * entidad (un PSP, no un banco). Los códigos de entidad son los del BCRA.
 */

export interface Inputs {
  cbu: string;
}

export interface Outputs {
  valido: boolean;
  estado: string;
  entidad: string;
  codigoEntidad: string;
  sucursal: string;
  tipo: string; // 'CBU (banco)' | 'CVU (billetera virtual)' | '—'
  dv1Ok: boolean;
  dv2Ok: boolean;
  detalle: string;
  _insight?: any;
}

// Códigos de entidad BCRA de alta confianza (bancos). Solo se listan los que
// se pueden afirmar con seguridad: un antifraude no debe adivinar el banco.
const ENTIDADES: Record<string, string> = {
  '007': 'Banco de Galicia y Buenos Aires',
  '011': 'Banco de la Nación Argentina',
  '014': 'Banco de la Provincia de Buenos Aires',
  '015': 'ICBC (ex Standard Bank)',
  '016': 'Citibank N.A.',
  '017': 'BBVA Argentina',
  '020': 'Banco de la Provincia del Neuquén',
  '027': 'Banco Supervielle',
  '029': 'Banco de la Ciudad de Buenos Aires',
  '034': 'Banco Patagonia',
  '044': 'Banco Hipotecario',
  '045': 'Banco de San Juan',
  '065': 'Banco Municipal de Rosario',
  '072': 'Banco Santander Argentina',
  '083': 'Banco del Chubut',
  '086': 'Banco de Santa Cruz',
  '093': 'Banco de La Pampa',
  '094': 'Banco de Corrientes',
  '143': 'Brubank',
  '150': 'HSBC Bank Argentina',
  '191': 'Banco Credicoop Cooperativo',
  '259': 'Banco Itaú Argentina',
  '268': 'Banco Provincia de Tierra del Fuego',
  '269': 'Banco de Servicios y Transacciones (BST)',
  '285': 'Banco Macro',
  '299': 'Banco Comafi',
  '300': 'Banco de Inversión y Comercio Exterior (BICE)',
  '311': 'Nuevo Banco del Chaco',
  '315': 'Banco de Formosa',
  '321': 'Banco de Santiago del Estero',
  '322': 'Banco Industrial (BIND)',
  '330': 'Nuevo Banco de Santa Fe',
  '386': 'Nuevo Banco de Entre Ríos',
  '389': 'Banco Columbia',
};

/** Detecta billeteras virtuales (CVU) por su prefijo conocido. */
function detectarPSP(cbu: string, codigo: string): string | null {
  // Mercado Pago: CVU arranca con 0000003100...
  if (cbu.startsWith('0000003')) return 'Mercado Pago';
  // Ualá (Uilo S.A.): CVU arranca con 0000058...
  if (cbu.startsWith('0000058')) return 'Ualá';
  // Naranja X: 0000168...
  if (cbu.startsWith('0000168')) return 'Naranja X';
  // Prefijo 000 sin banco identificado → billetera virtual genérica.
  if (codigo === '000') return 'Billetera virtual (CVU)';
  return null;
}

function dvBloque(digitos: string, pesos: number[]): number {
  let suma = 0;
  for (let k = 0; k < pesos.length; k++) suma += Number(digitos[k]) * pesos[k];
  return (10 - (suma % 10)) % 10;
}

export function compute(i: Inputs): Outputs {
  const limpio = String(i.cbu ?? '').replace(/\D/g, '');

  const vacio = (extra: string): Outputs => ({
    valido: false,
    estado: extra,
    entidad: '—',
    codigoEntidad: '—',
    sucursal: '—',
    tipo: '—',
    dv1Ok: false,
    dv2Ok: false,
    detalle: extra,
    _insight: {
      title: 'CBU inválido',
      text: extra,
      tone: 'warn',
      icon: '⚠️',
    },
  });

  if (!limpio) return vacio('Ingresá un CBU o CVU de 22 dígitos.');
  if (limpio.length !== 22) {
    return vacio(`Un CBU/CVU tiene **22 dígitos**; ingresaste **${limpio.length}**. Revisá que no falten o sobren números.`);
  }

  const bloque1 = limpio.slice(0, 8);
  const bloque2 = limpio.slice(8, 22);
  const codigo = bloque1.slice(0, 3);
  const sucursal = bloque1.slice(3, 7);

  const dv1Calc = dvBloque(bloque1.slice(0, 7), [7, 1, 3, 9, 7, 1, 3]);
  const dv1Ok = dv1Calc === Number(bloque1[7]);

  const dv2Calc = dvBloque(bloque2.slice(0, 13), [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3]);
  const dv2Ok = dv2Calc === Number(bloque2[13]);

  const valido = dv1Ok && dv2Ok;

  const psp = detectarPSP(limpio, codigo);
  const banco = ENTIDADES[codigo];
  let entidad: string;
  let tipo: string;
  if (psp) {
    entidad = psp;
    tipo = 'CVU (billetera virtual)';
  } else if (banco) {
    entidad = banco;
    tipo = 'CBU (banco)';
  } else {
    entidad = `Entidad con código ${codigo} (no identificada en la tabla)`;
    tipo = 'CBU (banco)';
  }

  const estado = valido
    ? `CBU/CVU válido — ${entidad}`
    : 'CBU/CVU INVÁLIDO: los dígitos verificadores no cierran';

  let insightText: string;
  let tone: 'good' | 'warn';
  if (valido) {
    tone = 'good';
    insightText = `El **${tipo === 'CVU (billetera virtual)' ? 'CVU' : 'CBU'}** es **válido**: los dos dígitos verificadores cierran. Pertenece a **${entidad}** (código de entidad ${codigo}, sucursal ${sucursal}). Igual, antes de transferir confirmá el nombre del titular: un CBU válido puede ser de un tercero.`;
  } else {
    tone = 'warn';
    const cual = !dv1Ok && !dv2Ok ? 'los dos bloques' : !dv1Ok ? 'el primer bloque (entidad/sucursal)' : 'el segundo bloque (número de cuenta)';
    insightText = `Este CBU/CVU **no es válido**: falla el dígito verificador de **${cual}**. Lo más probable es un **error de tipeo** (un número cambiado). No transfieras: pedí que te reenvíen el CBU completo.`;
  }

  return {
    valido,
    estado,
    entidad,
    codigoEntidad: codigo,
    sucursal,
    tipo,
    dv1Ok,
    dv2Ok,
    detalle: `Bloque 1: ${bloque1} (DV1 ${dv1Ok ? 'OK' : 'MAL'}) · Bloque 2: ${bloque2} (DV2 ${dv2Ok ? 'OK' : 'MAL'}). Entidad ${codigo} = ${entidad}.`,
    _insight: { title: valido ? 'CBU válido' : 'CBU con error', text: insightText, tone, icon: valido ? '✅' : '⚠️' },
  };
}
