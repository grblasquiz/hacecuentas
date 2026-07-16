/** ITP + cambio de nombre de un coche de segunda mano (España).
 *  Al comprar un vehículo usado a un particular se paga el Impuesto de Transmisiones
 *  Patrimoniales (ITP), autonómico, sobre el valor del vehículo, más la tasa de la DGT
 *  por el cambio de titularidad y, opcionalmente, la gestoría.
 *    - ITP: tipo autonómico (habitual 4% para bienes muebles; varía 4%–8% por CCAA).
 *    - Base ITP: el mayor entre el precio de compra y el valor fiscal (tablas de precios
 *      medios del Ministerio de Hacienda con reducción por antigüedad).
 *    - Tasa DGT (cambio de titularidad): 55,70 € turismos / 27,85 € motos (referencial 2026).
 *  Fuente: Agencia Tributaria (ITP y AJD) y DGT — Tasas de tráfico. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

const TASA_DGT_COCHE = 55.70;   // tasa 4.1 DGT turismos (referencial 2026)
const TASA_DGT_MOTO = 27.85;    // tasa 4.1 DGT motocicletas (referencial 2026)
const TIPO_ITP_DEFECTO = 4;     // % ITP habitual para vehículos usados (varía por CCAA)

export interface Inputs {
  valorVehiculo: number;      // base de cálculo del ITP (€): mayor entre precio y valor fiscal
  tipoITP?: number;           // % ITP de tu comunidad autónoma (default 4)
  tipoVehiculo?: string;      // 'coche' | 'moto'
  costeGestoria?: number;     // gestoría opcional (€), default 0
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorVehiculo) || 0;
  const tipoITP = Number(i.tipoITP) > 0 ? Number(i.tipoITP) : TIPO_ITP_DEFECTO;
  const esMoto = String(i.tipoVehiculo || 'coche') === 'moto';
  const gestoria = Math.max(0, Number(i.costeGestoria) || 0);
  if (valor <= 0) throw new Error('Introduce el valor del vehículo en euros');

  const itp = valor * (tipoITP / 100);
  const tasaDGT = esMoto ? TASA_DGT_MOTO : TASA_DGT_COCHE;
  const totalCambioNombre = itp + tasaDGT + gestoria;
  const totalConCompra = valor + totalCambioNombre;

  const _insight = {
    title: 'Coste real del cambio de nombre',
    text: `Cambiar el nombre de un vehículo valorado en **${fmtEur(valor)}** cuesta **${fmtEur(totalCambioNombre)}** en trámites: **${fmtEur(itp)}** de ITP (${tipoITP}%), **${fmtEur(tasaDGT)}** de tasa DGT${gestoria > 0 ? ` y **${fmtEur(gestoria)}** de gestoría` : ''}. Sumado al precio del coche, desembolsas **${fmtEur(totalConCompra)}** en total.`,
    tone: 'neutral',
    icon: '🚗',
  };
  const _chart = {
    type: 'bar',
    labels: gestoria > 0 ? ['ITP', 'Tasa DGT', 'Gestoría'] : ['ITP', 'Tasa DGT'],
    values: gestoria > 0
      ? [Math.round(itp), Math.round(tasaDGT), Math.round(gestoria)]
      : [Math.round(itp), Math.round(tasaDGT)],
    prefix: '€ ',
    ariaLabel: `ITP ${fmtEur(itp)}, tasa DGT ${fmtEur(tasaDGT)}${gestoria > 0 ? `, gestoría ${fmtEur(gestoria)}` : ''}.`,
  };

  return {
    totalCambioNombre: fmtEur(totalCambioNombre),
    itp: fmtEur(itp),
    tasaDGT: fmtEur(tasaDGT),
    gestoria: fmtEur(gestoria),
    totalConCompra: fmtEur(totalConCompra),
    detalle: `ITP ${tipoITP}% sobre ${fmtEur(valor)} = ${fmtEur(itp)} + tasa DGT ${fmtEur(tasaDGT)}${gestoria > 0 ? ` + gestoría ${fmtEur(gestoria)}` : ''} = ${fmtEur(totalCambioNombre)} de trámites.`,
    _insight,
    _chart,
  };
}
