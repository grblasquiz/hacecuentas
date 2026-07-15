export interface Inputs {
  saldoPendiente: number;
  tna: number;
  cuotasRestantes: number;
  pagoAnticipado: number;
  comisionPorcentaje?: number;
  estrategia?: 'plazo' | 'cuota';
  tasaAlternativa?: number;
}

export interface Outputs {
  cuotaActual: number;
  cuotaNueva: number;
  mesesAhorrados: number;
  comision: number;
  interesesAhorrados: number;
  beneficioNeto: number;
  detalle: string;
  _charts?: any[];
  _insight?: any;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const cuotaFrancesa = (capital: number, tasa: number, meses: number) => {
  if (tasa === 0) return capital / meses;
  const factor = Math.pow(1 + tasa, meses);
  return capital * tasa * factor / (factor - 1);
};

export function cancelacionAnticipadaPrestamo(i: Inputs): Outputs {
  const saldo = Number(i.saldoPendiente);
  const meses = Math.round(Number(i.cuotasRestantes));
  const tna = Number(i.tna);
  const pago = Number(i.pagoAnticipado);
  const comisionPct = Number(i.comisionPorcentaje) || 0;
  const estrategia = i.estrategia || 'plazo';
  const alternativa = Number(i.tasaAlternativa) || 0;
  if (saldo <= 0 || meses <= 0) throw new Error('Ingresá el saldo y las cuotas restantes');
  if (tna < 0) throw new Error('La tasa no puede ser negativa');
  if (pago <= 0 || pago > saldo) throw new Error('El pago anticipado debe ser mayor que cero y no superar el saldo');
  if (comisionPct < 0) throw new Error('La comisión no puede ser negativa');

  const r = tna / 100 / 12;
  const cuotaActual = cuotaFrancesa(saldo, r, meses);
  const saldoNuevo = Math.max(0, saldo - pago);
  const interesesAntes = cuotaActual * meses - saldo;
  const comision = pago * comisionPct / 100;
  let plazoNuevo = saldoNuevo === 0 ? 0 : meses;
  let cuotaNueva = 0;
  if (saldoNuevo > 0 && estrategia === 'plazo') {
    if (r === 0) plazoNuevo = Math.ceil(saldoNuevo / cuotaActual);
    else {
      const argumento = 1 - saldoNuevo * r / cuotaActual;
      plazoNuevo = argumento > 0 ? Math.ceil(-Math.log(argumento) / Math.log(1 + r)) : 1;
    }
    cuotaNueva = cuotaActual;
  } else if (saldoNuevo > 0) {
    cuotaNueva = cuotaFrancesa(saldoNuevo, r, meses);
  }
  const pagosDespues = saldoNuevo === 0 ? 0 : cuotaNueva * plazoNuevo;
  const interesesDespues = Math.max(0, pagosDespues - saldoNuevo);
  const interesesAhorrados = Math.max(0, interesesAntes - interesesDespues);
  const costoOportunidad = pago * (Math.pow(1 + alternativa / 100, meses / 12) - 1);
  const beneficioNeto = interesesAhorrados - comision - costoOportunidad;
  const mesesAhorrados = estrategia === 'plazo' ? Math.max(0, meses - plazoNuevo) : 0;

  return {
    cuotaActual: Math.round(cuotaActual),
    cuotaNueva: Math.round(cuotaNueva),
    mesesAhorrados,
    comision: Math.round(comision),
    interesesAhorrados: Math.round(interesesAhorrados),
    beneficioNeto: Math.round(beneficioNeto),
    detalle: estrategia === 'plazo'
      ? `Mantenés una cuota aproximada de ${fmt(cuotaActual)} y terminás ${mesesAhorrados} meses antes.`
      : `Mantenés el plazo y la cuota estimada baja de ${fmt(cuotaActual)} a ${fmt(cuotaNueva)}.`,
    _charts: [
      { type: 'doughnut', tabLabel: 'Ahorro', slices: [
        { label: 'Pago anticipado', value: Math.round(pago) },
        { label: 'Intereses evitados', value: Math.round(interesesAhorrados) },
        { label: 'Comisión', value: Math.round(comision) },
      ], prefix: '$', centerValue: fmt(interesesAhorrados - comision), centerLabel: 'Ahorro antes de alternativa' },
      { type: 'bar', tabLabel: 'Antes y después', data: { labels: ['Intereses'], datasets: [
        { label: 'Sin adelantar', data: [Math.round(interesesAntes)] },
        { label: 'Con adelanto', data: [Math.round(interesesDespues + comision)] },
      ] } },
    ],
    _insight: {
      title: beneficioNeto > 0 ? 'El adelanto mejora el resultado' : 'La alternativa puede rendir más',
      text: `Evitás **${fmt(interesesAhorrados)}** de intereses y pagás **${fmt(comision)}** de comisión.${alternativa > 0 ? ` Frente a invertir al ${alternativa}% anual, el beneficio neto estimado es **${fmt(beneficioNeto)}**.` : ''} ${estrategia === 'plazo' ? `Acortás el préstamo **${mesesAhorrados} meses**.` : `La cuota baja a **${fmt(cuotaNueva)}**.`}`,
      tone: beneficioNeto > 0 ? 'good' : 'warn',
      icon: '✂️',
    },
  };
}
