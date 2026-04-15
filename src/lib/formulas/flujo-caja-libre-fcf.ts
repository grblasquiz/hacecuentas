/** Flujo de Caja Libre (Free Cash Flow) */

export interface Inputs {
  ebit: number;
  tasaImpositiva: number;
  depreciacion: number;
  cambioCapitalTrabajo: number;
  capex: number;
}

export interface Outputs {
  fcf: number;
  nopat: number;
  margenFcf: number;
  detalle: string;
}

export function flujoCajaLibreFcf(i: Inputs): Outputs {
  const ebit = Number(i.ebit);
  const tasa = Number(i.tasaImpositiva);
  const dep = Number(i.depreciacion);
  const wc = Number(i.cambioCapitalTrabajo);
  const capex = Number(i.capex);

  if (isNaN(ebit) || ebit < 0) throw new Error('Ingresá el EBIT (ganancia operativa)');
  if (isNaN(tasa) || tasa < 0 || tasa > 100) throw new Error('La tasa impositiva debe estar entre 0 y 100');
  if (isNaN(dep) || dep < 0) throw new Error('La depreciación no puede ser negativa');
  if (isNaN(wc)) throw new Error('Ingresá el cambio en capital de trabajo');
  if (isNaN(capex) || capex < 0) throw new Error('El CAPEX no puede ser negativo');

  const nopat = ebit * (1 - tasa / 100);
  const fcf = nopat + dep - wc - capex;
  const margenFcf = ebit > 0 ? (fcf / ebit) * 100 : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let estado: string;
  if (fcf > 0) {
    estado = 'La empresa genera caja libre positiva — puede pagar dividendos, reducir deuda o reinvertir.';
  } else if (fcf === 0) {
    estado = 'La empresa opera en equilibrio de caja — no genera ni consume efectivo libre.';
  } else {
    estado = 'FCF negativo — la empresa consume más caja de la que genera. Necesita financiamiento.';
  }

  const detalle =
    `NOPAT (EBIT × (1−${tasa}%)): $${fmt.format(nopat)}. ` +
    `+ Depreciación: $${fmt.format(dep)}. ` +
    `− Cambio capital de trabajo: $${fmt.format(wc)}. ` +
    `− CAPEX: $${fmt.format(capex)}. ` +
    `= FCF: $${fmt.format(fcf)}. ${estado}`;

  return {
    fcf: Math.round(fcf),
    nopat: Math.round(nopat),
    margenFcf: Number(margenFcf.toFixed(1)),
    detalle,
  };
}
