/** Conversor de talles de ropa US ↔ AR/EU (tabla de equivalencias, mujer) */
export interface Inputs { valor: number | string; direccion?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

/**
 * Tabla maestra de equivalencias de ROPA DE MUJER (parte superior / vestidos).
 * Fuentes: tablas de talles de marcas globales (Zara, H&M, ASOS) + guías US/EU.
 * Los talles NO tienen estándar legal: esto es la equivalencia comercial promedio.
 */
interface Row { letra: string; us: string; ar: string; eu: string; busto: string; cintura: string; }
const TABLA: Row[] = [
  { letra: 'XS',  us: '0-2',   ar: '36',    eu: '32-34', busto: '78-82',  cintura: '60-64' },
  { letra: 'S',   us: '4-6',   ar: '38-40', eu: '36-38', busto: '84-88',  cintura: '66-70' },
  { letra: 'M',   us: '8-10',  ar: '42',    eu: '40',    busto: '90-94',  cintura: '72-76' },
  { letra: 'L',   us: '12-14', ar: '44-46', eu: '42-44', busto: '96-102', cintura: '78-84' },
  { letra: 'XL',  us: '16-18', ar: '48',    eu: '46-48', busto: '104-110', cintura: '86-92' },
  { letra: 'XXL', us: '20-22', ar: '50',    eu: '50',    busto: '112-118', cintura: '94-100' },
];

const LETRAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Mapea un talle numérico US (mujer) a su fila. US 0,2->XS, 4,6->S, 8,10->M, 12,14->L, 16,18->XL, 20+->XXL
function filaPorUsNumerico(n: number): Row | undefined {
  if (n <= 2) return TABLA[0];
  if (n <= 6) return TABLA[1];
  if (n <= 10) return TABLA[2];
  if (n <= 14) return TABLA[3];
  if (n <= 18) return TABLA[4];
  return TABLA[5];
}

// Mapea un talle AR/EU numérico a su fila (numeración argentina/europea, mujer)
function filaPorArEuNumerico(n: number): Row | undefined {
  if (n <= 36) return TABLA[0];
  if (n <= 40) return TABLA[1];
  if (n <= 42) return TABLA[2];
  if (n <= 46) return TABLA[3];
  if (n <= 48) return TABLA[4];
  return TABLA[5];
}

function normLetra(s: string): string {
  return s.toUpperCase().replace(/\s/g, '').replace('EXTRASMALL', 'XS').replace('SMALL', 'S')
    .replace('MEDIUM', 'M').replace('LARGE', 'L');
}

export function conversorTallesRopaUsArEu(i: Inputs): Outputs {
  const raw = String(i.valor ?? '').trim();
  const d = String(i.direccion || 'ida'); // ida = US → AR/EU ; vuelta = AR/EU → US
  if (!raw) {
    return { resultado: '—', resumen: 'Ingresá un talle US (ej: 8, M) o AR/EU (ej: 42, M).' };
  }

  const letra = normLetra(raw);
  const num = parseFloat(raw.replace(',', '.'));
  let fila: Row | undefined;
  let entrada = raw.toUpperCase();

  if (LETRAS.includes(letra)) {
    fila = TABLA.find(r => r.letra === letra);
    entrada = letra;
  } else if (Number.isFinite(num)) {
    fila = d === 'ida' ? filaPorUsNumerico(num) : filaPorArEuNumerico(num);
  }

  if (!fila) {
    return {
      resultado: '—',
      resumen: 'Talle no reconocido. Probá con una letra (XS, S, M, L, XL, XXL) o un número (US 0–22, AR/EU 36–50).',
    };
  }

  let resultado: string;
  let resumen: string;
  if (d === 'ida') {
    resultado = `US ${entrada} → AR ${fila.ar} · EU ${fila.eu} (talle ${fila.letra})`;
    resumen = `Un talle US ${entrada} de mujer equivale a AR ${fila.ar} y EU ${fila.eu} (letra ${fila.letra}). Busto orientativo: ${fila.busto} cm · cintura: ${fila.cintura} cm.`;
  } else {
    resultado = `AR/EU ${entrada} → US ${fila.us} (talle ${fila.letra})`;
    resumen = `Un talle AR/EU ${entrada} de mujer equivale a US ${fila.us} (letra ${fila.letra}). Busto orientativo: ${fila.busto} cm · cintura: ${fila.cintura} cm.`;
  }

  const _insight = {
    title: 'Antes de comprar, medite',
    text: `Para el talle **${fila.letra}** (US ${fila.us} · AR ${fila.ar} · EU ${fila.eu}) la equivalencia es aproximada: el talle US suele correr **más holgado** y cada marca arma su propio molde. Lo más seguro es **medirte busto (${fila.busto} cm) y cintura (${fila.cintura} cm) en centímetros** y compararlo con la tabla específica del fabricante.`,
    tone: 'neutral',
    icon: '👕',
  };

  return { resultado, resumen, _insight };
}
