// Salário-família 2026 (INSS) — cota de R$ 67,54 por filho de até 14 anos (ou
// inválido de qualquer idade), paga a quem recebe remuneração mensal até o teto
// de R$ 1.980,38 (Portaria Interministerial MPS/MF nº 13/2026).
//   valor = cota × nº de filhos elegíveis  (se remuneração ≤ teto; senão, 0)

import { SALARIO_FAMILIA_COTA, SALARIO_FAMILIA_TETO, SALARIO_MINIMO } from '../data/brasil-2026';

export interface Inputs {
  numeroFilhos: number;    // filhos até 14 anos (ou inválidos)
  remuneracao?: number;    // remuneração mensal (padrão: salário mínimo)
}

export interface Outputs {
  valorTotal: string;
  cotaPorFilho: string;
  filhosElegiveis: string;
  temDireito: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  let filhos = Math.floor(Number(i.numeroFilhos));
  if (!isFinite(filhos) || filhos < 0) filhos = 0;
  let remun = Number(i.remuneracao);
  if (!isFinite(remun) || remun <= 0) remun = SALARIO_MINIMO;

  const dentroTeto = remun <= SALARIO_FAMILIA_TETO;
  const valor = dentroTeto ? filhos * SALARIO_FAMILIA_COTA : 0;

  const temDireito = dentroTeto
    ? (filhos > 0 ? 'Sim — dentro do teto de remuneração' : 'Sem filhos elegíveis informados')
    : `Não — remuneração acima do teto (${brl(SALARIO_FAMILIA_TETO)})`;

  const detalhe = dentroTeto
    ? `Remuneração ${brl(remun)} está dentro do teto (${brl(SALARIO_FAMILIA_TETO)}). ` +
      `Salário-família = ${brl(SALARIO_FAMILIA_COTA)} × ${filhos} filho(s) = ${brl(valor)} por mês.`
    : `Remuneração ${brl(remun)} ultrapassa o teto de ${brl(SALARIO_FAMILIA_TETO)} — sem direito ao salário-família neste mês. ` +
      `Se voltar a ficar dentro do teto, o direito é retomado.`;

  return {
    valorTotal: brl(valor),
    cotaPorFilho: brl(SALARIO_FAMILIA_COTA),
    filhosElegiveis: String(filhos),
    temDireito,
    detalhe,
    _insight: {
      title: dentroTeto && filhos > 0 ? `Você recebe ${brl(valor)}/mês` : 'Salário-família',
      text: dentroTeto
        ? (filhos > 0
            ? `Com **${filhos} filho(s)** de até 14 anos e remuneração de **${brl(remun)}** (dentro do teto de ${brl(SALARIO_FAMILIA_TETO)}), você tem direito a **${brl(valor)}** por mês — ${brl(SALARIO_FAMILIA_COTA)} por filho. O valor é pago junto com o salário.`
            : `Informe o número de filhos de até 14 anos. Cada um vale ${brl(SALARIO_FAMILIA_COTA)}/mês, desde que a remuneração fique até ${brl(SALARIO_FAMILIA_TETO)}.`)
        : `Sua remuneração (**${brl(remun)}**) está acima do teto de **${brl(SALARIO_FAMILIA_TETO)}**, então não há salário-família neste mês. Nos meses em que ela ficar dentro do limite, o direito volta automaticamente.`,
      tone: dentroTeto && filhos > 0 ? 'good' : 'warn',
      icon: '👨‍👩‍👧',
    },
    _chart: dentroTeto && filhos > 0
      ? {
          type: 'bar',
          labels: Array.from({ length: filhos }, (_, k) => `Filho ${k + 1}`),
          values: Array.from({ length: filhos }, () => SALARIO_FAMILIA_COTA),
          prefix: 'R$ ',
          ariaLabel: `${filhos} cotas de ${brl(SALARIO_FAMILIA_COTA)} somam ${brl(valor)} por mês.`,
        }
      : undefined,
  };
}
