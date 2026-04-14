/** Consumo eléctrico: kWh/mes y costo */
export interface Inputs {
  potenciaWatts: number;
  horasPorDia: number;
  diasPorMes?: number;
  precioKwh?: number;
}
export interface Outputs {
  consumoKwhDia: number;
  consumoKwhMes: number;
  costoMensual: number;
  costoAnual: number;
  consumoAnualKwh: number;
}

export function consumoElectrico(i: Inputs): Outputs {
  const w = Number(i.potenciaWatts);
  const hs = Number(i.horasPorDia);
  const dias = Number(i.diasPorMes) || 30;
  const precio = Number(i.precioKwh) || 55; // ARS/kWh residencial típico 2026
  if (!w || w < 0) throw new Error('Ingresá la potencia en watts');
  if (!hs || hs < 0 || hs > 24) throw new Error('Ingresá horas válidas (0-24)');

  const kwhDia = (w * hs) / 1000;
  const kwhMes = kwhDia * dias;
  const costoMes = kwhMes * precio;
  const costoAnual = costoMes * 12;
  const kwhAnual = kwhMes * 12;

  return {
    consumoKwhDia: Number(kwhDia.toFixed(3)),
    consumoKwhMes: Number(kwhMes.toFixed(2)),
    consumoAnualKwh: Number(kwhAnual.toFixed(2)),
    costoMensual: Math.round(costoMes),
    costoAnual: Math.round(costoAnual),
  };
}
