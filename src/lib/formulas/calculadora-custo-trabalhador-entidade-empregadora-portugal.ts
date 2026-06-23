/**
 * Custo total de um trabalhador para a entidade empregadora — Portugal continente 2026.
 * Custo = (salário bruto mensal × 14 meses) + TSU patronal 23,75 % sobre toda a remuneração.
 * Inclui os subsídios de férias e de Natal (os 14 meses) e a contribuição patronal à
 * Segurança Social, que NÃO sai do recibo do trabalhador.
 * Não hardcodea cifras: usa segSocialEmpregador + constantes de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR, segSocialEmpregador } from '../data/portugal-2026.ts';

export interface Inputs {
  salarioBruto?: number;     // salário base mensal bruto
  subsidioRefeicao?: number; // subsídio de refeição diário (opcional)
  diasMes?: number;          // dias úteis/mês para o subsídio de refeição (opcional, default 22)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraCustoTrabalhadorEntidadeEmpregadoraPortugal(i: Inputs): Outputs {
  const meses = PORTUGAL_2026.subsidios.totalMesesAno; // 14
  const taxaPatronal = PORTUGAL_2026.segSocial.empregador; // 23,75 %
  const bruto = Number(i.salarioBruto) || 0;
  if (bruto <= 0) throw new Error('Indique o salário bruto mensal');

  // Subsídio de refeição (opcional). Isento de TSU até ao limite cartão (10,46 €/dia); aqui não
  // se diferencia a forma de pagamento — soma-se ao custo direto sem encargo de SS por defeito.
  const refeicaoDia = Number(i.subsidioRefeicao) || 0;
  const diasMes = Number(i.diasMes) || 22;
  const refeicaoMensal = refeicaoDia * diasMes;
  const refeicaoAnual = refeicaoMensal * 11; // ~11 meses úteis (não há refeição no mês de férias)

  // ── salário anual (14 meses) ──
  const salarioAnual = bruto * meses;

  // ── TSU patronal: 23,75 % sobre toda a remuneração (inclui subsídios de férias e Natal) ──
  const tsuMensal = segSocialEmpregador(bruto);
  const tsuAnual = tsuMensal * meses;

  // ── custo total ──
  const custoAnual = salarioAnual + tsuAnual + refeicaoAnual;
  const custoMensalMedio = custoAnual / 12;
  const sobreSalarioPct = ((custoAnual / (salarioAnual || 1)) - 1) * 100;

  const _table = {
    title: 'Custo anual de um trabalhador para a empresa',
    headers: ['Componente', 'Base', 'Valor anual'],
    rows: [
      ['Salário bruto (14 meses)', fmtEUR(bruto) + ' × 14', fmtEUR(salarioAnual)],
      ['TSU patronal (Segurança Social)', (taxaPatronal * 100).toLocaleString('de-DE') + ' %', fmtEUR(tsuAnual)],
      ...(refeicaoAnual > 0
        ? [['Subsídio de refeição', fmtEUR(refeicaoDia) + '/dia × ' + diasMes + ' × 11', fmtEUR(refeicaoAnual)]]
        : []),
      ['Custo total anual', '—', fmtEUR(custoAnual)],
    ],
    note:
      'TSU patronal de ' + (taxaPatronal * 100).toLocaleString('de-DE') +
      ' % (Código Contributivo) sobre toda a remuneração, incluindo subsídios de férias e de Natal. ' +
      'Não inclui seguro de acidentes de trabalho nem outros encargos facultativos.',
  };

  const _insight = {
    title: 'O que custa este trabalhador',
    text:
      `Um salário bruto de **${fmtEUR(bruto)}**/mês custa à empresa **${fmtEUR(custoAnual)}** por ano ` +
      `(equivalente a **${fmtEUR(custoMensalMedio)}**/mês): os 14 meses de salário (${fmtEUR(salarioAnual)}) ` +
      `mais **${fmtEUR(tsuAnual)}** de TSU patronal (${(taxaPatronal * 100).toLocaleString('de-DE')} %)` +
      (refeicaoAnual > 0 ? ` e ${fmtEUR(refeicaoAnual)} de subsídio de refeição` : '') +
      `. O custo total é **${sobreSalarioPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %** acima do salário anual.`,
    tone: 'good',
    icon: '🏢',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salário (14 meses)', value: Math.round(salarioAnual) },
      { label: 'TSU patronal', value: Math.round(tsuAnual) },
      ...(refeicaoAnual > 0 ? [{ label: 'Subsídio refeição', value: Math.round(refeicaoAnual) }] : []),
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(custoAnual),
    centerLabel: 'Custo anual',
    ariaLabel: `Custo anual ${fmtEUR(custoAnual)}: salário ${fmtEUR(salarioAnual)}, TSU ${fmtEUR(tsuAnual)}.`,
  };

  return {
    custoAnual: fmtEUR(custoAnual),
    custoMensalMedio: fmtEUR(custoMensalMedio),
    salarioBruto: fmtEUR(bruto),
    salarioAnual: fmtEUR(salarioAnual),
    tsuMensal: fmtEUR(tsuMensal),
    tsuAnual: fmtEUR(tsuAnual),
    subsidioRefeicaoAnual: refeicaoAnual > 0 ? fmtEUR(refeicaoAnual) : '—',
    sobreSalario: '+' + sobreSalarioPct.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %',
    detalhe:
      `${fmtEUR(bruto)} × 14 = ${fmtEUR(salarioAnual)} + TSU ${(taxaPatronal * 100).toLocaleString('de-DE')} % (${fmtEUR(tsuAnual)})` +
      (refeicaoAnual > 0 ? ` + refeição ${fmtEUR(refeicaoAnual)}` : '') +
      ` = ${fmtEUR(custoAnual)}/ano.`,
    _table,
    _insight,
    _chart,
  };
}
