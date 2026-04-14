/**
 * Calculadora de Indemnización por despido sin causa (Argentina)
 *
 * Componentes según LCT (Ley 20.744):
 *   - Art. 245: Indemnización por antigüedad = mejor remuneración mensual,
 *     normal y habitual del último año × (años + fracción > 3 meses)
 *     Tope: 3 × promedio convencional (post fallo Vizzoti 2004: si el tope
 *     reduce más del 33%, se aplica 67% de la base sin tope)
 *   - Art. 231-232: Preaviso + SAC sobre preaviso
 *       15 días <3 meses (prueba)
 *       1 mes entre 3 meses y 5 años
 *       2 meses más de 5 años
 *   - Art. 233: Integración mes de despido (días que faltan hasta fin de mes) + SAC
 *   - Art. 123: SAC proporcional al semestre en curso
 *   - Art. 156: Vacaciones no gozadas proporcionales + SAC sobre vacaciones
 */

export interface IndemnizacionInputs {
  sueldoBruto: number; // mejor remuneración mensual normal y habitual del último año
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11, meses extra más allá de los años completos
  topeConvenio: number; // 3 × promedio convencional; 0 = sin tope
  diaDespido: number; // 1-31, día del mes del despido
}

export interface IndemnizacionOutputs {
  antiguedad: number; // Art. 245
  preaviso: number;
  sacPreaviso: number;
  integracionMes: number;
  sacIntegracion: number;
  sacProporcional: number;
  vacacionesProporcionales: number;
  sacVacaciones: number;
  total: number;
  aniosComputables: string;
  baseArt245: number;
  vizzotiAplicado: boolean;
}

export function indemnizacion(inputs: IndemnizacionInputs): IndemnizacionOutputs {
  const sueldo = Number(inputs.sueldoBruto);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const tope = Math.max(0, Number(inputs.topeConvenio) || 0);
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral');
  }

  const antiguedadTotalMeses = anios * 12 + meses;

  // Art. 245: años trabajados + fracción > 3 meses = +1 año
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Base para Art. 245 (mejor remuneración), con posible tope de convenio
  // Fallo Vizzoti: si tope < 67% de la base, tomar 67% de la base
  let baseArt245 = sueldo;
  let vizzotiAplicado = false;
  if (tope > 0) {
    const minConVizzoti = sueldo * 0.67;
    if (tope < minConVizzoti) {
      baseArt245 = minConVizzoti;
      vizzotiAplicado = true;
    } else {
      baseArt245 = tope;
    }
  }

  const antiguedad = baseArt245 * aniosComputables;

  // Preaviso LCT Art. 231: 15 días (<3 meses) / 1 mes (3m a 5a inclusive) / 2 meses (>5a)
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 3) mesesPreaviso = 0.5; // 15 días = medio mes
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;

  const preaviso = sueldo * mesesPreaviso;
  const sacPreaviso = preaviso / 12; // SAC = 1/12 de lo que se paga

  // Integración mes de despido: días que faltan hasta fin de mes
  const diasMes = 30; // promedio
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracionMes = (sueldo / diasMes) * diasFaltantes;
  const sacIntegracion = integracionMes / 12;

  // SAC proporcional al semestre en curso (días trabajados del semestre / 181)
  // Simplificación: mes del despido en el semestre (1-6), proporcional
  // Asumimos media histórica: 3 meses del semestre × 0.5 = 1.5 meses de sueldo medio
  // Fórmula real: (sueldo / 2) × (meses trabajados en semestre / 6)
  // Aquí usamos aproximación 3 meses promedio para simplicidad
  const sacProporcional = (sueldo / 2) * (3 / 6); // ~ medio SAC

  // Vacaciones no gozadas proporcionales: días según antigüedad × (meses trabajados / 12)
  // Simplificación: asumimos que tiene derecho a las vacaciones del año en curso
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;

  // Proporcional al año: suponemos ~6 meses trabajados del año en curso promedio
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25; // Art. 155: jornal vacacional = sueldo / 25
  const vacacionesProporcionales = valorDia * diasVacProp;
  const sacVacaciones = vacacionesProporcionales / 12;

  const total =
    antiguedad +
    preaviso +
    sacPreaviso +
    integracionMes +
    sacIntegracion +
    sacProporcional +
    vacacionesProporcionales +
    sacVacaciones;

  return {
    antiguedad: Math.round(antiguedad),
    preaviso: Math.round(preaviso),
    sacPreaviso: Math.round(sacPreaviso),
    integracionMes: Math.round(integracionMes),
    sacIntegracion: Math.round(sacIntegracion),
    sacProporcional: Math.round(sacProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    sacVacaciones: Math.round(sacVacaciones),
    total: Math.round(total),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    baseArt245: Math.round(baseArt245),
    vizzotiAplicado,
  };
}
