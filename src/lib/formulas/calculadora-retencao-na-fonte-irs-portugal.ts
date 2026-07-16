/**
 * Retenção na fonte de IRS mensal — trabalho dependente (Portugal continente 2026).
 * Estima quanto é retido de IRS por mês para que, no final do ano, o acerto seja ~0.
 * Baseia-se no IRS anual real (escalões 2026) do módulo portugal-2026.ts, não nas
 * tabelas de retenção da AT (que retêm um pouco a mais). É uma ESTIMATIVA honesta.
 * Situação familiar aproximada por quociente conjugal; dependentes por dedução à coleta.
 */
import { PORTUGAL_2026, fmtEUR, irsAnual, segSocialTrabalhador } from '../data/portugal-2026.ts';

export interface Inputs {
  salarioBruto: number;         // salário base mensal bruto (€)
  situacao?: string;            // 'solteiro' | 'casado1' (único titular) | 'casado2' (dois titulares)
  dependentes?: number;         // nº de dependentes
  jovemIrs?: string;            // 'nao' | 'sim' (1.º ano, 100 % isento) — aproximação
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const DEDUCAO_DEPENDENTE = 600; // dedução à coleta por dependente (art. 78.º-A CIRS), aprox.

export function compute(i: Inputs): Outputs {
  const bruto = Math.max(0, Number(i.salarioBruto) || 0);
  const situacao = String(i.situacao || 'solteiro');
  const dependentes = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  const jovem = String(i.jovemIrs || 'nao') === 'sim' ? 1 : 0; // 1.º ano IRS Jovem = 100 %
  if (bruto <= 0) throw new Error('Indique o salário bruto mensal');

  const meses = 14; // 12 + subsídios de férias e Natal
  const ssMensal = segSocialTrabalhador(bruto);
  const brutoAnual = bruto * meses;
  const ssAnual = ssMensal * meses;

  // Rendimento coletável = bruto − dedução específica (o maior entre 4.587,09 € e a SS paga).
  // IRS Jovem: 1.º ano isenta 100 % (com tope 55 × IAS).
  const isento = Math.min(brutoAnual * jovem, PORTUGAL_2026.irsJovem.limiteIsencaoAnual);
  const brutoTributavel = Math.max(0, brutoAnual - isento);
  const deducao = Math.max(PORTUGAL_2026.irs.deducaoEspecificaTrabalho, ssAnual);
  const coletavel = Math.max(0, brutoTributavel - deducao);

  // Situação familiar: quociente conjugal só no "casado, único titular" (divide por 2).
  let irsAnualTotal: number;
  if (brutoTributavel <= PORTUGAL_2026.irs.minimoExistenciaAnual) {
    irsAnualTotal = 0; // mínimo de existência: quem ganha o SMN não tem retenção
  } else if (situacao === 'casado1') {
    irsAnualTotal = 2 * irsAnual(coletavel / 2);
  } else {
    irsAnualTotal = irsAnual(coletavel);
  }

  // Dependentes: dedução à coleta (aprox. 600 €/dependente/ano).
  irsAnualTotal = Math.max(0, irsAnualTotal - dependentes * DEDUCAO_DEPENDENTE);

  const irsMensal = irsAnualTotal / meses;
  const taxaRetencao = bruto > 0 ? (irsMensal / bruto) * 100 : 0;
  const liquido = bruto - ssMensal - irsMensal;
  const taxaStr = taxaRetencao.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const _table = {
    title: 'Do bruto ao líquido (mensal)',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Salário bruto', fmtEUR(bruto)],
      ['Segurança Social (11 %)', `− ${fmtEUR(ssMensal)}`],
      [`Retenção de IRS (~${taxaStr} %)`, `− ${fmtEUR(irsMensal)}`],
      ['Salário líquido', fmtEUR(liquido)],
    ],
    note: `Situação: ${situacao === 'casado1' ? 'casado, único titular' : situacao === 'casado2' ? 'casado, dois titulares' : 'não casado'}; ${dependentes} dependente(s). Estimativa alinhada com o IRS anual (escalões 2026), pode diferir da tabela de retenção da AT.`,
  };

  const _insight = {
    title: 'A retenção é uma estimativa; a AT retém um pouco a mais',
    text: `Para **${fmtEUR(bruto)}** brutos/mês, retêm-se cerca de **${fmtEUR(irsMensal)}** de IRS (~${taxaStr} %) e **${fmtEUR(ssMensal)}** de Segurança Social, ficando **${fmtEUR(liquido)}** líquidos. ` +
      `Esta estimativa é a retenção que faria o acerto anual ficar ~0; as tabelas oficiais da AT costumam reter um pouco mais, sendo a diferença devolvida no IRS.`,
    tone: irsMensal > 0 ? 'warn' : 'good',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(liquido) },
      { label: 'IRS', value: Math.round(irsMensal) },
      { label: 'Seg. Social', value: Math.round(ssMensal) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(liquido),
    centerLabel: 'Líquido',
    ariaLabel: `De ${fmtEUR(bruto)} brutos: ${fmtEUR(liquido)} líquidos, ${fmtEUR(irsMensal)} de IRS, ${fmtEUR(ssMensal)} de Segurança Social.`,
  };

  return {
    retencaoMensal: fmtEUR(irsMensal),
    taxaRetencao: `${taxaStr} %`,
    segSocial: fmtEUR(ssMensal),
    liquido: fmtEUR(liquido),
    irsAnual: fmtEUR(irsAnualTotal),
    detalhe: `${fmtEUR(bruto)} brutos → −${fmtEUR(ssMensal)} SS −${fmtEUR(irsMensal)} IRS (~${taxaStr} %) = ${fmtEUR(liquido)} líquidos.`,
    _insight,
    _table,
    _chart,
  };
}
