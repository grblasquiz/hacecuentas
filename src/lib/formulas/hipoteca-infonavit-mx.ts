/**
 * Calculadora de hipoteca Infonavit (MX) — sistema francés
 * Incluye gastos administrativos anuales que se suman a la mensualidad.
 */

export interface Inputs {
  montoCredito: number;
  tasaAnual: number;
  plazoAnios: number;
  gastoAdmin?: number; // % anual
}

export interface Outputs {
  mensualidad: number;
  totalPagado: number;
  totalIntereses: number;
  cuotasTotales: number;
  cat: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function hipotecaInfonavitMx(inputs: Inputs): Outputs {
  const monto = Number(inputs.montoCredito);
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);
  const gastoAdmin = Number(inputs.gastoAdmin ?? 0);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (!anios || anios <= 0) throw new Error('Ingresá el plazo en años');

  const plazoMeses = anios * 12;
  const i = tasaAnual / 100 / 12;

  let cuotaBase: number;
  if (i === 0) {
    cuotaBase = monto / plazoMeses;
  } else {
    const factor = Math.pow(1 + i, plazoMeses);
    cuotaBase = (monto * (i * factor)) / (factor - 1);
  }

  // Gastos admin: % anual sobre saldo — aproximamos como % del crédito / 12 sumado a la cuota
  const gastoAdminMensual = (monto * (gastoAdmin / 100)) / 12;
  const mensualidad = cuotaBase + gastoAdminMensual;

  const totalPagado = mensualidad * plazoMeses;
  const totalIntereses = totalPagado - monto;
  const catAprox = (Math.pow(1 + i, 12) - 1) * 100 + gastoAdmin;

  // Desglose financiero del total pagado: capital + intereses financieros + gastos admin
  const interesesFinancieros = cuotaBase * plazoMeses - monto;
  const adminTotal = gastoAdminMensual * plazoMeses;
  const sobrecosto = totalIntereses; // todo lo que se paga por encima del capital
  const fmtMx = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`;

  // El sobrecosto (intereses + admin) puede superar al capital prestado en plazos largos.
  const ratioSobrecosto = sobrecosto / monto;
  const insight = {
    title: 'Cuánto pagás de más sobre el crédito',
    text: ratioSobrecosto >= 1
      ? `Sobre un crédito de **${fmtMx(monto)}** terminás devolviendo **${fmtMx(totalPagado)}**: pagás **${fmtMx(sobrecosto)}** de más (intereses + gastos), **más que el monto prestado**.`
      : `Sobre un crédito de **${fmtMx(monto)}** terminás devolviendo **${fmtMx(totalPagado)}**, con **${fmtMx(sobrecosto)}** de sobrecosto (intereses + gastos), un **${Math.round(ratioSobrecosto * 100)}%** extra sobre el capital.`,
    tone: ratioSobrecosto >= 1 ? 'warn' : 'neutral',
    icon: '🏠',
  };

  // Donut: composición del total pagado (las slices suman totalPagado).
  const slices: Array<{ label: string; value: number }> = [
    { label: 'Capital prestado', value: Math.round(monto) },
    { label: 'Intereses', value: Math.round(interesesFinancieros) },
  ];
  if (adminTotal > 0) slices.push({ label: 'Gastos admin', value: Math.round(adminTotal) });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: fmtMx(totalPagado),
    centerLabel: 'Total a pagar',
    ariaLabel: `Composición del total a pagar: capital ${Math.round(monto)}, intereses ${Math.round(interesesFinancieros)}` +
      (adminTotal > 0 ? `, gastos admin ${Math.round(adminTotal)}.` : '.'),
  };

  return {
    mensualidad: Math.round(mensualidad),
    totalPagado: Math.round(totalPagado),
    totalIntereses: Math.round(totalIntereses),
    cuotasTotales: plazoMeses,
    cat: `${catAprox.toFixed(2)}% (aprox con gastos admin)`,
    explicacion: `Crédito Infonavit $${monto.toLocaleString('es-MX')} a ${tasaAnual}% en ${anios} años. Mensualidad estimada $${Math.round(mensualidad).toLocaleString('es-MX')} (cuota base $${Math.round(cuotaBase).toLocaleString('es-MX')} + admin $${Math.round(gastoAdminMensual).toLocaleString('es-MX')}). Intereses totales $${Math.round(totalIntereses).toLocaleString('es-MX')}.`,
    _insight: insight,
    _chart: chart,
  };
}
