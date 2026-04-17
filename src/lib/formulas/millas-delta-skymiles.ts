/**
 * Calculadora de Millas Delta (SkyMiles)
 */
export interface MillasDeltaSkymilesInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
}
export interface MillasDeltaSkymilesOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
}
const DEST_MILES: Record<string, [number, number, number]> = {"nyc": [10000, 20000, 35000], "atlanta": [9000, 18000, 35000], "amsterdam": [30000, 60000, 100000], "tokio": [35000, 70000, 125000], "ciudad-de-mexico": [11000, 22000, 40000], "cartagena": [12000, 25000, 45000]};
export function millasDeltaSkymiles(i: MillasDeltaSkymilesInputs): MillasDeltaSkymilesOutputs {
  const dest = String(i.destino || "");
  const cab = String(i.cabina || "economy");
  const viaje = String(i.tipoViaje || "ida-vuelta");
  const arr = DEST_MILES[dest];
  if (!arr) throw new Error("Destino inválido");
  let millas = 0;
  if (cab === "business") millas = arr[2];
  else if (viaje === "ida-vuelta") millas = arr[1];
  else millas = arr[0];
  const valor = millas * 1.1 / 100;
  return {
    millasRequeridas: millas,
    impuestos: "USD 130-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2))
  };
}
