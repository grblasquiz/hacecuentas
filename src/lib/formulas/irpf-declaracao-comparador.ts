/**
 * IRPF 2026 — Comparador: Simplificada vs Completa
 * Simplificada: desconto 20% da renda tributável, limite R$ 16.754,34
 * Completa: deduções legais somadas (dependentes, saúde, educação, PGBL, pensão)
 * Receita Federal — Instrução Normativa RFB (anual) e Lei 9.250/1995
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const LIMITE_SIMPLIFICADA = 16754.34;
const FAIXAS_ANUAIS = [
  { ate: 26963.20, aliq: 0, parcela: 0 },
  { ate: 33919.80, aliq: 0.075, parcela: 2022.24 },
  { ate: 45012.60, aliq: 0.15, parcela: 4566.23 },
  { ate: 55976.16, aliq: 0.225, parcela: 7942.17 },
  { ate: Infinity, aliq: 0.275, parcela: 10740.98 },
];

function calcularIR(base: number): number {
  if (base <= 0) return 0;
  for (const f of FAIXAS_ANUAIS) {
    if (base <= f.ate) return Math.max(0, base * f.aliq - f.parcela);
  }
  return 0;
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeclaracaoComparador(i: Inputs): Outputs {
  const renda = Number(i.rendaTributavel) || 0;
  const deducoes = Number(i.deducoesCompleta) || 0;

  const descontoSimpl = Math.min(renda * 0.20, LIMITE_SIMPLIFICADA);
  const baseSimpl = Math.max(0, renda - descontoSimpl);
  const irSimpl = calcularIR(baseSimpl);

  const baseCompleta = Math.max(0, renda - deducoes);
  const irCompleta = calcularIR(baseCompleta);

  const melhor = irSimpl <= irCompleta ? 'simplificada' : 'completa';
  const economia = Math.abs(irSimpl - irCompleta);

  return {
    descontoSimplificada: fmt(descontoSimpl),
    baseSimplificada: fmt(baseSimpl),
    irSimplificada: fmt(irSimpl),
    baseCompleta: fmt(baseCompleta),
    irCompleta: fmt(irCompleta),
    melhorOpcao: melhor === 'simplificada' ? 'Simplificada' : 'Completa',
    economia: fmt(economia),
    resumo: `Renda tributável ${fmt(renda)}. Simplificada paga ${fmt(irSimpl)}; completa paga ${fmt(irCompleta)}. Escolha a ${melhor} e economize ${fmt(economia)}.`,
  };
}
