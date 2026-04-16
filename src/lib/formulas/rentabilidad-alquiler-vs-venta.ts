/** Cap rate inmobiliario — rentabilidad alquiler vs valor de venta */

export interface Inputs {
  valorPropiedad: number;
  alquilerMensual: number;
  gastosMensuales: number;
  vacanciaPorc: number;
  apreciacionAnual: number;
}

export interface Outputs {
  ingresoNetoAnual: number;
  capRate: number;
  capRateNeto: number;
  retornoTotal: number;
  aniosRecuperacion: number;
  formula: string;
  explicacion: string;
}

export function rentabilidadAlquilerVsVenta(i: Inputs): Outputs {
  const valor = Number(i.valorPropiedad);
  const alquiler = Number(i.alquilerMensual);
  const gastos = Number(i.gastosMensuales) || 0;
  const vacancia = Number(i.vacanciaPorc) || 0;
  const apreciacion = Number(i.apreciacionAnual) || 0;

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la propiedad');
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');

  const ingresoBrutoAnual = alquiler * 12;
  const vacanciaMonto = ingresoBrutoAnual * (vacancia / 100);
  const gastosAnuales = gastos * 12;
  const ingresoNetoAnual = ingresoBrutoAnual - vacanciaMonto - gastosAnuales;

  const capRate = (ingresoBrutoAnual / valor) * 100;
  const capRateNeto = (ingresoNetoAnual / valor) * 100;
  const retornoTotal = capRateNeto + apreciacion;

  const aniosRecuperacion = ingresoNetoAnual > 0 ? valor / ingresoNetoAnual : 0;

  const formula = `Cap Rate = $${ingresoBrutoAnual.toLocaleString()} / $${valor.toLocaleString()} = ${capRate.toFixed(2)}%`;
  const explicacion = `Propiedad: $${valor.toLocaleString()}. Alquiler: $${alquiler.toLocaleString()}/mes ($${ingresoBrutoAnual.toLocaleString()}/año bruto).${vacancia > 0 ? ` Vacancia ${vacancia}%: -$${Math.round(vacanciaMonto).toLocaleString()}.` : ''}${gastos > 0 ? ` Gastos: -$${gastosAnuales.toLocaleString()}/año.` : ''} Ingreso neto: $${Math.round(ingresoNetoAnual).toLocaleString()}/año. Cap rate bruto: ${capRate.toFixed(2)}%. Cap rate neto: ${capRateNeto.toFixed(2)}%.${apreciacion > 0 ? ` Con apreciación del ${apreciacion}%, retorno total: ${retornoTotal.toFixed(2)}%.` : ''} Recuperás la inversión en ${aniosRecuperacion.toFixed(1)} años.`;

  return {
    ingresoNetoAnual: Math.round(ingresoNetoAnual),
    capRate: Number(capRate.toFixed(2)),
    capRateNeto: Number(capRateNeto.toFixed(2)),
    retornoTotal: Number(retornoTotal.toFixed(2)),
    aniosRecuperacion: Number(aniosRecuperacion.toFixed(1)),
    formula,
    explicacion,
  };
}
