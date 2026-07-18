/**
 * Compensação retributiva em layoff / suspensão do contrato — Portugal (art. 305.º CT).
 * Regra: compensação = 2/3 da retribuição normal ilíquida (bruta), com PISO na RMMG (920 €)
 * e TETO em 3 × RMMG (2.760 €). Nos primeiros 60 dias a Segurança Social garante 80 % e a
 * entidade empregadora 20 %; a partir daí, 70 %/30 %. Valores 2026.
 */
import { fmtEUR, LAYOFF_2026, PORTUGAL_2026 } from '../data/portugal-2026';

export interface Inputs {
  salarioBruto?: number; // retribuição normal ilíquida (bruta) mensal, €/mês
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioBruto) || 0);
  if (salario <= 0) throw new Error('Indique a retribuição normal ilíquida (salário bruto) mensal');

  const doisTercos = salario * LAYOFF_2026.fracao; // 2/3 do bruto
  const piso = LAYOFF_2026.piso;   // RMMG 920 €
  const teto = LAYOFF_2026.teto;   // 3 × RMMG = 2.760 €

  let compensacao = doisTercos;
  let limiteAplicado: 'piso' | 'teto' | 'nenhum' = 'nenhum';
  if (doisTercos < piso) { compensacao = piso; limiteAplicado = 'piso'; }
  else if (doisTercos > teto) { compensacao = teto; limiteAplicado = 'teto'; }

  // Repartição do pagamento nos primeiros 60 dias: SS 80 % + entidade 20 %.
  const parteSegSocial = compensacao * 0.80;
  const parteEntidade = compensacao * 0.20;

  let detalhe: string;
  if (limiteAplicado === 'piso') {
    detalhe = `2/3 de ${fmtEUR(salario)} = ${fmtEUR(doisTercos)}, abaixo do piso (RMMG ${fmtEUR(piso)}) → aplica-se o piso: ${fmtEUR(compensacao)}/mês.`;
  } else if (limiteAplicado === 'teto') {
    detalhe = `2/3 de ${fmtEUR(salario)} = ${fmtEUR(doisTercos)}, acima do teto (3 × RMMG = ${fmtEUR(teto)}) → aplica-se o teto: ${fmtEUR(compensacao)}/mês.`;
  } else {
    detalhe = `2/3 de ${fmtEUR(salario)} = ${fmtEUR(compensacao)}/mês (entre o piso ${fmtEUR(piso)} e o teto ${fmtEUR(teto)}).`;
  }

  const _table = {
    title: 'Como se reparte a compensação (primeiros 60 dias)',
    headers: ['Entidade pagadora', '% da compensação', 'Valor'],
    rows: [
      ['Segurança Social', '80 %', fmtEUR(parteSegSocial)],
      ['Entidade empregadora', '20 %', fmtEUR(parteEntidade)],
      ['Total mensal', '100 %', fmtEUR(compensacao)],
    ],
    note: `Nos primeiros 60 dias a Segurança Social suporta 80 % e a entidade 20 %; a partir daí passa a 70 %/30 %. A compensação é 2/3 do bruto, com piso ${fmtEUR(PORTUGAL_2026.rmmg.mensal)} (RMMG) e teto ${fmtEUR(teto)} (3 × RMMG).`,
  };

  const _insight = {
    title: `Compensação em layoff: ${fmtEUR(compensacao)}/mês`,
    text: limiteAplicado === 'piso'
      ? `Como 2/3 do seu bruto (${fmtEUR(doisTercos)}) ficam **abaixo da RMMG**, a lei garante o **piso de ${fmtEUR(piso)}**. Ninguém em layoff recebe menos do que o salário mínimo.`
      : limiteAplicado === 'teto'
        ? `Os 2/3 do seu bruto dariam ${fmtEUR(doisTercos)}, mas há um **teto de 3 × RMMG = ${fmtEUR(teto)}**. Acima disso, a compensação não sobe.`
        : `Recebe **2/3 da retribuição normal ilíquida** = ${fmtEUR(compensacao)}/mês, dentro dos limites legais (piso ${fmtEUR(piso)}, teto ${fmtEUR(teto)}).`,
    tone: 'info',
    icon: '🏭',
  };

  return {
    compensacao: `${fmtEUR(compensacao)}/mês`,
    doisTercos: fmtEUR(doisTercos),
    salarioBruto: `${fmtEUR(salario)}/mês`,
    detalhe,
    _insight,
    _table,
  };
}
