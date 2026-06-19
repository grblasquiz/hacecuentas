/**
 * Intereses de mora DIAN Colombia 2026 — impuestos pagados tarde (art. 635 ET).
 * Se liquidan DIARIAMENTE sobre el capital del impuesto adeudado, a la tasa diaria
 * equivalente a la TASA DE USURA vigente (modalidad consumo y ordinario, certificada
 * por la Superfinanciera) MENOS 2 puntos.
 *   Junio 2026: usura 28,79% E.A. (Res. 0823/2026) → mora DIAN = 28,79% − 2 = 26,79% E.A.
 * Fórmula oficial DIAN (Ley 1819/2016, parágrafo art. 590 ET; art. 635 ET;
 * Circular Externa 000003/2013): IM = K × T × t
 *   tasaDiaria = tasaAnual / 365 (o /366 en año bisiesto)   ← división simple, NO compuesta
 *   intereses  = capital × tasaDiaria × días de mora
 * Es interés simple sobre la tasa nominal/365; el (1+EA)^(1/365)−1 era el método
 * pre-2017 que derogó la Ley 1819. 2026 no es bisiesto → base 365.
 * La tasa cambia mensualmente; actualizar TASA_USURA_EA_JUN2026 al certificarse la nueva.
 * Constantes de moneda en src/lib/data/colombia-2026.ts.
 */
import { fmtCOP } from '../data/colombia-2026.ts';

// ── Tasa vigente (verificar/actualizar mensualmente con la Superfinanciera) ──
// Usura consumo y ordinario certificada por la Superfinanciera para junio 2026.
const TASA_USURA_EA_JUN2026 = 0.2879;        // 28,79% E.A. (Resolución 0823 de 2026)
const PUNTOS_MENOS = 0.02;                    // art. 635 ET: usura − 2 puntos
const TASA_MORA_DIAN_EA = TASA_USURA_EA_JUN2026 - PUNTOS_MENOS; // 26,79% E.A. (junio 2026)
const MES_REFERENCIA = 'junio 2026';

export interface Inputs {
  impuesto: number | string;       // capital del impuesto adeudado (COP)
  diasMora?: number | string;      // días de mora (días calendario)
  tasaUsuraEA?: number | string;   // % E.A. opcional para otro mes (ej. 28.79). Si viene, pisa la default.
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Tasa DIARIA oficial DIAN = tasa anual / 365 (división simple, base 365).
 * Método vigente Ley 1819/2016 (parág. art. 590 ET; art. 635 ET): NO es conversión
 * efectiva/geométrica. 2026 no es bisiesto → base 365.
 */
const tasaDiariaDesdeEA = (ea: number): number => ea / 365;

export function compute(i: Inputs): Outputs {
  const capital = num(i.impuesto);
  if (capital <= 0) throw new Error('Ingresá el impuesto adeudado');

  const dias = Math.max(0, Math.floor(num(i.diasMora, 0)));

  // Tasa de usura: el usuario puede pasar la de otro mes (en %); si no, junio 2026.
  const usuraInput = num(i.tasaUsuraEA, NaN);
  const usuraEA = Number.isFinite(usuraInput) && usuraInput > 0 ? usuraInput / 100 : TASA_USURA_EA_JUN2026;
  const tasaMoraEA = Math.max(0, usuraEA - PUNTOS_MENOS); // usura − 2 puntos (art. 635 ET)
  const usaDefault = !(Number.isFinite(usuraInput) && usuraInput > 0);

  const tasaDiaria = tasaDiariaDesdeEA(tasaMoraEA);
  const intereses = capital * tasaDiaria * dias;
  const total = capital + intereses;

  const interesPorDia = capital * tasaDiaria; // costo de cada día extra de mora
  const pctSobreCapital = capital > 0 ? (intereses / capital) * 100 : 0;

  const pct = (x: number, dec = 2) =>
    x.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const tasaMoraPctTxt = pct(tasaMoraEA * 100);
  const usuraPctTxt = pct(usuraEA * 100);

  const _insight = {
    title: 'Tus intereses de mora ante la DIAN',
    text: `Sobre un impuesto de **${fmtCOP(capital)}** con **${dias} día${dias === 1 ? '' : 's'}** de mora, a la tasa de mora del **${tasaMoraPctTxt}% E.A.** (usura ${usuraPctTxt}% − 2 puntos${usaDefault ? `, ${MES_REFERENCIA}` : ''}) te corren **${fmtCOP(intereses)}** de intereses. Tendrías que pagar **${fmtCOP(total)}** en total. Cada día extra de mora suma **${fmtCOP(interesPorDia)}**. Estos intereses van **aparte** de la sanción por extemporaneidad.`,
    tone: 'warn' as const,
    icon: '⏰',
  };

  const _chart = intereses > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Impuesto (capital)', value: Math.round(capital) },
          { label: `Intereses de mora (${dias} días)`, value: Math.round(intereses) },
        ],
        prefix: '$',
        centerValue: fmtCOP(total),
        centerLabel: 'total a pagar',
        ariaLabel: `Total a pagar a la DIAN: ${fmtCOP(total)} (${fmtCOP(capital)} de impuesto y ${fmtCOP(intereses)} de intereses de mora por ${dias} días).`,
      }
    : undefined;

  return {
    interesesMora: fmtCOP(intereses),
    totalAPagar: fmtCOP(total),
    tasaMoraAplicada: `${tasaMoraPctTxt}% E.A. (usura ${usuraPctTxt}% − 2 pts)`,
    tasaDiaria: `${pct(tasaDiaria * 100, 4)}% diario`,
    interesPorDia: `${fmtCOP(interesPorDia)} por día`,
    porcentajeSobreCapital: dias > 0 ? `${pct(pctSobreCapital)}% del impuesto` : 'Sin mora (0 días)',
    detalle: `${fmtCOP(capital)} × ${pct(tasaDiaria * 100, 6)}% diario × ${dias} días = ${fmtCOP(intereses)} de intereses → total ${fmtCOP(total)} (más sanción por extemporaneidad, que se calcula aparte).`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
