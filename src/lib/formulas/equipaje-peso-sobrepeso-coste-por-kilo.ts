/**
 * Calculadora de sobrepeso de equipaje — costo por kilo extra
 *
 * Fórmula estándar aplicada por aerolíneas globales (IATA policy):
 *   Kilos extra = max(0, Peso real − Franquicia incluida)
 *   Costo total = Kilos extra × Tarifa por kilo
 *
 * Fuente: IATA Resolution 302, Excess Baggage Charges (2024);
 *         Condiciones Generales de Transporte de aerolíneas IATA-adheridas.
 */

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

const T: Record<string, (r: number, e: number, f: number, t: number, m: string) => string> = {
  es: (r, e, f, t, m) =>
    e <= 0
      ? `Tu valija (${f} kg) está dentro del límite permitido. No hay cargo por sobrepeso.`
      : `Tenés **${e} kg de sobrepeso** (${f} kg real − ${Math.round(f - e)} kg franquicia). El cargo estimado es **${m}${r.toFixed(2)}** (${e} kg × ${m}${t}/kg).`,
  en: (r, e, f, t, m) =>
    e <= 0
      ? `Your bag (${f} kg) is within the allowed limit. No overweight charge applies.`
      : `You have **${e} kg of excess** (${f} kg actual − ${Math.round(f - e)} kg allowance). Estimated charge: **${m}${r.toFixed(2)}** (${e} kg × ${m}${t}/kg).`,
  pt: (r, e, f, t, m) =>
    e <= 0
      ? `Sua bagagem (${f} kg) está dentro do limite permitido. Nenhuma taxa de excesso se aplica.`
      : `Você tem **${e} kg de excesso** (${f} kg real − ${Math.round(f - e)} kg franquia). Custo estimado: **${m}${r.toFixed(2)}** (${e} kg × ${m}${t}/kg).`,
};

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: 'USD ',
  EUR: 'EUR ',
  ARS: '$',
  BRL: 'R$ ',
  CLP: 'CLP ',
  COP: 'COP ',
  MXN: 'MXN ',
};

export function equipajePesoSobrepesoCostePorKilo(i: Inputs): Outputs {
  const lang = String(i.__lang || 'es');

  const pesoReal = Math.max(0, Number(i.pesoReal) || 0);
  const franquiciaKg = Math.max(0, Number(i.franquiciaKg) || 0);
  const tarifaPorKg = Math.max(0, Number(i.tarifaPorKg) || 0);
  const moneda = String(i.moneda || 'USD');
  const monedaLabel = CURRENCY_SYMBOL[moneda] ?? `${moneda} `;

  const kilosExtra = Math.max(0, pesoReal - franquiciaKg);
  const costoTotal = kilosExtra * tarifaPorKg;

  // Round to 2 decimals for display
  const kilosExtraFmt = parseFloat(kilosExtra.toFixed(2));
  const costoFmt = costoTotal.toFixed(2);

  const isNoOverweight = kilosExtra <= 0;

  // Localized summary text
  const resumenFn = T[lang] ?? T.es;
  const resumen = resumenFn(costoTotal, kilosExtraFmt, pesoReal, tarifaPorKg, monedaLabel);

  // Online vs counter savings (typically 30–50% cheaper online)
  const ahorroOnline = Math.round(costoTotal * 0.4 * 100) / 100;

  const _insight = isNoOverweight
    ? {
        title: lang === 'en' ? 'No overweight' : lang === 'pt' ? 'Sem excesso' : 'Sin sobrepeso',
        text:
          lang === 'en'
            ? `Your baggage (${pesoReal} kg) is within the **${franquiciaKg} kg** allowance — no extra charge. You have ${(franquiciaKg - pesoReal).toFixed(1)} kg of margin left.`
            : lang === 'pt'
            ? `Sua bagagem (${pesoReal} kg) está dentro da franquia de **${franquiciaKg} kg** — sem cobrança extra. Você tem ${(franquiciaKg - pesoReal).toFixed(1)} kg de margem.`
            : `Tu valija (${pesoReal} kg) entra dentro de la franquicia de **${franquiciaKg} kg** — sin cargo extra. Te sobran ${(franquiciaKg - pesoReal).toFixed(1)} kg de margen.`,
        tone: 'good',
        icon: '✅',
      }
    : {
        title:
          lang === 'en'
            ? 'Overweight charge'
            : lang === 'pt'
            ? 'Taxa de excesso de bagagem'
            : 'Cargo por sobrepeso',
        text:
          lang === 'en'
            ? `You exceed the limit by **${kilosExtraFmt} kg**. The overweight fee is **${monedaLabel}${costoFmt}**. Paying online in advance typically saves around **${monedaLabel}${ahorroOnline.toFixed(2)}** (≈40%) vs paying at the counter.`
            : lang === 'pt'
            ? `Você excede o limite em **${kilosExtraFmt} kg**. A taxa de excesso é **${monedaLabel}${costoFmt}**. Pagar online antecipado costuma economizar cerca de **${monedaLabel}${ahorroOnline.toFixed(2)}** (≈40%) vs balcão.`
            : `Excedés el límite en **${kilosExtraFmt} kg**. El cargo por sobrepeso es **${monedaLabel}${costoFmt}**. Pagarlo online por anticipado suele ahorrarte alrededor de **${monedaLabel}${ahorroOnline.toFixed(2)}** (≈40 %) frente al mostrador.`,
        tone: 'warn',
        icon: '⚖️',
      };

  return {
    kilosExtra: kilosExtraFmt.toFixed(2),
    costoTotal: costoFmt,
    resumen,
    _insight,
  };
}
