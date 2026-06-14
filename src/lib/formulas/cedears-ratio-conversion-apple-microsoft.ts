/**
 * Calculadora de conversión CEDEAR ↔ acción (Apple, Microsoft y otros).
 *
 * Precio teórico del CEDEAR en ARS = (precio de la acción en USD × CCL) / ratio
 *   - ratio = cantidad de CEDEARs que equivalen a 1 acción (AAPL 20, MSFT 30, etc.)
 *   - CCL = dólar contado con liquidación (ARS/USD) que está implícito en los CEDEARs.
 * Además: cuántos CEDEARs equivalen a 1 acción y el valor en USD/ARS de una
 * cantidad de CEDEARs si el usuario la ingresa.
 */
export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function cedearsRatioConversionAppleMicrosoft(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const precioUSD = Number(i.precioUSD) || 0;
  const ratio = Math.round(Number(i.ratio) || 0);
  const ccl = Number(i.ccl) || 0;
  // cantidad puede venir como '' (campo opcional vacío); tratar como 0.
  const cantidadRaw = i.cantidad;
  const cantidad = (cantidadRaw === '' || cantidadRaw == null) ? 0 : Number(cantidadRaw) || 0;

  if (precioUSD <= 0 || ratio <= 0 || ccl <= 0) {
    const err = __lang === 'en'
      ? 'Enter the share price (USD), the conversion ratio and the CCL FX rate.'
      : __lang === 'pt'
      ? 'Informe o preço da ação (USD), a razão de conversão e o câmbio CCL.'
      : 'Ingresá el precio de la acción (USD), el ratio de conversión y el dólar CCL.';
    throw new Error(err);
  }

  // Precio teórico de 1 CEDEAR en ARS.
  const precioCedearARS = (precioUSD * ccl) / ratio;
  // Valor en USD de 1 CEDEAR (fracción de acción).
  const valorCedearUSD = precioUSD / ratio;

  const locale = __lang === 'en' ? 'en-US' : __lang === 'pt' ? 'pt-BR' : 'es-AR';
  const sym = __lang === 'en' ? '$' : __lang === 'pt' ? 'R$' : '$';
  const fmtARS = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 0 });
  const fmtUSD = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Bloque opcional: valor de una cantidad de CEDEARs.
  let detalleCantidad = '';
  if (cantidad > 0) {
    const accionesEquiv = cantidad / ratio;
    const valorTotalARS = cantidad * precioCedearARS;
    const valorTotalUSD = accionesEquiv * precioUSD;
    detalleCantidad = __lang === 'en'
      ? ` Your ${cantidad} CEDEARs = ${accionesEquiv.toFixed(4)} shares = USD ${fmtUSD(valorTotalUSD)} (ARS ${fmtARS(valorTotalARS)}).`
      : __lang === 'pt'
      ? ` Seus ${cantidad} CEDEARs = ${accionesEquiv.toFixed(4)} ações = USD ${fmtUSD(valorTotalUSD)} (ARS ${fmtARS(valorTotalARS)}).`
      : ` Tus ${cantidad} CEDEARs = ${accionesEquiv.toFixed(4)} acciones = USD ${fmtUSD(valorTotalUSD)} (ARS ${fmtARS(valorTotalARS)}).`;
  }

  const resumen = __lang === 'en'
    ? `1 CEDEAR ≈ ${sym}${fmtARS(precioCedearARS)} (USD ${fmtUSD(valorCedearUSD)}). ${ratio} CEDEARs = 1 share. Ratio ${ratio}:1, stock USD ${fmtUSD(precioUSD)}, CCL ${sym}${fmtARS(ccl)}.${detalleCantidad}`
    : __lang === 'pt'
    ? `1 CEDEAR ≈ ${sym}${fmtARS(precioCedearARS)} (USD ${fmtUSD(valorCedearUSD)}). ${ratio} CEDEARs = 1 ação. Razão ${ratio}:1, ação USD ${fmtUSD(precioUSD)}, CCL ${sym}${fmtARS(ccl)}.${detalleCantidad}`
    : `1 CEDEAR ≈ ${sym}${fmtARS(precioCedearARS)} (USD ${fmtUSD(valorCedearUSD)}). ${ratio} CEDEARs = 1 acción. Ratio ${ratio}:1, acción USD ${fmtUSD(precioUSD)}, CCL ${sym}${fmtARS(ccl)}.${detalleCantidad}`;

  const _insight = __lang === 'en'
    ? {
        title: 'CEDEAR price and share equivalence',
        text: `At a stock price of USD ${fmtUSD(precioUSD)}, a ${ratio}:1 ratio and a CCL of ${sym}${fmtARS(ccl)}, one CEDEAR is worth **${sym}${fmtARS(precioCedearARS)}**. You need **${ratio} CEDEARs to replicate 1 full share**, and each CEDEAR represents **USD ${fmtUSD(valorCedearUSD)}** of the underlying.`,
        tone: 'neutral',
        icon: '📈',
      }
    : __lang === 'pt'
    ? {
        title: 'Preço do CEDEAR e equivalência de ações',
        text: `Com a ação a USD ${fmtUSD(precioUSD)}, razão ${ratio}:1 e CCL de ${sym}${fmtARS(ccl)}, um CEDEAR vale **${sym}${fmtARS(precioCedearARS)}**. Você precisa de **${ratio} CEDEARs para replicar 1 ação inteira**, e cada CEDEAR representa **USD ${fmtUSD(valorCedearUSD)}** do ativo subjacente.`,
        tone: 'neutral',
        icon: '📈',
      }
    : {
        title: 'Precio del CEDEAR y equivalencia en acciones',
        text: `Con la acción a USD ${fmtUSD(precioUSD)}, ratio ${ratio}:1 y un CCL de ${sym}${fmtARS(ccl)}, un CEDEAR vale **${sym}${fmtARS(precioCedearARS)}**. Necesitás **${ratio} CEDEARs para replicar 1 acción completa**, y cada CEDEAR representa **USD ${fmtUSD(valorCedearUSD)}** del subyacente.`,
        tone: 'neutral',
        icon: '📈',
      };

  return {
    resultado: `${sym}${fmtARS(precioCedearARS)}`,
    resumen,
    _insight,
  };
}
