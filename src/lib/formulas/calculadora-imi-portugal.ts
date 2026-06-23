/**
 * Calculadora de IMI Portugal — Imposto Municipal sobre Imóveis (prédios urbanos).
 *
 * IMI anual = VPT (valor patrimonial tributário) × taxa municipal.
 * A taxa é fixada por cada município dentro do intervalo legal (0,3 % – 0,45 %);
 * a maioria dos concelhos aplica 0,30 %. Não hardcoda taxas: vêm de portugal-2026.ts.
 *
 * Pagamento (art. 120.º CIMI), por montante anual:
 *   - até 100 €  → 1 prestação (maio)
 *   - 100–500 €  → 2 prestações (maio, novembro)
 *   - > 500 €    → 3 prestações (maio, agosto, novembro)
 */
import { PORTUGAL_2026, fmtEUR, imi } from '../data/portugal-2026';

export interface Inputs {
  /** Valor Patrimonial Tributário do imóvel (€). */
  vpt: number;
  /** Taxa municipal em % (ex. 0,3). Default 0,3 %. */
  taxaPct?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

/** Nº de prestações de IMI consoante o montante anual (art. 120.º CIMI). */
function numPrestacoes(imiAnual: number): number {
  if (imiAnual <= 100) return 1;
  if (imiAnual <= 500) return 2;
  return 3;
}

export function calculadoraImiPortugal(i: Inputs): Outputs {
  const vpt = Math.max(0, Number(i.vpt) || 0);
  if (vpt <= 0) throw new Error('Indique o VPT (valor patrimonial tributário) do imóvel');

  // Taxa: aceita % (0,3) e converte para decimal. Default 0,30 %.
  let taxaInput = Number(i.taxaPct);
  if (!Number.isFinite(taxaInput) || taxaInput <= 0) taxaInput = PORTUGAL_2026.imi.urbanoPadrao * 100;
  const taxa = taxaInput / 100;

  const imiAnual = imi(vpt, taxa);
  const prestacoes = numPrestacoes(imiAnual);
  const valorPrestacao = imiAnual / prestacoes;

  const taxaStr = taxaInput.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  const dentroIntervalo =
    taxa >= PORTUGAL_2026.imi.urbanoMin && taxa <= PORTUGAL_2026.imi.urbanoMax;

  const meses =
    prestacoes === 1 ? 'maio' : prestacoes === 2 ? 'maio e novembro' : 'maio, agosto e novembro';

  const _insight = {
    type: 'highlight',
    icon: '🏠',
    text:
      `Um imóvel com VPT de **${fmtEUR(vpt)}** e taxa municipal de **${taxaStr}%** paga **${fmtEUR(imiAnual)}** ` +
      `de IMI por ano, em **${prestacoes}** prestação(ões) de **${fmtEUR(valorPrestacao)}** (${meses}).` +
      (dentroIntervalo
        ? ''
        : ` ⚠️ A taxa indicada está fora do intervalo legal (0,3 %–0,45 %); confirme a taxa do seu concelho.`),
  };

  const _table = {
    title: 'IMI anual por VPT e taxa municipal (prédios urbanos)',
    headers: ['VPT', 'Taxa 0,30 %', 'Taxa 0,375 %', 'Taxa 0,45 %'],
    rows: [50000, 100000, 150000, 200000, 300000, 500000].map((v) => [
      fmtEUR(v),
      fmtEUR(v * 0.003),
      fmtEUR(v * 0.00375),
      fmtEUR(v * 0.0045),
    ]),
    note:
      'A taxa de IMI dos prédios urbanos varia entre 0,30 % e 0,45 %, fixada por cada município. ' +
      'Prédios rústicos têm taxa única de 0,8 %. Há isenções temporárias (habitação própria de baixo VPT) ' +
      'e majorações (prédios devolutos). Consulte a taxa exata no portal do seu concelho.',
  };

  return {
    imiAnual: fmtEUR(imiAnual),
    vpt: fmtEUR(vpt),
    taxaAplicada: `${taxaStr}%`,
    prestacoes: String(prestacoes),
    valorPrestacao: fmtEUR(valorPrestacao),
    calendario: meses,
    detalhe:
      `IMI = VPT ${fmtEUR(vpt)} × ${taxaStr}% = ${fmtEUR(imiAnual)} por ano ` +
      `(${prestacoes} × ${fmtEUR(valorPrestacao)}, vencimento em ${meses}).`,
    _insight,
    _table,
  };
}
