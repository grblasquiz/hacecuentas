/**
 * IRPF — Dedução de pensão alimentícia judicial
 * Lei 9.250/1995, art. 8º II f: pensão decorrente de decisão
 * judicial ou acordo homologado em cartório é 100% dedutível.
 * Pensão informal (sem processo) NÃO é dedutível.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeducaoPensao(i: Inputs): Outputs {
  const pensaoMensal = Number(i.pensaoMensal) || 0;
  const meses = Number(i.mesesPagos) || 12;
  const tipo = String(i.tipoPensao || 'judicial');
  const aliq = (Number(i.aliquotaMarginal) || 27.5) / 100;

  const totalPago = pensaoMensal * meses;
  const dedutivel = tipo === 'judicial' ? totalPago : 0;
  const economiaIR = dedutivel * aliq;

  return {
    totalPagoAno: fmt(totalPago),
    valorDedutivel: fmt(dedutivel),
    economiaIR: fmt(economiaIR),
    tipoReconhecido: tipo === 'judicial' ? 'Judicial/Homologada (100% dedutível)' : 'Informal (NÃO dedutível)',
    resumo: tipo === 'judicial'
      ? `Pensão judicial ${fmt(pensaoMensal)}/mês × ${meses} meses = ${fmt(totalPago)} integralmente dedutível. Economia em IR: ${fmt(economiaIR)}.`
      : `Pensão informal de ${fmt(totalPago)} NÃO é dedutível. Só vale pensão fixada em juízo ou escritura pública. Regularize com acordo homologado.`,
  };
}
