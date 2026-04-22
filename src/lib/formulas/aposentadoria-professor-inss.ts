/** Aposentadoria Especial do Professor — INSS.
 * Redutor de 5 anos sobre regra geral.
 * Regra transição idade: homem 57 / mulher 55 anos (pós-EC 103).
 * Exige 25 anos exclusivos de magistério (educação infantil, fundamental, médio).
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  idade: number;
  anosMagisterio: number;
  mediaSalarial: number;
}

export interface Outputs {
  idadeRequerida: string;
  tempoMagisterio: string;
  falta: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaProfessorInss(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const idade = Number(i.idade);
  const anosMag = Number(i.anosMagisterio);
  const media = Number(i.mediaSalarial);
  if (!idade || !anosMag || !media) throw new Error('Informe idade, anos de magistério e média salarial.');

  const idadeMin = sexo === 'mulher' ? 55 : 57;
  const tempoMin = sexo === 'mulher' ? 25 : 25;
  const faltaIdade = Math.max(0, idadeMin - idade);
  const faltaMag = Math.max(0, tempoMin - anosMag);

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  // 60% + 2% por ano excedente ao tempo mínimo (regra professor)
  const excedente = Math.max(0, anosMag - tempoMin);
  const percentual = Math.min(100, 60 + excedente * 2);
  const valor = faltaIdade === 0 && faltaMag === 0 ? mediaAplicada * (percentual / 100) : 0;

  const status =
    faltaIdade === 0 && faltaMag === 0
      ? 'Requisitos atingidos — aposentadoria especial professor'
      : `Faltam ${faltaIdade.toFixed(1)} anos de idade e ${faltaMag} anos de magistério`;

  const formula = `Prof ${sexo}: ${idadeMin} anos + ${tempoMin} magistério → 60% + 2% × (${anosMag}-${tempoMin}) = ${percentual.toFixed(0)}%`;
  const explicacao = `Aposentadoria especial do professor (EC 103/2019): redutor de 5 anos sobre regra geral. Exige ${idadeMin} anos de idade e 25 anos EXCLUSIVAMENTE em funções de magistério (educação infantil, fundamental ou médio). Diretores e coordenadores também contam se exercerem em escola. Benefício: 60% da média + 2% por ano excedente. Teto INSS ${fmtBRL(teto)}.`;

  return {
    idadeRequerida: `${idadeMin} anos`,
    tempoMagisterio: `${tempoMin} anos`,
    falta: status,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
