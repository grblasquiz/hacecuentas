// Pontos na CNH — quando suspende (CTB, Lei 14.071/2021).
// O limite de pontos que suspende a habilitação depende de quantas infrações
// GRAVÍSSIMAS o condutor tem nos últimos 12 meses:
//   - 40 pontos: nenhuma infração gravíssima;
//   - 30 pontos: exatamente 1 infração gravíssima;
//   - 20 pontos: 2 ou mais infrações gravíssimas.
// Motorista profissional (EAR) suspende sempre em 40 pontos.
// Pontuação por infração: leve 3, média 4, grave 5, gravíssima 7.

export interface Inputs {
  leves?: number;
  medias?: number;
  graves?: number;
  gravissimas?: number;
  motoristaProfissional?: string; // 'sim' usa limite fixo de 40 pontos
}
export interface Outputs {
  pontosTotal: number;
  limiteAplicavel: number;
  situacao: string;
  pontosRestantes: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const P_LEVE = 3, P_MEDIA = 4, P_GRAVE = 5, P_GRAVISSIMA = 7;

export function compute(i: Inputs): Outputs {
  const leves = Math.max(0, Math.floor(Number(i.leves) || 0));
  const medias = Math.max(0, Math.floor(Number(i.medias) || 0));
  const graves = Math.max(0, Math.floor(Number(i.graves) || 0));
  const gravissimas = Math.max(0, Math.floor(Number(i.gravissimas) || 0));
  const profissional = String(i.motoristaProfissional) === 'sim';

  const pontosTotal = leves * P_LEVE + medias * P_MEDIA + graves * P_GRAVE + gravissimas * P_GRAVISSIMA;

  // Limite conforme nº de gravíssimas (condutor não profissional).
  let limite: number;
  if (profissional) limite = 40;
  else if (gravissimas >= 2) limite = 20;
  else if (gravissimas === 1) limite = 30;
  else limite = 40;

  const restantes = limite - pontosTotal;
  let situacao: string;
  if (pontosTotal >= limite) {
    situacao = 'Habilitação passível de suspensão';
  } else if (restantes <= 5) {
    situacao = `Atenção: faltam ${restantes} pontos para o limite`;
  } else {
    situacao = `Dentro do limite (faltam ${restantes} pontos)`;
  }
  const pontosRestantes = pontosTotal >= limite
    ? `${pontosTotal - limite} ponto(s) acima do limite`
    : `${restantes} ponto(s) até suspender`;

  const detalhe = `${leves} leve(s), ${medias} média(s), ${graves} grave(s) e ${gravissimas} gravíssima(s) somam ${pontosTotal} pontos. Com ${profissional ? 'CNH profissional (EAR)' : `${gravissimas} gravíssima(s)`}, o limite é ${limite} pontos. ${situacao}.`;

  return {
    pontosTotal,
    limiteAplicavel: limite,
    situacao,
    pontosRestantes,
    detalhe,
    _insight: {
      title: `${pontosTotal} pontos — limite ${limite}`,
      text: pontosTotal >= limite
        ? `Você somou **${pontosTotal} pontos** e o limite aplicável é **${limite}** (${profissional ? 'motorista profissional' : gravissimas >= 2 ? '2+ gravíssimas' : gravissimas === 1 ? '1 gravíssima' : 'sem gravíssimas'}). A habilitação está **passível de suspensão**.`
        : `Você tem **${pontosTotal} pontos** de um limite de **${limite}**. Ainda faltam **${restantes} pontos** para o risco de suspensão. Os pontos caducam 12 meses após cada infração.`,
      tone: pontosTotal >= limite ? 'warn' : (restantes <= 5 ? 'neutral' : 'good'),
      icon: '🚗',
    },
    _chart: {
      type: 'bar',
      labels: ['Pontos acumulados', 'Limite'],
      values: [pontosTotal, limite],
      ariaLabel: `Pontos acumulados ${pontosTotal}, limite de suspensão ${limite}.`,
    },
  };
}
