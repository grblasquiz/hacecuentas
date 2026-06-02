/** Rentabilidad de alquilar vs. vender una propiedad */
export interface Inputs {
  valorPropiedad: number;
  alquilerMensual: number;
  gastosMensuales: number;
  expensasPropietario?: number;
  tasaAlternativa: number;
}
export interface Outputs {
  rentabilidadBrutaAnual: number;
  rentabilidadNetaAnual: number;
  capRate: number;
  comparacionTasa: number;
  ingresoNetoAnual: number;
  conviene: string;
  _insight?: any;
  _chart?: any;
}

export function rentabilidadAlquiler(i: Inputs): Outputs {
  const valor = Number(i.valorPropiedad);
  const alquiler = Number(i.alquilerMensual);
  const gastos = Number(i.gastosMensuales) || 0;
  const expensas = Number(i.expensasPropietario) || 0;
  const tasaAlt = Number(i.tasaAlternativa);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la propiedad');
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');

  const bruta = (alquiler * 12 / valor) * 100;
  const ingresoNeto = (alquiler - gastos - expensas) * 12;
  const neta = (ingresoNeto / valor) * 100;
  const cap = neta; // cap rate = rentabilidad neta anual
  const diferencia = neta - tasaAlt;
  const conviene = diferencia > 0
    ? `Alquilar rinde ${diferencia.toFixed(2)} pp más que la tasa alternativa — conviene mantener.`
    : `Alquilar rinde ${Math.abs(diferencia).toFixed(2)} pp menos que la tasa alternativa — podría convenir vender e invertir.`;

  const netaR = Number(neta.toFixed(2));
  const difR = Number(diferencia.toFixed(2));

  // INSIGHT — rentabilidad neta vs tasa alternativa (eje dinámico: conviene mantener o vender)
  const tone: 'good' | 'warn' | 'neutral' = difR > 0 ? 'good' : netaR < 0 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Alquilar vs. invertir el capital',
    text: `Alquilar rinde **${netaR.toFixed(2)}% neto anual** (genera $${Math.round(ingresoNeto).toLocaleString()}/año). ${difR > 0
      ? `Eso es **${difR.toFixed(2)} pp por encima** de la tasa alternativa del ${tasaAlt}%: te conviene mantener la propiedad alquilada.`
      : `Eso es **${Math.abs(difR).toFixed(2)} pp por debajo** de la tasa alternativa del ${tasaAlt}%: podría convenir vender e invertir el capital en otro instrumento.`}`,
    tone,
    icon: '🏠',
  };

  const out: Outputs = {
    rentabilidadBrutaAnual: Number(bruta.toFixed(2)),
    rentabilidadNetaAnual: netaR,
    capRate: Number(cap.toFixed(2)),
    comparacionTasa: difR,
    ingresoNetoAnual: Math.round(ingresoNeto),
    conviene,
    _insight,
  };

  // CHART — gauge: zonas de rentabilidad neta anual (solo si es positiva)
  if (isFinite(netaR) && netaR >= 0) {
    out._chart = {
      type: 'scale',
      marker: netaR,
      markerLabel: `${netaR.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 2, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Media', max: 4, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Buena', max: 6, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Alta', max: Math.max(8, Math.ceil(netaR) + 1), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Rentabilidad neta anual del alquiler de ${netaR.toFixed(1)}% sobre una escala de 0% a 8%.`,
    };
  }
  return out;
}
