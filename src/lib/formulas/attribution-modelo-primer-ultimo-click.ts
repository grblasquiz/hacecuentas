/** Comparación de modelos de atribución: primer click, último click, lineal */

export interface Inputs {
  ingresoTotal: number;
  conversionesTotal: number;
  primerClickCanal: number;
  ultimoClickCanal: number;
  participacionCanal: number;
  touchpointsPromedio: number;
}

export interface Outputs {
  creditoPrimerClick: number;
  creditoUltimoClick: number;
  creditoLineal: number;
  detalle: string;
}

export function attributionModeloPrimerUltimoClick(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoTotal);
  const conv = Number(i.conversionesTotal);
  const primerPct = Number(i.primerClickCanal);
  const ultimoPct = Number(i.ultimoClickCanal);
  const participaPct = Number(i.participacionCanal);
  const touchpoints = Number(i.touchpointsPromedio);

  if (isNaN(ingreso) || ingreso < 0) throw new Error('Ingresá el ingreso total');
  if (isNaN(conv) || conv < 1) throw new Error('Ingresá las conversiones totales');
  if (isNaN(primerPct) || primerPct < 0 || primerPct > 100) throw new Error('Primer click: entre 0 y 100%');
  if (isNaN(ultimoPct) || ultimoPct < 0 || ultimoPct > 100) throw new Error('Último click: entre 0 y 100%');
  if (isNaN(participaPct) || participaPct < 0 || participaPct > 100) throw new Error('Participación: entre 0 y 100%');
  if (isNaN(touchpoints) || touchpoints < 1) throw new Error('Los touchpoints deben ser al menos 1');

  const valorConversion = ingreso / conv;

  // Primer click: 100% del crédito a conversiones donde fue primer contacto
  const convPrimer = conv * primerPct / 100;
  const creditoPrimerClick = convPrimer * valorConversion;

  // Último click: 100% del crédito a conversiones donde fue último contacto
  const convUltimo = conv * ultimoPct / 100;
  const creditoUltimoClick = convUltimo * valorConversion;

  // Lineal: crédito repartido por touchpoints
  const convParticipa = conv * participaPct / 100;
  const creditoLineal = (convParticipa * valorConversion) / touchpoints;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const mayorModelo = creditoPrimerClick >= creditoUltimoClick && creditoPrimerClick >= creditoLineal
    ? 'Primer Click'
    : creditoUltimoClick >= creditoLineal
      ? 'Último Click'
      : 'Lineal';

  const detalle =
    `${fmt.format(conv)} conversiones × $${fmt.format(valorConversion)} = $${fmt.format(ingreso)} total. ` +
    `Primer Click (${primerPct}% de conv.): $${fmt.format(creditoPrimerClick)}. ` +
    `Último Click (${ultimoPct}% de conv.): $${fmt.format(creditoUltimoClick)}. ` +
    `Lineal (${participaPct}% de conv. / ${touchpoints} touchpoints): $${fmt.format(creditoLineal)}. ` +
    `El canal vale más con el modelo de ${mayorModelo}.`;

  return {
    creditoPrimerClick: Math.round(creditoPrimerClick),
    creditoUltimoClick: Math.round(creditoUltimoClick),
    creditoLineal: Math.round(creditoLineal),
    detalle,
  };
}
