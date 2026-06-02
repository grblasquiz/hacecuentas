/**
 * IRPF — Dedução de contribuição a PGBL
 * Lei 9.250/1995 + Lei 9.532/1997: contribuições a PGBL são
 * dedutíveis até 12% da renda tributável anual do titular.
 * VGBL NÃO é dedutível (tributação só sobre rendimento no resgate).
 * Só vale na declaração completa e para quem contribui ao INSS/RPPS.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const LIMITE_PERC = 0.12;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeducaoPgbl(i: Inputs): Outputs {
  const rendaTributavel = Number(i.rendaTributavel) || 0;
  const aportePgbl = Number(i.aportePgbl) || 0;
  const aliq = (Number(i.aliquotaMarginal) || 27.5) / 100;

  const limite = rendaTributavel * LIMITE_PERC;
  const dedutivel = Math.min(aportePgbl, limite);
  const excedente = Math.max(0, aportePgbl - limite);
  const economiaIR = dedutivel * aliq;
  const aporteIdeal = limite;
  const margem = Math.max(0, limite - aportePgbl);

  const _insight = excedente > 0
    ? {
        title: 'Parte do aporte não deduz',
        text: `Do seu aporte de ${fmt(aportePgbl)}, só **${fmt(dedutivel)}** entram na dedução (teto de 12%). Os **${fmt(excedente)}** que sobram não reduzem IR — esse excedente renderia melhor num **VGBL**. A economia real fica em **${fmt(economiaIR)}**.`,
        tone: 'warn',
        icon: '⚠️',
      }
    : {
        title: 'Aporte 100% dedutível',
        text: `Seu aporte de ${fmt(aportePgbl)} está dentro do teto de 12% (${fmt(limite)}) e é **totalmente dedutível**, gerando **${fmt(economiaIR)}** de economia no IR. Você ainda tem **${fmt(margem)}** de margem para aportar este ano sem perder o benefício.`,
        tone: 'good',
        icon: '✅',
      };

  const out: Outputs = {
    limite12Percent: fmt(limite),
    dedutivel: fmt(dedutivel),
    excedenteNaoDedutivel: fmt(excedente),
    economiaIR: fmt(economiaIR),
    aporteIdeal: fmt(aporteIdeal),
    resumo: excedente > 0
      ? `Aporte ${fmt(aportePgbl)} excede o limite 12% (${fmt(limite)}). Dedutível: ${fmt(dedutivel)}. O excedente (${fmt(excedente)}) seria melhor em VGBL. Economia IR: ${fmt(economiaIR)}.`
      : `Aporte ${fmt(aportePgbl)} dentro do limite 12% (${fmt(limite)}) — totalmente dedutível. Ainda sobram ${fmt(limite - aportePgbl)} de margem. Economia IR na alíquota de ${(aliq * 100).toFixed(1)}%: ${fmt(economiaIR)}.`,
    _insight,
  };

  // Donut só quando há excedente (aporte = parte dedutível + parte não-dedutível)
  if (aportePgbl > 0 && excedente > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Dedutível (12%)', value: Math.round(dedutivel) },
        { label: 'Excedente (não deduz)', value: Math.round(excedente) },
      ],
      prefix: 'R$ ',
      centerValue: fmt(aportePgbl),
      centerLabel: 'Aporte PGBL',
      ariaLabel: 'Composição do aporte ao PGBL: parte dedutível dentro do teto de 12% e excedente não-dedutível',
    };
  }

  return out;
}
