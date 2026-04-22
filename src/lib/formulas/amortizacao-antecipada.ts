/**
 * Amortização antecipada — simulação SAC
 * Pagamento à vista X → escolha reduzir PRAZO ou reduzir PARCELA.
 * Entrada: saldo devedor, taxa, parcelas restantes, valor a amortizar, modo.
 */

export interface Inputs {
  saldoDevedor: number | string;
  taxaAnual: number | string;
  parcelasRestantes: number | string;
  valorAmortizacao: number | string;
  modo: string; // 'prazo' ou 'parcela'
}

export interface Outputs {
  novoSaldo: string;
  parcelaAnterior: string;
  parcelaNova: string;
  prazoAnterior: string;
  prazoNovo: string;
  economiaJuros: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function amortizacaoAntecipada(i: Inputs): Outputs {
  const saldo = Number(i.saldoDevedor) || 0;
  const taxaAnual = Number(i.taxaAnual) || 0;
  const n = Math.round(Number(i.parcelasRestantes) || 0);
  const amort = Number(i.valorAmortizacao) || 0;
  const modo = (i.modo === 'parcela') ? 'parcela' : 'prazo';

  if (saldo <= 0 || n <= 0 || taxaAnual <= 0) {
    throw new Error('Informe saldo devedor, taxa e parcelas restantes válidos.');
  }
  if (amort <= 0 || amort >= saldo) {
    throw new Error('O valor a amortizar deve ser maior que zero e menor que o saldo devedor.');
  }

  const im = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  // Parcela SAC inicial (média aproximada: amort + juros sobre saldo atual)
  const amortMensalAntes = saldo / n;
  const parcelaAnterior = amortMensalAntes + saldo * im;

  // Juros totais remanescentes sem amortização (SAC)
  let jurosAntes = 0;
  let s = saldo;
  for (let k = 0; k < n; k++) {
    jurosAntes += s * im;
    s -= amortMensalAntes;
  }

  const novoSaldo = saldo - amort;
  let parcelaNova = parcelaAnterior;
  let prazoNovo = n;
  let jurosDepois = 0;

  if (modo === 'parcela') {
    // Mantém prazo, reduz parcela
    const amortMensalDepois = novoSaldo / n;
    parcelaNova = amortMensalDepois + novoSaldo * im;
    let sd = novoSaldo;
    for (let k = 0; k < n; k++) {
      jurosDepois += sd * im;
      sd -= amortMensalDepois;
    }
    prazoNovo = n;
  } else {
    // Mantém parcela, reduz prazo
    // Aproxima prazo novo mantendo a amortização mensal original
    const amortMensalDepois = amortMensalAntes;
    prazoNovo = Math.ceil(novoSaldo / amortMensalDepois);
    parcelaNova = amortMensalDepois + novoSaldo * im;
    let sd = novoSaldo;
    for (let k = 0; k < prazoNovo; k++) {
      jurosDepois += sd * im;
      sd -= amortMensalDepois;
      if (sd < 0) sd = 0;
    }
  }

  const economia = jurosAntes - jurosDepois;

  return {
    novoSaldo: brl(novoSaldo),
    parcelaAnterior: brl(parcelaAnterior),
    parcelaNova: brl(parcelaNova),
    prazoAnterior: `${n} meses`,
    prazoNovo: `${prazoNovo} meses`,
    economiaJuros: brl(economia),
    resumen: modo === 'parcela'
      ? `Amortizando ${brl(amort)} e reduzindo parcela: nova parcela ${brl(parcelaNova)} (antes ${brl(parcelaAnterior)}). Prazo mantido em ${n} meses. Economia em juros: ${brl(economia)}.`
      : `Amortizando ${brl(amort)} e reduzindo prazo: de ${n} para ${prazoNovo} meses (economia de ${n - prazoNovo} meses). Economia em juros: ${brl(economia)}.`,
  };
}
