export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function desalojoCausaPlazosHonorariosJuicio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const c=String(i.causa||'fp');
  const t: Record<string, Record<string,string>> = {
    fp:   { es: '6-18 meses',  en: '6-18 months',  pt: '6-18 meses' },
    venc: { es: '3-8 meses',   en: '3-8 months',   pt: '3-8 meses' },
    incu: { es: '8-24 meses',  en: '8-24 months',  pt: '8-24 meses' },
  };
  const causaLabel: Record<string, Record<string,string>> = {
    fp:   { es: 'falta de pago',           en: 'non-payment',            pt: 'falta de pagamento' },
    venc: { es: 'vencimiento de contrato', en: 'contract expiry',        pt: 'vencimento do contrato' },
    incu: { es: 'incumplimiento',          en: 'breach of contract',     pt: 'descumprimento' },
  };
  const tiempo = (t[c] ?? t.fp)[__lang];
  const honorarios = __lang === 'en' ? '15-25% of rent value' : __lang === 'pt' ? '15-25% do valor locativo' : '15-25% valor locativo';
  const lbl = (causaLabel[c] ?? causaLabel.fp)[__lang];
  const _insight = {
    title: __lang === 'en' ? 'How long and how much an eviction takes' : __lang === 'pt' ? 'Quanto tempo e quanto custa um despejo' : 'Cuánto tarda y cuánto cuesta un desalojo',
    text: __lang === 'en'
      ? `An eviction for **${lbl}** typically takes **${tiempo}** in court, plus legal fees of about **15-25% of the rent value**. Times vary by jurisdiction and court backlog.`
      : __lang === 'pt'
      ? `Um despejo por **${lbl}** costuma levar **${tiempo}** na Justiça, mais honorários advocatícios de cerca de **15-25% do valor locativo**. Os prazos variam por jurisdição e congestionamento.`
      : `Un desalojo por **${lbl}** suele demorar **${tiempo}** en la Justicia, más honorarios de aproximadamente **15-25% del valor locativo**. Los plazos varían según la jurisdicción y la saturación de los juzgados.`,
    tone: 'warn',
    icon: '⚖️',
  };
  const resumen = __lang === 'en'
    ? `Eviction ${c}: ${tiempo}, legal fees 15-25% of value.`
    : __lang === 'pt'
    ? `Despejo ${c}: ${(t[c]||t.fp)['pt']}, honorários advocatícios 15-25% do valor.`
    : `Desalojo ${c}: ${(t[c]||t.fp)['es']}, honorarios 15-25% del valor.`;
  return { tiempo, honorarios, resumen, _insight };
}
