/**
 * Impuestos y costos por heredar o donar un inmueble en México.
 * México no cobra impuesto federal a la herencia y exenta de ISR las donaciones entre
 * cónyuge/ascendientes/descendientes (LISR Art. 93); pero SIEMPRE se paga el ISAI (impuesto
 * estatal/municipal sobre adquisición de inmuebles) + notario + registro. La exención de la
 * UMA anual sale de la fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  valorInmueble: number;                 // valor catastral/comercial del inmueble ($)
  tipoTransmision: 'herencia' | 'donacion';
  parentesco: 'directa' | 'otro';        // línea recta (cónyuge/ascendiente/descendiente) u otro
  tasaISAI: number;                      // % de ISAI de tu municipio (2%–6,5%), editable
  honorariosNotarioPct: number;          // honorarios de notario (% del valor), editable
  derechosRegistroPct: number;           // derechos de Registro Público (% del valor), editable
}

export interface Outputs {
  isai: number;
  honorariosNotario: number;
  derechosRegistro: number;
  isrPorTransmision: number;
  costoTotalTransmision: number;
  notaExencion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const { uma } = MEXICO_2026;

  const valor = Math.max(0, Number(i.valorInmueble) || 0);
  const isaiPct = Math.min(10, Math.max(0, Number(i.tasaISAI) || 0));
  const notPct = Math.min(10, Math.max(0, Number(i.honorariosNotarioPct) || 0));
  const regPct = Math.min(10, Math.max(0, Number(i.derechosRegistroPct) || 0));
  const esDonacion = i.tipoTransmision === 'donacion';
  const esDirecta = i.parentesco !== 'otro';

  const isai = valor * (isaiPct / 100);
  const honorariosNotario = valor * (notPct / 100);
  const derechosRegistro = valor * (regPct / 100);

  let isrPorTransmision = 0;
  let notaExencion: string;

  if (!esDonacion) {
    // Herencia por sucesión: exenta de ISR para el heredero.
    isrPorTransmision = 0;
    notaExencion = 'La herencia está exenta de ISR para el heredero (LISR Art. 93). Solo debe informarse en la declaración anual si el total de ingresos exentos del año supera $500,000.';
  } else if (esDirecta) {
    // Donación entre cónyuge/ascendiente/descendiente: exenta, sin límite.
    isrPorTransmision = 0;
    notaExencion = 'La donación entre cónyuges, ascendientes y descendientes en línea recta está exenta de ISR sin límite de monto (LISR Art. 93-XXIII).';
  } else {
    // Donación a terceros: exenta solo hasta 3 UMA anuales; el excedente causa ISR.
    const exencion = 3 * uma.anual;
    const baseGravable = Math.max(0, valor - exencion);
    isrPorTransmision = isrAnual2026(baseGravable);
    notaExencion = `La donación a personas distintas de cónyuge/ascendiente/descendiente está exenta solo hasta 3 UMA anuales (${fmtMXN(exencion)}); el excedente se acumula y causa ISR.`;
  }

  const costoTotalTransmision = isai + honorariosNotario + derechosRegistro + isrPorTransmision;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: 'Costo de heredar o donar el inmueble',
    text: `Transmitir un inmueble de **${fmtMXN(valor)}** cuesta alrededor de **${fmtMXN(costoTotalTransmision)}**: ISAI **${fmtMXN(isai)}**, notario **${fmtMXN(honorariosNotario)}** y registro **${fmtMXN(derechosRegistro)}**${isrPorTransmision > 0 ? `, más **${fmtMXN(isrPorTransmision)}** de ISR` : ', sin ISR por la exención'}. El impuesto grande no es la herencia: es el ISAI y los gastos notariales.`,
    tone: 'neutral',
    icon: '🏛️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'ISAI', value: Math.round(isai) },
      { label: 'Notario', value: Math.round(honorariosNotario) },
      { label: 'Registro', value: Math.round(derechosRegistro) },
      { label: 'ISR', value: Math.round(isrPorTransmision) },
    ],
    prefix: '$',
    centerValue: fmtMXN(costoTotalTransmision),
    centerLabel: 'Costo total',
    ariaLabel: `Costo total de la transmisión ${fmtMXN(costoTotalTransmision)}: ISAI, notario, registro e ISR.`,
  };

  return {
    isai: round2(isai),
    honorariosNotario: round2(honorariosNotario),
    derechosRegistro: round2(derechosRegistro),
    isrPorTransmision: round2(isrPorTransmision),
    costoTotalTransmision: round2(costoTotalTransmision),
    notaExencion,
    _insight,
    _chart,
  };
}
