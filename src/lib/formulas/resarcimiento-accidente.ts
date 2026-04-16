/**
 * Calculadora de Resarcimiento por Accidente - Argentina
 * Fórmula orientativa tipo Vuoto: ingreso × 13 × incapacidad% × (65-edad)/65
 */

export interface ResarcimientoAccidenteInputs {
  ingresoMensual: number;
  edad: number;
  incapacidad: number;
  gastosMedicos: number;
}

export interface ResarcimientoAccidenteOutputs {
  resarcimientoTotal: number;
  danoFisico: number;
  danoMoral: number;
  lucroCesante: number;
}

export function resarcimientoAccidente(inputs: ResarcimientoAccidenteInputs): ResarcimientoAccidenteOutputs {
  const ingreso = Number(inputs.ingresoMensual);
  const edad = Number(inputs.edad);
  const incapacidad = Number(inputs.incapacidad);
  const gastosMedicos = Math.max(0, Number(inputs.gastosMedicos) || 0);

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');
  if (!edad || edad <= 0 || edad > 100) throw new Error('Ingresá una edad válida');
  if (incapacidad < 0 || incapacidad > 100) throw new Error('La incapacidad debe estar entre 0 y 100');

  const edadJubilatoria = 65;
  const aniosProductivos = Math.max(1, edadJubilatoria - edad);
  const coeficienteEdad = aniosProductivos / edadJubilatoria;

  // Fórmula Vuoto: ingreso × 13 × incapacidad × coef edad
  const ingresoAnual = ingreso * 13; // 12 meses + SAC
  const danoFisico = ingresoAnual * (incapacidad / 100) * coeficienteEdad * aniosProductivos / 13;

  // Simplificación más usada: ingreso × 13 × incapacidad% × (65-edad)/65
  const danoFisicoSimple = ingreso * 13 * (incapacidad / 100) * coeficienteEdad;

  // Daño moral: ~30% del daño físico
  const danoMoral = danoFisicoSimple * 0.30;

  // Lucro cesante: 3 meses de ingreso como estimación de recuperación
  const mesesRecuperacion = incapacidad > 50 ? 12 : incapacidad > 20 ? 6 : 3;
  const lucroCesante = ingreso * mesesRecuperacion * (incapacidad / 100);

  const resarcimientoTotal = danoFisicoSimple + danoMoral + lucroCesante + gastosMedicos;

  return {
    resarcimientoTotal: Math.round(resarcimientoTotal),
    danoFisico: Math.round(danoFisicoSimple),
    danoMoral: Math.round(danoMoral),
    lucroCesante: Math.round(lucroCesante + gastosMedicos),
  };
}
