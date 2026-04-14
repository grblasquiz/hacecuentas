/** Conversión a/desde notación científica */
export interface Inputs {
  numero: string | number;
  modo?: string;
}
export interface Outputs {
  notacionCientifica: string;
  notacionEstandar: string;
  notacionIngenieria: string;
  mantisa: number;
  exponente: number;
  ordenMagnitud: string;
}

export function notacionCientifica(i: Inputs): Outputs {
  const raw = String(i.numero).trim().replace(',', '.');
  if (!raw) throw new Error('Ingresá un número');

  let n = 0;
  // Soporta entrada en notación científica: "1.5e3", "1.5E-3", "1.5×10^3"
  const cientificaInput = raw.match(/^(-?\d+(\.\d+)?)\s*[×x*]\s*10\^?(-?\d+)$/i);
  if (cientificaInput) {
    n = parseFloat(cientificaInput[1]) * Math.pow(10, parseInt(cientificaInput[3]));
  } else {
    n = parseFloat(raw);
  }

  if (isNaN(n)) throw new Error('Número no válido');
  if (!isFinite(n)) throw new Error('Número fuera de rango');

  if (n === 0) {
    return {
      notacionCientifica: '0',
      notacionEstandar: '0',
      notacionIngenieria: '0',
      mantisa: 0,
      exponente: 0,
      ordenMagnitud: '—',
    };
  }

  const abs = Math.abs(n);
  const signo = n < 0 ? -1 : 1;
  const exponente = Math.floor(Math.log10(abs));
  const mantisa = signo * abs / Math.pow(10, exponente);

  // Notación de ingeniería: exponente múltiplo de 3
  const expIng = Math.floor(exponente / 3) * 3;
  const mantIng = signo * abs / Math.pow(10, expIng);

  // Notación estándar: número expandido
  let estandar = '';
  if (Math.abs(exponente) < 16) {
    estandar = n.toString();
    if (estandar.includes('e')) estandar = n.toFixed(20).replace(/\.?0+$/, '');
  } else {
    estandar = `${signo === -1 ? '−' : ''}${mantisa.toFixed(4)}... × 10^${exponente}`;
  }

  const prefijos: Record<number, string> = {
    24: 'yotta (Y)', 21: 'zetta (Z)', 18: 'exa (E)', 15: 'peta (P)',
    12: 'tera (T)', 9: 'giga (G)', 6: 'mega (M)', 3: 'kilo (k)',
    0: '—', '-3': 'mili (m)', '-6': 'micro (μ)', '-9': 'nano (n)',
    '-12': 'pico (p)', '-15': 'femto (f)', '-18': 'atto (a)',
  };
  const ordenMagnitud = prefijos[expIng] ?? `10^${expIng}`;

  return {
    notacionCientifica: `${Number(mantisa.toFixed(6))} × 10^${exponente}`,
    notacionEstandar: estandar,
    notacionIngenieria: `${Number(mantIng.toFixed(4))} × 10^${expIng}`,
    mantisa: Number(mantisa.toFixed(6)),
    exponente,
    ordenMagnitud,
  };
}
