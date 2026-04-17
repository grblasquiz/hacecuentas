/**
 * Calculadora de Prima de Antigüedad México (LFT art. 162)
 * 12 días de salario por cada año de servicio, con tope 2 SMG diarios.
 * Aplica en jubilación, despido, defunción, o renuncia con 15+ años.
 */

export interface Inputs {
  salarioDiario: number;
  aniosAntiguedad: number;
  motivo?: 'jubilacion' | 'despido' | 'renuncia-15' | 'defuncion' | 'renuncia-menos15';
  smgDiario?: number;
  // retro-compat
  sueldoDiario?: number;
  aniosServicio?: number;
  salarioMinimoGeneral?: number;
}

export interface Outputs {
  primaAntiguedad: number;
  salarioAplicable: number;
  diasPrima: number;
  aplica: string;
  salarioTope: number;
  mensaje: string;
}

export function primaAntiguedadMexico(i: Inputs): Outputs {
  const sueldo = Number(i.salarioDiario ?? i.sueldoDiario);
  const anios = Number(i.aniosAntiguedad ?? i.aniosServicio);
  const smgDiario = Number(i.smgDiario ?? 278.80);
  const motivo = i.motivo ?? 'despido';

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el salario diario');
  if (!anios || anios <= 0) throw new Error('Ingresá los años de antigüedad');

  const tope = smgDiario * 2;
  const salarioAplicable = Math.min(sueldo, tope);
  const diasPrima = 12 * anios;

  // Solo aplica en: jubilación, despido, defunción, renuncia con 15+ años
  const aplicaFinal = motivo !== 'renuncia-menos15';
  const primaAntiguedad = aplicaFinal ? diasPrima * salarioAplicable : 0;

  return {
    primaAntiguedad: Number(primaAntiguedad.toFixed(2)),
    salarioAplicable: Number(salarioAplicable.toFixed(2)),
    diasPrima,
    aplica: aplicaFinal ? 'Sí aplica' : 'No aplica (renuncia con menos de 15 años)',
    salarioTope: Number(tope.toFixed(2)),
    mensaje: aplicaFinal
      ? `Por ${anios} años te corresponden ${diasPrima} días × $${salarioAplicable.toFixed(2)} = $${primaAntiguedad.toFixed(2)} de prima de antigüedad.`
      : `No aplica prima de antigüedad por renuncia con menos de 15 años (LFT Art. 162).`,
  };
}
