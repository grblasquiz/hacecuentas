/** Aposentadoria Especial (Insalubridade/Periculosidade) — INSS.
 * 15 anos: baixa exposição (mineração subterrânea frente de trabalho).
 * 20 anos: média (mineração subterrânea não-frente, asbesto).
 * 25 anos: alta (demais atividades — ruído, agentes químicos, biológicos, etc).
 * Pós-EC 103/2019 exige idade mínima: 55/58/60 (15/20/25).
 */

export interface Inputs {
  categoria: '15' | '20' | '25' | string;
  idade: number;
  anosExposicao: number;
  mediaSalarial: number;
}

export interface Outputs {
  categoriaDescricao: string;
  idadeMinima: string;
  tempoExposicaoMin: string;
  falta: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssEspecial(i: Inputs): Outputs {
  const cat = String(i.categoria || '25');
  const idade = Number(i.idade);
  const exp = Number(i.anosExposicao);
  const media = Number(i.mediaSalarial);
  if (!idade || !exp || !media) throw new Error('Informe idade, tempo de exposição e média salarial.');

  let tempoMin = 25;
  let idadeMin = 60;
  let descricao = 'Alta exposição (25 anos)';
  if (cat === '15') { tempoMin = 15; idadeMin = 55; descricao = 'Baixa exposição – mineração subterrânea frente (15 anos)'; }
  else if (cat === '20') { tempoMin = 20; idadeMin = 58; descricao = 'Média exposição – mineração/asbesto (20 anos)'; }

  const faltaIdade = Math.max(0, idadeMin - idade);
  const faltaExp = Math.max(0, tempoMin - exp);

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  // Pós-EC 103: 60% + 2% por ano excedente a 20 anos contribuição total (simplificado: aplica sobre tempoMin)
  const excedente = Math.max(0, exp - tempoMin);
  const percentual = Math.min(100, 60 + excedente * 2);
  const valor = faltaIdade === 0 && faltaExp === 0 ? mediaAplicada * (percentual / 100) : 0;

  const status =
    faltaIdade === 0 && faltaExp === 0
      ? 'Requisitos atingidos — aposentadoria especial'
      : `Faltam ${faltaIdade} anos de idade e ${faltaExp} anos de exposição`;

  const formula = `Categoria ${cat} anos: idade mín ${idadeMin} + ${tempoMin} anos exposição comprovada (PPP + LTCAT)`;
  const explicacao = `Aposentadoria especial por insalubridade (EC 103/2019): três categorias conforme intensidade da exposição: 15 anos (baixa — mineração subterrânea), 20 anos (média — asbesto/mineração não frente), 25 anos (alta — demais agentes nocivos: ruído acima de 85dB, químicos, biológicos, calor). Após EC 103, exige idade mínima (55/58/60). Documentação exigida: PPP (Perfil Profissiográfico Previdenciário) e LTCAT. Teto ${fmtBRL(teto)}.`;

  return {
    categoriaDescricao: descricao,
    idadeMinima: `${idadeMin} anos`,
    tempoExposicaoMin: `${tempoMin} anos`,
    falta: status,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
