/**
 * Prestação do crédito habitação (hipoteca) em Portugal — sistema francês (PMT).
 * Prestação = capital × [ i × (1+i)^n ] / [ (1+i)^n − 1 ], com i = taxa mensal e n = nº de meses.
 * Taxa anual (TAN) ≈ Euribor + spread. Inclui estimativa de TAEG aproximada.
 * A fórmula PMT calcula-se aqui (não está no data file). fmtEUR vem de portugal-2026.ts.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  montante: number;     // capital financiado (€)
  prazoAnos: number;    // prazo em anos
  euribor?: number;     // Euribor (% anual)
  spread?: number;      // spread do banco (% anual)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function calculadoraPrestacaoCreditoHabitacaoPortugal(i: Inputs): Outputs {
  const montante = Math.max(0, Number(i.montante) || 0);
  const prazoAnos = Math.max(1, Number(i.prazoAnos) || 30);
  const euribor = Number(i.euribor);
  const spread = Number(i.spread);

  if (montante <= 0) throw new Error('Indique o montante do crédito');

  // Defaults realistas (Euribor 6M em torno de 2,1 % e spread médio 1,0 % em 2026).
  const euriborPct = Number.isFinite(euribor) ? Math.max(0, euribor) : 2.1;
  const spreadPct = Number.isFinite(spread) ? Math.max(0, spread) : 1.0;
  const tanPct = euriborPct + spreadPct;            // TAN (taxa anual nominal)

  const n = Math.round(prazoAnos * 12);
  const iMens = tanPct / 100 / 12;

  // PMT (sistema francês). Caso taxa 0 → divisão simples do capital.
  const prestacao = iMens === 0
    ? montante / n
    : montante * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);

  const totalPago = prestacao * n;
  const totalJuros = Math.max(0, totalPago - montante);

  // TAEG aproximada: além dos juros, o crédito habitação carrega seguros
  // (vida + multirriscos) e comissões. Estimamos um agravamento típico de
  // ~0,5 p.p. sobre a TAN para refletir o custo total anual efetivo.
  const taegPct = tanPct + 0.5;

  const jurosPct = totalPago > 0 ? (totalJuros / totalPago) * 100 : 0;
  const jurosPctStr = jurosPct.toLocaleString('de-DE', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'A prestação é capital + juros; o peso muda com a Euribor',
    text: `Para **${fmtEUR(montante)}** a **${prazoAnos} anos** com TAN **${tanPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%** ` +
      `(Euribor ${euriborPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}% + spread ${spreadPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%), ` +
      `paga **${fmtEUR(prestacao)}/mês**. Ao longo do prazo paga **${fmtEUR(totalJuros)}** só de juros — cerca de **${jurosPctStr}%** do total. ` +
      `Como a maioria dos créditos é a taxa variável, se a Euribor subir 1 p.p. a prestação sobe (e vice-versa).`,
    tone: 'warn',
    icon: '🏦',
  };

  const _table = {
    title: 'Resumo do crédito habitação',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Capital financiado', fmtEUR(montante)],
      ['Prazo', `${prazoAnos} anos (${n} meses)`],
      ['TAN (Euribor + spread)', `${tanPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`],
      ['Prestação mensal', fmtEUR(prestacao)],
      ['Total de juros', fmtEUR(totalJuros)],
      ['Total pago (capital + juros)', fmtEUR(totalPago)],
      ['TAEG aproximada', `${taegPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`],
    ],
    note: 'Sistema francês: prestação constante, juros decrescentes. A TAEG inclui seguros e comissões (aqui estimada); a real consta na FINE/ficha do banco.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(montante) },
      { label: 'Juros', value: Math.round(totalJuros) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(prestacao),
    centerLabel: 'Prestação/mês',
    ariaLabel: `Prestação ${fmtEUR(prestacao)}/mês. Capital ${fmtEUR(montante)}, juros ${fmtEUR(totalJuros)}.`,
  };

  return {
    prestacao: fmtEUR(prestacao),
    totalJuros: fmtEUR(totalJuros),
    totalPago: fmtEUR(totalPago),
    tan: `${tanPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`,
    taeg: `${taegPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`,
    detalhe: `${fmtEUR(montante)} a ${prazoAnos} anos (TAN ${tanPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%) → prestação ${fmtEUR(prestacao)}/mês, ${fmtEUR(totalJuros)} de juros no total.`,
    _insight,
    _table,
    _chart,
  };
}
