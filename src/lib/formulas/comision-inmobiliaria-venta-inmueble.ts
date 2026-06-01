/**
 * Calculadora de Comisión Inmobiliaria por Venta (Argentina)
 *
 * Marco legal:
 *   - CABA: Ley 2.340 (modif. Ley 5.859) + CUCICBA - tope orientativo 4% + 4%
 *   - PBA: Decreto-Ley 10.973/89 + COCIBA - práctica 3-4% por parte
 *   - Interior: leyes provinciales propias - práctica 3-6%
 *   - IVA: 21% (Ley 23.349 - servicio gravado) si corredor es responsable inscripto
 *
 * Base de cálculo: precio que figura en la escritura traslativa de dominio.
 */

type Jurisdiccion = 'caba' | 'pba' | 'interior';

export interface ComisionInmobiliariaInputs {
  precioVenta: number;
  jurisdiccion: Jurisdiccion;
  comisionVendedor: number; // porcentaje editable
  comisionComprador: number; // porcentaje editable
  incluyeIva: boolean;
}

export interface ComisionInmobiliariaOutputs {
  comisionVendedorMonto: number;
  ivaVendedor: number;
  totalAPagarVendedor: number;
  comisionCompradorMonto: number;
  ivaComprador: number;
  totalAPagarComprador: number;
  montoEscritura: number;
  montoFinalVendedor: number;
  totalComisionMercado: number;
  _chart?: any;
}

const IVA_ALICUOTA = 0.21;

export function comisionInmobiliariaVentaInmueble(
  inputs: ComisionInmobiliariaInputs
): ComisionInmobiliariaOutputs {
  const precio = Number(inputs.precioVenta);

  if (!precio || precio <= 0) {
    throw new Error('Ingresá el precio de venta del inmueble');
  }

  // Porcentajes (clamp a 0-10%)
  const pctVendedor = Math.max(0, Math.min(10, Number(inputs.comisionVendedor) || 0)) / 100;
  const pctComprador = Math.max(0, Math.min(10, Number(inputs.comisionComprador) || 0)) / 100;
  const sumaIva = inputs.incluyeIva !== false;

  // Cálculo comisiones sin IVA
  const comisionVendedorMonto = precio * pctVendedor;
  const comisionCompradorMonto = precio * pctComprador;

  // IVA sobre cada comisión (si aplica)
  const ivaVendedor = sumaIva ? comisionVendedorMonto * IVA_ALICUOTA : 0;
  const ivaComprador = sumaIva ? comisionCompradorMonto * IVA_ALICUOTA : 0;

  const totalAPagarVendedor = comisionVendedorMonto + ivaVendedor;
  const totalAPagarComprador = comisionCompradorMonto + ivaComprador;

  // Total inmobiliaria
  const totalComisionMercado = totalAPagarVendedor + totalAPagarComprador;

  // Neto del vendedor (precio escritura menos su comisión total)
  const montoFinalVendedor = precio - totalAPagarVendedor;

  // Donut: descomposición de la comisión total que cobra la inmobiliaria
  // (parte vendedor + parte comprador, cada una con su IVA si corresponde).
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Comisión vendedor', value: Math.max(0, Math.round(comisionVendedorMonto)) },
      { label: 'IVA vendedor', value: Math.max(0, Math.round(ivaVendedor)) },
      { label: 'Comisión comprador', value: Math.max(0, Math.round(comisionCompradorMonto)) },
      { label: 'IVA comprador', value: Math.max(0, Math.round(ivaComprador)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalComisionMercado).toLocaleString('es-AR'),
    centerLabel: 'Comisión total',
    ariaLabel: 'Composición de la comisión inmobiliaria total: parte del vendedor y del comprador, con IVA.',
  };

  return {
    comisionVendedorMonto: Math.round(comisionVendedorMonto),
    ivaVendedor: Math.round(ivaVendedor),
    totalAPagarVendedor: Math.round(totalAPagarVendedor),
    comisionCompradorMonto: Math.round(comisionCompradorMonto),
    ivaComprador: Math.round(ivaComprador),
    totalAPagarComprador: Math.round(totalAPagarComprador),
    montoEscritura: Math.round(precio),
    montoFinalVendedor: Math.round(montoFinalVendedor),
    totalComisionMercado: Math.round(totalComisionMercado),
    _chart: chart,
  };
}
