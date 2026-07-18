/**
 * Pré-aviso de demissão (denúncia do contrato pelo trabalhador) — Portugal 2026.
 * Art. 400.º do Código do Trabalho. Dias de calendário (corridos).
 * Contrato SEM TERMO: 30 dias se antiguidade ≤ 2 anos; 60 dias se > 2 anos.
 * Contrato A TERMO: 30 dias se duração ≥ 6 meses; 15 dias se < 6 meses.
 * Cargos de direção/administração: o IRCT pode elevar o pré-aviso até 6 meses.
 * Não cumprir o pré-aviso obriga a indemnizar o empregador pelos dias em falta.
 * Cálculo em dias — fmtEUR não é necessário.
 */
import { PRE_AVISO_DEMISSAO_2026 } from '../data/portugal-2026';

export interface Inputs {
  tipoContrato?: string;   // 'sem_termo' | 'a_termo'
  antiguidade?: number;    // anos de antiguidade (contrato sem termo)
  duracaoContrato?: string; // 'a_termo': '6mais' | 'menos6'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipoContrato || 'sem_termo') === 'a_termo' ? 'a_termo' : 'sem_termo';

  let dias: number;
  let regime: string;
  let detalhe: string;

  if (tipo === 'a_termo') {
    const dur = String(i.duracaoContrato || '6mais') === 'menos6' ? 'menos6' : '6mais';
    if (dur === 'menos6') {
      dias = PRE_AVISO_DEMISSAO_2026.termoMenos6meses; // 15
      regime = 'Contrato a termo com duração inferior a 6 meses';
      detalhe = `Contrato a termo (< 6 meses): pré-aviso de ${dias} dias de calendário (art. 400.º, n.º 2 CT).`;
    } else {
      dias = PRE_AVISO_DEMISSAO_2026.termo6mesesOuMais; // 30
      regime = 'Contrato a termo com duração igual ou superior a 6 meses';
      detalhe = `Contrato a termo (≥ 6 meses): pré-aviso de ${dias} dias de calendário (art. 400.º, n.º 2 CT).`;
    }
  } else {
    const anos = Math.max(0, Number(i.antiguidade) || 0);
    if (anos > 2) {
      dias = PRE_AVISO_DEMISSAO_2026.semTermoMais2anos; // 60
      regime = 'Contrato sem termo, antiguidade superior a 2 anos';
      detalhe = `Contrato sem termo com ${anos} ano(s) de antiguidade (> 2 anos): pré-aviso de ${dias} dias de calendário (art. 400.º, n.º 1 CT).`;
    } else {
      dias = PRE_AVISO_DEMISSAO_2026.semTermoAte2anos; // 30
      regime = 'Contrato sem termo, antiguidade até 2 anos';
      detalhe = `Contrato sem termo com ${anos} ano(s) de antiguidade (≤ 2 anos): pré-aviso de ${dias} dias de calendário (art. 400.º, n.º 1 CT).`;
    }
  }

  const _table = {
    title: 'Pré-aviso de demissão do trabalhador — art. 400.º CT',
    headers: ['Tipo de contrato', 'Condição', 'Pré-aviso'],
    rows: [
      ['Sem termo', 'Antiguidade até 2 anos', '30 dias'],
      ['Sem termo', 'Antiguidade superior a 2 anos', '60 dias'],
      ['A termo', 'Duração igual ou superior a 6 meses', '30 dias'],
      ['A termo', 'Duração inferior a 6 meses', '15 dias'],
      ['O seu caso', regime, `${dias} dias`],
    ],
    note: 'Dias de calendário (corridos). Cargos de direção/administração podem ter pré-aviso alargado até 6 meses por IRCT. Não cumprir o pré-aviso obriga a pagar ao empregador a retribuição base e diuturnidades dos dias em falta.',
  };

  const _insight = {
    title: `Pré-aviso: ${dias} dias`,
    text: `${regime}: deve comunicar a demissão com **${dias} dias de calendário** de antecedência (art. 400.º do Código do Trabalho). Se não cumprir, terá de **indemnizar o empregador** pela retribuição base e diuturnidades correspondentes aos dias em falta.`,
    tone: 'neutral',
    icon: '📅',
  };

  return {
    diasPreAviso: `${dias} dias`,
    regime,
    detalhe,
    _insight,
    _table,
  };
}
