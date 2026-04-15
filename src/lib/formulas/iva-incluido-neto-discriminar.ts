/**
 * Calculadora de IVA — incluido, neto y discriminado
 * Sacar IVA: neto = precio / (1 + alícuota)
 * Agregar IVA: total = neto × (1 + alícuota)
 */

export interface IvaIncluidoNetoDiscriminarInputs {
  monto: number;
  montoTipo: string;
  alicuota: number;
}

export interface IvaIncluidoNetoDiscriminarOutputs {
  neto: number;
  iva: number;
  total: number;
  detalle: string;
}

export function ivaIncluidoNetoDiscriminar(
  inputs: IvaIncluidoNetoDiscriminarInputs
): IvaIncluidoNetoDiscriminarOutputs {
  const monto = Number(inputs.monto);
  const tipo = inputs.montoTipo || 'conIva';
  const alicuota = Number(inputs.alicuota) || 21;

  if (!monto || monto <= 0) throw new Error('Ingresá un monto');
  if (alicuota <= 0) throw new Error('La alícuota debe ser positiva');

  const factor = 1 + alicuota / 100;
  let neto: number;
  let iva: number;
  let total: number;

  if (tipo === 'conIva') {
    // Sacar IVA del precio final
    total = monto;
    neto = monto / factor;
    iva = total - neto;
  } else {
    // Agregar IVA al neto
    neto = monto;
    total = monto * factor;
    iva = total - neto;
  }

  const operacion = tipo === 'conIva' ? 'sacando' : 'agregando';

  return {
    neto: Math.round(neto * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100,
    detalle: `${tipo === 'conIva' ? 'Precio con IVA' : 'Precio neto'}: $${monto.toLocaleString('es-AR')}. ${operacion === 'sacando' ? 'Discriminando' : 'Agregando'} IVA ${alicuota}%: neto $${(Math.round(neto * 100) / 100).toLocaleString('es-AR')} + IVA $${(Math.round(iva * 100) / 100).toLocaleString('es-AR')} = total $${(Math.round(total * 100) / 100).toLocaleString('es-AR')}.`,
  };
}
