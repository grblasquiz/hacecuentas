/**
 * Salário mínimo em Portugal 2026 (RMMG) → valor/hora, mensal líquido e comparativos.
 * RMMG = 920 €/mês × 14 meses. Valor/hora (art. 271.º CT) = RMMG × 12 ÷ (52 × horas/semana).
 * Calcula também o líquido (− 11 % SS; isento de IRS no SMN) e o proporcional por carga horária.
 * Tudo a partir de portugal-2026.ts (RMMG, helpers de SS e salário líquido).
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  salarioLiquido,
} from '../data/portugal-2026.ts';

export interface Inputs {
  horasSemana?: number; // jornada semanal (default 40)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

// Valor/hora a partir da RMMG e da carga horária semanal (art. 271.º CT).
function valorHora(rmmgMensal: number, horasSemana: number): number {
  return (rmmgMensal * 12) / (52 * horasSemana);
}

export function calculadoraSalarioMinimoPortugalHora(i: Inputs): Outputs {
  const horasSemana = Math.max(1, Math.min(60, Number(i.horasSemana) || PORTUGAL_2026.rmmg.horasSemanaPadrao));

  const rmmg = PORTUGAL_2026.rmmg;
  const mensalBruto = rmmg.mensal;            // 920 € (jornada completa)
  const anualBruto = rmmg.anual;              // 12.880 €

  const hora40 = valorHora(mensalBruto, 40);
  const hora35 = valorHora(mensalBruto, 35);
  const horaEscolhida = valorHora(mensalBruto, horasSemana);

  // Para a jornada escolhida, o salário mensal é proporcional (full = 40h padrão legal).
  const mensalProporcional = mensalBruto * (horasSemana / 40);

  // Líquido mensal: quem ganha o SMN não tem retenção de IRS (mínimo de existência),
  // só desconta 11 % de Segurança Social.
  const liq = salarioLiquido(mensalBruto, rmmg.meses, 0);

  // Part-time exemplos (20h e 30h) — valor mensal proporcional.
  const ptMensal20 = mensalBruto * (20 / 40);
  const ptMensal30 = mensalBruto * (30 / 40);

  const horaStr = (h: number) => fmtEUR(Math.round(h * 100) / 100);

  const _insight = {
    title: 'Salário mínimo: 920 €/mês, mas pago 14 vezes',
    text: `A RMMG em 2026 é **${fmtEUR(mensalBruto)}/mês**, paga **14 vezes** (subsídios de férias e Natal incluídos) = **${fmtEUR(anualBruto)}/ano**. ` +
      `A **${horasSemana}h/semana**, o valor/hora é **${horaStr(horaEscolhida)}**. ` +
      `Quem ganha o mínimo **não paga IRS** (mínimo de existência), só desconta 11 % de Segurança Social: o líquido fica em **${fmtEUR(liq.liquido)}/mês**.`,
    tone: 'good',
    icon: '💶',
  };

  const _table = {
    title: 'Salário mínimo por carga horária — Portugal 2026',
    headers: ['Jornada', 'Valor/hora', 'Salário mensal'],
    rows: [
      ['40 h/semana (completa)', horaStr(hora40), fmtEUR(mensalBruto)],
      ['35 h/semana', horaStr(hora35), fmtEUR(mensalBruto)],
      ['30 h/semana (part-time)', horaStr(valorHora(mensalBruto, 30)), fmtEUR(ptMensal30)],
      ['20 h/semana (part-time)', horaStr(valorHora(mensalBruto, 20)), fmtEUR(ptMensal20)],
      [`${horasSemana} h/semana (escolhida)`, horaStr(horaEscolhida), fmtEUR(mensalProporcional)],
    ],
    note: 'Jornada completa (35 ou 40 h) garante a RMMG cheia (920 €); a part-time o salário é proporcional. Valor/hora = RMMG × 12 ÷ (52 × horas/semana), art. 271.º do Código do Trabalho.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(liq.liquido) },
      { label: 'Segurança Social (11 %)', value: Math.round(liq.segSocial) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(liq.liquido),
    centerLabel: 'Líquido/mês',
    ariaLabel: `Salário mínimo 920 € bruto: líquido ${fmtEUR(liq.liquido)} após 11 % de Segurança Social.`,
  };

  return {
    valorHora: horaStr(horaEscolhida),
    mensalBruto: fmtEUR(mensalBruto),
    mensalLiquido: fmtEUR(liq.liquido),
    anualBruto: `${fmtEUR(anualBruto)} (14 meses)`,
    hora40h: horaStr(hora40),
    hora35h: horaStr(hora35),
    detalhe: `RMMG ${fmtEUR(mensalBruto)}/mês (×14 = ${fmtEUR(anualBruto)}/ano). A ${horasSemana}h/semana → ${horaStr(horaEscolhida)}/hora. Líquido ${fmtEUR(liq.liquido)}/mês (só −11 % SS, sem IRS).`,
    _insight,
    _table,
    _chart,
  };
}
