/**
 * Calculadora de Valor por Milla (CPM)
 */
export interface ValorMillasPuntoCentavosInputs {
  precioCash: number;
  millasCanje: number;
  tasasUsd: number;
}
export interface ValorMillasPuntoCentavosOutputs {
  cpm: number;
  evaluacion: string;
  ahorroEquivalente: number;
}
export function valorMillasPuntoCentavos(i: ValorMillasPuntoCentavosInputs): ValorMillasPuntoCentavosOutputs {
  const cash = Number(i.precioCash);
  const millas = Number(i.millasCanje);
  const tasas = Number(i.tasasUsd) || 0;
  if (!cash || cash <= 0) throw new Error("Cash inválido");
  if (!millas || millas <= 0) throw new Error("Millas inválidas");
  const cpm = (cash - tasas) / millas * 100;
  let eval_ = "Promedio";
  if (cpm < 1) eval_ = "Bajo - no canjear";
  else if (cpm < 1.5) eval_ = "Bajo-medio";
  else if (cpm < 2) eval_ = "Bueno";
  else if (cpm < 3) eval_ = "Excelente";
  else eval_ = "Top - canje premium";
  return {
    cpm: Number(cpm.toFixed(2)),
    evaluacion: eval_,
    ahorroEquivalente: Number((cash - tasas).toFixed(2))
  };
}
