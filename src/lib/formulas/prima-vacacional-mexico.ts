/** Prima vacacional México según antigüedad (reforma LFT 2023) */
import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

export interface Inputs {
  salarioDiario: number;
  aniosAntiguedad: number;
  diasVacacionesEmpresa: number;
  primaVacacionalPorc: number;
}

export interface Outputs {
  diasVacaciones: number;
  primaVacacionalBruta: number;
  exentoIsr: number;
  gravado: number;
  isrRetenido: number;
  primaVacacionalNeta: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

// Tabla de vacaciones LFT Art. 76 (reforma 2023)
function diasVacacionesPorAntiguedad(anios: number): number {
  if (anios < 1) return 12;
  if (anios === 1) return 12;
  if (anios === 2) return 14;
  if (anios === 3) return 16;
  if (anios === 4) return 18;
  if (anios === 5) return 20;
  // A partir del 6to año, +2 días por cada 5 años de servicio
  if (anios <= 10) return 22;
  if (anios <= 15) return 24;
  if (anios <= 20) return 26;
  if (anios <= 25) return 28;
  if (anios <= 30) return 30;
  return 32;
}

// ISR: tarifa mensual 2026 desde la fuente única (Art. 96 LISR, Anexo 8 RMF 2026).
// Antes había una tabla hardcodeada acá que no coincidía con src/lib/data/mexico-2026.ts
// (renglones de un ejercicio anterior) y retenía de más.
const calcISR = (base: number) => isrMensual2026(base);

export function primaVacacionalMexico(i: Inputs): Outputs {
  const salarioDiario = Number(i.salarioDiario);
  const anios = Math.max(0, Number(i.aniosAntiguedad) || 0);
  const primaPorc = Number(i.primaVacacionalPorc) || 25;

  if (!salarioDiario || salarioDiario <= 0) throw new Error('Ingresá tu salario diario');

  const diasVacCustom = Number(i.diasVacacionesEmpresa) || 0;
  const diasVacaciones = diasVacCustom > 0 ? diasVacCustom : diasVacacionesPorAntiguedad(Math.floor(anios));

  // Prima vacacional = salario diario × días vacaciones × % prima
  const primaVacacionalBruta = salarioDiario * diasVacaciones * (primaPorc / 100);

  // Exención: 15 UMA diarias (Art. 93 LISR) — UMA fuente única src/lib/data/mexico-2026.ts
  const UMA_DIARIO = MEXICO_2026.uma.diaria; // UMA diaria 2026 = $117,31
  const exentoIsr = Math.min(primaVacacionalBruta, UMA_DIARIO * MEXICO_2026.exencionesIsrUmas.primaVacacional);
  const gravado = Math.max(0, primaVacacionalBruta - exentoIsr);
  const isrRetenido = calcISR(gravado);
  const primaVacacionalNeta = primaVacacionalBruta - isrRetenido;

  const formula = `Prima = $${salarioDiario} × ${diasVacaciones} días × ${primaPorc}% = $${primaVacacionalBruta.toFixed(2)}`;
  const explicacion = `Con ${Math.floor(anios)} año(s) de antigüedad te corresponden ${diasVacaciones} días de vacaciones. La prima vacacional (${primaPorc}%) es $${Math.round(primaVacacionalBruta).toLocaleString('es-MX')} MXN brutos. Exento de ISR: $${Math.round(exentoIsr).toLocaleString('es-MX')} (hasta 15 UMA). ISR retenido: $${Math.round(isrRetenido).toLocaleString('es-MX')}. Prima neta: $${Math.round(primaVacacionalNeta).toLocaleString('es-MX')} MXN.`;

  // Insight narrativo
  const fmtMx = (v: number) => '$' + Math.round(v).toLocaleString('es-MX') + ' MXN';
  let _insight: any;
  if (isrRetenido <= 0) {
    _insight = {
      title: 'Prima libre de ISR',
      text: `Tus **${diasVacaciones} días** de vacaciones generan una prima de **${fmtMx(primaVacacionalBruta)}**, toda dentro de la exención de **15 UMA (${fmtMx(exentoIsr)})**: no se retiene ISR y cobrás los **${fmtMx(primaVacacionalNeta)}** completos.`,
      tone: 'good',
      icon: '🏖️',
    };
  } else {
    const pctRet = primaVacacionalBruta > 0 ? (isrRetenido / primaVacacionalBruta) * 100 : 0;
    _insight = {
      title: 'Retención de ISR sobre el excedente',
      text: `De los **${fmtMx(primaVacacionalBruta)}** de prima, **${fmtMx(exentoIsr)}** quedan exentos y el resto paga ISR: te retienen **${fmtMx(isrRetenido)}** (**${pctRet.toFixed(1)}%**) y cobrás **${fmtMx(primaVacacionalNeta)}** netos.`,
      tone: 'warn',
      icon: '🏖️',
    };
  }

  // Gráfico: reparto de la prima bruta (neto + ISR)
  let _chart: any;
  if (primaVacacionalBruta > 0) {
    const slices = [{ label: 'Prima neta', value: Math.round(primaVacacionalNeta) }];
    if (isrRetenido > 0) slices.push({ label: 'ISR retenido', value: Math.round(isrRetenido) });
    _chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtMx(primaVacacionalBruta),
      centerLabel: 'Prima bruta',
      ariaLabel: `Reparto de la prima vacacional bruta de ${fmtMx(primaVacacionalBruta)} entre neto e ISR retenido`,
    };
  }

  return {
    diasVacaciones,
    primaVacacionalBruta: Math.round(primaVacacionalBruta),
    exentoIsr: Math.round(exentoIsr),
    gravado: Math.round(gravado),
    isrRetenido: Math.round(isrRetenido),
    primaVacacionalNeta: Math.round(primaVacacionalNeta),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
