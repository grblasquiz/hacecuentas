/** Compara gasto en nafta vs GNC y calcula ahorro y amortización del equipo */
export interface Inputs {
  kmMensuales: number;
  consumoNafta: number;
  precioNafta: number;
  precioGnc: number;
  costoEquipo?: number;
}
export interface Outputs {
  ahorroMensual: number;
  ahorroAnual: number;
  mesesAmortizacion: number;
  gastoMensualNafta: number;
  gastoMensualGnc: number;
  detalle: string;
}

export function compararNaftaVsGncAhorro(i: Inputs): Outputs {
  const km = Number(i.kmMensuales);
  const consumoNafta = Number(i.consumoNafta);
  const precioNafta = Number(i.precioNafta);
  const precioGnc = Number(i.precioGnc);
  const costoEquipo = Number(i.costoEquipo) || 0;

  if (!km || km < 100) throw new Error('Ingresá los km mensuales (mínimo 100)');
  if (!consumoNafta || consumoNafta < 4) throw new Error('Ingresá el consumo de nafta en L/100km');
  if (!precioNafta || precioNafta <= 0) throw new Error('Ingresá el precio del litro de nafta');
  if (!precioGnc || precioGnc <= 0) throw new Error('Ingresá el precio del m³ de GNC');

  // Consumo GNC: factor 1.3 respecto a nafta
  const consumoGnc = consumoNafta * 1.3; // m³/100km

  const gastoMensualNafta = (km * consumoNafta / 100) * precioNafta;
  const gastoMensualGnc = (km * consumoGnc / 100) * precioGnc;
  const ahorroMensual = gastoMensualNafta - gastoMensualGnc;
  const ahorroAnual = ahorroMensual * 12;

  let mesesAmortizacion = 0;
  if (costoEquipo > 0 && ahorroMensual > 0) {
    mesesAmortizacion = costoEquipo / ahorroMensual;
  }

  let detalleStr = `Nafta: $${Math.round(gastoMensualNafta).toLocaleString('es-AR')}/mes. GNC: $${Math.round(gastoMensualGnc).toLocaleString('es-AR')}/mes. Ahorro: $${Math.round(ahorroMensual).toLocaleString('es-AR')}/mes ($${Math.round(ahorroAnual).toLocaleString('es-AR')}/año).`;
  if (mesesAmortizacion > 0) {
    detalleStr += ` El equipo de $${Math.round(costoEquipo).toLocaleString('es-AR')} se amortiza en ${mesesAmortizacion.toFixed(1)} meses.`;
  }

  return {
    ahorroMensual: Math.round(ahorroMensual),
    ahorroAnual: Math.round(ahorroAnual),
    mesesAmortizacion: Number(mesesAmortizacion.toFixed(1)),
    gastoMensualNafta: Math.round(gastoMensualNafta),
    gastoMensualGnc: Math.round(gastoMensualGnc),
    detalle: detalleStr,
  };
}
