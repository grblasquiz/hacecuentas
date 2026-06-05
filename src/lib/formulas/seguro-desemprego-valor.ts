/**
 * Seguro-desemprego 2026 — Valor das parcelas.
 * Base: média dos 3 últimos salários (tabela MTE 2026, vigência 11/01/2026).
 *   Até R$ 2.222,17 → 80% da média
 *   Entre R$ 2.222,17 e R$ 3.703,99 → R$ 1.777,74 + 50% do excedente a R$ 2.222,17
 *   Acima R$ 3.703,99 → teto R$ 2.518,65
 * Valor mínimo: 1 salário mínimo (R$ 1.621). Valores em src/lib/data/brasil-2026.ts.
 */
import { SEGURO_DESEMPREGO, SALARIO_MINIMO } from '../data/brasil-2026';

export interface SeguroDesempregoValorInputs {
  salario1: number;
  salario2: number;
  salario3: number;
}

export interface SeguroDesempregoValorOutputs {
  mediaSalarios: number;
  faixaAplicada: string;
  valorParcela: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

const FAIXA1 = SEGURO_DESEMPREGO.faixa1;
const FAIXA2 = SEGURO_DESEMPREGO.faixa2;
const PARCELA_FAIXA1_FIXA = SEGURO_DESEMPREGO.parcelaFixa;
const TETO = SEGURO_DESEMPREGO.teto;

export function seguroDesempregoValor(inputs: SeguroDesempregoValorInputs): SeguroDesempregoValorOutputs {
  const s1 = Number(inputs.salario1) || 0;
  const s2 = Number(inputs.salario2) || 0;
  const s3 = Number(inputs.salario3) || 0;

  if (s1 <= 0 || s2 <= 0 || s3 <= 0) {
    throw new Error('Ingresá os 3 últimos salários');
  }

  const media = (s1 + s2 + s3) / 3;
  let valor = 0;
  let faixa = '';

  if (media <= FAIXA1) {
    valor = media * 0.8;
    faixa = `80% da média (até R$ ${FAIXA1.toFixed(2)})`;
  } else if (media <= FAIXA2) {
    valor = PARCELA_FAIXA1_FIXA + (media - FAIXA1) * 0.5;
    faixa = `R$ ${PARCELA_FAIXA1_FIXA.toFixed(2)} + 50% do excedente a R$ ${FAIXA1.toFixed(2)}`;
  } else {
    valor = TETO;
    faixa = `Teto R$ ${TETO.toFixed(2)}`;
  }

  // Valor mínimo = 1 salário mínimo
  let ajustadoPiso = false;
  if (valor < SALARIO_MINIMO) {
    valor = SALARIO_MINIMO;
    ajustadoPiso = true;
    faixa += ` (ajustado ao piso: 1 salário mínimo R$ ${SALARIO_MINIMO})`;
  }
  const bateuTeto = media > FAIXA2;

  const formula = `Média 3 salários = (${s1.toFixed(2)} + ${s2.toFixed(2)} + ${s3.toFixed(2)}) / 3 = R$ ${media.toFixed(2)} → Parcela R$ ${valor.toFixed(2)}`;
  const explicacion = `A média dos 3 últimos salários é R$ ${media.toFixed(2)}. Aplicando a tabela 2026 do seguro-desemprego (${faixa}), o valor de cada parcela é R$ ${valor.toFixed(2)}. O benefício tem valor mínimo de 1 salário mínimo (R$ ${SALARIO_MINIMO}) e teto de R$ ${TETO.toFixed(2)}.`;

  const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let _insight: any;
  if (bateuTeto) {
    _insight = {
      title: 'Parcela no teto',
      text: `Sua média de **R$ ${brl(media)}** ultrapassa a última faixa, então a parcela fica **limitada ao teto de R$ ${brl(TETO)}**. Mesmo ganhando mais, o seguro-desemprego não paga acima desse valor.`,
      tone: 'warn',
      icon: '🧾',
    };
  } else if (ajustadoPiso) {
    _insight = {
      title: 'Parcela no piso',
      text: `O cálculo daria menos que o salário mínimo, então a parcela é **ajustada ao piso de R$ ${brl(SALARIO_MINIMO)}**. Nenhuma parcela do seguro-desemprego pode ser inferior a um salário mínimo.`,
      tone: 'neutral',
      icon: '🧾',
    };
  } else {
    _insight = {
      title: 'Valor da parcela',
      text: `Com média de **R$ ${brl(media)}**, cada parcela do seguro-desemprego é de **R$ ${brl(valor)}** (${faixa}). Isso equivale a cerca de **${Math.round((valor / media) * 100)}%** do seu salário médio.`,
      tone: 'good',
      icon: '💰',
    };
  }

  const lastMax = Math.max(FAIXA2 * 1.4, media * 1.1);
  const _chart = {
    type: 'scale',
    marker: Math.round(media * 100) / 100,
    markerLabel: 'Sua média',
    min: 0,
    segments: [
      { nombre: '80% da média', max: Math.round(FAIXA1), color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Faixa intermediária', max: Math.round(FAIXA2), color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Teto', max: Math.round(lastMax), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Sua média salarial de R$ ${brl(media)} cai na faixa "${bateuTeto ? 'teto' : media <= FAIXA1 ? '80% da média' : 'intermediária'}" da tabela do seguro-desemprego.`,
  };

  return {
    mediaSalarios: Math.round(media * 100) / 100,
    faixaAplicada: faixa,
    valorParcela: Math.round(valor * 100) / 100,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
