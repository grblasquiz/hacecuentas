export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function copomTasaReferenciaBancoCentralImpacto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const monto = Number(i.monto) || 0;
  const meses = Number(i.plazo) || 12;
  const selicAnual = Number(i.tasa) || 0; // Selic % anual (COPOM, Banco Central do Brasil)

  // Tasa Selic mensual equivalente (capitalización compuesta) y rendimiento compuesto
  const tasaMensual = Math.pow(1 + selicAnual / 100, 1 / 12) - 1;
  const importeFinalCompuesto = monto * Math.pow(1 + tasaMensual, meses);
  const rendimientoCompuesto = importeFinalCompuesto - monto;

  // Rendimiento simple (proporcional al plazo) como referencia comparativa
  const rendimientoSimple = monto * (selicAnual / 100) * (meses / 12);
  const importeFinalSimple = monto + rendimientoSimple;

  const fmtBRL = (n: number) =>
    'R$ ' + n.toLocaleString(__lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n: number) => n.toLocaleString(__lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  const resumen = __lang === 'en'
    ? `${fmtBRL(monto)} at a Selic rate of ${fmtPct(selicAnual)} per year over ${meses} months yields ${fmtBRL(rendimientoCompuesto)} (compound), ending at ${fmtBRL(importeFinalCompuesto)}.`
    : `${fmtBRL(monto)} a una tasa Selic de ${fmtPct(selicAnual)} anual durante ${meses} meses rinde ${fmtBRL(rendimientoCompuesto)} (compuesto), terminando en ${fmtBRL(importeFinalCompuesto)}.`;

  const _insight = __lang === 'en'
    ? {
        title: 'Selic impact (Brazil)',
        text: `The Selic rate is set by the COPOM of the Banco Central do Brasil. At **${fmtPct(selicAnual)}** per year, **${fmtBRL(monto)}** grows to **${fmtBRL(importeFinalCompuesto)}** in **${meses}** months — a return of **${fmtBRL(rendimientoCompuesto)}** with monthly compounding. Simple interest would yield **${fmtBRL(rendimientoSimple)}**. This is gross (before income tax / IR).`,
        tone: 'positive',
        icon: '🏦',
      }
    : {
        title: 'Impacto de la Selic (Brasil)',
        text: `La tasa Selic la fija el COPOM del Banco Central do Brasil. Con **${fmtPct(selicAnual)}** anual, **${fmtBRL(monto)}** crece hasta **${fmtBRL(importeFinalCompuesto)}** en **${meses}** meses — un rendimiento de **${fmtBRL(rendimientoCompuesto)}** con capitalización mensual. El interés simple rendiría **${fmtBRL(rendimientoSimple)}**. Es bruto (antes del impuesto a la renta / IR).`,
        tone: 'positive',
        icon: '🏦',
      };

  return {
    resultado: fmtBRL(importeFinalCompuesto),
    rendimiento: fmtBRL(rendimientoCompuesto),
    importeFinalSimple: fmtBRL(importeFinalSimple),
    rendimientoSimple: fmtBRL(rendimientoSimple),
    resumen,
    _insight,
  };
}
