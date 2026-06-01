/** Ahorro económico anual al reemplazar lámparas incandescentes por LED */
export interface Inputs {
  cantidadLamparas: number;
  wattsIncandescente: number;
  wattsLED: number;
  horasPorDia: number;
  precioKwh: number;
  precioLED?: number;
}
export interface Outputs {
  consumoActualKwhAnio: number;
  consumoLEDKwhAnio: number;
  ahorroKwhAnio: number;
  ahorroMonetarioAnio: number;
  ahorroMonetario10Anios: number;
  inversionLED: number;
  mesesParaAmortizar: number;
  resumen: string;
  _insight?: any;
}

export function ahorroLedVsIncandescente(i: Inputs): Outputs {
  const n = Number(i.cantidadLamparas);
  const wInc = Number(i.wattsIncandescente);
  const wLED = Number(i.wattsLED);
  const hs = Number(i.horasPorDia);
  const precio = Number(i.precioKwh);
  const precioLED = Number(i.precioLED) || 1500; // ARS típico 2026 por lámpara LED

  if (!n || n <= 0) throw new Error('Ingresá la cantidad de lámparas');
  if (!wInc || wInc <= 0) throw new Error('Ingresá los watts de la lámpara incandescente');
  if (!wLED || wLED <= 0) throw new Error('Ingresá los watts de la lámpara LED');
  if (wLED >= wInc) throw new Error('La LED debe consumir menos que la incandescente');
  if (!hs || hs < 0 || hs > 24) throw new Error('Ingresá horas válidas (0-24)');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del kWh');

  const kwhAnioPorLampInc = (wInc * hs * 365) / 1000;
  const kwhAnioPorLampLED = (wLED * hs * 365) / 1000;
  const consumoActualKwhAnio = kwhAnioPorLampInc * n;
  const consumoLEDKwhAnio = kwhAnioPorLampLED * n;
  const ahorroKwhAnio = consumoActualKwhAnio - consumoLEDKwhAnio;
  const ahorroMonetarioAnio = ahorroKwhAnio * precio;
  const ahorroMonetario10Anios = ahorroMonetarioAnio * 10;
  const inversionLED = precioLED * n;
  const mesesParaAmortizar = ahorroMonetarioAnio > 0 ? (inversionLED / ahorroMonetarioAnio) * 12 : 999;

  const fmt = (v: number) => '$' + Math.round(v).toLocaleString('es-AR');
  const amortTxt = mesesParaAmortizar < 1
    ? 'en menos de un mes'
    : mesesParaAmortizar < 12
      ? `en **${mesesParaAmortizar.toFixed(1).replace('.', ',')} meses**`
      : `en **${(mesesParaAmortizar / 12).toFixed(1).replace('.', ',')} años**`;
  const _insight = {
    title: 'LED: ahorro que se acumula',
    text: `Cambiar ${n} lámpara(s) incandescente(s) por LED recorta el consumo en **${ahorroKwhAnio.toFixed(0)} kWh/año** y te ahorra **${fmt(ahorroMonetarioAnio)} por año**. Recuperás los **${fmt(inversionLED)}** de inversión ${amortTxt}; en 10 años el ahorro acumulado llega a **${fmt(ahorroMonetario10Anios)}**.`,
    tone: mesesParaAmortizar <= 24 ? 'good' : 'neutral',
    icon: '💡',
  };

  return {
    consumoActualKwhAnio: Number(consumoActualKwhAnio.toFixed(2)),
    consumoLEDKwhAnio: Number(consumoLEDKwhAnio.toFixed(2)),
    ahorroKwhAnio: Number(ahorroKwhAnio.toFixed(2)),
    ahorroMonetarioAnio: Math.round(ahorroMonetarioAnio),
    ahorroMonetario10Anios: Math.round(ahorroMonetario10Anios),
    inversionLED: Math.round(inversionLED),
    mesesParaAmortizar: Number(mesesParaAmortizar.toFixed(1)),
    resumen: `Cambiando ${n} lámpara(s) ahorrás $${Math.round(ahorroMonetarioAnio).toLocaleString('es-AR')} por año. Recuperás la inversión en ${mesesParaAmortizar.toFixed(1)} meses.`,
    _insight,
  };
}
