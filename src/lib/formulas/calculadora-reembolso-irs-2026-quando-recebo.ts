/**
 * Reembolso do IRS 2026 (Portugal) — quando recebe o dinheiro.
 * Prazos legais: liquidação até 31-07-2026 e reembolso até 31-08-2026 para
 * declarações entregues dentro do prazo (1-abr a 30-jun-2026), art. 97.º do CIRS.
 * Prazos médios reais: IRS Automático ~12-15 dias; via normal ~3 a 3,5 semanas.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  dataEntrega: string;  // ISO 'YYYY-MM-DD'
  valor: number;        // valor a reembolsar (€)
  tipoEntrega?: string; // 'automatico' | 'normal'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const FIM_PRAZO_ENTREGA = new Date(2026, 5, 30);   // 30-06-2026
const LIMITE_LIQUIDACAO = new Date(2026, 6, 31);   // 31-07-2026
const LIMITE_REEMBOLSO = new Date(2026, 7, 31);    // 31-08-2026

function parseData(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return null;
  const f = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(f.getTime()) ? null : f;
}

function fmtData(d: Date): string {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export function calculadoraReembolsoIrs2026QuandoRecebo(i: Inputs): Outputs {
  const data = parseData(i.dataEntrega);
  const valor = Math.max(0, Number(i.valor) || 0);
  const tipo = String(i.tipoEntrega || 'normal');
  if (!data) throw new Error('Introduza a data em que entregou a declaração');
  if (valor <= 0) throw new Error('Introduza o valor a reembolsar');

  const dentroPrazo = data <= FIM_PRAZO_ENTREGA;
  const automatico = tipo === 'automatico';

  // Prazo médio real observado nas últimas campanhas da AT
  let rangoDias: [number, number];
  let estimativa: string;
  if (automatico && dentroPrazo) {
    rangoDias = [10, 15];
    estimativa = 'em cerca de 10 a 15 dias';
  } else if (dentroPrazo) {
    rangoDias = [17, 30];
    estimativa = 'em cerca de 3 a 4 semanas';
  } else {
    rangoDias = [30, 120];
    estimativa = 'em 1 a 4 meses (entrega fora do prazo: a declaração perde prioridade e o prazo legal de 31 de agosto deixa de se aplicar)';
  }

  const desde = new Date(data); desde.setDate(desde.getDate() + rangoDias[0]);
  const ate = new Date(data); ate.setDate(ate.getDate() + rangoDias[1]);
  const janela = `entre ${fmtData(desde)} e ${fmtData(ate)} (estimativa)`;

  const _insight = {
    title: 'Quando recebe o reembolso',
    text: dentroPrazo
      ? `Entregou a ${fmtData(data)} (${automatico ? 'IRS Automático' : 'via normal'}) com **${fmtEUR(valor)}** a reembolsar. Nas últimas campanhas, a AT pagou este tipo de declarações **${estimativa}**. Os prazos legais: liquidação até **31 de julho de 2026** e reembolso até **31 de agosto de 2026**. Confirme que tem o **IBAN atualizado** no Portal das Finanças — é a causa mais comum de atrasos.`
      : `Entregou a ${fmtData(data)}, **fora do prazo legal** (terminou a 30 de junho de 2026). O reembolso de **${fmtEUR(valor)}** ainda chega, mas ${estimativa}. Acompanhe o estado em "Consultar Declaração" no Portal das Finanças.`,
    tone: dentroPrazo ? 'good' : 'warning',
    icon: '💶',
  };
  const _chart = {
    type: 'gauge',
    value: rangoDias[1],
    min: 0,
    max: 120,
    label: `até ~${rangoDias[1]} dias`,
    ariaLabel: `Prazo máximo estimado do reembolso: ${rangoDias[1]} dias após a entrega.`,
  };

  return {
    estimativa: `Costuma ser pago ${estimativa}`,
    janela,
    prazoLegal: dentroPrazo
      ? `Liquidação até ${fmtData(LIMITE_LIQUIDACAO)} · reembolso até ${fmtData(LIMITE_REEMBOLSO)}`
      : 'Entrega fora do prazo: os limites de 31-jul/31-ago não se aplicam',
    detalhe: `Valor a reembolsar: ${fmtEUR(valor)} · entregue a ${fmtData(data)} · ${automatico ? 'IRS Automático' : 'declaração via normal'}.`,
    _insight,
    _chart,
  };
}
