import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface AporteJubilatorioUruguayInputs {
  /** Sueldo nominal mensual, en pesos uruguayos. */
  nominal: number;
}

export interface AporteJubilatorioUruguayOutputs {
  resultado: string;
  montepio: string;
  tasa: string;
  anual: string;
  nota: string;
}

/**
 * Aporte jubilatorio personal (montepío BPS) sobre el salario nominal — Uruguay 2026.
 * Es el 15% del nominal con destino jubilatorio (BPS / AFAP según el régimen del trabajador).
 *
 * Nota sobre AFAP/topes: la distribución del 15% entre BPS y la AFAP depende del nivel salarial y
 * de la opción del artículo 8 de la Ley 16.713. Existen franjas (en pesos, ajustadas por el IMS)
 * que definen qué parte va al régimen de solidaridad intergeneracional (BPS) y qué parte al de
 * ahorro individual (AFAP). Esta calculadora muestra el aporte total del 15%; el reparto exacto
 * BPS/AFAP lo determina BPS según tu historia laboral.
 */
export function aporteJubilatorioUruguay(
  inputs: AporteJubilatorioUruguayInputs,
): AporteJubilatorioUruguayOutputs {
  const nominal = Math.max(0, Number(inputs.nominal) || 0);
  const tasa = URUGUAY_2026.bps.montepio; // 0.15
  const montepio = nominal * tasa;
  const anual = montepio * 12;

  // Referencia de franja: el primer tramo de aporte (BPS) se ubica en torno a las 15 BPC mensuales.
  const tramoBpc = 15;
  const tramoPesos = tramoBpc * URUGUAY_2026.bpc;
  let nota: string;
  if (nominal <= 0) {
    nota = 'Ingresá tu sueldo nominal para ver el aporte jubilatorio del 15%.';
  } else if (nominal <= tramoPesos) {
    nota = `Con un nominal de ${fmtUYU(nominal)} (hasta ~${tramoBpc} BPC = ${fmtUYU(tramoPesos)}), el aporte va principalmente al régimen de solidaridad (BPS), salvo que hayas optado por aportar a una AFAP.`;
  } else {
    nota = `Con un nominal de ${fmtUYU(nominal)} (por encima de ~${tramoBpc} BPC = ${fmtUYU(tramoPesos)}), una parte del 15% se destina obligatoriamente al ahorro individual en una AFAP. El reparto exacto BPS/AFAP lo determina BPS.`;
  }

  return {
    resultado: `${fmtUYU(montepio)} por mes (15% de ${fmtUYU(nominal)})`,
    montepio: fmtUYU(montepio),
    tasa: '15% (montepío jubilatorio personal)',
    anual: `${fmtUYU(anual)} al año (12 meses, sin contar aguinaldo)`,
    nota,
  };
}
