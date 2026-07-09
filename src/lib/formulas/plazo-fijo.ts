/**
 * Calculadora de Plazo Fijo Argentina
 *
 * Fórmula estándar: interés simple sobre TNA
 *   interés = capital × (TNA/100) × (días / 365)
 *   monto_final = capital + interés
 *
 * TEA (Tasa Efectiva Anual): (1 + TNA/365)^365 - 1 (capitalización diaria teórica)
 * Rendimiento efectivo del plazo = (monto_final/capital - 1) × 100
 */

export interface PlazoFijoInputs {
  capital: number;
  tna: number; // Tasa Nominal Anual en %
  dias: number; // 30, 60, 90, 180, 365...
}

export interface PlazoFijoOutputs {
  interesGanado: number;
  montoFinal: number;
  rendimientoPeriodo: number; // % del período
  tea: number; // tasa efectiva anual %
  interesDiario: number;
  interesMensualEq: number; // tasa mensual equivalente
  _insight?: any;
  _chart?: any;
}

export function plazoFijo(inputs: PlazoFijoInputs): PlazoFijoOutputs {
  const capital = Number(inputs.capital);
  const tna = Number(inputs.tna);
  const dias = Number(inputs.dias);

  if (!capital || capital <= 0) throw new Error('Ingresá el capital a invertir');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA (tasa nominal anual)');
  if (!dias || dias < 1) throw new Error('Ingresá los días del plazo (mínimo 30)');

  const tnaDecimal = tna / 100;
  const interesGanado = capital * tnaDecimal * (dias / 365);
  const montoFinal = capital + interesGanado;
  const rendimientoPeriodo = (interesGanado / capital) * 100;

  // TEA: (1 + TNA/365)^365 - 1 (interés compuesto diario teórico)
  const tea = (Math.pow(1 + tnaDecimal / 365, 365) - 1) * 100;

  const interesDiario = interesGanado / dias;
  const interesMensualEq = capital * tnaDecimal * (30 / 365);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const capitalRound = Math.round(capital);
  const interesRound = Math.round(interesGanado);
  const montoRound = Math.round(montoFinal);

  const _insight = {
    title: 'Qué ganás con este plazo fijo',
    text: `A ${dias} días con una TNA de **${tna}%**, tus **${fmt(capital)}** se transforman en **${fmt(montoFinal)}**: ganás **${fmt(interesGanado)}** de interés (**${rendimientoPeriodo.toFixed(2)}%** del período). La TEA equivalente es **${tea.toFixed(2)}%**, el techo real si reinvertís cada vencimiento.`,
    tone: 'good',
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital invertido', value: capitalRound },
      { label: 'Interés ganado', value: interesRound },
    ],
    prefix: '$',
    centerValue: fmt(montoFinal),
    centerLabel: 'Monto final',
    ariaLabel: `Monto final de ${fmt(montoFinal)}: capital de ${fmt(capital)} más interés ganado de ${fmt(interesGanado)} en ${dias} días.`,
  };

  return {
    interesGanado: interesRound,
    montoFinal: montoRound,
    rendimientoPeriodo: Number(rendimientoPeriodo.toFixed(2)),
    tea: Number(tea.toFixed(2)),
    interesDiario: Math.round(interesDiario),
    interesMensualEq: Math.round(interesMensualEq),
    _insight,
    _chart,
  };
}

/**
 * Cronograma de renovaciones: reinvirtiendo capital + interés en cada
 * vencimiento (interés simple por período, capitalización al renovar).
 * Cubre ~1 año de renovaciones (mín. 6, máx. 24 filas). Contrato A4.
 * Números formateados es-AR. Devuelve null si los inputs no son válidos.
 */
export function schedule(
  inputs: PlazoFijoInputs & { __lang?: string }
): { headers: string[]; rows: (string | number)[][] } | null {
  const capital = Number(inputs.capital);
  const tna = Number(inputs.tna);
  const dias = Number(inputs.dias);
  if (!capital || capital <= 0 || !tna || tna <= 0 || !dias || dias < 1) return null;

  const rate = tna / 100;
  const periods = Math.min(24, Math.max(6, Math.round(365 / dias)));

  const lang = inputs.__lang === 'en' ? 'en' : inputs.__lang === 'pt' ? 'pt' : 'es';
  const headers =
    lang === 'en' ? ['Rollover', 'Starting capital', 'Interest', 'Balance'] :
    lang === 'pt' ? ['Renovação', 'Capital inicial', 'Juros', 'Saldo'] :
    ['Renovación', 'Capital inicial', 'Interés', 'Saldo'];

  const f = (x: number) => Math.round(x).toLocaleString('es-AR');
  const rows: (string | number)[][] = [];
  let saldo = capital;
  for (let p = 1; p <= periods; p++) {
    const interes = saldo * rate * (dias / 365);
    const nuevo = saldo + interes;
    rows.push([p, f(saldo), f(interes), f(nuevo)]);
    saldo = nuevo;
  }
  return { headers, rows };
}
