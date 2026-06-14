export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function bonosAl30Al35Al41RendimientoAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs (deben coincidir con los `id` de fields del JSON):
  // precioCompra = precio de compra del bono (USD, sobre 100 de VN)
  // valorFinal   = valor nominal/residual a cobrar al vencimiento (USD)
  // cuponAnual   = renta/cupón anual en USD
  // anios        = años hasta el vencimiento
  const precio = Number(i.precioCompra) || 0;
  const valorFinal = Number(i.valorFinal) || 0;
  const cupon = Number(i.cuponAnual) || 0;
  const anios = Math.max(0.0001, Number(i.anios) || 1);

  // Current yield = cupón / precio
  const currentYield = precio > 0 ? (cupon / precio) * 100 : 0;

  // Cupones totales cobrados a lo largo de la vida
  const cuponesTotales = cupon * anios;

  // Ganancia/pérdida de capital al vencimiento
  const gananciaCapital = valorFinal - precio;

  // Rendimiento total simple anualizado:
  // ((valorFinal + cupones − precio) / precio) / años
  const rendimientoAnual = precio > 0
    ? (((valorFinal + cuponesTotales - precio) / precio) / anios) * 100
    : 0;

  // Rendimiento total acumulado (no anualizado), informativo
  const rendimientoTotal = precio > 0
    ? ((valorFinal + cuponesTotales - precio) / precio) * 100
    : 0;

  const fmtPct = (n: number) => `${n.toFixed(2)}%`;
  const fmtUSD = (n: number) => 'USD ' + (Math.round(n * 100) / 100).toLocaleString('es-AR');

  const resumen = __lang === 'en'
    ? `Buying at ${fmtUSD(precio)} with a ${fmtUSD(cupon)} annual coupon, holding ${anios} year(s) to collect ${fmtUSD(valorFinal)}: ~${fmtPct(rendimientoAnual)} annualized simple return in USD.`
    : `Comprando a ${fmtUSD(precio)} con cupón anual de ${fmtUSD(cupon)} y manteniendo ${anios} año(s) hasta cobrar ${fmtUSD(valorFinal)}: rinde ~${fmtPct(rendimientoAnual)} anual simple en USD.`;

  // --- Insight: la TIR/rendimiento alto en estos bonos es prima de riesgo ---
  const upside = precio > 0 ? (gananciaCapital / precio) * 100 : 0;
  const tone = rendimientoAnual >= 15 ? 'warn' : rendimientoAnual >= 8 ? 'neutral' : 'good';
  const _insight = {
    title: __lang === 'en' ? 'High return = priced-in risk' : 'Rendimiento alto = riesgo en el precio',
    text: __lang === 'en'
      ? `Buying at **${fmtUSD(precio)}** gives a current yield of **${fmtPct(currentYield)}** from the coupon alone${gananciaCapital !== 0 ? `, plus a **${fmtUSD(gananciaCapital)}** capital ${gananciaCapital > 0 ? 'gain' : 'loss'} (${upside.toFixed(0)}%) at maturity` : ''}. The total annualized simple return targets **~${fmtPct(rendimientoAnual)} in USD** — a double-digit figure reflects default risk already priced in; it only materializes if Argentina honors AL30/AL35/AL41.`
      : `Comprar a **${fmtUSD(precio)}** da un rendimiento corriente de **${fmtPct(currentYield)}** solo por el cupón${gananciaCapital !== 0 ? `, más una ${gananciaCapital > 0 ? 'ganancia' : 'pérdida'} de capital de **${fmtUSD(gananciaCapital)}** (${upside.toFixed(0)}%) al vencimiento` : ''}. El rendimiento total anualizado simple apunta a **~${fmtPct(rendimientoAnual)} en USD**: una cifra de dos dígitos refleja riesgo de default ya descontado; solo se concreta si Argentina cumple con el AL30/AL35/AL41.`,
    tone,
    icon: '🇦🇷'
  };

  // --- Gráfico: composición del retorno total (cupones + ganancia de capital) ---
  const _chart = (cuponesTotales > 0 || gananciaCapital > 0) ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Coupons' : 'Cupones', value: Math.max(0, Math.round(cuponesTotales)) },
      { label: __lang === 'en' ? 'Capital gain' : 'Ganancia de capital', value: Math.max(0, Math.round(gananciaCapital)) }
    ],
    prefix: 'USD ',
    centerValue: fmtPct(rendimientoTotal),
    centerLabel: __lang === 'en' ? 'Total return' : 'Retorno total',
    ariaLabel: __lang === 'en'
      ? `Composition of the total return: coupons collected and capital gain at maturity.`
      : `Composición del retorno total: cupones cobrados y ganancia de capital al vencimiento.`
  } : undefined;

  return {
    rendimientoAnual: fmtPct(rendimientoAnual),
    currentYield: fmtPct(currentYield),
    resumen,
    _insight,
    _chart
  };
}
