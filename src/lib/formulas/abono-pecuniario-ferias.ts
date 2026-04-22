/** Abono pecuniário: venda de até 10 dias das férias (1/3 do período).
 *  CLT art. 143. Valor: (salário/30) × 10 + 1/3 sobre o abono.
 */

export interface Inputs {
  salarioBruto: number;
  diasVendidos: number;
}

export interface Outputs {
  diasVendidos: string;
  abonoBase: string;
  tercoSobreAbono: string;
  abonoTotal: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function abonoPecuniarioFerias(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const dias = Math.min(10, Math.max(0, Math.floor(Number(i.diasVendidos) || 0)));
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');
  if (dias <= 0) throw new Error('Informe os dias vendidos (1 a 10).');

  const diario = salario / 30;
  const base = diario * dias;
  const terco = base / 3;
  const total = base + terco;

  const formula = `Abono = (${fmt(salario)}/30) × ${dias} + 1/3 = ${fmt(total)}`;
  const explicacao = `Abono pecuniário de ${dias} dia(s) de férias vendidos: ${fmt(base)} + 1/3 constitucional ${fmt(terco)} = ${fmt(total)}. Valor isento de INSS e IRRF (natureza indenizatória). Máximo 10 dias. Base legal: CLT art. 143.`;

  return {
    diasVendidos: `${dias} dia(s)`,
    abonoBase: fmt(base),
    tercoSobreAbono: fmt(terco),
    abonoTotal: fmt(total),
    formula,
    explicacao,
  };
}
