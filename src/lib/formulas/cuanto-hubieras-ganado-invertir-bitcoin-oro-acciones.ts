/**
 * "¿Cuánto hubieras ganado si invertías en…?" — calculadora viral / compartible.
 *
 * Toma un monto y un año, y muestra cuánto valdría HOY (2026) si lo hubieras puesto
 * en Bitcoin, oro, plata, acciones, el S&P 500 o dólar blue. El hook compartible es
 * la TABLA comparativa: el mismo monto+año en TODOS los activos, lado a lado.
 *
 * Precios = cierre/promedio anual APROXIMADO (educativo, no asesoramiento). Fuente:
 * datos públicos de mercado. `dataUpdate.frequency` = yearly (actualizar el snapshot
 * 2026 y agregar el año nuevo cada enero). Devuelve outputs + _insight + _table.
 */

export interface InversionInputs {
  monto: number;
  anio: number | string;
  activo: string;
  __lang?: string;
}

export interface InversionOutputs {
  valorActual: number;
  ganancia: number;
  rendimientoTotal: string;
  rendimientoAnual: string;
  multiplicador: string;
  _insight?: any;
  _table?: any;
}

// Precio aproximado por activo y año (inicio de año, USD; dolar_blue en ARS/USD).
// El valor "2026" es el snapshot actual. null = el activo no existía ese año.
const PRECIOS: Record<string, Record<number, number | null>> = {
  bitcoin:    { 2013: 13.5, 2014: 800, 2015: 315, 2016: 430, 2017: 1000, 2018: 14000, 2019: 3700, 2020: 7200, 2021: 29000, 2022: 47000, 2023: 16500, 2024: 44000, 2025: 94000, 2026: 101000 },
  ethereum:   { 2013: null, 2014: null, 2015: null, 2016: 1, 2017: 8, 2018: 750, 2019: 140, 2020: 130, 2021: 730, 2022: 3700, 2023: 1200, 2024: 2300, 2025: 3350, 2026: 3500 },
  oro:        { 2013: 1660, 2014: 1200, 2015: 1180, 2016: 1060, 2017: 1150, 2018: 1300, 2019: 1280, 2020: 1520, 2021: 1900, 2022: 1800, 2023: 1820, 2024: 2060, 2025: 2620, 2026: 2750 },
  plata:      { 2013: 30, 2014: 19.5, 2015: 15.7, 2016: 14, 2017: 16, 2018: 17, 2019: 15.5, 2020: 18, 2021: 27, 2022: 23, 2023: 24, 2024: 23, 2025: 29, 2026: 32 },
  sp500:      { 2013: 1460, 2014: 1840, 2015: 2060, 2016: 2040, 2017: 2240, 2018: 2670, 2019: 2510, 2020: 3230, 2021: 3760, 2022: 4770, 2023: 3840, 2024: 4770, 2025: 5880, 2026: 6100 },
  nasdaq:     { 2013: 2660, 2014: 3580, 2015: 4180, 2016: 4180, 2017: 4860, 2018: 6330, 2019: 6330, 2020: 8730, 2021: 12880, 2022: 16500, 2023: 10940, 2024: 16830, 2025: 21000, 2026: 21500 },
  apple:      { 2013: 17.5, 2014: 19.8, 2015: 27, 2016: 25, 2017: 29, 2018: 42, 2019: 39, 2020: 75, 2021: 132, 2022: 180, 2023: 130, 2024: 185, 2025: 250, 2026: 230 },
  tesla:      { 2013: 2.3, 2014: 10, 2015: 14.6, 2016: 14.9, 2017: 14.3, 2018: 21, 2019: 20.7, 2020: 28, 2021: 240, 2022: 400, 2023: 108, 2024: 250, 2025: 420, 2026: 350 },
  nvidia:     { 2013: 0.32, 2014: 0.4, 2015: 0.5, 2016: 0.83, 2017: 2.7, 2018: 4.9, 2019: 3.3, 2020: 6, 2021: 13, 2022: 30, 2023: 14.6, 2024: 49, 2025: 138, 2026: 132 },
  dolar_blue: { 2013: 6.9, 2014: 10, 2015: 13.3, 2016: 14.4, 2017: 16.8, 2018: 18.7, 2019: 38, 2020: 77, 2021: 200, 2022: 312, 2023: 720, 2024: 1025, 2025: 1180, 2026: 1290 },
};

const NOMBRES: Record<string, string> = {
  bitcoin: 'Bitcoin', ethereum: 'Ethereum', oro: 'Oro', plata: 'Plata',
  sp500: 'S&P 500', nasdaq: 'Nasdaq 100', apple: 'Apple', tesla: 'Tesla',
  nvidia: 'NVIDIA', dolar_blue: 'Dólar blue',
};
const EMOJI: Record<string, string> = {
  bitcoin: '₿', ethereum: 'Ξ', oro: '🥇', plata: '🥈', sp500: '📈', nasdaq: '💻',
  apple: '🍎', tesla: '🚗', nvidia: '🎮', dolar_blue: '💵',
};

const ANIO_ACTUAL = 2026;

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + 'M';
  return '$' + Math.round(n).toLocaleString('es-AR');
}

export function cuantoHubierasGanado(inputs: InversionInputs): InversionOutputs {
  const monto = Math.max(0, Number(inputs.monto) || 0);
  const anio = Math.round(Number(inputs.anio) || 2020);
  const activo = (inputs.activo || 'bitcoin').toLowerCase();
  const anios = Math.max(1, ANIO_ACTUAL - anio);

  const calcular = (key: string): { valor: number; mult: number } | null => {
    const tabla = PRECIOS[key];
    if (!tabla) return null;
    const pIni = tabla[anio];
    const pAct = tabla[ANIO_ACTUAL];
    if (pIni == null || pAct == null || pIni <= 0) return null;
    const mult = pAct / pIni;
    return { valor: monto * mult, mult };
  };

  const sel = calcular(activo) || { valor: monto, mult: 1 };
  const valorActual = sel.valor;
  const ganancia = valorActual - monto;
  const rendTotal = monto > 0 ? (sel.mult - 1) * 100 : 0;
  const rendAnual = (Math.pow(sel.mult, 1 / anios) - 1) * 100;

  // Tabla comparativa: el MISMO monto+año en todos los activos (el hook viral).
  const filas = Object.keys(PRECIOS)
    .map((k) => ({ k, r: calcular(k) }))
    .filter((x) => x.r)
    .map((x) => ({
      activo: `${EMOJI[x.k]} ${NOMBRES[x.k]}`,
      valor: x.r!.valor,
      mult: x.r!.mult,
      _sort: x.r!.valor,
    }))
    .sort((a, b) => b._sort - a._sort);

  const tableRows = filas.map((f) => [
    f.activo,
    fmtUSD(f.valor),
    (f.mult >= 100 ? Math.round(f.mult) : f.mult.toFixed(1)) + '×',
    (f.mult >= 1 ? '+' : '') + Math.round((f.mult - 1) * 100).toLocaleString('es-AR') + '%',
  ]);

  const mejor = filas[0];
  const peor = filas[filas.length - 1];
  const nombreSel = NOMBRES[activo] || activo;
  const multTxt = sel.mult >= 100 ? Math.round(sel.mult) + '×' : sel.mult.toFixed(1) + '×';

  let narrativa: string;
  if (sel.mult >= 1.05) {
    narrativa = `Si en ${anio} ponías ${fmtUSD(monto)} en ${nombreSel}, hoy tendrías ${fmtUSD(valorActual)} — multiplicaste tu plata por ${multTxt} (${(rendAnual).toFixed(0)}% anual). `;
  } else if (sel.mult >= 0.95) {
    narrativa = `${nombreSel} prácticamente no se movió desde ${anio}: tus ${fmtUSD(monto)} valdrían ${fmtUSD(valorActual)} hoy. `;
  } else {
    narrativa = `Mala elección: ${nombreSel} cayó desde ${anio}. Tus ${fmtUSD(monto)} valdrían solo ${fmtUSD(valorActual)} hoy. `;
  }
  if (mejor && peor && mejor.activo !== peor.activo) {
    narrativa += `La mejor apuesta de ${anio} fue ${mejor.activo} (${fmtUSD(mejor.valor)}); la peor, ${peor.activo} (${fmtUSD(peor.valor)}).`;
  }

  return {
    valorActual,
    ganancia,
    rendimientoTotal: (rendTotal >= 0 ? '+' : '') + rendTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 }) + '%',
    rendimientoAnual: (rendAnual >= 0 ? '+' : '') + rendAnual.toFixed(1) + '% anual',
    multiplicador: multTxt,
    _insight: { type: 'highlight', icon: '🤑', text: narrativa },
    _table: {
      title: `Tu ${fmtUSD(monto)} de ${anio}, hoy, en cada activo`,
      headers: ['Activo', 'Valor hoy (2026)', 'Multiplicó', 'Rendimiento'],
      rows: tableRows,
      note: 'Precios de cierre/promedio anual aproximados (USD; dólar blue en ARS). Educativo, no es asesoramiento financiero. Rendimientos pasados no garantizan rendimientos futuros.',
    },
  };
}
