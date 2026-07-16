// Adicional de insalubridade e periculosidade (CLT).
// Insalubridade (art. 192): 10% (grau mínimo), 20% (médio) ou 40% (máximo)
//   sobre o salário mínimo nacional (base padrão; convenções coletivas ou
//   decisão judicial podem usar o salário base).
// Periculosidade (art. 193): 30% sobre o salário base (sem adicionais).
// Não se acumulam: o trabalhador recebe o mais vantajoso.
// Salário mínimo importado da fonte única (src/lib/data/brasil-2026.ts).

import { SALARIO_MINIMO } from '../data/brasil-2026.ts';

export interface Inputs {
  tipo: string;         // 'insalubridade-10' | 'insalubridade-20' | 'insalubridade-40' | 'periculosidade-30'
  salarioBase: number;  // R$ (salário contratual, sem adicionais)
  baseInsalubridade?: string; // 'salario-minimo' (padrão) | 'salario-base'
}
export interface Outputs {
  adicionalMensal: string;
  percentualAplicado: string;
  baseCalculo: string;
  reflexoAnual: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GRAUS: Record<string, { pct: number; nome: string; tipo: 'insalubridade' | 'periculosidade' }> = {
  'insalubridade-10': { pct: 0.10, nome: 'Insalubridade grau mínimo', tipo: 'insalubridade' },
  'insalubridade-20': { pct: 0.20, nome: 'Insalubridade grau médio', tipo: 'insalubridade' },
  'insalubridade-40': { pct: 0.40, nome: 'Insalubridade grau máximo', tipo: 'insalubridade' },
  'periculosidade-30': { pct: 0.30, nome: 'Periculosidade', tipo: 'periculosidade' },
};

export function compute(i: Inputs): Outputs {
  const salarioBase = Number(i.salarioBase) || 0;
  const cfg = GRAUS[String(i.tipo)] || GRAUS['insalubridade-20'];
  const usaSalarioBase = String(i.baseInsalubridade) === 'salario-base';

  // Base de cálculo: periculosidade sempre sobre o salário base; insalubridade
  // sobre o salário mínimo (padrão) ou salário base (se convenção/decisão).
  const base = cfg.tipo === 'periculosidade'
    ? salarioBase
    : (usaSalarioBase ? salarioBase : SALARIO_MINIMO);

  if (cfg.tipo === 'periculosidade' && salarioBase <= 0) {
    return {
      adicionalMensal: '—', percentualAplicado: '30%', baseCalculo: '—', reflexoAnual: '—',
      detalhe: 'Informe o salário base para calcular a periculosidade (30% sobre o salário).',
      _insight: { title: 'Falta o salário base', text: 'A **periculosidade** é 30% sobre o **salário base**. Informe o salário.', tone: 'warn', icon: '⚠️' },
    };
  }
  if (cfg.tipo === 'insalubridade' && usaSalarioBase && salarioBase <= 0) {
    return {
      adicionalMensal: '—', percentualAplicado: `${(cfg.pct * 100).toFixed(0)}%`, baseCalculo: '—', reflexoAnual: '—',
      detalhe: 'Informe o salário base para calcular a insalubridade sobre o salário base.',
      _insight: { title: 'Falta o salário base', text: 'Você escolheu calcular sobre o **salário base**. Informe o salário.', tone: 'warn', icon: '⚠️' },
    };
  }

  const adicional = base * cfg.pct;
  // Reflexo anual aproximado: 12 meses + 1/3 de férias + 13º sobre o adicional.
  const reflexoAnual = adicional * (12 + 1 / 3 + 1);

  const baseLabel = cfg.tipo === 'periculosidade'
    ? 'salário base'
    : (usaSalarioBase ? 'salário base' : `salário mínimo (${fmtBRL(SALARIO_MINIMO)})`);

  const detalhe = `${cfg.nome}: ${(cfg.pct * 100).toFixed(0)}% sobre ${baseLabel} (${fmtBRL(base)}) = ${fmtBRL(adicional)} por mês. Com reflexos em 13º e 1/3 de férias, o impacto anual é de cerca de ${fmtBRL(reflexoAnual)}.`;

  return {
    adicionalMensal: fmtBRL(adicional),
    percentualAplicado: `${(cfg.pct * 100).toFixed(0)}%`,
    baseCalculo: `${fmtBRL(base)} (${baseLabel})`,
    reflexoAnual: fmtBRL(reflexoAnual),
    detalhe,
    _insight: {
      title: `Adicional: ${fmtBRL(adicional)}/mês`,
      text: `${cfg.nome} garante **${(cfg.pct * 100).toFixed(0)}%** sobre o ${baseLabel}, ou seja **${fmtBRL(adicional)}** por mês. No ano, com 13º e férias, isso soma cerca de **${fmtBRL(reflexoAnual)}**.`,
      tone: 'good',
      icon: '⚠️',
    },
    _chart: {
      type: 'bar',
      labels: ['Base de cálculo', 'Adicional mensal'],
      values: [Math.round(base * 100) / 100, Math.round(adicional * 100) / 100],
      prefix: 'R$ ',
      ariaLabel: `Base ${fmtBRL(base)}, adicional mensal ${fmtBRL(adicional)}.`,
    },
  };
}
