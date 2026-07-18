/**
 * Reconversión de bolívares viejos a bolívares actuales (Bolívar Digital, VED).
 *
 * Venezuela hizo TRES reconversiones que eliminaron ceros con factores fijos:
 *   - 2008 (Bolívar Fuerte):   ÷ 1.000        (3 ceros)
 *   - 2018 (Bolívar Soberano): ÷ 100.000      (5 ceros)
 *   - 2021 (Bolívar Digital):  ÷ 1.000.000    (6 ceros)
 * Total: 14 ceros eliminados. Para convertir un monto expresado en una moneda
 * vieja al bolívar ACTUAL se aplican en cadena los factores de TODAS las
 * reconversiones posteriores a esa moneda. Cada factor está precomputado en
 * RECONVERSIONES_VES.factorAActual.
 *
 * Fuente: BCV; Decreto de nueva expresión monetaria (01/10/2021); Prodavinci.
 */
import { RECONVERSIONES_VES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;
  desde?: string; // 'original' | 'fuerte' | 'soberano' | 'digital'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function fmt(n: number, dec = 2): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(n);
}

export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  if (!monto) throw new Error('Ingresá el monto en bolívares a convertir');

  const desdeId = String(i.desde ?? 'soberano');
  const origen = RECONVERSIONES_VES.find((r) => r.id === desdeId) ?? RECONVERSIONES_VES[2];

  const factor = origen.factorAActual;
  const actual = monto / factor;

  // Detalle legible del factor en cadena.
  const cerosPosteriores = RECONVERSIONES_VES
    .filter((r) => (r.anio ?? 0) > (origen.anio ?? -1) && r.ceros > 0);
  const cadena = cerosPosteriores.map((r) => `÷ ${new Intl.NumberFormat('de-DE').format(Math.pow(10, r.ceros))} (${r.anio})`).join('  ');

  const narrativa = factor === 1
    ? `Ese monto ya está expresado en bolívares actuales (Bolívar Digital): **Bs. ${fmt(monto)}**. No hace falta convertir nada.`
    : `**Bs. ${fmt(monto)}** en ${origen.nombre} equivalen a **Bs. ${fmt(actual, actual < 1 ? 8 : 2)}** en bolívares actuales (Bolívar Digital). ` +
      `Se dividió entre **${new Intl.NumberFormat('de-DE').format(factor)}** (${cadena || 'factor acumulado'}), el resultado de eliminar ${Math.log10(factor)} ceros con las reconversiones posteriores.`;

  const _table = {
    title: 'Factores de reconversión del bolívar',
    headers: ['Reconversión', 'Ceros que quitó', 'Factor de división'],
    rows: RECONVERSIONES_VES
      .filter((r) => r.ceros > 0)
      .map((r) => [
        `${r.anio} — ${r.nombre.split(' (')[0]}`,
        String(r.ceros),
        `÷ ${new Intl.NumberFormat('de-DE').format(Math.pow(10, r.ceros))}`,
      ]),
    note: 'En total se eliminaron 14 ceros al bolívar (3 + 5 + 6). Para llegar al bolívar actual se aplican en cadena los factores de las reconversiones posteriores a la moneda de origen.',
  };

  return {
    resultado: Number(actual.toFixed(actual < 1 ? 10 : 2)),
    factorAplicado: factor,
    detalle: factor === 1
      ? `Bs. ${fmt(monto)} ya son bolívares actuales`
      : `Bs. ${fmt(monto)} ÷ ${new Intl.NumberFormat('de-DE').format(factor)} = Bs. ${fmt(actual, actual < 1 ? 8 : 2)}`,
    _insight: {
      type: 'highlight',
      icon: '🔄',
      text: narrativa,
    },
    _table,
  };
}
