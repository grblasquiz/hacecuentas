/** Indemnización por vacaciones no gozadas al egresar (LCT art 156) */
export interface Inputs { sueldoMensualBruto: number; antiguedadAnos: number; diasNoGozados: number; }
export interface Outputs { valorDiarioVacaciones: number; indemnizacionBruta: number; diasCorrespondientes: number; explicacion: string; }
export function vacacionesNoTomadasIndemnizacionFormula(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensualBruto);
  const ant = Number(i.antiguedadAnos);
  const dias = Number(i.diasNoGozados);
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo mensual bruto');
  if (ant < 0) throw new Error('Antigüedad inválida');
  if (dias < 0) throw new Error('Días no gozados inválidos');
  let diasCorresp = 14;
  if (ant > 20) diasCorresp = 35;
  else if (ant > 10) diasCorresp = 28;
  else if (ant >= 5) diasCorresp = 21;
  else if (ant >= 0.5) diasCorresp = 14;
  const valorDiario = sueldo / 25;
  const indemn = valorDiario * dias;
  return {
    valorDiarioVacaciones: Number(valorDiario.toFixed(2)),
    indemnizacionBruta: Number(indemn.toFixed(2)),
    diasCorrespondientes: diasCorresp,
    explicacion: `Valor diario $${valorDiario.toFixed(2)} (sueldo/25 según LCT art 155). Indemnización por ${dias} días no gozados: $${indemn.toFixed(2)}. Te correspondían ${diasCorresp} días/año por antigüedad de ${ant} años.`,
  };
}
