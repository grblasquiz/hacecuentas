/**
 * Calculadora para dividir gastos entre amigos
 * Parte igualitaria = gasto_total / N
 */

export interface SplitGastosGrupoAmigosInputs {
  gastoTotal: number;
  cantidadPersonas: number;
  montoPagadoPorUno?: number;
}

export interface SplitGastosGrupoAmigosOutputs {
  parteIgualitaria: number;
  debenAlPagador: number;
  sobrePagoPagador: number;
  detalle: string;
}

export function splitGastosGrupoAmigos(
  inputs: SplitGastosGrupoAmigosInputs
): SplitGastosGrupoAmigosOutputs {
  const total = Number(inputs.gastoTotal);
  const personas = Math.round(Number(inputs.cantidadPersonas));
  const pagoPrincipal = Number(inputs.montoPagadoPorUno) || 0;

  if (!total || total <= 0) throw new Error('Ingresá el gasto total');
  if (!personas || personas < 2) throw new Error('Debe haber al menos 2 personas');
  if (pagoPrincipal > total) throw new Error('El monto pagado no puede superar el gasto total');

  const parteIgualitaria = total / personas;

  let debenAlPagador = 0;
  let sobrePago = 0;

  if (pagoPrincipal > 0) {
    sobrePago = pagoPrincipal - parteIgualitaria;
    if (sobrePago > 0) {
      const otrasPersonas = personas - 1;
      debenAlPagador = sobrePago / otrasPersonas;
    }
  } else {
    // Si no se especifica pagador, todos deben partes iguales
    debenAlPagador = parteIgualitaria;
  }

  let detalleStr = '';
  if (pagoPrincipal > 0 && sobrePago > 0) {
    const otrasPersonas = personas - 1;
    detalleStr = `Gasto total: $${Math.round(total).toLocaleString('es-AR')} entre ${personas} personas = $${Math.round(parteIgualitaria).toLocaleString('es-AR')} cada uno. El pagador puso $${Math.round(pagoPrincipal).toLocaleString('es-AR')} (de más: $${Math.round(sobrePago).toLocaleString('es-AR')}). Los otros ${otrasPersonas} le deben $${Math.round(debenAlPagador).toLocaleString('es-AR')} cada uno.`;
  } else if (pagoPrincipal > 0 && sobrePago <= 0) {
    detalleStr = `Gasto total: $${Math.round(total).toLocaleString('es-AR')} entre ${personas} personas = $${Math.round(parteIgualitaria).toLocaleString('es-AR')} cada uno. El pagador puso $${Math.round(pagoPrincipal).toLocaleString('es-AR')}, que es menor o igual a su parte. No le deben nada.`;
  } else {
    detalleStr = `Gasto total: $${Math.round(total).toLocaleString('es-AR')} entre ${personas} personas = $${Math.round(parteIgualitaria).toLocaleString('es-AR')} cada uno.`;
  }

  return {
    parteIgualitaria: Math.round(parteIgualitaria),
    debenAlPagador: Math.round(Math.max(0, debenAlPagador)),
    sobrePagoPagador: Math.round(Math.max(0, sobrePago)),
    detalle: detalleStr,
  };
}
