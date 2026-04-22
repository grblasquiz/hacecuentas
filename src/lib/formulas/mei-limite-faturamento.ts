/** MEI — Monitor de limite de faturamento R$ 81.000/ano (2026)
 *  Alerta aos 70% (R$ 56.700). Se ultrapassa em até 20% (R$97.200) paga DAS complementar.
 *  Se > 20% desenquadramento retroativo ao ano.
 */

export interface Inputs {
  faturamentoAcumulado: number;
  mesesDecorridos: number;
}

export interface Outputs {
  limiteAnual: number;
  percentualUsado: number;
  disponivel: number;
  projecaoAnual: number;
  alerta: string;
  status: string;
  formula: string;
  explicacion: string;
}

export function meiLimiteFaturamento(i: Inputs): Outputs {
  const fat = Math.max(0, Number(i.faturamentoAcumulado) || 0);
  const meses = Math.min(12, Math.max(1, Number(i.mesesDecorridos) || 1));

  const LIMITE = 81000;
  const LIMITE_20 = 97200;
  const percentualUsado = (fat / LIMITE) * 100;
  const disponivel = Math.max(0, LIMITE - fat);
  const projecaoAnual = (fat / meses) * 12;

  let status = 'ok';
  let alerta = '';

  if (fat > LIMITE_20) {
    status = 'desenquadramento';
    alerta = `⚠️ Ultrapassou R$ 97.200 (20% acima do limite). Desenquadramento RETROATIVO a janeiro. Você deverá virar ME do Simples Nacional com efeito retroativo e pagar diferenças.`;
  } else if (fat > LIMITE) {
    status = 'excesso';
    alerta = `⚠️ Ultrapassou R$ 81.000. Pagará DAS complementar sobre o excedente (até R$ 16.200 tolerado). A partir de janeiro do próximo ano vira ME obrigatoriamente.`;
  } else if (percentualUsado >= 70) {
    status = 'atencao';
    alerta = `⚠️ Já usou ${percentualUsado.toFixed(1)}% do limite. Projeção: R$ ${projecaoAnual.toFixed(2)}. Considere migrar para ME antes de estourar.`;
  } else {
    status = 'ok';
    alerta = `✓ Dentro do limite (${percentualUsado.toFixed(1)}% usado). Disponível: R$ ${disponivel.toFixed(2)}.`;
  }

  const formula = `% usado = R$ ${fat.toFixed(2)} / R$ ${LIMITE} × 100 = ${percentualUsado.toFixed(1)}%`;
  const explicacion = `Faturamento MEI em ${meses} mes(es): R$ ${fat.toFixed(2)} (${percentualUsado.toFixed(1)}% do teto anual de R$ 81.000). Projeção linear anual: R$ ${projecaoAnual.toFixed(2)}. Disponível: R$ ${disponivel.toFixed(2)}. ${alerta}`;

  return {
    limiteAnual: LIMITE,
    percentualUsado: Number(percentualUsado.toFixed(2)),
    disponivel: Number(disponivel.toFixed(2)),
    projecaoAnual: Number(projecaoAnual.toFixed(2)),
    alerta,
    status,
    formula,
    explicacion,
  };
}
