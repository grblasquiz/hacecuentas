/** Indemnización por vacaciones no gozadas al egresar (LCT art 156) */
export interface Inputs { sueldoMensualBruto: number; antiguedadAnos: number; diasNoGozados: number; }
export interface Outputs { valorDiarioVacaciones: number; indemnizacionBruta: number; diasCorrespondientes: number; explicacion: string; _insight?: any; }
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
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Cuánto te deben por vacaciones no gozadas',
    text: dias > 0
      ? `Al egresar, los **${dias} días** de vacaciones no gozadas se pagan a **${fmt(valorDiario)}** por día (sueldo/25, LCT art. 155): te corresponde una indemnización de **${fmt(indemn)}** (Art. 156). A diferencia del resto de la liquidación, este rubro **se cobra siempre**, sin importar la causa del cese.`
      : `No cargaste días no gozados, así que la indemnización del Art. 156 da **$0**. Por tu antigüedad de **${ant} años** te corresponderían **${diasCorresp} días/año**; cualquier día que no hayas tomado al egresar se paga a **${fmt(valorDiario)}** el día.`,
    tone: (dias > 0 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '💸',
  };
  return {
    valorDiarioVacaciones: Number(valorDiario.toFixed(2)),
    indemnizacionBruta: Number(indemn.toFixed(2)),
    diasCorrespondientes: diasCorresp,
    explicacion: `Valor diario $${valorDiario.toFixed(2)} (sueldo/25 según LCT art 155). Indemnización por ${dias} días no gozados: $${indemn.toFixed(2)}. Te correspondían ${diasCorresp} días/año por antigüedad de ${ant} años.`,
    _insight: insight,
  };
}
