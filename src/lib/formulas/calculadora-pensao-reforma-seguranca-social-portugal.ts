/**
 * Pensão de reforma da Segurança Social (Portugal) — ESTIMATIVA.
 * Pensão = remuneração de referência × taxa global de formação.
 * Taxa de formação anual: 2 % por ano até 20 anos de carreira; acima de 20 anos
 * usa-se uma taxa escalonada (2,0 %–2,3 %) sobre a parcela da RR por escalões de IAS,
 * com o limite global de 92 % (regime geral, Decreto-Lei n.º 187/2007).
 * fmtEUR + IAS vêm de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  remuneracaoMedia: number; // remuneração de referência mensal (€)
  anosDescontos: number;    // anos civis com registo de remunerações
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function calculadoraPensaoReformaSegurancaSocialPortugal(i: Inputs): Outputs {
  const rr = Math.max(0, Number(i.remuneracaoMedia) || 0);
  const anos = Math.max(0, Math.min(40, Number(i.anosDescontos) || 0));

  if (rr <= 0) throw new Error('Indique a remuneração média mensal');
  if (anos <= 0) throw new Error('Indique os anos de descontos (carreira contributiva)');

  const ias = PORTUGAL_2026.ias;

  // Taxa anual de formação:
  //  - Carreira ≤ 20 anos: 2,0 % por ano (taxa global = anos × 2 %).
  //  - Carreira > 20 anos: taxa anual entre 2,0 % e 2,3 % conforme a remuneração de
  //    referência cai em escalões de IAS (quanto menor a RR, maior a taxa — regime
  //    mais favorável para carreiras longas e salários baixos).
  let taxaGlobal: number; // fração (0–0,92)

  if (anos <= 20) {
    taxaGlobal = anos * 0.02;
  } else {
    // Escalões da RR em múltiplos de IAS e respetiva taxa anual (DL 187/2007, anexo).
    const escaloes = [
      { ateIas: 1.1, taxaAno: 0.023 },   // até 1,1 × IAS → 2,3 %/ano
      { ateIas: 2.0, taxaAno: 0.0225 },  // 1,1–2 × IAS → 2,25 %/ano
      { ateIas: 4.0, taxaAno: 0.0221 },  // 2–4 × IAS → 2,21 %/ano
      { ateIas: 8.0, taxaAno: 0.0216 },  // 4–8 × IAS → 2,16 %/ano
      { ateIas: Infinity, taxaAno: 0.02 }, // > 8 × IAS → 2,0 %/ano
    ];
    // Taxa anual ponderada pela fração da RR em cada escalão.
    let somaPonderada = 0;
    let anterior = 0;
    for (const e of escaloes) {
      const limite = e.ateIas === Infinity ? Infinity : e.ateIas * ias;
      const naFaixa = Math.min(rr, limite) - anterior;
      if (naFaixa > 0) somaPonderada += (naFaixa / rr) * e.taxaAno;
      anterior = limite;
      if (rr <= limite) break;
    }
    taxaGlobal = somaPonderada * anos;
  }

  // Limite global da taxa: 92 % da remuneração de referência.
  taxaGlobal = Math.min(taxaGlobal, 0.92);

  const pensaoBruta = rr * taxaGlobal;

  // Pensão mínima do regime geral (≥ 15 anos) ≈ 1,5 × IAS de referência social;
  // usamos um piso conservador ligado ao IAS para carreiras com 15+ anos.
  const pensaoMinima = anos >= 15 ? ias * 0.55 : 0; // referência indicativa
  const pensao = Math.max(pensaoBruta, pensaoMinima);

  const taxaPct = (taxaGlobal * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const taxaReposicaoPct = rr > 0 ? ((pensao / rr) * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 }) : '0';

  const _insight = {
    title: 'Pensão estimada — depende da carreira e da remuneração',
    text: `Com **${anos} anos** de descontos e uma remuneração de referência de **${fmtEUR(rr)}**, a taxa global de formação é **${taxaPct}%**, ` +
      `o que dá uma pensão estimada de **${fmtEUR(pensao)}/mês** (≈ ${taxaReposicaoPct}% do que ganhava). ` +
      `É uma **estimativa**: o valor oficial usa toda a sua carreira contributiva (melhores remunerações desde 2002), o fator de sustentabilidade e a idade de reforma.`,
    tone: 'neutral',
    icon: '👵',
  };

  const _table = {
    title: 'Como se forma a pensão (regime geral)',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Remuneração de referência (RR)', fmtEUR(rr)],
      ['Anos de descontos', `${anos} anos`],
      ['Taxa global de formação', `${taxaPct}%`],
      ['Pensão estimada (RR × taxa)', fmtEUR(pensaoBruta)],
      ['Taxa de substituição', `${taxaReposicaoPct}%`],
      ['Pensão estimada final', fmtEUR(pensao)],
    ],
    note: 'Taxa anual de 2 % até 20 anos; acima de 20 anos varia 2,0 %–2,3 % por escalão de IAS, com tope global de 92 %. Estimativa simplificada — o cálculo oficial é da Segurança Social.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Pensão', value: Math.round(pensao) },
      { label: 'Quebra de rendimento', value: Math.max(0, Math.round(rr - pensao)) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(pensao),
    centerLabel: 'Pensão/mês',
    ariaLabel: `Pensão estimada ${fmtEUR(pensao)} face a uma remuneração de ${fmtEUR(rr)}.`,
  };

  return {
    pensao: fmtEUR(pensao),
    taxaFormacao: `${taxaPct}%`,
    taxaSubstituicao: `${taxaReposicaoPct}%`,
    remuneracaoReferencia: fmtEUR(rr),
    detalhe: `${anos} anos × RR ${fmtEUR(rr)} → taxa ${taxaPct}% → pensão estimada ${fmtEUR(pensao)}/mês (≈ ${taxaReposicaoPct}% da remuneração). Estimativa.`,
    _insight,
    _table,
    _chart,
  };
}
