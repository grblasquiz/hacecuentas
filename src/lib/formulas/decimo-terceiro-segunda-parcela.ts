/** 2ª parcela do 13º: saldo − INSS − IRRF. Pago até 20/dezembro. Lei 4.090/1962. */

import { calcINSS as calcInss2026, calcIRRF2026 as calcIrrf2026, IRRF_DEDUCAO_DEPENDENTE } from '../data/brasil-2026';

export interface Inputs {
  salarioBruto: number;
  mesesTrabalhados: number;
  dependentes: number;
  primeiraParcelaPaga: number;
}

export interface Outputs {
  decimoBruto: string;
  descontoInss: string;
  descontoIrrf: string;
  saldo: string;
  segundaParcelaLiquida: string;
  dataLimite: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


export function decimoTerceiroSegundaParcela(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const meses = Math.min(12, Math.max(0, Math.floor(Number(i.mesesTrabalhados) || 12)));
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  const primeira = Math.max(0, Number(i.primeiraParcelaPaga) || 0);
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');

  const decimoBruto = (salario / 12) * meses;
  const saldoBruto = decimoBruto - primeira;
  const inss = calcInss2026(decimoBruto);
  const baseIrrf = decimoBruto - inss - deps * IRRF_DEDUCAO_DEPENDENTE;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const segunda = saldoBruto - inss - irrf;

  const formula = `2ª parcela = saldo ${fmt(saldoBruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(segunda)}`;
  const explicacao = `13º bruto de ${fmt(decimoBruto)} (${meses}/12 meses). 1ª parcela paga: ${fmt(primeira)}. Na 2ª parcela (até 20/dez), descontam-se INSS ${fmt(inss)} e IRRF ${fmt(irrf)} sobre o valor integral do 13º, resultando líquido de ${fmt(segunda)}.`;

  const descontos = inss + irrf;
  const tone = segunda < 0 ? 'warn' : (descontos > 0 ? 'warn' : 'good');
  const insightText = segunda < 0
    ? `A 1ª parcela informada (**${fmt(primeira)}**) supera o saldo do 13º bruto de **${fmt(decimoBruto)}** menos os descontos — confira o valor já pago.`
    : `Na 2ª parcela você recebe **${fmt(segunda)}**: do saldo de ${fmt(saldoBruto)} saem **${fmt(descontos)}** de INSS + IRRF, que incidem só agora (em dez). Total descontado concentra-se nesta parcela.`;

  // Donut só quando os componentes somam o bruto de forma coerente
  const out: Outputs = {
    decimoBruto: fmt(decimoBruto),
    descontoInss: fmt(inss),
    descontoIrrf: fmt(irrf),
    saldo: fmt(saldoBruto),
    segundaParcelaLiquida: fmt(segunda),
    dataLimite: '20 de dezembro',
    formula,
    explicacao,
    _insight: {
      title: 'Quanto cai na 2ª parcela',
      text: insightText,
      tone,
      icon: '🎄',
    },
  };

  if (segunda >= 0 && primeira >= 0 && primeira <= decimoBruto) {
    const slices = [
      { label: '1ª parcela (já paga)', value: Number(primeira.toFixed(2)) },
      { label: '2ª parcela (líquida)', value: Number(segunda.toFixed(2)) },
      { label: 'INSS', value: Number(inss.toFixed(2)) },
    ];
    if (irrf > 0) slices.push({ label: 'IRRF', value: Number(irrf.toFixed(2)) });
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: 'R$ ',
      centerValue: fmt(decimoBruto),
      centerLabel: '13º bruto',
      ariaLabel: `13º bruto de ${fmt(decimoBruto)} repartido entre as parcelas e os descontos`,
    };
  }

  return out;
}
