/**
 * Minha Casa Minha Vida 2026 — enquadramento por faixa de renda familiar.
 * Faixa 1: até R$ 2.850/mês — subsídio até 95% do valor do imóvel.
 * Faixa 2: até R$ 4.700/mês — subsídio decrescente, taxa 4,25%-5% aa.
 * Faixa 3: até R$ 8.000/mês — sem subsídio, taxa 7,66%-8,16% aa.
 * Relançado em 2023 (Lei 14.620/2023).
 */

export interface Inputs {
  rendaFamiliar: number | string;
  valorImovel: number | string;
  regiao: string; // 'metropolitana' | 'interior'
}

export interface Outputs {
  faixaEnquadrada: string;
  subsidioEstimado: string;
  taxaJurosAnual: string;
  valorFinanciado: string;
  parcelaEstimada: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function mcmvFaixaSubsidio(i: Inputs): Outputs {
  const renda = Number(i.rendaFamiliar) || 0;
  const valor = Number(i.valorImovel) || 0;
  const regiao = String(i.regiao || 'metropolitana');

  if (renda <= 0 || valor <= 0) {
    throw new Error('Informe renda familiar e valor do imóvel válidos.');
  }

  // Limite de valor de imóvel por região (2026)
  const tetoImovel = regiao === 'metropolitana' ? 350000 : 264000;
  if (valor > tetoImovel) {
    throw new Error(`Valor do imóvel acima do teto MCMV para ${regiao}: R$ ${tetoImovel.toLocaleString('pt-BR')}.`);
  }

  let faixa = '';
  let subsidio = 0;
  let taxa = 0;

  if (renda <= 2850) {
    faixa = 'Faixa 1 (até R$ 2.850) — maior subsídio';
    subsidio = valor * 0.55; // até 95% em casos específicos; média prática 55-60%
    taxa = 4.25;
  } else if (renda <= 4700) {
    faixa = 'Faixa 2 (até R$ 4.700) — subsídio decrescente';
    // subsídio decrescente proporcional
    const fator = 1 - (renda - 2850) / (4700 - 2850);
    subsidio = valor * 0.25 * fator;
    taxa = 5.0;
  } else if (renda <= 8000) {
    faixa = 'Faixa 3 (até R$ 8.000) — sem subsídio, taxa reduzida';
    subsidio = 0;
    taxa = 7.66;
  } else {
    throw new Error('Renda familiar acima do limite do MCMV (R$ 8.000/mês em 2026).');
  }

  const pv = valor - subsidio;
  const n = 360; // prazo padrão 30 anos
  const im = Math.pow(1 + taxa / 100, 1 / 12) - 1;
  // SAC: parcela inicial
  const amort = pv / n;
  const parcelaInicial = amort + pv * im;

  const pctSubsidio = valor > 0 ? (subsidio / valor) * 100 : 0;
  const insight = {
    title: subsidio > 0 ? 'Quanto o governo banca' : 'Sem subsídio, só juros reduzidos',
    text: subsidio > 0
      ? `Você se enquadra na **${faixa.split(' —')[0]}**: o subsídio de **${brl(subsidio)}** cobre **${pctSubsidio.toFixed(0)}%** do imóvel, então você financia **${brl(pv)}** a **${taxa.toFixed(2)}% aa** — parcela inicial SAC de **${brl(parcelaInicial)}**.`
      : `Você se enquadra na **Faixa 3**: sem subsídio, mas a taxa de **${taxa.toFixed(2)}% aa** é bem abaixo do mercado livre. Financia **${brl(pv)}**, parcela inicial SAC de **${brl(parcelaInicial)}**.`,
    tone: subsidio > 0 ? 'good' : 'neutral',
    icon: '🏠',
  };

  const chart = subsidio > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Subsídio do governo', value: Math.round(subsidio) },
          { label: 'Você financia', value: Math.round(valor) - Math.round(subsidio) },
        ],
        prefix: 'R$ ',
        centerValue: brl(valor),
        centerLabel: 'Valor do imóvel',
        ariaLabel: `Composição do valor do imóvel: subsídio ${brl(subsidio)} e parte financiada ${brl(pv)}.`,
      }
    : undefined;

  return {
    faixaEnquadrada: faixa,
    subsidioEstimado: brl(subsidio),
    taxaJurosAnual: taxa.toFixed(2) + '% aa',
    valorFinanciado: brl(pv),
    parcelaEstimada: brl(parcelaInicial),
    resumen: `Renda ${brl(renda)} → ${faixa}. Imóvel ${brl(valor)}: subsídio ${brl(subsidio)}, financia ${brl(pv)} a ${taxa.toFixed(2)}% aa. Parcela inicial SAC em 360 meses: ${brl(parcelaInicial)}.`,
    _insight: insight,
    _chart: chart,
  };
}
