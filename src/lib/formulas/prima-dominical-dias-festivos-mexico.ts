/**
 * Prima dominical y días festivos/descansos trabajados — LFT México.
 * Domingo como día normal de trabajo: prima del 25% (LFT Art. 71).
 * Festivo obligatorio trabajado: salario doble ADICIONAL, total 3x (LFT Art. 75).
 * Día de descanso semanal trabajado: salario doble ADICIONAL, total 3x (LFT Art. 73).
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salario: number;
  periodo?: string;    // 'diario' | 'mensual'
  domingos?: number;   // domingos trabajados como parte de la jornada normal
  festivos?: number;   // días festivos obligatorios trabajados
  descansos?: number;  // días de descanso semanal trabajados
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { lft, salarioMinimo, uma } = MEXICO_2026;

  const salario = num(i.salario, 0);
  if (salario <= 0) throw new Error('Ingresa tu salario');
  const periodo = String(i.periodo || 'diario') === 'mensual' ? 'mensual' : 'diario';
  const domingos = Math.max(0, Math.floor(num(i.domingos, 0)));
  const festivos = Math.max(0, Math.floor(num(i.festivos, 0)));
  const descansos = Math.max(0, Math.floor(num(i.descansos, 0)));
  if (domingos + festivos + descansos === 0) {
    throw new Error('Ingresa al menos un domingo, festivo o día de descanso trabajado');
  }

  const salarioDiario = periodo === 'mensual' ? salario / salarioMinimo.factorMensual : salario;

  const extraDominical = domingos * salarioDiario * lft.primaDominical;          // 25% extra
  const extraFestivos = festivos * salarioDiario * lft.festivoLaboradoExtra;     // +200% (total 3x)
  const extraDescansos = descansos * salarioDiario * lft.descansoLaboradoExtra;  // +200% (total 3x)
  const totalExtra = extraDominical + extraFestivos + extraDescansos;

  // Referencia ISR: la prima dominical está exenta hasta 1 UMA por domingo (LISR Art. 93).
  const exentoDominical = Math.min(extraDominical, domingos * uma.diaria);

  const partes: string[] = [];
  if (domingos > 0) partes.push(`${domingos} domingo${domingos > 1 ? 's' : ''} × 25% = ${fmtMXN(extraDominical)}`);
  if (festivos > 0) partes.push(`${festivos} festivo${festivos > 1 ? 's' : ''} × salario doble adicional = ${fmtMXN(extraFestivos)}`);
  if (descansos > 0) partes.push(`${descansos} descanso${descansos > 1 ? 's' : ''} × salario doble adicional = ${fmtMXN(extraDescansos)}`);

  const _insight = {
    title: 'Lo que te deben pagar de más',
    text: `Con salario diario de **${fmtMXN(salarioDiario)}**, te corresponden **${fmtMXN(totalExtra)}** extra en el periodo: ${partes.join('; ')}. ${
      festivos + descansos > 0
        ? `Cada festivo o descanso trabajado se cobra al **triple** en total (tu día normal + el doble adicional).`
        : `La prima dominical es el 25% extra por trabajar el domingo como día normal (LFT Art. 71).`
    }${extraDominical > 0 ? ` De la prima dominical, hasta 1 UMA por domingo (${fmtMXN(uma.diaria)}) está exenta de ISR: en tu caso, ${fmtMXN(exentoDominical)}.` : ''}`,
    tone: 'good',
    icon: '📅',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Prima dominical (25%)', value: Math.round(extraDominical) },
      { label: 'Festivos trabajados (2x extra)', value: Math.round(extraFestivos) },
      { label: 'Descansos trabajados (2x extra)', value: Math.round(extraDescansos) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(totalExtra),
    centerLabel: 'Extra del periodo',
    ariaLabel: `Pago extra de ${fmtMXN(totalExtra)}: ${fmtMXN(extraDominical)} de prima dominical, ${fmtMXN(extraFestivos)} por festivos y ${fmtMXN(extraDescansos)} por descansos trabajados.`,
  };

  return {
    totalExtra: fmtMXN(totalExtra) + ' extra en el periodo',
    primaDominical: fmtMXN(extraDominical) + (domingos > 0 ? ` (${domingos} domingo${domingos > 1 ? 's' : ''} × ${fmtMXN(salarioDiario * lft.primaDominical)})` : ''),
    pagoFestivos: fmtMXN(extraFestivos) + (festivos > 0 ? ` adicional (cada festivo se paga ${fmtMXN(salarioDiario * (1 + lft.festivoLaboradoExtra))} en total)` : ''),
    pagoDescansos: fmtMXN(extraDescansos) + (descansos > 0 ? ` adicional (cada descanso trabajado se paga ${fmtMXN(salarioDiario * (1 + lft.descansoLaboradoExtra))} en total)` : ''),
    detalle: `Salario diario ${fmtMXN(salarioDiario)}${periodo === 'mensual' ? ` (mensual ÷ ${salarioMinimo.factorMensual})` : ''}. ${partes.join('. ')}. Total extra: ${fmtMXN(totalExtra)}.`,
    _insight,
    _chart,
  };
}
