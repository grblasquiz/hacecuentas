import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface CalculadoraJornalUruguayInputs {
  /** Monto ingresado por el usuario, en pesos uruguayos. */
  monto: number;
  /** Unidad del monto ingresado. */
  unidad: 'jornal' | 'mensual' | 'hora';
}

export interface CalculadoraJornalUruguayOutputs {
  resultado: string;
  mensual: string;
  jornal: string;
  hora: string;
  comparacionSmn: string;
}

/**
 * Conversor jornal ⇄ mensual ⇄ hora para Uruguay 2026.
 * Convención del Decreto N° 319/025: jornal = mensual/25, hora = mensual/200.
 * (25 jornales y 200 horas mensuales de referencia.)
 */
export function calculadoraJornalUruguay(
  inputs: CalculadoraJornalUruguayInputs,
): CalculadoraJornalUruguayOutputs {
  const monto = Math.max(0, Number(inputs.monto) || 0);
  const unidad = inputs.unidad || 'jornal';

  const divJornal = URUGUAY_2026.smn.divisorJornal; // 25
  const divHora = URUGUAY_2026.smn.divisorHora;     // 200

  // Normalizo todo a mensual.
  let mensual: number;
  if (unidad === 'mensual') mensual = monto;
  else if (unidad === 'jornal') mensual = monto * divJornal;
  else mensual = monto * divHora; // hora

  const jornal = mensual / divJornal;
  const hora = mensual / divHora;

  // Comparación contra el SMN vigente (jul-dic 2026, Decreto N° 319/025).
  const smnMensual = URUGUAY_2026.smn.mensualJulio;
  const pctSmn = smnMensual > 0 ? (mensual / smnMensual) * 100 : 0;
  const vecesSmn = smnMensual > 0 ? mensual / smnMensual : 0;

  let comparacionSmn: string;
  if (mensual <= 0) {
    comparacionSmn = 'Ingresá un monto para comparar con el salario mínimo nacional.';
  } else if (mensual < smnMensual) {
    comparacionSmn = `Equivale al ${pctSmn.toFixed(1)}% del salario mínimo nacional (${fmtUYU(smnMensual)} mensual en 2026): está por debajo del mínimo.`;
  } else {
    comparacionSmn = `Equivale a ${vecesSmn.toFixed(2)} salarios mínimos nacionales (SMN = ${fmtUYU(smnMensual)} mensual en 2026).`;
  }

  const resultado =
    `${fmtUYU(jornal)} por jornal · ${fmtUYU(mensual)} mensual · ${fmtUYU(hora)} por hora`;

  return {
    resultado,
    mensual: fmtUYU(mensual),
    jornal: fmtUYU(jornal),
    hora: fmtUYU(hora),
    comparacionSmn,
  };
}
