/** Interés acumulado en tarjeta pagando solo el mínimo */
export interface Inputs {
  saldo: number;
  tasaAnual: number; // %
  pagoMensual: number;
}
export interface Outputs {
  mesesParaPagar: number;
  interesTotal: number;
  totalPagado: number;
  cuotaMinimaEfectiva: number;
  resumen: string;
  alerta: string;
}

export function interesAcumuladoTarjeta(i: Inputs): Outputs {
  const saldo = Number(i.saldo);
  const tasaAnual = Number(i.tasaAnual);
  const pago = Number(i.pagoMensual);

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo de la tarjeta');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (!pago || pago <= 0) throw new Error('Ingresá el pago mensual');

  const r = tasaAnual / 100 / 12;
  const interesMensualInicial = saldo * r;

  if (pago <= interesMensualInicial) {
    throw new Error(`El pago mensual (${pago.toFixed(2)}) no cubre ni los intereses (${interesMensualInicial.toFixed(2)}) — la deuda crece indefinidamente. Aumentá el pago.`);
  }

  // Fórmula: n = -ln(1 - r*P/pago) / ln(1+r)
  const meses = -Math.log(1 - (r * saldo) / pago) / Math.log(1 + r);
  const totalPagado = pago * meses;
  const interesTotal = totalPagado - saldo;

  let alerta = '';
  if (meses > 120) alerta = 'Vas a tardar más de 10 años en saldar la tarjeta. Pagá más o consolidá la deuda.';
  else if (meses > 60) alerta = 'Más de 5 años. El interés total superará el saldo original — considerá subir el pago.';
  else if (interesTotal > saldo) alerta = 'Vas a pagar más en intereses que el saldo original. Subí la cuota si podés.';
  else alerta = 'Plan razonable, pero cualquier pago extra acelera muchísimo la cancelación.';

  const resumen = `Pagando ${pago.toLocaleString()}/mes a ${tasaAnual}% TNA tardás ${Math.ceil(meses)} meses y pagás ${interesTotal.toLocaleString()} en intereses.`;

  return {
    mesesParaPagar: Math.ceil(meses),
    interesTotal: Math.round(interesTotal),
    totalPagado: Math.round(totalPagado),
    cuotaMinimaEfectiva: Math.round(interesMensualInicial),
    resumen,
    alerta,
  };
}
