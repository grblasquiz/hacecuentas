/** Ahorro anual al reemplazar lámparas por LED */
export interface Inputs {
  cantidadLamparas: number;
  wattsActual: number;
  wattsLED: number;
  horasDia: number;
  precioKwh: number;
  precioLamparaLED?: number;
}
export interface Outputs {
  ahorroAnual: number;
  ahorroMensual: number;
  inversionTotal: number;
  mesesRecupero: number;
  detalle: string;
  _insight?: any;
}

export function ahorroCambiarLamparasLed(i: Inputs): Outputs {
  const n = Number(i.cantidadLamparas);
  const wActual = Number(i.wattsActual);
  const wLED = Number(i.wattsLED);
  const hs = Number(i.horasDia);
  const precio = Number(i.precioKwh);
  const precioLED = Number(i.precioLamparaLED) || 2000;

  if (!n || n <= 0) throw new Error('Ingresá la cantidad de lámparas');
  if (!wActual || wActual <= 0) throw new Error('Ingresá los watts de la lámpara actual');
  if (!wLED || wLED <= 0) throw new Error('Ingresá los watts de la lámpara LED');
  if (wLED >= wActual) throw new Error('La LED debe consumir menos watts que la actual');
  if (!hs || hs <= 0 || hs > 24) throw new Error('Ingresá horas válidas (0-24)');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del kWh');

  const kwhActualAnio = (n * wActual * hs * 365) / 1000;
  const kwhLEDAnio = (n * wLED * hs * 365) / 1000;
  const ahorroKwh = kwhActualAnio - kwhLEDAnio;
  const ahorroAnual = ahorroKwh * precio;
  const ahorroMensual = ahorroAnual / 12;
  const inversionTotal = n * precioLED;
  const mesesRecupero = ahorroMensual > 0 ? inversionTotal / ahorroMensual : 999;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const meses = Number(mesesRecupero.toFixed(1));
  const anualR = Math.round(ahorroAnual);
  const invR = Math.round(inversionTotal);
  const rapido = meses <= 12;
  const _insight = {
    title: rapido ? 'Se paga sola y rápido' : 'Recupero más largo',
    text: rapido
      ? `El cambio se recupera en **${meses} meses** y después ahorrás **$${fmt.format(anualR)}/año** netos. Como la inversión ($${fmt.format(invR)}) vuelve en menos de un año y las LED duran muchos años, todo lo que viene después es ganancia.`
      : `Recuperás los **$${fmt.format(invR)}** de inversión recién en **${meses} meses**, ahorrando **$${fmt.format(anualR)}/año**. El ahorro existe pero es lento: conviene si usás bastante esas luces o si pagás un kWh caro.`,
    tone: rapido ? 'good' : 'neutral',
    icon: '💡',
  };

  return {
    ahorroAnual: anualR,
    ahorroMensual: Math.round(ahorroMensual),
    inversionTotal: invR,
    mesesRecupero: meses,
    detalle: `Cambiando ${n} lámpara(s) de ${wActual}W a LED ${wLED}W (${hs} hs/día): ahorrás ${fmt.format(ahorroKwh)} kWh/año = $${fmt.format(ahorroAnual)}/año ($${fmt.format(ahorroMensual)}/mes). Inversión: $${fmt.format(inversionTotal)}, recuperada en ${mesesRecupero.toFixed(1)} meses.`,
    _insight,
  };
}
