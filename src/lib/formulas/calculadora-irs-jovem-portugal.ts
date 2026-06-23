/**
 * IRS Jovem 2026 (Portugal) — poupança de IRS para jovens até aos 35 anos.
 * Isenção parcial do rendimento de trabalho (Cat. A/B): 100 % no 1.º ano,
 * 75 % nos anos 2–4, 50 % nos anos 5–7, 25 % nos anos 8–10 (máx. 10 anos).
 * Limite anual do rendimento isento = 55 × IAS. Compara IRS com vs sem benefício.
 * Usa irsTrabalhoDependenteAnual + constantes de portugal-2026.ts.
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  irsTrabalhoDependenteAnual,
  segSocialTrabalhador,
} from '../data/portugal-2026.ts';

export interface Inputs {
  salarioBrutoAnual: number; // rendimento bruto anual (Cat. A)
  anoElegibilidade?: string; // '1' | '2-4' | '5-7' | '8-10'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

// Mapeia o ano de obtenção de rendimentos para a fração de isenção.
function isencaoDoAno(ano: string): { isencao: number; label: string } {
  switch (String(ano)) {
    case '1': return { isencao: 1.0, label: '1.º ano (100 %)' };
    case '5-7': return { isencao: 0.5, label: 'Anos 5 a 7 (50 %)' };
    case '8-10': return { isencao: 0.25, label: 'Anos 8 a 10 (25 %)' };
    case '2-4':
    default: return { isencao: 0.75, label: 'Anos 2 a 4 (75 %)' };
  }
}

export function calculadoraIrsJovemPortugal(i: Inputs): Outputs {
  const brutoAnual = Math.max(0, Number(i.salarioBrutoAnual) || 0);
  if (brutoAnual <= 0) throw new Error('Indique o salário bruto anual');

  const { isencao, label } = isencaoDoAno(i.anoElegibilidade || '2-4');

  const j = PORTUGAL_2026.irsJovem;

  // Contribuições à SS (11 %) usadas como dedução específica no cálculo do IRS.
  const ssAnual = segSocialTrabalhador(brutoAnual / 14) * 14;

  const irsSem = irsTrabalhoDependenteAnual(brutoAnual, ssAnual, 0);
  const irsCom = irsTrabalhoDependenteAnual(brutoAnual, ssAnual, isencao);
  const poupanca = Math.max(0, irsSem - irsCom);

  // Parte do rendimento efetivamente isenta (com o tope 55 × IAS).
  const rendimentoIsento = Math.min(brutoAnual * isencao, j.limiteIsencaoAnual);
  const atingiuTope = brutoAnual * isencao > j.limiteIsencaoAnual;

  const poupancaMensal = poupanca / 14;
  const poupancaPctStr = irsSem > 0 ? ((poupanca / irsSem) * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 }) : '0';

  const _insight = {
    title: 'IRS Jovem: quanto poupa',
    text: `Com um bruto anual de **${fmtEUR(brutoAnual)}** no **${label}**, fica isento de IRS sobre **${fmtEUR(rendimentoIsento)}** ` +
      `(o limite anual é 55 × IAS = ${fmtEUR(j.limiteIsencaoAnual)}). ` +
      `O IRS desce de **${fmtEUR(irsSem)}** para **${fmtEUR(irsCom)}** — uma poupança de **${fmtEUR(poupanca)}/ano** (~${fmtEUR(poupancaMensal)}/mês, ${poupancaPctStr}% menos IRS).` +
      (atingiuTope ? ' Já está no tope: acima de 55 × IAS, o excedente não beneficia da isenção.' : ''),
    tone: 'good',
    icon: '🧑‍🎓',
  };

  const _table = {
    title: 'IRS com vs sem IRS Jovem',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Salário bruto anual', fmtEUR(brutoAnual)],
      ['Ano de elegibilidade', label],
      ['Rendimento isento (tope 55×IAS)', fmtEUR(rendimentoIsento)],
      ['IRS sem IRS Jovem', fmtEUR(irsSem)],
      ['IRS com IRS Jovem', fmtEUR(irsCom)],
      ['Poupança anual', fmtEUR(poupanca)],
      ['Poupança mensal (÷14)', fmtEUR(poupancaMensal)],
    ],
    note: `Regime para jovens até aos ${j.idadeMaxima} anos, máximo ${j.anosMaximos} anos. Isenção: 100 % (1.º ano), 75 % (2–4), 50 % (5–7), 25 % (8–10). Limite anual isento: 55 × IAS = ${fmtEUR(j.limiteIsencaoAnual)} (2026).`,
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'IRS a pagar', value: Math.round(irsCom) },
      { label: 'Poupança IRS Jovem', value: Math.round(poupanca) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(poupanca),
    centerLabel: 'Poupança/ano',
    ariaLabel: `IRS sem benefício ${fmtEUR(irsSem)}, com IRS Jovem ${fmtEUR(irsCom)}: poupa ${fmtEUR(poupanca)} por ano.`,
  };

  return {
    poupanca: fmtEUR(poupanca),
    irsSem: fmtEUR(irsSem),
    irsCom: fmtEUR(irsCom),
    rendimentoIsento: fmtEUR(rendimentoIsento),
    poupancaMensal: fmtEUR(poupancaMensal),
    detalhe: `${label}: IRS desce de ${fmtEUR(irsSem)} para ${fmtEUR(irsCom)} → poupa ${fmtEUR(poupanca)}/ano (${fmtEUR(poupancaMensal)}/mês). Isento sobre ${fmtEUR(rendimentoIsento)}.`,
    _insight,
    _table,
    _chart,
  };
}
