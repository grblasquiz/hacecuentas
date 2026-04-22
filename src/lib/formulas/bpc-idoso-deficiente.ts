/**
 * BPC/LOAS — Benefício de Prestação Continuada
 * Lei 8.742/1993 (LOAS) — 1 salário mínimo (R$ 1.518 em 2026)
 * Requisitos: idoso 65+ anos OU pessoa com deficiência
 * Renda per capita familiar < 1/4 do salário mínimo
 */

export interface BpcInputs {
  rendaFamiliarTotal: number;
  numeroMembros: number;
  idadeRequerente: number;
  deficiencia: string; // sim | nao
}

export interface BpcOutputs {
  rendaPerCapita: number;
  limitePerCapita: number;
  elegivel: string;
  valorBeneficio: number;
  formula: string;
  explicacion: string;
}

const SALARIO_MINIMO = 1518;
const LIMITE_PER_CAPITA = SALARIO_MINIMO / 4; // R$ 379,50

export function bpcIdosoDeficiente(inputs: BpcInputs): BpcOutputs {
  const renda = Number(inputs.rendaFamiliarTotal) || 0;
  const membros = Math.max(1, Number(inputs.numeroMembros) || 1);
  const idade = Number(inputs.idadeRequerente) || 0;
  const deficiencia = String(inputs.deficiencia || 'nao').toLowerCase();

  if (idade <= 0) {
    throw new Error('Ingresá a idade do requerente');
  }

  const perCapita = renda / membros;
  const atendeIdade = idade >= 65;
  const atendeDeficiencia = deficiencia === 'sim';
  const atendeRenda = perCapita < LIMITE_PER_CAPITA;

  let motivo = '';
  let elegivelBool = false;

  if ((atendeIdade || atendeDeficiencia) && atendeRenda) {
    elegivelBool = true;
    motivo = `Elegível: ${atendeIdade ? 'idoso 65+' : 'pessoa com deficiência'} + renda per capita R$ ${perCapita.toFixed(2)} < R$ ${LIMITE_PER_CAPITA.toFixed(2)}`;
  } else if (!atendeIdade && !atendeDeficiencia) {
    motivo = 'Não elegível: requerente precisa ter 65+ anos ou ser pessoa com deficiência';
  } else {
    motivo = `Não elegível: renda per capita R$ ${perCapita.toFixed(2)} excede o limite R$ ${LIMITE_PER_CAPITA.toFixed(2)}`;
  }

  const valorBeneficio = elegivelBool ? SALARIO_MINIMO : 0;

  const formula = `Renda per capita = R$ ${renda.toFixed(2)} / ${membros} = R$ ${perCapita.toFixed(2)} (limite: R$ ${LIMITE_PER_CAPITA.toFixed(2)})`;
  const explicacion = `${motivo}. O BPC (Lei 8.742/1993 — LOAS) paga 1 salário mínimo (R$ ${SALARIO_MINIMO} em 2026) mensais. Valor: R$ ${valorBeneficio}. O benefício é solicitado no INSS e requer cadastro no CadÚnico.`;

  return {
    rendaPerCapita: Math.round(perCapita * 100) / 100,
    limitePerCapita: Math.round(LIMITE_PER_CAPITA * 100) / 100,
    elegivel: motivo,
    valorBeneficio,
    formula,
    explicacion,
  };
}
