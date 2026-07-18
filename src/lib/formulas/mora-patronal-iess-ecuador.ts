/**
 * Interés por mora patronal del IESS — Ecuador.
 *
 * Cuando el empleador no paga la planilla de aportes a tiempo (la planilla se paga hasta el día 15
 * del mes siguiente; desde el día 16 entra en mora), el IESS cobra un interés sobre el capital
 * adeudado (aportes patronales + personales). La tasa es la tasa activa efectiva máxima referencial
 * del sistema financiero que publica el BCE cada mes, más el recargo del IESS (≈13,33% anual en 2026,
 * editable). El interés se acumula día a día; esta calculadora lo estima por meses de retraso.
 *
 * El usuario puede ingresar el capital directamente, o el sueldo (y la calc arma la base de aportes
 * 9,45% + 11,15% = 20,60%). Tasa por defecto importada de la data país (NO hardcodear).
 */
import { IESS_MORA_EC_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  capital?: number;       // monto de aportes impagos (USD). Si se deja vacío, se calcula del sueldo.
  sueldoBase?: number;    // sueldo del/los trabajador(es) para derivar los aportes (USD/mes)
  mesesMora: number;      // meses de retraso
  tasaAnual?: number;     // tasa de interés de mora anual (%) — default 13,33
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const D = IESS_MORA_EC_2026;
  const aporteTotal = D.aportePersonal + D.aportePatronal; // 0,2060

  // Capital: prioriza el monto ingresado; si no, lo deriva del sueldo × 20,60%.
  let capital = Number(i.capital) || 0;
  let baseTexto = '';
  if (capital <= 0) {
    const sueldo = Number(i.sueldoBase) || 0;
    if (sueldo <= 0) throw new Error('Ingresá el monto de aportes adeudado, o el sueldo para calcularlo.');
    capital = sueldo * aporteTotal;
    baseTexto = ` (${(aporteTotal * 100).toFixed(2)}% de un sueldo de ${fmtUSDec(sueldo)})`;
  }

  const meses = Math.max(0, Math.floor(Number(i.mesesMora) || 0));
  if (meses <= 0) throw new Error('Ingresá los meses de retraso (por ejemplo 3).');

  const tasaInput = Number(i.tasaAnual);
  const tasaAnual = Number.isFinite(tasaInput) && tasaInput > 0 ? tasaInput : D.tasaAnualReferencia;

  // Interés simple de mora: capital × (tasa anual / 12) × meses.
  const interes = capital * (tasaAnual / 100 / 12) * meses;
  const total = capital + interes;

  const _insight = {
    title: `Deuda actualizada: ${fmtUSDec(total)}`,
    text: `Sobre un capital de **${fmtUSDec(capital)}**${baseTexto} con **${meses} ${meses === 1 ? 'mes' : 'meses'}** de mora y una tasa de **${tasaAnual}% anual**, el interés de mora es **${fmtUSDec(interes)}**. En total tenés que pagar **${fmtUSDec(total)}**. El IESS recalcula la tasa cada mes (BCE + recargo IESS) y el interés corre día a día, así que el valor exacto lo ves en el sistema de Historia Laboral al momento de pagar.`,
    tone: 'warn',
    icon: '🏛️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital (aportes)', value: Math.round(capital * 100) / 100 },
      { label: 'Interés de mora', value: Math.round(interes * 100) / 100 },
    ],
    prefix: '$ ',
    centerValue: fmtUSDec(total),
    centerLabel: 'Total a pagar',
    ariaLabel: `Capital ${fmtUSDec(capital)} más interés de mora ${fmtUSDec(interes)} = ${fmtUSDec(total)}.`,
  };

  const anclas = [1, 3, 6, 12, 24];
  if (!anclas.includes(meses)) anclas.push(meses);
  anclas.sort((a, b) => a - b);
  const _table = {
    title: `Interés de mora según meses de retraso (capital ${fmtUSDec(capital)}, tasa ${tasaAnual}% anual)`,
    headers: ['Meses de mora', 'Interés', 'Total a pagar'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: anclas.slice(0, 7).map((m) => {
      const intr = capital * (tasaAnual / 100 / 12) * m;
      return [
        `${m} ${m === 1 ? 'mes' : 'meses'}${m === meses ? ' (tu caso)' : ''}`,
        fmtUSDec(intr),
        fmtUSDec(capital + intr),
      ];
    }),
    note: 'Interés simple estimado (capital × tasa/12 × meses). El IESS lo calcula día a día con la tasa vigente de cada mes. No incluye la responsabilidad patronal (que aplica solo si ocurre una contingencia durante la mora).',
  };

  return {
    interes: fmtUSDec(interes),
    capitalBase: fmtUSDec(capital),
    total: fmtUSDec(total),
    detalle: `Capital ${fmtUSDec(capital)} × ${tasaAnual}%/12 × ${meses} ${meses === 1 ? 'mes' : 'meses'} = ${fmtUSDec(interes)} de interés. Total ${fmtUSDec(total)}.`,
    _insight,
    _chart,
    _table,
  };
}
