/**
 * Calculadora de Millas American Airlines (AAdvantage)
 */
export interface MillasAmericanAaDestinoInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
}
export interface MillasAmericanAaDestinoOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
}
const DEST_MILES: Record<string, [number, number, number]> = {"miami": [7500, 15000, 30000], "nyc": [12500, 25000, 50000], "la": [12500, 25000, 50000], "madrid": [30000, 60000, 100000], "londres": [30000, 60000, 100000], "tokio": [35000, 70000, 120000]};
export function millasAmericanAaDestino(i: MillasAmericanAaDestinoInputs): MillasAmericanAaDestinoOutputs {
  const dest = String(i.destino || "");
  const cab = String(i.cabina || "economy");
  const viaje = String(i.tipoViaje || "ida-vuelta");
  const arr = DEST_MILES[dest];
  if (!arr) throw new Error("Destino inválido");
  let millas = 0;
  if (cab === "business") millas = arr[2];
  else if (viaje === "ida-vuelta") millas = arr[1];
  else millas = arr[0];
  const valor = millas * 1.4 / 100;
  return {
    millasRequeridas: millas,
    impuestos: "USD 150-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2))
  };
}
