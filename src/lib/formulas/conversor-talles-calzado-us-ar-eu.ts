/** Conversor de talle de calzado US ↔ AR/EU (AR = EU, base Mondopoint) */
export interface Inputs { valor: number | string; direccion?: string; genero?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

/**
 * Tablas de equivalencia estándar (las que usan Zappos, Famous Footwear, Nike size guide).
 * AR = EU en la práctica (ambos sistemas derivan de Mondopoint / largo del pie en cm).
 *
 * Hombre:  EU ≈ US + 33   (US 8 = EU 41, US 9 = EU 42, US 10 = EU 43)
 * Mujer:   EU ≈ US + 31   (US 7 = EU 38, US 8 = EU 39, US 9 = EU 40)
 */
const MEN: Array<{ us: number; eu: number; cm: number }> = [
  { us: 6, eu: 39, cm: 24.1 },
  { us: 6.5, eu: 39.5, cm: 24.4 },
  { us: 7, eu: 40, cm: 25.0 },
  { us: 7.5, eu: 40.5, cm: 25.4 },
  { us: 8, eu: 41, cm: 25.7 },
  { us: 8.5, eu: 41.5, cm: 26.0 },
  { us: 9, eu: 42, cm: 26.7 },
  { us: 9.5, eu: 42.5, cm: 27.0 },
  { us: 10, eu: 43, cm: 27.3 },
  { us: 10.5, eu: 43.5, cm: 27.9 },
  { us: 11, eu: 44, cm: 28.3 },
  { us: 11.5, eu: 44.5, cm: 28.6 },
  { us: 12, eu: 45, cm: 29.0 },
  { us: 13, eu: 46, cm: 29.7 },
  { us: 14, eu: 47, cm: 30.5 },
];

const WOMEN: Array<{ us: number; eu: number; cm: number }> = [
  { us: 5, eu: 35.5, cm: 21.6 },
  { us: 5.5, eu: 36, cm: 22.2 },
  { us: 6, eu: 36.5, cm: 22.5 },
  { us: 6.5, eu: 37, cm: 23.0 },
  { us: 7, eu: 38, cm: 23.5 },
  { us: 7.5, eu: 38.5, cm: 23.8 },
  { us: 8, eu: 39, cm: 24.1 },
  { us: 8.5, eu: 39.5, cm: 24.6 },
  { us: 9, eu: 40, cm: 25.1 },
  { us: 9.5, eu: 40.5, cm: 25.4 },
  { us: 10, eu: 41, cm: 25.9 },
  { us: 10.5, eu: 41.5, cm: 26.2 },
  { us: 11, eu: 42, cm: 26.7 },
];

function nearest(table: Array<{ us: number; eu: number; cm: number }>, key: 'us' | 'eu', val: number) {
  let best = table[0];
  let bestDiff = Infinity;
  for (const row of table) {
    const diff = Math.abs(row[key] - val);
    if (diff < bestDiff) { bestDiff = diff; best = row; }
  }
  return { row: best, exact: bestDiff < 0.01 };
}

export function conversorTallesCalzadoUsArEu(i: Inputs): Outputs {
  const raw = String(i.valor ?? '').replace(',', '.').trim();
  const num = Number(raw);
  const dir = String(i.direccion || 'ida'); // ida = US→AR/EU, vuelta = AR/EU→US
  const genero = String(i.genero || 'hombre'); // hombre | mujer
  const table = genero === 'mujer' ? WOMEN : MEN;
  const label = genero === 'mujer' ? 'mujer' : 'hombre';

  if (raw === '' || !Number.isFinite(num)) {
    return { resultado: '—', resumen: 'Ingresá un talle numérico (ej: 10 US, o 42 AR/EU).' };
  }

  const _insight = {
    title: 'Antes de comprar tu calzado',
    text: `Para el talle **${raw}** la equivalencia estándar es la que muestra la tabla, pero entre marcas puede haber hasta medio número de diferencia. La regla más segura es **medir tu pie en cm** y cruzarlo con la guía de talles del fabricante (Nike, Adidas y New Balance publican la suya).`,
    tone: 'neutral',
    icon: '👟',
  };

  if (dir === 'vuelta') {
    // AR/EU → US
    const { row, exact } = nearest(table, 'eu', num);
    const aprox = exact ? '' : ' (aproximado, talle más cercano)';
    return {
      resultado: `AR/EU ${num} = US ${row.us} (${label})`,
      resumen: `Talle **${num} AR/EU** equivale a **US ${row.us}** en calzado de ${label}${aprox}. Largo de pie aprox.: **${row.cm} cm**. AR y EU usan la misma numeración.`,
      _insight,
    };
  }

  // US → AR/EU (ida)
  const { row, exact } = nearest(table, 'us', num);
  const aprox = exact ? '' : ' (aproximado, talle más cercano)';
  return {
    resultado: `US ${num} = AR/EU ${row.eu} (${label})`,
    resumen: `Talle **US ${num}** equivale a **${row.eu} AR/EU** en calzado de ${label}${aprox}. Largo de pie aprox.: **${row.cm} cm**. En Argentina el talle coincide con el europeo (EU).`,
    _insight,
  };
}
