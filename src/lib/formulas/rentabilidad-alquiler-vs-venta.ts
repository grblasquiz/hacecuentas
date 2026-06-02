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
  _insight?: any;
  _chart?: any;
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

  const capNetoR = Number(capRateNeto.toFixed(2));
  const retornoR = Number(retornoTotal.toFixed(2));
  const aniosR = Number(aniosRecuperacion.toFixed(1));

  // INSIGHT — interpreta el cap rate neto y el retorno total
  const tone: 'good' | 'warn' | 'neutral' = capNetoR >= 5 ? 'good' : capNetoR >= 3 ? 'neutral' : 'warn';
  const lectura = capNetoR >= 5
    ? 'Es un cap rate alto: la propiedad genera buen flujo respecto a su precio.'
    : capNetoR >= 3
      ? 'Es un cap rate dentro del rango habitual del mercado.'
      : capNetoR < 0
        ? 'El cap rate neto es negativo: vacancia y gastos superan al alquiler.'
        : 'Es un cap rate bajo: el alquiler rinde poco frente al valor de venta.';
  const _insight = {
    title: 'Cap rate de la propiedad',
    text: `La propiedad rinde un **cap rate neto de ${capNetoR.toFixed(2)}%** anual (genera $${Math.round(ingresoNetoAnual).toLocaleString()}/año netos)${apreciacion > 0 ? `, que con una apreciación del ${apreciacion}% sube a un **retorno total de ${retornoR.toFixed(2)}%**` : ''}. Recuperás el precio de compra en **${aniosR} años** solo con renta. ${lectura}`,
    tone,
    icon: '🏢',
  };

  const out: Outputs = {
    ingresoNetoAnual: Math.round(ingresoNetoAnual),
    capRate: Number(capRate.toFixed(2)),
    capRateNeto: capNetoR,
    retornoTotal: retornoR,
    aniosRecuperacion: aniosR,
    formula,
    explicacion,
    _insight,
  };

  // CHART — gauge: zonas de cap rate neto anual (solo si es positivo)
  if (isFinite(capNetoR) && capNetoR >= 0) {
    out._chart = {
      type: 'scale',
      marker: capNetoR,
      markerLabel: `${capNetoR.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 3, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Medio', max: 5, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Bueno', max: 8, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Alto', max: Math.max(10, Math.ceil(capNetoR) + 1), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Cap rate neto de ${capNetoR.toFixed(1)}% sobre una escala de 0% a 10%.`,
    };
  }
  return out;
}
