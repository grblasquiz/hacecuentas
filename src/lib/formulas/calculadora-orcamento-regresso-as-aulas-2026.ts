/**
 * Orçamento do regresso às aulas 2026 (Portugal) — despesa por filho e ciclo.
 * Referências: DECO PROteste (material escolar ~50-150 € por ciclo; despesa média
 * global do regresso às aulas ~600 € por estudante), manuais gratuitos do 1.º ao
 * 12.º ano na escola pública via plataforma MEGA, apoios ASE por escalão (8-16 €).
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  numFilhos: number;   // n.º de filhos em idade escolar
  ciclo: string;       // 'pre' | 'ciclo1' | 'ciclo2' | 'ciclo3' | 'secundario'
  tipoEscola: string;  // 'publica' | 'privada'
  refeicoes?: string;  // 'sim' | 'nao'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Material escolar por ciclo (€/aluno) — intervalo DECO 50-150 € consoante o ciclo.
const MATERIAL: Record<string, number> = { pre: 60, ciclo1: 90, ciclo2: 110, ciclo3: 130, secundario: 150 };
// Manuais: gratuitos na escola pública (MEGA, 1.º-12.º ano); na privada pagam-se.
const MANUAIS_PRIVADA: Record<string, number> = { pre: 0, ciclo1: 150, ciclo2: 200, ciclo3: 250, secundario: 300 };
// Mochila, vestuário e calçado de início de ano.
const VESTUARIO = 120;
// Extras por ciclo (agenda, equipamento de EF; calculadora gráfica no secundário).
const EXTRAS: Record<string, number> = { pre: 20, ciclo1: 25, ciclo2: 35, ciclo3: 45, secundario: 110 };
// Refeições escolares (€/dia × ~20 dias letivos/mês).
const REFEICAO_DIA_PUBLICA = 1.6;
const REFEICAO_DIA_PRIVADA = 6;
const MESES_ANO_LETIVO = 10;

const CICLOS: Record<string, string> = {
  pre: 'Pré-escolar',
  ciclo1: '1.º ciclo (1.º-4.º ano)',
  ciclo2: '2.º ciclo (5.º-6.º ano)',
  ciclo3: '3.º ciclo (7.º-9.º ano)',
  secundario: 'Secundário (10.º-12.º ano)',
};

export function calculadoraOrcamentoRegressoAsAulas2026(i: Inputs): Outputs {
  const filhos = Math.max(1, Math.min(10, Math.round(Number(i.numFilhos) || 1)));
  const ciclo = String(i.ciclo || 'ciclo1');
  const escola = String(i.tipoEscola || 'publica');
  const comRefeicoes = String(i.refeicoes || 'sim') === 'sim';
  if (!(ciclo in MATERIAL)) throw new Error('Escolha o ciclo de ensino');

  const material = MATERIAL[ciclo] * filhos;
  const manuais = (escola === 'privada' ? MANUAIS_PRIVADA[ciclo] : 0) * filhos;
  const vestuario = VESTUARIO * filhos;
  const extras = (EXTRAS[ciclo] || 30) * filhos;
  const arranque = material + manuais + vestuario + extras;

  const refeicaoDia = escola === 'privada' ? REFEICAO_DIA_PRIVADA : REFEICAO_DIA_PUBLICA;
  const refeicoesMes = comRefeicoes ? refeicaoDia * 20 * filhos : 0;
  const refeicoesAno = refeicoesMes * MESES_ANO_LETIVO;

  const totalAno = arranque + refeicoesAno;

  const _insight = {
    title: 'O seu orçamento de regresso às aulas',
    text: `Para **${filhos} ${filhos === 1 ? 'filho' : 'filhos'}** no **${CICLOS[ciclo]}** (escola ${escola === 'privada' ? 'privada' : 'pública'}), o arranque de setembro custa cerca de **${fmtEUR(arranque)}** (material, ${escola === 'privada' ? 'manuais, ' : ''}mochila/vestuário e extras).${escola === 'publica' ? ' Os **manuais são gratuitos** do 1.º ao 12.º ano via plataforma MEGA — levante os vouchers a partir do fim de julho.' : ''}${comRefeicoes ? ` Com refeições escolares (~${fmtEUR(refeicoesMes)}/mês), o ano letivo soma cerca de **${fmtEUR(totalAno)}**.` : ''} A média nacional da despesa de regresso às aulas ronda os 600 € por estudante.`,
    tone: 'neutral',
    icon: '🎒',
  };
  const _chart = {
    type: 'bar',
    items: [
      { label: 'Material escolar', value: Math.round(material) },
      ...(manuais > 0 ? [{ label: 'Manuais', value: Math.round(manuais) }] : []),
      { label: 'Mochila e vestuário', value: Math.round(vestuario) },
      { label: 'Extras', value: Math.round(extras) },
      ...(refeicoesAno > 0 ? [{ label: 'Refeições (ano letivo)', value: Math.round(refeicoesAno) }] : []),
    ],
    ariaLabel: `Orçamento do regresso às aulas: arranque ${fmtEUR(arranque)}, total anual ${fmtEUR(totalAno)}.`,
  };

  return {
    arranque: fmtEUR(arranque),
    material: fmtEUR(material),
    manuais: escola === 'privada' ? fmtEUR(manuais) : 'Gratuitos (plataforma MEGA)',
    vestuario: fmtEUR(vestuario),
    extras: fmtEUR(extras),
    refeicoesMensal: comRefeicoes ? `${fmtEUR(refeicoesMes)}/mês` : 'Sem refeições escolares',
    totalAnoLetivo: fmtEUR(totalAno),
    detalhe: `${filhos} ${filhos === 1 ? 'filho' : 'filhos'} · ${CICLOS[ciclo]} · escola ${escola === 'privada' ? 'privada' : 'pública'} · ano letivo de ${MESES_ANO_LETIVO} meses.`,
    _insight,
    _chart,
  };
}
