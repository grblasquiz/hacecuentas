/**
 * Patente comercial municipal — Chile.
 * Base: Art. 24 DL 3.063 (Ley de Rentas Municipales).
 * La patente anual = capital propio tributario × tasa por mil (entre 2,5‰ y 5‰,
 * la fija cada municipio), con un mínimo de 1 UTM y un máximo de 8.000 UTM al año.
 * UTM es input con default (UTM jun-2026 = $71.506); NO se hardcodea adentro.
 */

export interface Inputs {
  capitalPropio: number;
  tasaPorMil: number;   // ‰ (por mil). Default 2,5
  valorUTM: number;     // default 71506
}

export interface Outputs {
  patenteAnual: number;
  patenteCuota: number;
  _insight?: any;
  _table?: any;
}

const UTM_DEFAULT = 71506;

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi);
}

export function compute(i: Inputs): Outputs {
  const utm = i.valorUTM && i.valorUTM > 0 ? i.valorUTM : UTM_DEFAULT;
  const capital = Math.max(0, i.capitalPropio || 0);
  const tasa = i.tasaPorMil && i.tasaPorMil > 0 ? i.tasaPorMil : 2.5;

  const bruto = capital * (tasa / 1000);
  const minLegal = 1 * utm;          // mínimo legal: 1 UTM
  const maxLegal = 8000 * utm;       // máximo legal: 8.000 UTM
  const patenteAnual = Math.round(clamp(bruto, minLegal, maxLegal));
  const patenteCuota = Math.round(patenteAnual / 2);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const enUtm = patenteAnual / utm;

  let topeNota: string;
  if (bruto < minLegal) {
    topeNota = `El cálculo (${fmt(bruto)}) quedó bajo el **mínimo legal de 1 UTM**, así que pagás el piso: ${fmt(minLegal)}.`;
  } else if (bruto > maxLegal) {
    topeNota = `El cálculo (${fmt(bruto)}) superó el **tope legal de 8.000 UTM**, así que pagás el máximo: ${fmt(maxLegal)}.`;
  } else {
    topeNota = `Equivale a ${enUtm.toFixed(1)} UTM, dentro del rango legal (1 a 8.000 UTM).`;
  }

  const _insight = {
    title: 'Patente comercial anual estimada',
    text: `Con un capital propio de **${fmt(capital)}** y una tasa de **${tasa.toLocaleString('es-CL')}‰**, la patente anual es **${fmt(patenteAnual)}** (${fmt(patenteCuota)} por cada cuota semestral). ${topeNota}`,
    tone: 'info' as const,
    icon: '🏪',
  };

  // Tabla: patente para distintas tasas municipales (2,5‰ a 5‰) sobre el mismo capital.
  const tasas = [2.5, 3, 3.5, 4, 4.5, 5];
  const rows = tasas.map((t) => {
    const b = capital * (t / 1000);
    const anual = Math.round(clamp(b, minLegal, maxLegal));
    return [
      `${t.toLocaleString('es-CL')} ‰${Math.abs(t - tasa) < 1e-9 ? ' (tu tasa)' : ''}`,
      fmt(anual),
      fmt(Math.round(anual / 2)),
    ];
  });
  const _table = {
    title: `Patente anual según tasa municipal (capital ${fmt(capital)}, UTM ${fmt(utm)})`,
    headers: ['Tasa por mil', 'Patente anual', 'Cuota semestral'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'Cada municipio fija la tasa entre 2,5‰ y 5‰ del capital propio (Art. 24 DL 3.063), con mínimo 1 UTM y máximo 8.000 UTM al año. La patente se paga en dos cuotas (enero y julio).',
  };

  return { patenteAnual, patenteCuota, _insight, _table };
}
