/** Costo de pagar solo el mínimo de la tarjeta */
export interface Inputs { saldoActual: number; tnaAnual: number; minimoPct?: number; __lang?: string; }
export interface Outputs { totalPagado: number; interesesPagados: number; mesesPagar: number; costoFinanciacion: string; _chart?: any; }

export function tarjetaCreditoMinimo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errSaldo: 'Ingresá el saldo a financiar',
      errTna: 'La TNA no puede ser negativa',
      sliceSaldo: 'Saldo original',
      sliceIntereses: 'Intereses',
      centerLabel: 'Total pagado',
      ariaLabel: 'Composición del total pagado: saldo original más intereses.',
    },
    en: {
      errSaldo: 'Enter the balance to finance',
      errTna: 'APR cannot be negative',
      sliceSaldo: 'Original balance',
      sliceIntereses: 'Interest',
      centerLabel: 'Total paid',
      ariaLabel: 'Breakdown of total paid: original balance plus interest.',
    },
  } as const)[__lang];

  let saldo = Number(i.saldoActual);
  const tna = Number(i.tnaAnual);
  const minPct = Number(i.minimoPct) || 15;
  if (!saldo || saldo <= 0) throw new Error(T.errSaldo);
  if (tna < 0) throw new Error(T.errTna);

  const tasaMensual = tna / 100 / 12;
  let totalPagado = 0;
  let meses = 0;
  const saldoOriginal = saldo;

  while (saldo > 100 && meses < 360) {
    meses++;
    const interes = saldo * tasaMensual;
    const minimo = Math.max(saldo * (minPct / 100), 2000);
    const pago = Math.min(minimo, saldo + interes);
    saldo = saldo + interes - pago;
    totalPagado += pago;
  }
  if (saldo > 0) { totalPagado += saldo; meses++; }

  const intereses = totalPagado - saldoOriginal;
  const costoPct = ((intereses / saldoOriginal) * 100).toFixed(0);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.sliceSaldo, value: saldoOriginal },
      { label: T.sliceIntereses, value: intereses },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalPagado).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };

  return {
    totalPagado: Math.round(totalPagado),
    interesesPagados: Math.round(intereses),
    mesesPagar: meses,
    costoFinanciacion: __lang === 'en'
      ? `You pay ${costoPct}% more than the original balance in interest alone`
      : `Pagás ${costoPct}% más del saldo original solo en intereses`,
    _chart: chart,
  };
}
