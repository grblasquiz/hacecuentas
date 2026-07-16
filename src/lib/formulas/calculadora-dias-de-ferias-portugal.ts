/**
 * Dias de férias a que se tem direito — Portugal (Código do Trabalho, art. 238.º).
 * Regra geral: 22 dias úteis de férias por ano civil. No ano de admissão: 2 dias
 * úteis por cada mês de duração do contrato, até 20 dias, gozáveis após 6 meses
 * completos. Cálculo de utilidade laboral; fmtEUR não é necessário aqui.
 */
export interface Inputs {
  situacao?: string;            // 'completo' (ano civil completo) | 'admissao' (ano de admissão)
  mesesContrato?: number;       // meses de duração do contrato no ano de admissão
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const FERIAS_ANO_COMPLETO = 22; // dias úteis (art. 238.º CT)
const MAX_ANO_ADMISSAO = 20;    // limite no ano de admissão
const DIAS_POR_MES = 2;         // dias úteis por mês de contrato no ano de admissão

export function compute(i: Inputs): Outputs {
  const situacao = String(i.situacao || 'completo');
  const meses = Math.max(0, Math.floor(Number(i.mesesContrato) || 0));

  let dias: number;
  let base: string;
  if (situacao === 'admissao') {
    if (meses <= 0) throw new Error('Indique os meses de duração do contrato no ano de admissão');
    dias = Math.min(DIAS_POR_MES * meses, MAX_ANO_ADMISSAO);
    base = `${DIAS_POR_MES} dias × ${meses} meses (máx. ${MAX_ANO_ADMISSAO})`;
  } else {
    dias = FERIAS_ANO_COMPLETO;
    base = 'Ano civil completo (art. 238.º CT)';
  }

  const _table = {
    title: 'Direito a férias',
    headers: ['Situação', 'Dias úteis'],
    rows: [
      ['Ano civil completo', `${FERIAS_ANO_COMPLETO} dias úteis`],
      ['Ano de admissão', `2 dias/mês, até ${MAX_ANO_ADMISSAO} dias (gozáveis após 6 meses)`],
      ['O seu caso', `${dias} dias úteis`],
    ],
    note: 'Dias úteis não incluem sábados, domingos nem feriados. Alguns contratos coletivos (IRCT) atribuem mais de 22 dias. No ano de admissão, as férias só podem ser gozadas após 6 meses completos de contrato.',
  };

  const _insight = {
    title: `Tem direito a ${dias} dias úteis de férias`,
    text: situacao === 'admissao'
      ? `No **ano de admissão**, com **${meses} ${meses === 1 ? 'mês' : 'meses'}** de contrato, tem direito a **${dias} dias úteis** de férias (2 por mês, até 20), gozáveis só depois de **6 meses completos** de contrato.`
      : `Num **ano civil completo**, o mínimo legal é **22 dias úteis** de férias (art. 238.º do Código do Trabalho). São dias **úteis**: sábados, domingos e feriados não contam. Contratos coletivos podem dar mais.`,
    tone: 'good',
    icon: '🏖️',
  };

  return {
    diasFerias: `${dias} dias úteis`,
    baseCalculo: base,
    detalhe: situacao === 'admissao'
      ? `Ano de admissão: 2 × ${meses} meses = ${Math.min(DIAS_POR_MES * meses, MAX_ANO_ADMISSAO)} dias úteis (máx. 20).`
      : `Ano completo: ${FERIAS_ANO_COMPLETO} dias úteis (art. 238.º CT).`,
    _insight,
    _table,
  };
}
