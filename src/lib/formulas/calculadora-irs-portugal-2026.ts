/**
 * Calculadora de IRS Portugal 2026 — reembolso ou imposto a pagar (continente).
 *
 * Compara o IRS DEVIDO no ano (apurado pelas taxas marginais sobre o rendimento
 * coletável) com as RETENÇÕES na fonte já feitas:
 *   - retido > devido  → REEMBOLSO
 *   - retido < devido  → imposto A PAGAR
 *
 * Não hardcoda escalões nem deduções: tudo sai de portugal-2026.ts.
 * Apuramento (trabalho dependente, Cat. A):
 *   coletável = bruto − dedução específica (máx. entre 4.587,09 € e SS paga)
 *   IRS devido = soma marginal por escalão (12,5 % … 48 %)
 *   No agregado com 2 titulares aplica-se o quociente conjugal (split do rendimento).
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  irsTrabalhoDependenteAnual,
  segSocialTrabalhador,
} from '../data/portugal-2026';

export interface Inputs {
  /** Rendimento bruto anual (Cat. A). Normalmente 14 × salário mensal. */
  brutoAnual: number;
  /** Retenções na fonte de IRS já feitas no ano (€). */
  retencoes: number;
  /** Nº de titulares do agregado: 1 (solteiro) ou 2 (casados/unidos, tributação conjunta). */
  titulares?: number;
  /** Nº de dependentes a cargo (filhos). Informativo para a dedução à coleta. */
  dependentes?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraIrsPortugal2026(i: Inputs): Outputs {
  const bruto = Math.max(0, Number(i.brutoAnual) || 0);
  if (bruto <= 0) throw new Error('Indique o rendimento bruto anual');

  const retido = Math.max(0, Number(i.retencoes) || 0);
  const titulares = Number(i.titulares) === 2 ? 2 : 1;
  const dependentes = Math.max(0, Math.floor(Number(i.dependentes) || 0));

  // Segurança Social do trabalhador (11 %) — usada como piso da dedução específica.
  const ssAnualReal = segSocialTrabalhador(bruto); // 11 % sobre o bruto anual = SS anual

  let irsDevido: number;
  if (titulares === 2) {
    // Quociente conjugal: o IRS é calculado sobre metade do rendimento do casal
    // e depois multiplicado por 2 (cada titular declara o seu bruto; modelo simplificado:
    // dividimos o rendimento total por 2, apuramos e multiplicamos por 2).
    const metade = bruto / 2;
    const ssMetade = metade * PORTUGAL_2026.segSocial.trabalhador;
    irsDevido = irsTrabalhoDependenteAnual(metade, ssMetade, 0) * 2;
  } else {
    irsDevido = irsTrabalhoDependenteAnual(bruto, ssAnualReal, 0);
  }

  // Dedução à coleta por dependente (art. 78.º-A CIRS): 600 € por dependente.
  // Reduz o imposto devido (com o limite de não o tornar negativo).
  const DEDUCAO_DEPENDENTE = 600;
  const deducaoDependentes = dependentes * DEDUCAO_DEPENDENTE;
  irsDevido = Math.max(0, irsDevido - deducaoDependentes);

  const saldo = retido - irsDevido; // > 0 reembolso ; < 0 a pagar
  const reembolso = saldo > 0;
  const taxaMediaPct = bruto > 0 ? (irsDevido / bruto) * 100 : 0;
  const taxaMediaStr = taxaMediaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const resultadoLabel = Math.abs(saldo) < 0.005
    ? 'Sem imposto a pagar nem a receber'
    : reembolso
      ? `Reembolso de ${fmtEUR(saldo)}`
      : `A pagar ${fmtEUR(-saldo)}`;

  const _insight = {
    type: 'highlight',
    icon: reembolso ? '💶' : '⚠️',
    text:
      `Com um rendimento bruto anual de **${fmtEUR(bruto)}**, o IRS devido é **${fmtEUR(irsDevido)}** ` +
      `(taxa média de **${taxaMediaStr}%**). ` +
      (reembolso
        ? `Como já reteve **${fmtEUR(retido)}**, tem direito a um reembolso de **${fmtEUR(saldo)}**.`
        : Math.abs(saldo) < 0.005
          ? `As retenções (**${fmtEUR(retido)}**) igualam o imposto: não há acerto.`
          : `Reteve apenas **${fmtEUR(retido)}**, pelo que ainda tem **${fmtEUR(-saldo)}** a pagar.`),
  };

  // Tabela: IRS devido por nível de rendimento (titular único), para contexto.
  const _table = {
    title: 'IRS anual devido por rendimento bruto — trabalho dependente (titular único)',
    headers: ['Bruto anual', 'Coletável aprox.', 'IRS devido', 'Taxa média'],
    rows: [15000, 20000, 25000, 35000, 50000, 70000, 100000].map((b) => {
      const ss = b * PORTUGAL_2026.segSocial.trabalhador;
      const irs = irsTrabalhoDependenteAnual(b, ss, 0);
      const ded = Math.max(PORTUGAL_2026.irs.deducaoEspecificaTrabalho, ss);
      const colet = Math.max(0, b - ded);
      return [
        fmtEUR(b),
        fmtEUR(colet),
        fmtEUR(irs),
        `${((irs / b) * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`,
      ];
    }),
    note:
      'Dedução específica de trabalho dependente = 4.587,09 € (8,54 × IAS) ou o valor das contribuições para a SS, ' +
      'o que for maior. Não inclui deduções à coleta (saúde, educação, dependentes), que reduzem o imposto final.',
  };

  return {
    resultado: resultadoLabel,
    brutoAnual: fmtEUR(bruto),
    irsDevido: fmtEUR(irsDevido),
    retencoes: fmtEUR(retido),
    saldo: reembolso ? `+${fmtEUR(saldo)} (reembolso)` : Math.abs(saldo) < 0.005 ? fmtEUR(0) : `−${fmtEUR(-saldo)} (a pagar)`,
    taxaMedia: `${taxaMediaStr}%`,
    detalhe:
      `IRS devido ${fmtEUR(irsDevido)}` +
      (dependentes > 0 ? ` (após dedução de ${fmtEUR(deducaoDependentes)} por ${dependentes} dependente(s))` : '') +
      ` − retido ${fmtEUR(retido)} = ` +
      (reembolso ? `reembolso ${fmtEUR(saldo)}.` : Math.abs(saldo) < 0.005 ? 'acerto nulo.' : `a pagar ${fmtEUR(-saldo)}.`),
    _insight,
    _table,
  };
}
