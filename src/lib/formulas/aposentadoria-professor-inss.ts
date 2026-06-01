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
  _insight?: any;
  _chart?: any;
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

  const elegivel = faltaIdade === 0 && faltaMag === 0;
  const _insight = elegivel
    ? {
        title: 'Aposentadoria especial do professor liberada',
        text: `Você cumpre **${idadeMin} anos** de idade e **${anosMag} anos** de magistério, com benefício de **${percentual.toFixed(0)}% da média** = ${fmtBRL(valor)}. O redutor de 5 anos premia o tempo exclusivo em sala de aula.`,
        tone: 'good',
        icon: '🎓',
      }
    : {
        title: 'Ainda faltam requisitos',
        text: `Faltam **${faltaIdade.toFixed(1)} anos** de idade e **${faltaMag} anos** de magistério. Lembre que só conta tempo EXCLUSIVO em educação infantil, fundamental ou médio — função administrativa fora da escola não soma.`,
        tone: 'warn',
        icon: '⏳',
      };

  const _chart = {
    type: 'scale',
    marker: Number(percentual.toFixed(0)),
    markerLabel: `${percentual.toFixed(0)}% da média`,
    min: 60,
    segments: [
      { nombre: 'Piso (60%)', max: 70, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Parcial', max: 85, color: '#fcd34d', colorDark: '#a16207' },
      { nombre: 'Quase integral', max: 99, color: '#86efac', colorDark: '#15803d' },
      { nombre: 'Integral (100%)', max: 101, color: '#22c55e', colorDark: '#166534' },
    ],
    ariaLabel: `Percentual do benefício sobre a média: ${percentual.toFixed(0)}% de um máximo de 100%`,
  };

  return {
    idadeRequerida: `${idadeMin} anos`,
    tempoMagisterio: `${tempoMin} anos`,
    falta: status,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
