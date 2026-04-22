/**
 * Custos de escritura pública + registro imobiliário — tabela CNJ 2026.
 * Tabela por faixa de valor (emolumentos + taxas estaduais + ISS).
 * Valores aproximados — podem variar por estado (Corregedoria local).
 */

export interface Inputs {
  valorImovel: number | string;
  estado: string; // UF
  financiado: string; // 'sim' | 'nao'
}

export interface Outputs {
  escrituraPublica: string;
  registroImobiliario: string;
  totalCustos: string;
  percentualSobreValor: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Tabela emolumentos cartoriais por faixa (média nacional, base CNJ 2026)
interface Faixa {
  ate: number;
  escritura: number;
  registro: number;
}

const TABELA: Faixa[] = [
  { ate: 50000, escritura: 180, registro: 120 },
  { ate: 100000, escritura: 380, registro: 280 },
  { ate: 200000, escritura: 720, registro: 540 },
  { ate: 400000, escritura: 1300, registro: 980 },
  { ate: 700000, escritura: 1950, registro: 1450 },
  { ate: 1000000, escritura: 2500, registro: 1900 },
  { ate: 2000000, escritura: 2950, registro: 2250 },
  { ate: Infinity, escritura: 3200, registro: 2500 },
];

export function escrituraRegistroCustos(i: Inputs): Outputs {
  const valor = Number(i.valorImovel) || 0;
  const estado = String(i.estado || 'SP').toUpperCase();
  const financiado = String(i.financiado || 'nao') === 'sim';

  if (valor <= 0) {
    throw new Error('Informe o valor do imóvel.');
  }

  const faixa = TABELA.find(f => valor <= f.ate)!;

  // Se financiado, não precisa escritura pública (contrato de financiamento faz as vezes)
  let escritura = financiado ? 0 : faixa.escritura;
  const registro = faixa.registro;

  // Ajuste por estado (valores médios típicos)
  const ajusteEstado: Record<string, number> = {
    SP: 1.0, RJ: 1.05, MG: 0.95, RS: 1.1, PR: 0.92,
    BA: 0.88, PE: 0.9, CE: 0.85, DF: 1.0, SC: 1.02,
  };
  const fator = ajusteEstado[estado] || 1.0;
  escritura = Math.round(escritura * fator);
  const registroAjustado = Math.round(registro * fator);

  const total = escritura + registroAjustado;
  const pct = (total / valor) * 100;

  return {
    escrituraPublica: brl(escritura) + (financiado ? ' (financiamento dispensa escritura pública)' : ''),
    registroImobiliario: brl(registroAjustado),
    totalCustos: brl(total),
    percentualSobreValor: pct.toFixed(2) + '%',
    resumen: `Imóvel de ${brl(valor)} em ${estado}: escritura ${brl(escritura)} + registro ${brl(registroAjustado)} = ${brl(total)} (${pct.toFixed(2)}% do valor). ${financiado ? 'Financiamento dispensa escritura pública.' : ''}`,
  };
}
