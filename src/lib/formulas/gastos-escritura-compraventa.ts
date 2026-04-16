/** Gastos de escritura en compraventa inmobiliaria */
export interface Inputs {
  valorOperacion: number;
  esComprador: string;
  selloPct?: number;
  honorariosPct?: number;
}
export interface Outputs {
  gastoTotal: number;
  honorarios: number;
  sellos: number;
  iti: number;
  otros: number;
}

export function gastosEscrituraCompraventa(i: Inputs): Outputs {
  const valor = Number(i.valorOperacion);
  const esComprador = i.esComprador === 'comprador';
  const selloPct = Number(i.selloPct) ?? 3.6;
  const honPct = Number(i.honorariosPct) ?? 2;

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la operación');

  const honorariosBruto = valor * (honPct / 100);
  const honorarios = esComprador ? Math.round(honorariosBruto * 1.21) : 0; // +IVA 21%
  const sellos = esComprador ? Math.round(valor * (selloPct / 100)) : 0;
  const iti = !esComprador ? Math.round(valor * 0.015) : 0; // 1.5% ITI vendedor
  const otros = esComprador ? Math.round(valor * 0.004) : 0; // ~0.4% certificados etc

  const gastoTotal = honorarios + sellos + iti + otros;

  return { gastoTotal, honorarios, sellos, iti, otros };
}
