/**
 * Calculadora de Millas LATAM (LATAM Pass)
 */
export interface MillasLatamDestinoInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
}
export interface MillasLatamDestinoOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
  _insight?: any;
}
const DEST_MILES: Record<string, [number, number, number]> = {"buenos-aires": [7000, 14000, 30000], "santiago": [7000, 14000, 30000], "miami": [25000, 50000, 85000], "madrid": [45000, 90000, 150000], "londres": [55000, 110000, 170000], "sydney": [60000, 120000, 180000]};
export function millasLatamDestino(i: MillasLatamDestinoInputs): MillasLatamDestinoOutputs {
  const dest = String(i.destino || "");
  const cab = String(i.cabina || "economy");
  const viaje = String(i.tipoViaje || "ida-vuelta");
  const arr = DEST_MILES[dest];
  if (!arr) throw new Error("Destino inválido");
  let millas = 0;
  if (cab === "business") millas = arr[2];
  else if (viaje === "ida-vuelta") millas = arr[1];
  else millas = arr[0];
  const valor = millas * 1.2 / 100;
  const cabLabel = cab === "business" ? "Business" : "Economy";
  const viajeLabel = viaje === "ida-vuelta" ? "ida y vuelta" : "solo ida";
  return {
    millasRequeridas: millas,
    impuestos: "USD 120-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2)),
    _insight: {
      title: "Lo que rinde este canje",
      text: `Necesitás **${millas.toLocaleString("es-AR")} millas LATAM Pass** para ${cabLabel} ${viajeLabel}, un canje valuado en **USD ${valor.toFixed(2)}** (a 1,2¢ por milla). Acordate que las tasas e impuestos (USD 120-300) se pagan aparte, en plata.`,
      tone: "neutral",
      icon: "✈️"
    }
  };
}
