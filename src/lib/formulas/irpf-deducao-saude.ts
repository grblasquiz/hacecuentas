/**
 * IRPF — Dedução de despesas médicas (sem limite)
 * Lei 9.250/1995, art. 8º II a: despesas médicas não têm teto,
 * desde que comprovadas (nota fiscal, recibo com CPF/CNPJ).
 * Exige declaração completa.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeducaoSaude(i: Inputs): Outputs {
  const planoSaude = Number(i.planoSaude) || 0;
  const consultas = Number(i.consultas) || 0;
  const exames = Number(i.exames) || 0;
  const hospitais = Number(i.hospitais) || 0;
  const dentistaPsicologo = Number(i.dentistaPsicologo) || 0;
  const aliq = (Number(i.aliquotaMarginal) || 27.5) / 100;

  const total = planoSaude + consultas + exames + hospitais + dentistaPsicologo;
  const economiaIR = total * aliq;

  return {
    totalDedutivel: fmt(total),
    economiaIR: fmt(economiaIR),
    aliquotaAplicada: (aliq * 100).toFixed(1) + '%',
    resumo: `Despesas médicas dedutíveis: ${fmt(total)} (sem limite legal). Na alíquota de ${(aliq * 100).toFixed(1)}% você deixa de pagar ${fmt(economiaIR)} em IR. Guarde recibos com CPF/CNPJ por 5 anos.`,
    alerta: total > 0 ? 'Obrigatório informar CPF/CNPJ do prestador no DIRPF. Reembolso de plano deve ser subtraído.' : 'Sem gastos informados.',
  };
}
