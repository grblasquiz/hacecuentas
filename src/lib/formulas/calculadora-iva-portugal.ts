/**
 * Calculadora de IVA Portugal continente — conversor bidirecional.
 *
 * Três taxas (art. 18.º CIVA + Listas I/II):
 *   - Normal     23 % (geral)
 *   - Intermédia 13 % (restauração, alguns alimentos e bebidas)
 *   - Reduzida    6 % (bens essenciais: pão, leite, medicamentos, livros…)
 *
 * Conversor bidirecional:
 *   - sem IVA → com IVA: base × (1 + taxa)
 *   - com IVA → sem IVA: total ÷ (1 + taxa)
 *
 * Não hardcoda taxas: vêm de portugal-2026.ts (PORTUGAL_2026.iva).
 * NOTA: Açores (16/9/4) e Madeira (22/12/5) têm taxas próprias — isto é CONTINENTE.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026';

export interface Inputs {
  /** Montante (€). */
  valor: number;
  /** Taxa: "normal" (23%), "intermedia" (13%) ou "reduzida" (6%). */
  taxa?: string;
  /** Direção: "sem_para_com" (acrescentar IVA) ou "com_para_sem" (retirar IVA). */
  direcao?: string;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function taxaDecimal(t: string | undefined): number {
  if (t === 'intermedia') return PORTUGAL_2026.iva.intermedia;
  if (t === 'reduzida') return PORTUGAL_2026.iva.reduzida;
  return PORTUGAL_2026.iva.normal;
}

export function calculadoraIvaPortugal(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valor) || 0);
  if (valor <= 0) throw new Error('Indique um montante para calcular o IVA');

  const taxa = taxaDecimal(i.taxa);
  const acrescentar = String(i.direcao || 'sem_para_com') !== 'com_para_sem';

  let semIva: number;
  let comIva: number;
  if (acrescentar) {
    semIva = valor;
    comIva = valor * (1 + taxa);
  } else {
    comIva = valor;
    semIva = valor / (1 + taxa);
  }
  const montanteIva = comIva - semIva;

  const taxaPct = (taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 });

  const desglose = acrescentar
    ? `${fmtEUR(semIva)} (base) + ${fmtEUR(montanteIva)} (IVA ${taxaPct}%) = ${fmtEUR(comIva)} (com IVA)`
    : `${fmtEUR(comIva)} (com IVA) − ${fmtEUR(montanteIva)} (IVA ${taxaPct}%) = ${fmtEUR(semIva)} (base)`;

  const _insight = {
    type: 'highlight',
    icon: '🧾',
    text: acrescentar
      ? `Sobre **${fmtEUR(semIva)}** de base, o IVA à taxa de **${taxaPct}%** acrescenta **${fmtEUR(montanteIva)}**: o preço final é **${fmtEUR(comIva)}**.`
      : `De **${fmtEUR(comIva)}** com IVA incluído (**${taxaPct}%**), a base é **${fmtEUR(semIva)}** e o IVA contido **${fmtEUR(montanteIva)}**.`,
  };

  const _table = {
    title: 'IVA Portugal continente 2026 — base, IVA e total por taxa',
    headers: ['Base (sem IVA)', 'Reduzida 6 % → total', 'Intermédia 13 % → total', 'Normal 23 % → total'],
    rows: [10, 50, 100, 250, 500, 1000].map((base) => [
      fmtEUR(base),
      `${fmtEUR(base * PORTUGAL_2026.iva.reduzida)} → ${fmtEUR(base * (1 + PORTUGAL_2026.iva.reduzida))}`,
      `${fmtEUR(base * PORTUGAL_2026.iva.intermedia)} → ${fmtEUR(base * (1 + PORTUGAL_2026.iva.intermedia))}`,
      `${fmtEUR(base * PORTUGAL_2026.iva.normal)} → ${fmtEUR(base * (1 + PORTUGAL_2026.iva.normal))}`,
    ]),
    note:
      'Taxas do continente (art. 18.º CIVA): normal 23 %, intermédia 13 %, reduzida 6 %. ' +
      'Para retirar o IVA de um preço final, divida por 1,23 / 1,13 / 1,06. ' +
      'Açores (16/9/4) e Madeira (22/12/5) têm taxas próprias.',
  };

  return {
    base: fmtEUR(semIva),
    iva: fmtEUR(montanteIva),
    total: fmtEUR(comIva),
    taxaAplicada: `${taxaPct}%`,
    desglose,
    detalhe: desglose,
    _insight,
    _table,
  };
}
