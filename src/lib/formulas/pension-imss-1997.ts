/**
 * Calculadora de pensión IMSS Ley 1997 (cuentas individuales)
 * Simplificada: requiere 1250 semanas cotizadas y 60-65 años de edad
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoBase: number;
  semanasCotizadas: number;
  edad: number;
}

export interface Outputs {
  pensionEstimada: number;
  cumpleRequisitos: boolean;
  semanasFaltantes: number;
  edadFaltante: number;
  mensaje: string;
}

export function pensionImss1997(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBase);
  const semanas = Number(i.semanasCotizadas);
  const edad = Number(i.edad);

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo base de cotización');
  if (!semanas || semanas < 0) throw new Error('Ingresá las semanas cotizadas');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  const SEMANAS_REQ = 1250;
  const EDAD_MIN = 60;

  const semanasFaltantes = Math.max(0, SEMANAS_REQ - semanas);
  const edadFaltante = Math.max(0, EDAD_MIN - edad);
  const cumpleRequisitos = semanas >= SEMANAS_REQ && edad >= EDAD_MIN;

  // Fórmula simplificada indicativa: sueldo * (semanas/1250) * factor edad
  const factorSemanas = Math.min(1, semanas / SEMANAS_REQ);
  const factorEdad = edad >= 65 ? 0.40 : edad >= 60 ? 0.35 : 0.30;
  const pensionEstimada = sueldo * factorSemanas * factorEdad;

  let mensaje = '';
  if (cumpleRequisitos) {
    mensaje = `Cumplís requisitos. Pensión estimada: $${pensionEstimada.toFixed(2)} mensuales.`;
  } else {
    const faltan: string[] = [];
    if (semanasFaltantes > 0) faltan.push(`${semanasFaltantes} semanas`);
    if (edadFaltante > 0) faltan.push(`${edadFaltante} años de edad`);
    mensaje = `Te faltan ${faltan.join(' y ')} para pensionarte bajo Ley 97.`;
  }

  return {
    pensionEstimada: Number(pensionEstimada.toFixed(2)),
    cumpleRequisitos,
    semanasFaltantes,
    edadFaltante,
    mensaje,
  };
}
