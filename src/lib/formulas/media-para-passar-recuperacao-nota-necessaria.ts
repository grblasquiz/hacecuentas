// Média para passar — quanto preciso tirar na prova final / recuperação.
// Utilidade escolar pura. Dado o que já foi feito (média parcial e o peso que
// ela tem na nota final) e a média exigida para aprovação, calcula a nota
// mínima necessária na avaliação que falta.
//
//   notaNecessaria = (mediaParaPassar − mediaParcial × pesoParcial) ÷ pesoFinal
//   com pesoParcial + pesoFinal = 1.

export interface Inputs {
  mediaParcial: number;      // média já obtida (0–10)
  pesoParcialPct: number;    // quanto a média parcial pesa na nota final (%)
  mediaParaPassar?: number;  // média mínima de aprovação (padrão 6)
  notaMaxima?: number;       // teto da nota (padrão 10)
}
export interface Outputs {
  notaNecessaria: string;
  situacao: string;
  pesoFinalPct: string;
  folga: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmt1 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const mediaParcial = Math.max(0, Number(i.mediaParcial) || 0);
  let pesoParcial = Number(i.pesoParcialPct);
  if (!isFinite(pesoParcial)) pesoParcial = 70;
  pesoParcial = Math.min(99, Math.max(1, pesoParcial)) / 100;   // evita divisão por zero no peso final
  const pesoFinal = 1 - pesoParcial;
  const mediaPassar = isFinite(Number(i.mediaParaPassar)) && Number(i.mediaParaPassar) > 0 ? Number(i.mediaParaPassar) : 6;
  const notaMax = isFinite(Number(i.notaMaxima)) && Number(i.notaMaxima) > 0 ? Number(i.notaMaxima) : 10;

  const necessariaNum = (mediaPassar - mediaParcial * pesoParcial) / pesoFinal;

  let situacao: string;
  let notaNecessariaStr: string;
  let folga = '—';

  if (necessariaNum <= 0) {
    situacao = 'Já está aprovado';
    notaNecessariaStr = '0,0';
    // Com quanto de folga: mesmo zerando a final, quanto passa da média.
    const mediaSeZerar = mediaParcial * pesoParcial;
    folga = `+${fmt1(mediaSeZerar - mediaPassar)} acima da média mesmo tirando 0`;
  } else if (necessariaNum > notaMax) {
    situacao = 'Não dá para passar só com a avaliação final';
    notaNecessariaStr = fmt1(necessariaNum);
    folga = `faltariam ${fmt1(necessariaNum - notaMax)} pontos acima do teto (${fmt1(notaMax)})`;
  } else {
    situacao = `Precisa tirar ${fmt1(necessariaNum)} na avaliação final`;
    notaNecessariaStr = fmt1(necessariaNum);
    folga = `${fmt1(notaMax - necessariaNum)} de margem até o teto (${fmt1(notaMax)})`;
  }

  const pesoFinalPct = `${(pesoFinal * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
  const detalhe = `Média parcial ${fmt1(mediaParcial)} pesando ${(pesoParcial * 100).toFixed(0)}% e a final valendo ${pesoFinalPct}, para atingir média ${fmt1(mediaPassar)}: nota necessária = (${fmt1(mediaPassar)} − ${fmt1(mediaParcial)}×${pesoParcial.toFixed(2)}) ÷ ${pesoFinal.toFixed(2)} = ${notaNecessariaStr}.`;

  return {
    notaNecessaria: notaNecessariaStr,
    situacao,
    pesoFinalPct,
    folga,
    detalhe,
    _insight: {
      title: situacao,
      text: necessariaNum <= 0
        ? `Com média parcial **${fmt1(mediaParcial)}** e o peso informado, você **já garantiu** a média ${fmt1(mediaPassar)} — nem precisa da avaliação final.`
        : necessariaNum > notaMax
        ? `Para fechar a média ${fmt1(mediaPassar)} você precisaria de **${notaNecessariaStr}**, acima do teto de ${fmt1(notaMax)}. Matematicamente **não dá** só com a final.`
        : `Você precisa de **${notaNecessariaStr}** na avaliação final (que vale ${pesoFinalPct}) para fechar a média ${fmt1(mediaPassar)}.`,
      tone: necessariaNum > notaMax ? 'warn' : 'good',
      icon: '🎓',
    },
    _chart: {
      type: 'bar',
      labels: ['Média parcial', 'Nota necessária', 'Média p/ passar'],
      values: [Math.round(mediaParcial * 100) / 100, Math.round(Math.max(0, Math.min(necessariaNum, notaMax)) * 100) / 100, Math.round(mediaPassar * 100) / 100],
      ariaLabel: `Média parcial ${fmt1(mediaParcial)}, nota necessária ${notaNecessariaStr}, média para passar ${fmt1(mediaPassar)}.`,
    },
  };
}
