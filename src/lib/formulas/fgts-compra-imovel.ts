/**
 * Cálculo de Uso do FGTS para Compra de Imóvel (Minha Casa Minha Vida e SFH) 2026
 * Regras: mínimo 3 anos de carteira, imóvel residencial urbano,
 * valor máx ≈ R$ 350.000 (SFH), não ter imóvel no mesmo município.
 * Fontes: Lei 8.036/90, Resolução CCFGTS 702, Manual Caixa.
 */

export interface Inputs {
  saldoFgts: number | string;
  valorImovel: number | string;
  anosCarteira: number | string;
  temImovelMesmoMunicipio?: string;
}

export interface Outputs {
  podeUsar: string;
  valorUsavel: string;
  motivo: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TETO_IMOVEL = 350000;
const MIN_CARTEIRA = 3;

export function fgtsCompraImovel(i: Inputs): Outputs {
  const saldo = Number(i.saldoFgts) || 0;
  const valor = Number(i.valorImovel) || 0;
  const anos = Number(i.anosCarteira) || 0;
  const temImovel = String(i.temImovelMesmoMunicipio || 'nao').toLowerCase() === 'sim';

  if (saldo <= 0 || valor <= 0) {
    throw new Error('Informe saldo e valor do imóvel (maiores que zero).');
  }

  const motivos: string[] = [];
  if (anos < MIN_CARTEIRA) motivos.push(`Tempo de carteira insuficiente (${anos} anos; mínimo ${MIN_CARTEIRA}).`);
  if (valor > TETO_IMOVEL) motivos.push(`Imóvel acima do teto SFH de ${brl(TETO_IMOVEL)}.`);
  if (temImovel) motivos.push('Já possui imóvel no mesmo município.');

  const pode = motivos.length === 0;
  const usavel = pode ? Math.min(saldo, valor) : 0;

  return {
    podeUsar: pode ? 'Sim' : 'Não',
    valorUsavel: brl(usavel),
    motivo: pode ? 'Atende os requisitos legais (SFH/MCMV).' : motivos.join(' '),
    resumen: pode
      ? `Você pode usar até ${brl(usavel)} do FGTS para comprar o imóvel de ${brl(valor)}.`
      : `Você NÃO pode usar o FGTS neste caso: ${motivos.join(' ')}`,
  };
}
