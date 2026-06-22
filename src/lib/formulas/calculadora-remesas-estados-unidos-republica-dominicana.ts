/**
 * Calculadora de remesas USA → República Dominicana 2026.
 *
 * Cuánto recibe el beneficiario en pesos al enviar dólares desde Estados Unidos.
 *   recibe (DOP) = (USD enviados − comisión) × tasa del proveedor
 *
 * La tasa de referencia (mid del BCRD) NO se hardcodea: viene del snapshot
 * REPUBLICA_DOMINICANA_2026.fx. El usuario puede cargar la tasa y la comisión
 * reales de su proveedor (Remitly, Western Union, banco, etc.); por defecto se
 * usa la tasa media oficial y comisión 0, y se muestra el SPREAD (cuánto pierde
 * frente a la tasa oficial) — el costo oculto típico de las remesas.
 *
 * Las remesas son ~9-10% del PIB dominicano (de las economías más
 * remesa-dependientes de la región).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  usd?: number;          // dólares a enviar desde EE.UU.
  comision?: number;     // comisión del proveedor en USD (default 0)
  tasaProveedor?: number; // RD$ por USD que paga el proveedor (default: tasa oficial mid)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function calculadoraRemesasEstadosUnidosRepublicaDominicana(i: Inputs): Outputs {
  const usd = Number(i.usd) || 0;
  const comision = Math.max(0, Number(i.comision) || 0);
  if (usd <= 0) throw new Error('Ingresá cuántos dólares vas a enviar');

  const tasaOficial = REPUBLICA_DOMINICANA_2026.fx.usdMid;
  const fecha = REPUBLICA_DOMINICANA_2026.fx.fecha;
  // Si no carga tasa del proveedor (o pone 0/negativa), usamos la oficial de referencia.
  const tasa = Number(i.tasaProveedor) > 0 ? Number(i.tasaProveedor) : tasaOficial;

  const usdNeto = Math.max(0, usd - comision); // lo que efectivamente se convierte
  const recibe = usdNeto * tasa;               // pesos que recibe el beneficiario

  // Cuánto recibiría a la tasa oficial sin comisión (mejor escenario teórico).
  const recibeOficialSinFee = usd * tasaOficial;
  const costoTotalDop = recibeOficialSinFee - recibe; // costo total en DOP (comisión + spread)
  const costoComisionDop = comision * tasa;           // parte que es comisión explícita
  const costoSpreadDop = Math.max(0, costoTotalDop - costoComisionDop); // parte que es peor tasa
  const costoPct = recibeOficialSinFee > 0 ? (costoTotalDop / recibeOficialSinFee) * 100 : 0;
  const tasaEfectiva = usd > 0 ? recibe / usd : 0; // RD$ realmente recibidos por cada USD enviado

  const _table = {
    title: 'Desglose del envío',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Enviás', fmtUSD(usd)],
      ['Comisión del proveedor', fmtUSD(comision)],
      ['Se convierte', fmtUSD(usdNeto)],
      ['Tasa del proveedor', `RD$ ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} / USD`],
      ['Tasa oficial (BCRD)', `RD$ ${tasaOficial.toLocaleString('de-DE', { minimumFractionDigits: 2 })} / USD`],
      ['Recibe el beneficiario', fmtDOP(recibe)],
      ['Costo total (comisión + spread)', fmtDOP(costoTotalDop)],
      ['Tasa efectiva real', `RD$ ${tasaEfectiva.toLocaleString('de-DE', { minimumFractionDigits: 2 })} / USD`],
    ],
    note: `La tasa efectiva (${fmtDOP(tasaEfectiva)} por dólar) es lo que de verdad recibe el beneficiario por cada USD enviado, ya con comisión y spread. Comparala entre proveedores: a igualdad de comisión, la mejor tasa gana. Tasa oficial de referencia BCRD al ${fecha}.`,
  };

  const haySpread = costoSpreadDop > 0.5;
  const _insight = {
    type: 'highlight',
    icon: '💸',
    text:
      `Al enviar **${fmtUSD(usd)}** el beneficiario recibe **${fmtDOP(recibe)}** ` +
      `(tasa efectiva **RD$ ${tasaEfectiva.toLocaleString('de-DE', { minimumFractionDigits: 2 })}** por dólar). ` +
      (costoTotalDop > 0.5
        ? `Frente a la tasa oficial del BCRD sin comisión, el envío cuesta **${fmtDOP(costoTotalDop)}** (**${costoPct.toFixed(1)}%**)` +
          (haySpread
            ? `: ${fmtDOP(costoComisionDop)} de comisión y **${fmtDOP(costoSpreadDop)}** de spread (la tasa peor que la oficial). El spread suele ser el costo oculto más grande de una remesa.`
            : `, todo en comisión explícita (tu proveedor paga la tasa de referencia).`)
        : `, justo a la tasa de referencia del BCRD y sin comisión. Verificá igual el precio real de tu proveedor.`),
  };

  return {
    recibe: fmtDOP(recibe),
    recibeDop: Math.round(recibe),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    costoTotal: fmtDOP(costoTotalDop),
    costoPorcentaje: Number(costoPct.toFixed(1)),
    detalle: `Enviás ${fmtUSD(usd)}${comision > 0 ? ` (− ${fmtUSD(comision)} comisión)` : ''} × RD$ ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtDOP(recibe)}`,
    _table,
    _insight,
  };
}
