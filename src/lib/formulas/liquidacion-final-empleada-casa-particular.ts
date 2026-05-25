/**
 * Calculadora de Liquidación Final — Empleada de Casas Particulares
 * Ley 26.844 (Régimen Especial de Contrato de Trabajo para el Personal
 * de Casas Particulares), Arts. 48, 49, 50.
 *
 * Diferencias clave con LCT (Ley 20.744):
 *   - Indemnización por antigüedad (Art. 48): 1 mes del mejor sueldo
 *     por cada año o fracción mayor a 3 meses. NO aplica tope Vizzoti
 *     porque el régimen no establece tope convencional.
 *   - Preaviso (Art. 42):
 *       10 días si antigüedad < 1 año
 *       30 días (1 mes) si antigüedad entre 1 y 5 años
 *       60 días (2 meses) si antigüedad > 5 años
 *   - Integración mes del despido (Art. 43): días faltantes hasta fin
 *     de mes desde el día del despido.
 *   - SAC proporcional (Art. 39): igual al LCT, mejor sueldo / 2 ×
 *     (meses trabajados del semestre / 6).
 *   - Vacaciones proporcionales (Art. 30): días según antigüedad, valor
 *     jornal = sueldo / 25.
 *
 * Aportes empleador: sólo obligatorios cuando trabaja > 16 hs/semana.
 */

export interface LiquidacionEmpleadaInputs {
  sueldoMensual: number;
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11
  horasSemana: 'menos-16' | '16-24' | 'mas-24';
  diaDespido: number; // 1-31
}

export interface LiquidacionEmpleadaOutputs {
  total: number;
  antiguedad: number;
  preaviso: number;
  integracion: number;
  sacProporcional: number;
  vacacionesProporcionales: number;
  aniosComputables: string;
  mensaje: string;
}

export function liquidacionFinalEmpleadaCasaParticular(
  inputs: LiquidacionEmpleadaInputs
): LiquidacionEmpleadaOutputs {
  const sueldo = Number(inputs.sueldoMensual);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const horas = inputs.horasSemana || '16-24';
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual.');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral.');
  }

  const antiguedadTotalMeses = anios * 12 + meses;

  // Art. 48 Ley 26.844: 1 mes por año + fracción > 3 meses suma año adicional
  const aniosComputables = meses > 3 ? anios + 1 : anios;
  const antiguedad = sueldo * aniosComputables;

  // Art. 42 Ley 26.844: preaviso
  //   < 1 año = 10 días
  //   1 a 5 años = 30 días (1 mes)
  //   > 5 años = 60 días (2 meses)
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 12) mesesPreaviso = 10 / 30; // 10 días
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;

  const preaviso = sueldo * mesesPreaviso;

  // Art. 43 Ley 26.844: integración mes despido (días hasta fin de mes)
  const diasMes = 30;
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracion = (sueldo / diasMes) * diasFaltantes;

  // SAC proporcional (Art. 39): aproximación 3 meses promedio del semestre
  const sacProporcional = (sueldo / 2) * (3 / 6);

  // Vacaciones proporcionales (Art. 30 Ley 26.844)
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;

  // Proporcional al año en curso (aproximación 6 meses promedio)
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25;
  const vacacionesProporcionales = valorDia * diasVacProp;

  const total =
    antiguedad +
    preaviso +
    integracion +
    sacProporcional +
    vacacionesProporcionales;

  let mensaje =
    'Liquidación final según Ley 26.844 (Régimen Especial Personal de Casas Particulares).';
  if (horas === 'menos-16') {
    mensaje +=
      ' Trabajando menos de 16 hs/semana, el empleador no estaba obligado a aportes jubilatorios ni obra social, pero la indemnización por despido sin causa es exigible igual.';
  } else if (horas === '16-24') {
    mensaje +=
      ' Con jornada de 16 a 24 hs/semana corresponden aportes obligatorios (jubilación + obra social + ART).';
  } else {
    mensaje +=
      ' Con jornada superior a 24 hs/semana el régimen previsional y de obra social es pleno, equiparado a LCT en ese aspecto.';
  }

  return {
    total: Math.round(total),
    antiguedad: Math.round(antiguedad),
    preaviso: Math.round(preaviso),
    integracion: Math.round(integracion),
    sacProporcional: Math.round(sacProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    mensaje,
  };
}
