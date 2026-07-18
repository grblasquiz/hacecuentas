/**
 * Calculadora de dias úteis e feriados — Portugal 2026.
 *
 * Conta os dias úteis (segunda a sexta, excluindo feriados) e os dias corridos entre
 * duas datas, usando a lista oficial de feriados nacionais obrigatórios de 2026.
 * Opcionalmente inclui o Carnaval (17-fev-2026), que é feriado facultativo.
 *
 * Toda a lógica de calendário e a lista de feriados vêm de portugal-2026.ts.
 */
import { diasUteisPortugal, FERIADOS_2026 } from '../data/portugal-2026';

export interface Inputs {
  /** Data inicial (YYYY-MM-DD), inclusive. */
  dataInicio?: string;
  /** Data final (YYYY-MM-DD), inclusive. */
  dataFim?: string;
  /** Incluir o Carnaval (17-fev-2026) como feriado? 'sim' | 'nao'. */
  incluirCarnaval?: string;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const CARNAVAL_2026 = { data: '2026-02-17', nome: 'Carnaval (facultativo)' };

export function compute(i: Inputs): Outputs {
  const inicio = String(i.dataInicio || '2026-01-01');
  const fim = String(i.dataFim || '2026-12-31');
  const comCarnaval = String(i.incluirCarnaval || 'nao') === 'sim';

  const feriados = comCarnaval ? [...FERIADOS_2026, CARNAVAL_2026] : FERIADOS_2026;
  const r = diasUteisPortugal(inicio, fim, feriados);

  const _insight = {
    type: 'highlight',
    icon: '📅',
    text:
      `Entre **${inicio}** e **${fim}** há **${r.corridos}** dias corridos, dos quais **${r.uteis} são dias úteis**. ` +
      `Ficam de fora **${r.fimDeSemana}** dias de fim de semana e **${r.feriadosNoIntervalo}** feriados${comCarnaval ? ' (Carnaval incluído)' : ''}. ` +
      `Em 2026, o ano inteiro tem 252 dias úteis (365 dias − 104 de fim de semana − 9 feriados em dias úteis).`,
  };

  const _table = {
    title: 'Feriados nacionais obrigatórios de Portugal — 2026',
    headers: ['Data', 'Feriado', 'Dia da semana'],
    rows: [
      ['1 jan', 'Ano Novo', 'quinta-feira'],
      ['3 abr', 'Sexta-feira Santa', 'sexta-feira'],
      ['5 abr', 'Domingo de Páscoa', 'domingo'],
      ['25 abr', 'Dia da Liberdade', 'sábado'],
      ['1 mai', 'Dia do Trabalhador', 'sexta-feira'],
      ['4 jun', 'Corpo de Deus', 'quinta-feira'],
      ['10 jun', 'Dia de Portugal', 'quarta-feira'],
      ['15 ago', 'Assunção de Nossa Senhora', 'sábado'],
      ['5 out', 'Implantação da República', 'segunda-feira'],
      ['1 nov', 'Dia de Todos os Santos', 'domingo'],
      ['1 dez', 'Restauração da Independência', 'terça-feira'],
      ['8 dez', 'Imaculada Conceição', 'terça-feira'],
      ['25 dez', 'Natal', 'sexta-feira'],
    ],
    note:
      'Em 2026, 9 dos 13 feriados nacionais caem em dias úteis (os outros 4 em fim de semana). ' +
      'O Carnaval (17-fev, terça-feira) é facultativo. A estes acrescem os feriados municipais (um por concelho).',
  };

  return {
    diasUteis: `${r.uteis} dias úteis`,
    diasCorridos: `${r.corridos} dias`,
    feriados: `${r.feriadosNoIntervalo} feriado${r.feriadosNoIntervalo === 1 ? '' : 's'}`,
    fimDeSemana: `${r.fimDeSemana} dias`,
    detalhe:
      `De ${inicio} a ${fim} (inclusive): ${r.corridos} dias corridos = ${r.uteis} úteis + ${r.fimDeSemana} de fim de semana + ${r.feriadosNoIntervalo} feriados em dias úteis${comCarnaval ? ' (Carnaval contado)' : ''}.`,
    _insight,
    _table,
  };
}
