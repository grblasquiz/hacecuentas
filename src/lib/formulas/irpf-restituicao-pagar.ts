/**
 * IRPF — Ajuste anual: restituir ou pagar?
 * Confronta IR devido (tabela progressiva anual) × IR retido na fonte.
 * Se retido > devido → restituição. Se devido > retido → imposto a pagar (DARF).
 * Tabela 2026 (ano-base 2025) — Lei 14.663/2023 + MP 2026.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const FAIXAS = [
  { ate: 26963.20, aliq: 0, parcela: 0 },
  { ate: 33919.80, aliq: 0.075, parcela: 2022.24 },
  { ate: 45012.60, aliq: 0.15, parcela: 4566.23 },
  { ate: 55976.16, aliq: 0.225, parcela: 7942.17 },
  { ate: Infinity, aliq: 0.275, parcela: 10740.98 },
];

function calcularIR(base: number): number {
  if (base <= 0) return 0;
  for (const f of FAIXAS) if (base <= f.ate) return Math.max(0, base * f.aliq - f.parcela);
  return 0;
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfRestituicaoPagar(i: Inputs): Outputs {
  const rendaTributavel = Number(i.rendaTributavel) || 0;
  const deducoes = Number(i.deducoesLegais) || 0;
  const retido = Number(i.irRetidoFonte) || 0;
  const carneLeao = Number(i.carneLeaoPago) || 0;

  const base = Math.max(0, rendaTributavel - deducoes);
  const devido = calcularIR(base);
  const totalPagoAntecipado = retido + carneLeao;
  const diferenca = totalPagoAntecipado - devido;

  const aliqEfetiva = rendaTributavel > 0 ? (devido / rendaTributavel) * 100 : 0;

  return {
    baseCalculo: fmt(base),
    irDevido: fmt(devido),
    totalAntecipado: fmt(totalPagoAntecipado),
    resultado: diferenca >= 0 ? 'Restituição' : 'Imposto a pagar',
    valor: fmt(Math.abs(diferenca)),
    aliquotaEfetiva: aliqEfetiva.toFixed(2) + '%',
    resumo: diferenca >= 0
      ? `IR devido ${fmt(devido)} menor que o antecipado ${fmt(totalPagoAntecipado)}. Você tem ${fmt(diferenca)} para restituir. Alíquota efetiva: ${aliqEfetiva.toFixed(2)}%.`
      : `IR devido ${fmt(devido)} maior que o antecipado ${fmt(totalPagoAntecipado)}. Pagar via DARF: ${fmt(-diferenca)} (código 0211). Alíquota efetiva: ${aliqEfetiva.toFixed(2)}%.`,
  };
}
