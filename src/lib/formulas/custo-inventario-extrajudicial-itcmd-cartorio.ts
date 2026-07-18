// Custo de um inventário extrajudicial em São Paulo — soma dos 4 blocos:
//   ITCMD (4% sobre o patrimônio, Lei 10.705/2000)
//   + honorários advocatícios (% sobre o patrimônio, mínimo OAB-SP ~6%)
//   + emolumentos do cartório (escritura pública — tabelado, informado pelo usuário)
//   + despesas com certidões e registros.
// Válido para São Paulo (v1). O ITCMD é o dado preciso e verificado; emolumentos
// e certidões variam por caso e são editáveis.

import { ITCMD_SP } from '../data/brasil-2026';

export interface Inputs {
  valorPatrimonio: number;
  honorariosPct?: number;    // % de honorários (padrão 6, mínimo OAB-SP)
  emolumentosCartorio?: number; // R$ da escritura (tabelado; padrão estimado)
  despesasCertidoes?: number;   // R$ de certidões/registros (padrão estimado)
}

export interface Outputs {
  custoTotal: string;
  itcmd: string;
  honorarios: string;
  emolumentos: string;
  certidoes: string;
  percentualPatrimonio: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorPatrimonio) || 0);
  let honPct = Number(i.honorariosPct);
  if (!isFinite(honPct) || honPct < 0) honPct = 6;
  let emol = Number(i.emolumentosCartorio);
  if (!isFinite(emol) || emol < 0) emol = 4000;
  let certid = Number(i.despesasCertidoes);
  if (!isFinite(certid) || certid < 0) certid = 800;

  const itcmd = valor * ITCMD_SP.aliquota;
  const honorarios = valor * (honPct / 100);
  const custoTotal = itcmd + honorarios + emol + certid;
  const pct = valor > 0 ? (custoTotal / valor) * 100 : 0;

  const detalhe =
    `Inventário extrajudicial (SP) de ${brl(valor)}: ITCMD 4% = ${brl(itcmd)} + honorários ${honPct.toLocaleString('pt-BR')}% = ${brl(honorarios)} ` +
    `+ emolumentos ${brl(emol)} + certidões ${brl(certid)} = ${brl(custoTotal)} (${pct.toFixed(1)}% do patrimônio).`;

  return {
    custoTotal: brl(custoTotal),
    itcmd: brl(itcmd),
    honorarios: brl(honorarios),
    emolumentos: brl(emol),
    certidoes: brl(certid),
    percentualPatrimonio: `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`,
    detalhe,
    _insight: {
      title: `Custo do inventário: ${brl(custoTotal)}`,
      text:
        `Para um patrimônio de **${brl(valor)}**, o inventário extrajudicial em SP sai por volta de **${brl(custoTotal)}** ` +
        `(**${pct.toFixed(1)}%** do valor). O maior peso costuma ser o **ITCMD (4% = ${brl(itcmd)})** e os **honorários (${brl(honorarios)})** — ` +
        `este é o item negociável. Emolumentos e certidões variam por cartório e por caso.`,
      tone: 'warn',
      icon: '📜',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'ITCMD (4%)', value: Number(itcmd.toFixed(2)) },
        { label: `Honorários (${honPct}%)`, value: Number(honorarios.toFixed(2)) },
        { label: 'Emolumentos', value: Number(emol.toFixed(2)) },
        { label: 'Certidões', value: Number(certid.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(custoTotal),
      centerLabel: 'Total',
      ariaLabel: `ITCMD ${brl(itcmd)}, honorários ${brl(honorarios)}, emolumentos ${brl(emol)} e certidões ${brl(certid)} somam ${brl(custoTotal)}.`,
    },
  };
}
