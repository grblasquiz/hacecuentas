/** Estima el costo total de transferencia de un vehículo */
export interface Inputs {
  valuacionFiscal: number;
  mismaJurisdiccion: number;
}
export interface Outputs {
  costoTotal: number;
  arancelRegistro: number;
  selladoProvincial: number;
  detalle: string;
}

export function transferAutoCostoRegistro(i: Inputs): Outputs {
  const valuacion = Number(i.valuacionFiscal);
  const misma = Number(i.mismaJurisdiccion);

  if (!valuacion || valuacion < 500000) throw new Error('Ingresá la valuación fiscal del vehículo (mínimo $500.000)');
  if (misma < 1 || misma > 2) throw new Error('Indicá 1 (misma jurisdicción) o 2 (cambio de radicación)');

  // Arancel del registro: ~1.5% de la valuación
  const arancelRegistro = valuacion * 0.015;

  // Sellado provincial: ~1%
  const selladoProvincial = valuacion * 0.01;

  // Gastos fijos estimados
  const verificacionPolicial = 35000;
  const formularios = 15000;
  const informeDominio = 10000;

  // Extra por cambio de radicación
  const extraRadicacion = misma === 2 ? 50000 : 0;

  const costoTotal = arancelRegistro + selladoProvincial + verificacionPolicial + formularios + informeDominio + extraRadicacion;

  const radicacion = misma === 2 ? ' Incluye gasto extra por cambio de radicación.' : '';

  return {
    costoTotal: Math.round(costoTotal),
    arancelRegistro: Math.round(arancelRegistro),
    selladoProvincial: Math.round(selladoProvincial),
    detalle: `Costo estimado de transferencia: $${Math.round(costoTotal).toLocaleString('es-AR')}. Arancel registro: $${Math.round(arancelRegistro).toLocaleString('es-AR')}. Sellado: $${Math.round(selladoProvincial).toLocaleString('es-AR')}. Verificación + formularios: $${(verificacionPolicial + formularios + informeDominio).toLocaleString('es-AR')}.${radicacion}`,
  };
}
