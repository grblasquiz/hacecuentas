/**
 * Recibos verdes — trabalhador independente, Portugal continente 2026.
 * Calcula a contribuição mensal à Segurança Social (base = % do rendimento relevante)
 * e o IRS anual estimado, a partir do rendimento informado.
 * - Segurança Social: segSocialIndependente (21,4 % sobre 70 % dos serviços / 20 % dos bens, base ≤ 12×IAS).
 * - IRS: irsAnual sobre o rendimento coletável (regime simplificado: coeficiente 0,75 serviços / 0,15 bens).
 * Não hardcodea cifras: tudo de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR, segSocialIndependente, irsAnual } from '../data/portugal-2026.ts';

export interface Inputs {
  periodo?: string;        // 'mensal' | 'anual' — como se informa o rendimento
  rendimento?: number;     // rendimento faturado (mensal ou anual conforme periodo)
  tipo?: string;           // 'servicos' | 'bens'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraRecibosVerdesTrabalhadorIndependentePortugal(i: Inputs): Outputs {
  const ind = PORTUGAL_2026.segSocial.independente;
  const periodo = String(i.periodo || 'mensal');
  const rendBruto = Number(i.rendimento) || 0;
  if (rendBruto <= 0) throw new Error('Indique o rendimento faturado');

  const tipoServicos = String(i.tipo || 'servicos') !== 'bens';

  // Normalizar para mensal e anual
  const rendMensal = periodo === 'anual' ? rendBruto / 12 : rendBruto;
  const rendAnual = periodo === 'anual' ? rendBruto : rendBruto * 12;

  // ── Segurança Social (mensal) ──
  const ssMensal = segSocialIndependente(rendMensal, tipoServicos, false);
  const ssAnual = ssMensal * 12;
  const percRelevante = tipoServicos ? ind.percRendimentoRelevanteServicos : ind.percRendimentoRelevanteBens;
  const baseSsMensal = Math.min(rendMensal * percRelevante, ind.baseMaximaMensal);

  // ── IRS estimado (regime simplificado) ──
  // No regime simplificado da Cat. B, o rendimento tributável = coeficiente × rendimento bruto.
  // Coeficiente: 0,75 (prestação de serviços) ou 0,15 (venda de bens/mercadorias).
  const coefIrs = tipoServicos ? 0.75 : 0.15;
  const rendColetavel = rendAnual * coefIrs;
  const irsAno = irsAnual(rendColetavel);
  const irsMensal = irsAno / 12;

  // ── Líquido estimado ──
  const liquidoMensal = rendMensal - ssMensal - irsMensal;
  const liquidoAnual = rendAnual - ssAnual - irsAno;
  const cargaPct = ((ssAnual + irsAno) / (rendAnual || 1)) * 100;

  const _table = {
    title: 'Recibos verdes — encargos do trabalhador independente (mensal)',
    headers: ['Conceito', 'Base / Taxa', 'Valor mensal'],
    rows: [
      ['Rendimento faturado', '—', fmtEUR(rendMensal)],
      [
        'Rendimento relevante (SS)',
        (percRelevante * 100).toLocaleString('de-DE') + ' % do faturado',
        fmtEUR(baseSsMensal),
      ],
      ['Segurança Social', (ind.taxaGeral * 100).toLocaleString('de-DE') + ' %', fmtEUR(ssMensal)],
      ['IRS estimado', 'coef. ' + coefIrs.toLocaleString('de-DE') + ' → escalões', fmtEUR(irsMensal)],
      ['Rendimento líquido estimado', '—', fmtEUR(liquidoMensal)],
    ],
    note:
      'Regime simplificado da Cat. B. SS = ' + (ind.taxaGeral * 100).toLocaleString('de-DE') +
      ' % sobre ' + (percRelevante * 100).toLocaleString('de-DE') + ' % do rendimento (base ≤ 12 × IAS = ' +
      fmtEUR(ind.baseMaximaMensal) + '). IAS 2026 = ' + fmtEUR(PORTUGAL_2026.ias) + '.',
  };

  const tipoTxt = tipoServicos ? 'prestação de serviços' : 'venda de bens';
  const _insight = {
    title: 'Quanto lhe sobra dos recibos verdes',
    text:
      `De um rendimento de **${fmtEUR(rendMensal)}**/mês (${tipoTxt}), paga **${fmtEUR(ssMensal)}** ` +
      `de Segurança Social e cerca de **${fmtEUR(irsMensal)}** de IRS, ficando com **${fmtEUR(liquidoMensal)}** líquidos. ` +
      `A carga total (SS + IRS) é de **${cargaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %** do faturado.`,
    tone: 'good',
    icon: '🧮',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: Math.round(liquidoMensal) },
      { label: 'Segurança Social', value: Math.round(ssMensal) },
      { label: 'IRS', value: Math.round(irsMensal) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(rendMensal),
    centerLabel: 'Rendimento mensal',
    ariaLabel: `Rendimento ${fmtEUR(rendMensal)}: líquido ${fmtEUR(liquidoMensal)}, SS ${fmtEUR(ssMensal)}, IRS ${fmtEUR(irsMensal)}.`,
  };

  return {
    liquidoMensal: fmtEUR(liquidoMensal),
    rendimentoMensal: fmtEUR(rendMensal),
    segSocialMensal: fmtEUR(ssMensal),
    irsMensal: fmtEUR(irsMensal),
    segSocialAnual: fmtEUR(ssAnual),
    irsAnual: fmtEUR(irsAno),
    liquidoAnual: fmtEUR(liquidoAnual),
    cargaTotal: cargaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %',
    detalhe:
      `SS: ${(ind.taxaGeral * 100).toLocaleString('de-DE')} % × ${fmtEUR(baseSsMensal)} = ${fmtEUR(ssMensal)}/mês. ` +
      `IRS: coef. ${coefIrs.toLocaleString('de-DE')} × ${fmtEUR(rendAnual)} = ${fmtEUR(rendColetavel)} coletável → ${fmtEUR(irsAno)}/ano.`,
    _table,
    _insight,
    _chart,
  };
}
