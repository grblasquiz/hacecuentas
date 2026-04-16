/**
 * Calculadora de Sueldo Bruto desde Neto Deseado
 * Operación inversa: bruto = neto / (1 - aportes)
 */

export interface SueldoBrutoDesdeNetoInputs {
  netoDeseado: number;
  aportes: number;
}

export interface SueldoBrutoDesdeNetoOutputs {
  sueldoBruto: number;
  aportesMonto: number;
  netoResultado: number;
}

export function sueldoBrutoDesdeNeto(inputs: SueldoBrutoDesdeNetoInputs): SueldoBrutoDesdeNetoOutputs {
  const netoDeseado = Number(inputs.netoDeseado);
  const aportesPorc = Number(inputs.aportes) || 17;

  if (!netoDeseado || netoDeseado <= 0) {
    throw new Error('Ingresá el sueldo neto deseado');
  }

  const tasaAportes = aportesPorc / 100;
  const sueldoBruto = netoDeseado / (1 - tasaAportes);
  const aportesMonto = sueldoBruto * tasaAportes;
  const netoResultado = sueldoBruto - aportesMonto;

  return {
    sueldoBruto: Math.round(sueldoBruto),
    aportesMonto: Math.round(aportesMonto),
    netoResultado: Math.round(netoResultado),
  };
}
