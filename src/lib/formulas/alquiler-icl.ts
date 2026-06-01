/** Actualización de alquiler por ICL (BCRA) — Ley 27.551 / 27.737 / libre */
import { ICL_FECHAS, ICL_VALORES, ICL_LAST_UPDATED } from './_bcra-icl';

export interface Inputs {
  valorActual: number;
  /** Fecha de firma del contrato o última actualización. ISO YYYY-MM-DD. */
  fechaInicio?: string;
  /** Fecha de la nueva actualización. ISO YYYY-MM-DD. */
  fechaActualizacion?: string;
  /** Override manual (avanzado): si se ingresa un coeficiente válido, pisa el cálculo por fechas. */
  coeficienteICL?: number | string;
  /** Idioma de los textos de salida (es | en | pt). Lo inyecta el cliente. */
  __lang?: string;
}

export interface Outputs {
  valorActualizado: number;
  incremento: number;
  aumentoPorcentual: number;
  coeficienteUsado: number;
  iclInicio: number;
  iclActualizacion: number;
  fechaInicioUsada: string;
  fechaActualizacionUsada: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

/** Busca el valor de ICL para una fecha exacta. Si no existe (fin de semana,
 *  feriado, día no publicado), retorna el valor del día hábil anterior disponible.
 *  Implementación: búsqueda binaria sobre arrays ordenados ascendentes. */
function lookupICL(fechaIso: string): { fecha: string; valor: number } {
  if (fechaIso < ICL_FECHAS[0]) {
    throw new Error(`No hay datos de ICL antes del ${ICL_FECHAS[0]} (el índice arranca el 01/07/2020)`);
  }
  if (fechaIso > ICL_LAST_UPDATED) {
    // Fecha futura más allá del último dato publicado — devolvemos el último disponible.
    return { fecha: ICL_LAST_UPDATED, valor: ICL_VALORES[ICL_VALORES.length - 1] };
  }
  // Binary search: encontrar el índice más grande con fecha <= fechaIso.
  let lo = 0;
  let hi = ICL_FECHAS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ICL_FECHAS[mid] <= fechaIso) lo = mid;
    else hi = mid - 1;
  }
  return { fecha: ICL_FECHAS[lo], valor: ICL_VALORES[lo] };
}

function validDate(s: string | undefined): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** ISO YYYY-MM-DD → DD/MM/AAAA para mostrarle al usuario. */
function fmtFecha(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export function alquilerIcl(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const numLocale = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-AR';
  const money = (n: number) => '$' + Math.round(n).toLocaleString(numLocale);
  const dec = (n: number, d = 2) =>
    n.toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });

  const T = ({
    es: {
      errValor: 'Ingresá el valor actual del alquiler',
      errFaltan: 'Ingresá las dos fechas (firma y actualización) o, en opciones avanzadas, el coeficiente ICL.',
      errRango:
        'El coeficiente ICL se ve fuera de rango. Debería estar entre 1 y 5 (ratio ICL_actualización / ICL_inicio). No ingreses una tasa mensual ni el valor bruto del ICL.',
      errOrden: 'La fecha de actualización debe ser posterior a la de inicio del contrato',
      detFechas: (cf: string, ci: string, c: string, fa: string, fi: string) =>
        `Coeficiente = ${cf} ÷ ${ci} = ${c}. (ICL del BCRA al ${fa} dividido por el ICL al ${fi}.) Último dato BCRA disponible: ${fmtFecha(ICL_LAST_UPDATED)}.`,
      detManual: (c: string) => `Usaste un coeficiente ICL cargado a mano: ${c}.`,
      insTitle: (a: string, b: string) => `Tu alquiler pasa de ${a} a ${b}`,
      insFechas: (pct: string, coef: string, fi: string, fa: string) =>
        `Es un aumento del **${pct}%** para el período ${fi} → ${fa} (coeficiente ICL **${coef}**). El ICL es el índice oficial del BCRA: combina mitad inflación (IPC) y mitad salarios (RIPTE).`,
      insManual: (pct: string, coef: string) =>
        `Con el coeficiente **${coef}** que cargaste, el aumento es del **${pct}%** sobre el alquiler actual.`,
      chBase: 'Alquiler actual',
      chAumento: 'Aumento ICL',
      chCenter: 'Nuevo',
      chAria: (a: string, b: string) => `Alquiler actual ${a} más el aumento por ICL, total ${b}.`,
    },
    en: {
      errValor: 'Enter the current rent amount',
      errFaltan: 'Enter both dates (signing and update) or, under advanced options, the ICL coefficient.',
      errRango:
        'The ICL coefficient looks out of range. It should be between 1 and 5 (ratio ICL_update / ICL_start). Do not enter a monthly rate or the raw ICL value.',
      errOrden: 'The update date must be after the contract start date',
      detFechas: (cf: string, ci: string, c: string, fa: string, fi: string) =>
        `Coefficient = ${cf} ÷ ${ci} = ${c}. (BCRA ICL on ${fa} divided by the ICL on ${fi}.) Latest BCRA data: ${fmtFecha(ICL_LAST_UPDATED)}.`,
      detManual: (c: string) => `You used a manually entered ICL coefficient: ${c}.`,
      insTitle: (a: string, b: string) => `Your rent goes from ${a} to ${b}`,
      insFechas: (pct: string, coef: string, fi: string, fa: string) =>
        `That's a **${pct}%** increase for the period ${fi} → ${fa} (ICL coefficient **${coef}**). The ICL is the official BCRA index: half inflation (CPI) and half wages (RIPTE).`,
      insManual: (pct: string, coef: string) =>
        `With the **${coef}** coefficient you entered, the increase is **${pct}%** over the current rent.`,
      chBase: 'Current rent',
      chAumento: 'ICL increase',
      chCenter: 'New',
      chAria: (a: string, b: string) => `Current rent ${a} plus the ICL increase, total ${b}.`,
    },
    pt: {
      errValor: 'Informe o valor atual do aluguel',
      errFaltan: 'Informe as duas datas (assinatura e ajuste) ou, em opções avançadas, o coeficiente ICL.',
      errRango:
        'O coeficiente ICL parece fora da faixa. Deveria estar entre 1 e 5 (razão ICL_ajuste / ICL_início). Não informe uma taxa mensal nem o valor bruto do ICL.',
      errOrden: 'A data do ajuste deve ser posterior à data de início do contrato',
      detFechas: (cf: string, ci: string, c: string, fa: string, fi: string) =>
        `Coeficiente = ${cf} ÷ ${ci} = ${c}. (ICL do BCRA em ${fa} dividido pelo ICL em ${fi}.) Último dado BCRA: ${fmtFecha(ICL_LAST_UPDATED)}.`,
      detManual: (c: string) => `Você usou um coeficiente ICL informado manualmente: ${c}.`,
      insTitle: (a: string, b: string) => `Seu aluguel passa de ${a} para ${b}`,
      insFechas: (pct: string, coef: string, fi: string, fa: string) =>
        `É um aumento de **${pct}%** no período ${fi} → ${fa} (coeficiente ICL **${coef}**). O ICL é o índice oficial do BCRA: metade inflação (IPC) e metade salários (RIPTE).`,
      insManual: (pct: string, coef: string) =>
        `Com o coeficiente **${coef}** que você informou, o aumento é de **${pct}%** sobre o aluguel atual.`,
      chBase: 'Aluguel atual',
      chAumento: 'Aumento ICL',
      chCenter: 'Novo',
      chAria: (a: string, b: string) => `Aluguel atual ${a} mais o aumento por ICL, total ${b}.`,
    },
  } as const)[lang];

  const valor = Number(i.valorActual);
  if (!valor || valor <= 0) throw new Error(T.errValor);

  let coefUsado: number;
  let iclInicio = 0;
  let iclActualizacion = 0;
  let fechaInicioUsada = '';
  let fechaActualizacionUsada = '';
  let modoManual = false;

  // El form manda '' (string vacío) para los opcionales sin completar; Number('')=0,
  // así que el guard trata ''/0/NaN/undefined como "sin coeficiente manual".
  const coefManual = Number(i.coeficienteICL);
  const tieneManual = String(i.coeficienteICL ?? '').trim() !== '' && Number.isFinite(coefManual) && coefManual > 0;

  // Modo manual (avanzado) tiene prioridad: si cargaste un coeficiente, pisa las fechas.
  if (tieneManual) {
    coefUsado = coefManual;
    // Guard contra error típico (usuario pone tasa mensual o ICL bruto).
    if (coefUsado < 0.5 || coefUsado > 50) throw new Error(T.errRango);
    modoManual = true;
  }
  // Modo automático (default): fechas → lookup en la tabla del BCRA.
  else if (validDate(i.fechaInicio) && validDate(i.fechaActualizacion)) {
    if (i.fechaInicio > i.fechaActualizacion) throw new Error(T.errOrden);
    const ini = lookupICL(i.fechaInicio);
    const fin = lookupICL(i.fechaActualizacion);
    iclInicio = ini.valor;
    iclActualizacion = fin.valor;
    fechaInicioUsada = ini.fecha;
    fechaActualizacionUsada = fin.fecha;
    coefUsado = fin.valor / ini.valor;
  } else {
    throw new Error(T.errFaltan);
  }

  const valorR = Math.round(valor);
  const actualizado = Math.round(valor * coefUsado);
  const incremento = actualizado - valorR;
  const porcentaje = (coefUsado - 1) * 100;
  const pctStr = dec(Math.abs(porcentaje), 2);
  const coefStr = dec(coefUsado, 4);

  const detalle = modoManual
    ? T.detManual(coefStr)
    : T.detFechas(
        dec(iclActualizacion, 4),
        dec(iclInicio, 4),
        coefStr,
        fmtFecha(fechaActualizacionUsada),
        fmtFecha(fechaInicioUsada)
      );

  const insight = {
    title: T.insTitle(money(valorR), money(actualizado)),
    text: modoManual
      ? T.insManual(pctStr, coefStr)
      : T.insFechas(pctStr, coefStr, fmtFecha(fechaInicioUsada), fmtFecha(fechaActualizacionUsada)),
    tone: 'neutral' as const,
    icon: '🏠',
  };

  // Donut: parte "alquiler actual" + parte "aumento" → el centro muestra el nuevo total.
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.chBase, value: valorR },
      { label: T.chAumento, value: Math.max(0, incremento) },
    ],
    prefix: '$',
    centerValue: money(actualizado),
    centerLabel: T.chCenter,
    ariaLabel: T.chAria(money(valorR), money(actualizado)),
  };

  return {
    valorActualizado: actualizado,
    incremento,
    aumentoPorcentual: Number(porcentaje.toFixed(2)),
    coeficienteUsado: Number(coefUsado.toFixed(4)),
    iclInicio: Number(iclInicio.toFixed(4)),
    iclActualizacion: Number(iclActualizacion.toFixed(4)),
    fechaInicioUsada,
    fechaActualizacionUsada,
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
