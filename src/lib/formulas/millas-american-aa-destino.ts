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
  _insight?: any;
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
  const destNombre: Record<string, string> = { miami: 'Miami', nyc: 'Nueva York', la: 'Los Ángeles', madrid: 'Madrid', londres: 'Londres', tokio: 'Tokio' };
  const dn = destNombre[dest] || dest;
  const cabNombre = cab === 'business' ? 'business' : 'económica';
  const millasFmt = millas.toLocaleString('es-AR');
  const _insight = cab === 'business'
    ? { title: 'Canje premium', text: `Volar a **${dn}** en **business** con AAdvantage cuesta **${millasFmt} millas** (valor aprox. **USD ${valor.toFixed(0)}**). Los canjes en cabina premium suelen exprimir más valor por milla.`, tone: 'good', icon: '🛫' }
    : { title: `Canje a ${dn}`, text: `Llegar a **${dn}** en ${cabNombre} sale **${millasFmt} millas** (valor aprox. **USD ${valor.toFixed(0)}**). Sumá **USD 150-300** de tasas y fees aparte.`, tone: 'neutral', icon: '✈️' };
  return {
    millasRequeridas: millas,
    impuestos: "USD 150-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2)),
    _insight
  };
}
