/**
 * Subsídio de desemprego — Portugal continente 2026.
 * Valor mensal = 65 % da remuneração de referência (RR), com tope superior 2,5 × IAS
 * e piso 1,15 × IAS (se RR ≥ RMMG) ou 1 × IAS.
 * Duração estimada em função do tempo de descontos (carreira contributiva) e da idade.
 * Não hardcodea cifras: usa subsidioDesemprego + constantes de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR, subsidioDesemprego } from '../data/portugal-2026.ts';

export interface Inputs {
  remuneracaoMedia?: number; // remuneração de referência mensal (média dos 12 dos últimos 14 meses)
  mesesDescontos?: number;   // meses de descontos (carreira contributiva relevante)
  idade?: number;            // idade do beneficiário (afeta a duração)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/**
 * Duração do subsídio de desemprego (meses) segundo a idade e os meses de descontos.
 * Regras do Decreto-Lei n.º 220/2006 (períodos de concessão por escalão etário + acréscimos).
 */
function duracaoMeses(idade: number, mesesDescontos: number): number {
  // Carência mínima: 360 dias de descontos (≈ 12 meses) nos últimos 24 meses.
  if (mesesDescontos < 12) return 0;
  // Períodos-base por escalão etário e respetivos acréscimos por cada 4 anos de carreira além do mínimo.
  if (idade < 30) {
    if (mesesDescontos < 24) return 5;          // 15–24 meses descontos → 150 dias
    // ≥ 24 meses: 5 meses + 1 mês por cada 4 meses de descontos além de 24 (máx. usual ~12)
    return Math.min(12, 5 + Math.floor((mesesDescontos - 24) / 4));
  }
  if (idade < 40) {
    if (mesesDescontos < 48) return 9;          // base 9 meses
    return Math.min(18, 9 + Math.floor((mesesDescontos - 48) / 4));
  }
  if (idade < 50) {
    if (mesesDescontos < 60) return 12;         // base 12 meses
    return Math.min(22, 12 + Math.floor((mesesDescontos - 60) / 4));
  }
  // 50 ou mais
  if (mesesDescontos < 72) return 18;           // base 18 meses
  return Math.min(26, 18 + Math.floor((mesesDescontos - 72) / 4));
}

export function calculadoraSubsidioDesempregoPortugal(i: Inputs): Outputs {
  const d = PORTUGAL_2026.desemprego;
  const rr = Number(i.remuneracaoMedia) || 0;
  const meses = Number(i.mesesDescontos) || 0;
  const idade = Number(i.idade) || 40;
  if (rr <= 0) throw new Error('Indique a remuneração de referência mensal');
  if (meses <= 0) throw new Error('Indique os meses de descontos');

  const valorMensal = subsidioDesemprego(rr);
  const dur = duracaoMeses(idade, meses);
  const totalPeriodo = valorMensal * dur;

  // diagnóstico de tope/piso
  const calc65 = rr * d.percRemuneracaoReferencia;
  const aplicaTope = calc65 > d.topeSuperiorMensal;
  const piso = rr >= PORTUGAL_2026.rmmg.mensal ? d.minimoComRmmg : d.minimoIas;
  const aplicaPiso = calc65 < piso;

  const carenciaOk = meses >= 12;

  const _table = {
    title: 'Cálculo do subsídio de desemprego',
    headers: ['Parâmetro', 'Valor'],
    rows: [
      ['Remuneração de referência (mensal)', fmtEUR(rr)],
      ['65 % da remuneração de referência', fmtEUR(calc65)],
      ['Tope superior (2,5 × IAS)', fmtEUR(d.topeSuperiorMensal)],
      ['Piso (' + (rr >= PORTUGAL_2026.rmmg.mensal ? '1,15' : '1') + ' × IAS)', fmtEUR(piso)],
      ['Subsídio mensal', fmtEUR(valorMensal)],
      ['Duração estimada', carenciaOk ? dur + ' meses' : 'Sem direito (carência < 12 meses)'],
      ['Total estimado do período', carenciaOk ? fmtEUR(totalPeriodo) : '—'],
    ],
    note: 'IAS 2026 = ' + fmtEUR(PORTUGAL_2026.ias) + '. Duração segundo idade e tempo de descontos (DL 220/2006). Cálculo orientativo.',
  };

  let topeNota = '';
  if (aplicaTope) topeNota = ` O valor foi limitado ao tope de ${fmtEUR(d.topeSuperiorMensal)} (2,5 × IAS).`;
  else if (aplicaPiso) topeNota = ` O valor foi elevado ao piso mínimo de ${fmtEUR(piso)}.`;

  const _insight = {
    title: 'O seu subsídio de desemprego',
    text: carenciaOk
      ? `Com uma remuneração de referência de **${fmtEUR(rr)}**, o subsídio mensal é de **${fmtEUR(valorMensal)}** ` +
        `(65 % da RR) durante cerca de **${dur} meses**, num total estimado de **${fmtEUR(totalPeriodo)}**.` + topeNota
      : `Com apenas ${meses} ${meses === 1 ? 'mês' : 'meses'} de descontos não cumpre a carência mínima ` +
        `(360 dias ≈ 12 meses nos últimos 24). Não há direito a subsídio de desemprego.`,
    tone: carenciaOk ? (aplicaTope ? 'warn' : 'good') : 'warn',
    icon: '🧾',
  };

  const _chart = carenciaOk
    ? {
        type: 'bar',
        bars: [
          { label: 'Subsídio mensal', value: Math.round(valorMensal) },
          { label: 'Total do período', value: Math.round(totalPeriodo) },
        ],
        prefix: '€ ',
        ariaLabel: `Subsídio mensal ${fmtEUR(valorMensal)} durante ${dur} meses, total ${fmtEUR(totalPeriodo)}.`,
      }
    : undefined;

  return {
    valorMensal: carenciaOk ? fmtEUR(valorMensal) : 'Sem direito',
    remuneracaoReferencia: fmtEUR(rr),
    percentagem: (d.percRemuneracaoReferencia * 100).toLocaleString('de-DE') + ' % da RR',
    duracao: carenciaOk ? dur + ' meses' : 'Carência não cumprida',
    totalPeriodo: carenciaOk ? fmtEUR(totalPeriodo) : '—',
    topeAplicado: aplicaTope ? 'Sim — tope 2,5 × IAS (' + fmtEUR(d.topeSuperiorMensal) + ')' : 'Não',
    detalhe: carenciaOk
      ? `65 % × ${fmtEUR(rr)} = ${fmtEUR(valorMensal)}/mês × ${dur} meses = ${fmtEUR(totalPeriodo)}.`
      : `Carência mínima de 12 meses de descontos não cumprida (${meses} meses).`,
    _table,
    _insight,
    _chart,
  };
}
