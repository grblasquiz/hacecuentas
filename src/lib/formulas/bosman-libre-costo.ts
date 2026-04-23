/** Costo total traspaso libre (Bosman): sin fee, solo agente + prima firma */
export interface Inputs {
  salarioAnualJugador: number; // bruto USD o EUR
  anosContrato: number;
  primaFirmaUSD: number; // signing bonus
  comisionAgentePct: number; // % sobre salario total (típico 5-10)
  bonusTerceros: number; // pago a ex-club o terceros si aplica
}

export interface Outputs {
  feeTransferencia: number;
  salarioTotalContrato: number;
  comisionAgente: number;
  primaFirma: number;
  costoTotalClub: number;
  ahorroVsMercado: number; // comparado a un fee de mercado estimado
  moneda: string;
  resumen: string;
}

export function bosmanLibreCosto(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioAnualJugador) || 0);
  const anos = Math.max(1, Number(i.anosContrato) || 3);
  const prima = Math.max(0, Number(i.primaFirmaUSD) || 0);
  const comPct = Math.max(0, Number(i.comisionAgentePct) || 7);
  const tercero = Math.max(0, Number(i.bonusTerceros) || 0);

  const salarioTotal = salario * anos;
  const comision = salarioTotal * (comPct / 100);
  const feeTransfer = 0; // por definición Bosman
  const total = feeTransfer + salarioTotal + comision + prima + tercero;

  // Estimación ahorro: jugador libre vs fee de mercado ≈ 3-5× salario anual
  const feeMercadoEstim = salario * 3.5;
  const ahorro = feeMercadoEstim;

  return {
    feeTransferencia: feeTransfer,
    salarioTotalContrato: Math.round(salarioTotal),
    comisionAgente: Math.round(comision),
    primaFirma: Math.round(prima),
    costoTotalClub: Math.round(total),
    ahorroVsMercado: Math.round(ahorro),
    moneda: 'USD',
    resumen: `Traspaso libre (Bosman): **fee transferencia US$ 0** + salario US$ ${Math.round(salarioTotal).toLocaleString('en')} + comisión US$ ${Math.round(comision).toLocaleString('en')} + prima US$ ${Math.round(prima).toLocaleString('en')} = **costo total US$ ${Math.round(total).toLocaleString('en')}**. Ahorro estimado vs fee mercado: ~US$ ${Math.round(ahorro).toLocaleString('en')}.`,
  };
}
