export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dolarMepPasoAPasoCostoOperacion(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;            // ARS a invertir
  const precioARS = Number(i.precioARS) || 0;    // precio del bono en ARS (ej. AL30)
  const precioUSD = Number(i.precioUSD) || 0;    // precio del bono en USD (ej. AL30D)
  // comisión: '' => default 0.5%; respetar 0 explícito
  const comRaw = i.comision;
  const comision = (comRaw === '' || comRaw === null || comRaw === undefined)
    ? 0.5
    : (Number(comRaw) || 0);

  // MEP implícito = precio en pesos / precio en dólares del mismo bono
  const mepImplicito = precioUSD > 0 ? precioARS / precioUSD : 0;

  // Bonos comprados con el monto (en nominales), luego vendidos en USD
  const bonosNominales = precioARS > 0 ? monto / precioARS : 0;
  const usdBruto = bonosNominales * precioUSD;            // USD antes de comisiones
  const usdNeto = usdBruto * (1 - comision / 100);        // USD tras comisión

  // Tipo de cambio MEP efectivo que pagás (ARS por cada USD que te llevás)
  const mepEfectivo = usdNeto > 0 ? monto / usdNeto : 0;

  // Costo total en comisiones, expresado en ARS
  const costoComisionUSD = usdBruto - usdNeto;
  const costoComisionARS = costoComisionUSD * mepImplicito;
  // Sobreprecio del MEP efectivo vs el implícito (en %)
  const sobreprecioPct = mepImplicito > 0 ? (mepEfectivo / mepImplicito - 1) * 100 : 0;

  const fmtARS = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const fmtUSD = (n: number) => 'US$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMep = (n: number) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _insight = {
    title: 'Tu dólar MEP',
    text: usdNeto > 0
      ? `Con **${fmtARS(monto)}** comprás bonos y te llevás **${fmtUSD(usdNeto)}** netos. Tu tipo de cambio MEP efectivo es **${fmtMep(mepEfectivo)}/USD**; pagaste **${fmtARS(costoComisionARS)}** en comisiones (${sobreprecioPct.toFixed(2)}% sobre el MEP implícito de ${fmtMep(mepImplicito)}).`
      : 'Completá monto, precio del bono en ARS y en USD para ver cuántos dólares MEP recibís y a qué tipo de cambio.',
    tone: comision >= 1 ? 'warn' : 'neutral',
    icon: '💵',
  };

  return {
    usdNeto: fmtUSD(usdNeto),
    mepEfectivo: fmtMep(mepEfectivo),
    costoComision: fmtARS(costoComisionARS),
    resumen: usdNeto > 0
      ? `Con ${fmtARS(monto)} obtenés ${fmtUSD(usdNeto)} a un MEP efectivo de ${fmtMep(mepEfectivo)}/USD (MEP implícito ${fmtMep(mepImplicito)}).`
      : 'Ingresá los datos de la operación.',
    _insight,
  };
}
