/**
 * Calculadora de Millas Avianca (LifeMiles)
 */
export interface MillasAviancaLifemilesInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
}
export interface MillasAviancaLifemilesOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
}
const DEST_MILES: Record<string, [number, number, number]> = {"bogota": [7500, 15000, 30000], "buenos-aires": [20000, 40000, 70000], "miami": [15000, 30000, 55000], "madrid": [30000, 60000, 100000], "são-paulo": [17500, 35000, 60000], "lima": [10000, 20000, 40000]};
export function millasAviancaLifemiles(i: MillasAviancaLifemilesInputs): MillasAviancaLifemilesOutputs {
  const dest = String(i.destino || "");
  const cab = String(i.cabina || "economy");
  const viaje = String(i.tipoViaje || "ida-vuelta");
  const arr = DEST_MILES[dest];
  if (!arr) throw new Error("Destino inválido");
  let millas = 0;
  if (cab === "business") millas = arr[2];
  else if (viaje === "ida-vuelta") millas = arr[1];
  else millas = arr[0];
  const valor = millas * 1.6 / 100;
  return {
    millasRequeridas: millas,
    impuestos: "USD 160-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2))
  };
}
