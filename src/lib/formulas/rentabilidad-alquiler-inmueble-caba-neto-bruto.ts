export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function rentabilidadAlquilerInmuebleCabaNetoBruto(i: Inputs): Outputs {
  const v=Number(i.valorInmueble)||0; const a=Number(i.alquilerMensual)||0; const g=Number(i.gastosMensuales)||0;
  const bruta=(a*12/v)*100;
  const neta=((a-g)*12/v)*100;
  const pay=a>0?(v/(a*12)):0;

  // INSIGHT — interpreta la rentabilidad neta y el payback
  const tone: 'good' | 'warn' | 'neutral' = neta >= 4 ? 'good' : neta >= 2 ? 'neutral' : 'warn';
  const lectura = neta >= 4
    ? 'Es una rentabilidad alta para inmuebles en CABA.'
    : neta >= 2
      ? 'Es una rentabilidad típica del mercado de CABA.'
      : neta < 0
        ? 'Los gastos se comen el alquiler: la renta neta es negativa.'
        : 'Es una rentabilidad baja; revisá gastos o valor de compra.';
  const _insight = {
    title: 'Rentabilidad real del alquiler',
    text: `Este inmueble rinde **${neta.toFixed(1)}% neto anual** (${bruta.toFixed(1)}% bruto antes de gastos). A este ritmo recuperás el valor de compra en **${pay.toFixed(1)} años** solo con alquileres. ${lectura}`,
    tone,
    icon: '🏠',
  };

  const out: Outputs = { rentBruta:bruta.toFixed(2)+'%', rentNeta:neta.toFixed(2)+'%', paybackAños:pay.toFixed(1), resumen:`Inmueble $${v.toLocaleString('es-AR')}: bruta ${bruta.toFixed(1)}%, neta ${neta.toFixed(1)}%, payback ${pay.toFixed(1)} años.`, _insight };

  // CHART — gauge: zonas de rentabilidad neta anual (solo si es positiva)
  if (isFinite(neta) && neta >= 0) {
    const netaR = Number(neta.toFixed(2));
    out._chart = {
      type: 'scale',
      marker: netaR,
      markerLabel: `${neta.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 2, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Típica', max: 4, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Buena', max: 6, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Alta', max: Math.max(8, Math.ceil(netaR) + 1), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Rentabilidad neta anual de ${neta.toFixed(1)}% sobre una escala de 0% a 8%.`,
    };
  }
  return out;
}
