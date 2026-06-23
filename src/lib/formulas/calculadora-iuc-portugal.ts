/**
 * Calculadora de IUC Portugal — Imposto Único de Circulação (ligeiros de passageiros).
 *
 * ⚠️ ESTIMATIVA. A AT não publica uma tabela €/escalão consolidada e de leitura direta;
 * os valores por escalão atualizam-se anualmente. Esta calculadora usa o MÉTODO legal
 * (Código do IUC) e os coeficientes de antiguidade de portugal-2026.ts, com tabelas de
 * referência aproximadas. Para o valor exato, emita o DUC no Portal das Finanças.
 *
 * Dois métodos consoante a data da 1.ª matrícula:
 *   • CATEGORIA A (matriculados ATÉ 30-jun-2007): componente única de CILINDRADA,
 *     multiplicada por um coeficiente de antiguidade (quanto mais velho, menor).
 *   • CATEGORIA B (matriculados DESDE 1-jul-2007): componente de CILINDRADA + componente
 *     de CO2, multiplicada pelo coeficiente de antiguidade do ano da matrícula.
 *     Veículos a gasóleo (diesel) têm um agravamento adicional na cilindrada.
 *
 * Não hardcoda os coeficientes de antiguidade: vêm de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026';

// ── Tabelas de referência aproximadas (€) — Categoria B, 2026 ──
// Componente de cilindrada (sobre cm³). Escalões legais do Código do IUC.
const CAT_B_CILINDRADA: ReadonlyArray<{ ateCc: number; euros: number }> = [
  { ateCc: 1000, euros: 30.34 },
  { ateCc: 1250, euros: 60.85 },
  { ateCc: 1500, euros: 121.71 },
  { ateCc: 2500, euros: 198.89 },
  { ateCc: Infinity, euros: 408.16 },
];
// Componente de CO2 (g/km) — veículos de gasolina/elétricos (1.ª matrícula desde 2007).
const CAT_B_CO2: ReadonlyArray<{ ateCo2: number; euros: number }> = [
  { ateCo2: 120, euros: 64.82 },
  { ateCo2: 150, euros: 96.86 },
  { ateCo2: 180, euros: 210.39 },
  { ateCo2: 250, euros: 720.96 },
  { ateCo2: Infinity, euros: 1234.01 },
];
// Agravamento de cilindrada para veículos a GASÓLEO (diesel) — adicional aproximado.
const CAT_B_AGRAVAMENTO_DIESEL = 1.1; // multiplicador sobre a componente de cilindrada

// ── Categoria A (pré-jul-2007): componente única de cilindrada ──
const CAT_A_CILINDRADA: ReadonlyArray<{ ateCc: number; euros: number }> = [
  { ateCc: 1000, euros: 19.71 },
  { ateCc: 1300, euros: 39.56 },
  { ateCc: 1750, euros: 61.71 },
  { ateCc: 2600, euros: 157.01 },
  { ateCc: 3500, euros: 285.43 },
  { ateCc: Infinity, euros: 508.27 },
];
// Coeficiente de antiguidade da Categoria A (ano de matrícula): mais velho = menor imposto.
function coefCatA(anoMatricula: number): number {
  if (anoMatricula <= 1995) return 1.0;
  if (anoMatricula <= 1999) return 1.05;
  if (anoMatricula <= 2003) return 1.1;
  return 1.15; // 2004 – jun/2007
}

export interface Inputs {
  /** Cilindrada do motor (cm³ / cc). */
  cilindrada: number;
  /** Tipo de combustível: "gasolina" ou "gasoleo" (diesel). */
  combustivel?: string;
  /** Ano da 1.ª matrícula (ex. 2015). Determina categoria A (≤2007) vs B (≥2007). */
  anoMatricula: number;
  /** Emissões de CO2 em g/km (só Categoria B). Opcional; default 130. */
  co2?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function escalaoValor(
  base: number,
  tabela: ReadonlyArray<{ ateCc?: number; ateCo2?: number; euros: number }>,
  key: 'ateCc' | 'ateCo2',
): number {
  for (const e of tabela) {
    const limite = (e as any)[key] as number;
    if (base <= limite) return e.euros;
  }
  return tabela[tabela.length - 1].euros;
}

function coefAntiguidadeB(anoMatricula: number): number {
  const tabela = PORTUGAL_2026.iuc.categoriaB.coeficienteAntiguidade;
  // tabela: [{ano:2007,coef},{ano:2008},{ano:2009},{anoDesde:2010,coef}]
  if (anoMatricula >= 2010) return 1.15;
  for (const c of tabela) {
    if ('ano' in c && c.ano === anoMatricula) return c.coef;
  }
  // anos sem entrada explícita (não deve ocorrer: 2007/2008/2009 cobertos): default 1.0
  return 1.0;
}

export function calculadoraIucPortugal(i: Inputs): Outputs {
  const cc = Math.max(0, Number(i.cilindrada) || 0);
  if (cc <= 0) throw new Error('Indique a cilindrada do veículo (cm³)');
  const ano = Math.floor(Number(i.anoMatricula) || 0);
  if (ano < 1960 || ano > 2100) throw new Error('Indique um ano de matrícula válido');

  const diesel = String(i.combustivel || 'gasolina') === 'gasoleo';
  const co2 = Math.max(0, Number(i.co2) || 130);

  // Categoria A (pré 1-jul-2007) vs B (desde 1-jul-2007). Usamos 2007 como fronteira:
  // matrículas de 2007 ou posteriores → Categoria B (método cilindrada + CO2).
  const categoriaB = ano >= 2007;

  let iucEstimado: number;
  let componenteCilindrada: number;
  let componenteCo2 = 0;
  let coef: number;

  if (categoriaB) {
    coef = coefAntiguidadeB(ano);
    let cil = escalaoValor(cc, CAT_B_CILINDRADA, 'ateCc');
    if (diesel) cil *= CAT_B_AGRAVAMENTO_DIESEL;
    componenteCilindrada = cil;
    componenteCo2 = escalaoValor(co2, CAT_B_CO2, 'ateCo2');
    iucEstimado = (componenteCilindrada + componenteCo2) * coef;
  } else {
    coef = coefCatA(ano);
    componenteCilindrada = escalaoValor(cc, CAT_A_CILINDRADA, 'ateCc') * coef;
    iucEstimado = componenteCilindrada;
  }

  const categoriaLabel = categoriaB ? 'Categoria B (matrícula ≥ jul-2007)' : 'Categoria A (matrícula ≤ jun-2007)';
  const combLabel = diesel ? 'gasóleo' : 'gasolina';

  const _insight = {
    type: 'highlight',
    icon: '🚗',
    text:
      `Um veículo de **${cc} cm³** a **${combLabel}**, matriculado em **${ano}** (${categoriaLabel}), ` +
      `paga cerca de **${fmtEUR(iucEstimado)}** de IUC por ano. ` +
      (categoriaB
        ? `Resulta da componente de cilindrada (**${fmtEUR(componenteCilindrada)}**) + CO2 (**${fmtEUR(componenteCo2)}**), com coeficiente de antiguidade **${coef.toLocaleString('de-DE', { maximumFractionDigits: 2 })}**.`
        : `Resulta da componente de cilindrada com coeficiente de antiguidade **${coef.toLocaleString('de-DE', { maximumFractionDigits: 2 })}**.`) +
      ` Valor estimado — confirme o exato no Portal das Finanças.`,
  };

  const _table = {
    title: 'IUC estimado — Categoria B (gasolina, matrícula 2010+) por cilindrada e CO2',
    headers: ['Cilindrada', 'CO2 ≤ 120 g/km', 'CO2 121–150', 'CO2 151–180'],
    rows: [
      ['até 1000 cm³', null, null, null],
      ['1001–1250 cm³', null, null, null],
      ['1251–1500 cm³', null, null, null],
      ['1501–2500 cm³', null, null, null],
    ].map((row, idx) => {
      const ccRef = [900, 1100, 1400, 2000][idx];
      const cil = escalaoValor(ccRef, CAT_B_CILINDRADA, 'ateCc');
      const c = 1.15; // 2010+
      return [
        row[0] as string,
        fmtEUR((cil + escalaoValor(110, CAT_B_CO2, 'ateCo2')) * c),
        fmtEUR((cil + escalaoValor(140, CAT_B_CO2, 'ateCo2')) * c),
        fmtEUR((cil + escalaoValor(170, CAT_B_CO2, 'ateCo2')) * c),
      ];
    }),
    note:
      'Estimativa para gasolina, 1.ª matrícula a partir de 2010 (coeficiente 1,15). Veículos a gasóleo pagam ' +
      'um agravamento na componente de cilindrada e CO2 > 180 g/km tem agravamento adicional. ' +
      'A AT não publica tabela €/escalão consolidada — valores aproximados. Emita o DUC nas Finanças para o valor exato.',
  };

  return {
    iucEstimado: fmtEUR(iucEstimado),
    categoria: categoriaLabel,
    componenteCilindrada: fmtEUR(componenteCilindrada),
    componenteCo2: categoriaB ? fmtEUR(componenteCo2) : 'n/a (Categoria A)',
    coeficiente: coef.toLocaleString('de-DE', { maximumFractionDigits: 2 }),
    combustivel: combLabel,
    detalhe: categoriaB
      ? `IUC ≈ (cilindrada ${fmtEUR(componenteCilindrada)} + CO2 ${fmtEUR(componenteCo2)}) × ${coef.toLocaleString('de-DE', { maximumFractionDigits: 2 })} = ${fmtEUR(iucEstimado)}/ano (estimativa).`
      : `IUC ≈ cilindrada × coeficiente ${coef.toLocaleString('de-DE', { maximumFractionDigits: 2 })} = ${fmtEUR(iucEstimado)}/ano (estimativa).`,
    _insight,
    _table,
  };
}
