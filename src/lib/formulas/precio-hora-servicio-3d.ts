/**
 * Calculadora de precio por hora de servicio de impresión 3D
 */

export interface Inputs {
  precioImpresora: number; amortizacionMeses: number; horasMes: number; watts: number; kwh: number; tiempoHumano: number; tarifaHumana: number;
}

export interface Outputs {
  precioHora: string; amortizacion: string; electricidad: string; desgaste: string; manoObra: string;
}

export function precioHoraServicio3d(inputs: Inputs): Outputs {
  const pi = Number(inputs.precioImpresora);
  const am = Number(inputs.amortizacionMeses);
  const hm = Number(inputs.horasMes);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const th = Number(inputs.tiempoHumano);
  const tah = Number(inputs.tarifaHumana);
  if (!pi || !am || !hm || !w || !kwh || !tah) throw new Error('Completá los campos');
  const amHora = (pi / am) / hm;
  const elHora = (w / 1000) * kwh;
  const desgaste = (amHora + elHora) * 0.10;
  const manoObra = (th / 60) * tah;
  const total = amHora + elHora + desgaste + manoObra;
  return {
    precioHora: `$${total.toFixed(0)}/hora`,
    amortizacion: `$${amHora.toFixed(0)}`,
    electricidad: `$${elHora.toFixed(0)}`,
    desgaste: `$${desgaste.toFixed(0)}`,
    manoObra: `$${manoObra.toFixed(0)}`,
  };
}
