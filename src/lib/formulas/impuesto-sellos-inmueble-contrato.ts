/**
 * Calculadora de impuesto de sellos (inmueble / contrato)
 * Sellos = monto_contrato × alícuota
 */

export interface ImpuestoSellosInmuebleContratoInputs {
  montoContrato: number;
  alicuota: number;
  partesQuePagan: string;
}

export interface ImpuestoSellosInmuebleContratoOutputs {
  impuestoTotal: number;
  montoPorParte: number;
  detalle: string;
}

export function impuestoSellosInmuebleContrato(
  inputs: ImpuestoSellosInmuebleContratoInputs
): ImpuestoSellosInmuebleContratoOutputs {
  const monto = Number(inputs.montoContrato);
  const alicuota = Number(inputs.alicuota);
  const partes = inputs.partesQuePagan || 'mitades';

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del contrato');
  if (isNaN(alicuota) || alicuota < 0) throw new Error('Ingresá la alícuota de sellos');

  const impuesto = monto * (alicuota / 100);
  const porParte = partes === 'mitades' ? impuesto / 2 : impuesto;
  const partesStr = partes === 'mitades' ? '50% cada parte' : 'una sola parte';

  return {
    impuestoTotal: Math.round(impuesto),
    montoPorParte: Math.round(porParte),
    detalle: `Impuesto de sellos: $${Math.round(monto).toLocaleString('es-AR')} × ${alicuota}% = $${Math.round(impuesto).toLocaleString('es-AR')}. Distribución: ${partesStr} → $${Math.round(porParte).toLocaleString('es-AR')} por parte. Se paga una sola vez al firmar el contrato.`,
  };
}
