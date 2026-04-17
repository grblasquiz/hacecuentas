/**
 * Calculadora de Prima de Antigüedad México (LFT art. 162)
 * 12 días de salario por cada año de servicio, con tope 2 UMA diarias
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoDiario: number;
  aniosServicio: number;
  salarioMinimoGeneral?: number; // tope 2 UMA (opcional, default 2 UMA 2026)
}

export interface Outputs {
  primaTotal: number;
  salarioTope: number;
  salarioAplicado: number;
  diasTotal: number;
  mensaje: string;
}

export function primaAntiguedadMexico(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoDiario);
  const anios = Number(i.aniosServicio);
  // 2 UMA diarias 2026 aprox: 2 * 120 = 240
  const topeDefault = 240;
  const tope = Number(i.salarioMinimoGeneral ?? topeDefault);

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo diario');
  if (!anios || anios <= 0) throw new Error('Ingresá los años de servicio');

  const salarioAplicado = Math.min(sueldo, tope);
  const diasTotal = 12 * anios;
  const primaTotal = diasTotal * salarioAplicado;

  return {
    primaTotal: Number(primaTotal.toFixed(2)),
    salarioTope: Number(tope.toFixed(2)),
    salarioAplicado: Number(salarioAplicado.toFixed(2)),
    diasTotal,
    mensaje: `Por ${anios} años de servicio te corresponden ${diasTotal} días × $${salarioAplicado.toFixed(2)} = $${primaTotal.toFixed(2)} de prima de antigüedad.`,
  };
}
