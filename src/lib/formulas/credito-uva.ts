/** Crédito UVA vs. tasa fija — simulación comparativa */
export interface Inputs {
  monto: number;
  plazoAnos: number;
  tasaUVA: number;
  tasaFija: number;
  inflacionEsperada: number;
  salarioActual?: number;
}
export interface Outputs {
  cuotaInicialUVA: number;
  cuotaInicialFija: number;
  cuotaFinalUVAEstimada: number;
  totalPagarUVAEstimado: number;
  totalPagarFija: number;
  ratioCuotaSalarioInicial: number;
  ratioCuotaSalarioFinal: number;
  recomendacion: string;
  _insight?: any;
}

function cuotaFrancesa(capital: number, tasaMensual: number, meses: number): number {
  if (tasaMensual === 0) return capital / meses;
  return capital * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
}

export function creditoUva(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const anos = Number(i.plazoAnos);
  const uva = Number(i.tasaUVA) / 100;
  const fija = Number(i.tasaFija) / 100;
  const inf = Number(i.inflacionEsperada) / 100;
  const salario = Number(i.salarioActual) || 0;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (!anos || anos <= 0) throw new Error('Ingresá el plazo en años');
  const meses = anos * 12;

  const cuotaUVA0 = cuotaFrancesa(monto, uva / 12, meses);
  const cuotaFija = cuotaFrancesa(monto, fija / 12, meses);

  // UVA: cuota en pesos se ajusta por UVA (inflación). Simulamos cuota al final del préstamo si la inflación se mantiene
  const cuotaUVAFinal = cuotaUVA0 * Math.pow(1 + inf, anos);

  // Total a pagar UVA — aproximación: sumá cuotas ajustadas mes a mes con inflación promedio anual
  const tasaMensInf = Math.pow(1 + inf, 1 / 12) - 1;
  let totalUVA = 0;
  for (let m = 0; m < meses; m++) {
    totalUVA += cuotaUVA0 * Math.pow(1 + tasaMensInf, m);
  }

  const totalFija = cuotaFija * meses;

  const ratio0 = salario > 0 ? (cuotaUVA0 / salario) * 100 : 0;
  const ratioF = salario > 0 ? (cuotaUVAFinal / (salario * Math.pow(1 + inf, anos))) * 100 : 0;

  let recomendacion = '';
  if (cuotaFija > cuotaUVA0 * 1.5) {
    recomendacion = 'El crédito UVA tiene una cuota inicial mucho más baja; conviene si esperás que tu salario acompañe la inflación.';
  } else if (fija < inf) {
    recomendacion = 'La tasa fija está por debajo de la inflación esperada — en términos reales conviene la tasa fija.';
  } else {
    recomendacion = 'Ambas opciones son similares — depende de tu tolerancia al riesgo y estabilidad laboral.';
  }

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const ahorroInicial = cuotaFija - cuotaUVA0;
  const uvaMasBarataInicio = ahorroInicial > 0;
  const _insight = {
    title: uvaMasBarataInicio ? 'La cuota UVA arranca más baja' : 'La cuota fija arranca más baja',
    text: uvaMasBarataInicio
      ? `Empezás pagando **${fmt(cuotaUVA0)}/mes** con UVA contra **${fmt(cuotaFija)}/mes** con tasa fija: **${fmt(ahorroInicial)}** menos por mes al inicio. Pero la cuota UVA se ajusta por inflación y podría trepar a ~**${fmt(cuotaUVAFinal)}** hacia el final${salario > 0 ? `, llevando el ratio cuota/sueldo del **${ratio0.toFixed(1)}%** al **${ratioF.toFixed(1)}%**` : ''}.`
      : `La tasa fija arranca en **${fmt(cuotaFija)}/mes** y no se mueve, mientras la UVA empieza en **${fmt(cuotaUVA0)}/mes** pero se ajusta por inflación hasta ~**${fmt(cuotaUVAFinal)}**. Con la inflación esperada, la fija te da previsibilidad sin sorpresas.`,
    tone: (uvaMasBarataInicio ? 'neutral' : 'good') as 'good' | 'neutral',
    icon: '🏦'
  };

  return {
    cuotaInicialUVA: Math.round(cuotaUVA0),
    cuotaInicialFija: Math.round(cuotaFija),
    cuotaFinalUVAEstimada: Math.round(cuotaUVAFinal),
    totalPagarUVAEstimado: Math.round(totalUVA),
    totalPagarFija: Math.round(totalFija),
    ratioCuotaSalarioInicial: Number(ratio0.toFixed(1)),
    ratioCuotaSalarioFinal: Number(ratioF.toFixed(1)),
    recomendacion,
    _insight,
  };
}

/**
 * Cronograma año a año del crédito UVA. La amortización se calcula en UVA
 * (pesos constantes) por sistema francés a la tasa real, y cada valor se
 * pasa a pesos NOMINALES aplicando la inflación esperada mes a mes — así se
 * ve cómo la cuota trepa con la inflación. Contrato A4 (Calculator.astro).
 * Números formateados es-AR. Devuelve null si los inputs no son válidos.
 */
export function schedule(
  i: Inputs & { __lang?: string }
): { headers: string[]; rows: (string | number)[][] } | null {
  const monto = Number(i.monto);
  const anos = Number(i.plazoAnos);
  const uva = Number(i.tasaUVA) / 100;
  const inf = Number(i.inflacionEsperada) / 100 || 0;
  if (!monto || monto <= 0 || !anos || anos <= 0) return null;

  const meses = anos * 12;
  const iMes = uva / 12;
  const cuotaReal =
    iMes === 0 ? monto / meses : (monto * (iMes * Math.pow(1 + iMes, meses))) / (Math.pow(1 + iMes, meses) - 1);
  const infMensual = Math.pow(1 + inf, 1 / 12) - 1;

  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const headers =
    lang === 'en' ? ['Year', 'Monthly payment', 'Yearly interest', 'Yearly principal', 'Balance'] :
    lang === 'pt' ? ['Ano', 'Parcela mensal', 'Juros do ano', 'Capital do ano', 'Saldo'] :
    ['Año', 'Cuota mensual', 'Interés del año', 'Capital del año', 'Saldo'];

  const f = (x: number) => Math.round(x).toLocaleString('es-AR');
  const rows: (string | number)[][] = [];
  const years = Math.min(Math.round(anos), 40);
  let saldoReal = monto;
  for (let y = 1; y <= years; y++) {
    let interesAnioNom = 0;
    let capitalAnioNom = 0;
    let cuotaMesNom = 0;
    let lastGlobalMonth = (y - 1) * 12 + 1;
    for (let mm = 1; mm <= 12; mm++) {
      const globalMonth = (y - 1) * 12 + mm;
      if (globalMonth > meses) break;
      lastGlobalMonth = globalMonth;
      const factor = Math.pow(1 + infMensual, globalMonth - 1);
      const interesReal = saldoReal * iMes;
      const capitalReal = cuotaReal - interesReal;
      if (mm === 1) cuotaMesNom = cuotaReal * factor;
      interesAnioNom += interesReal * factor;
      capitalAnioNom += capitalReal * factor;
      saldoReal = Math.max(0, saldoReal - capitalReal);
    }
    const saldoNom = saldoReal * Math.pow(1 + infMensual, lastGlobalMonth - 1);
    rows.push([y, f(cuotaMesNom), f(interesAnioNom), f(capitalAnioNom), f(saldoNom)]);
  }
  return { headers, rows };
}
