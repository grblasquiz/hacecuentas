/**
 * Calculadora de Millas LATAM (LATAM Pass)
 */
export interface MillasLatamDestinoInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
  precioPasajeUsd?: number;
  /** Millas exactas que cotiza LATAM para ese vuelo (si no, se usa la tabla de referencia). */
  millasCotizadas?: number;
  /** Tasas e impuestos en USD que se pagan en plata aunque se canjee. */
  tasasUsd?: number;
}
export interface MillasLatamDestinoOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
  valorPorMilla?: string;
  decisionCanje?: string;
  _insight?: any;
}
const DEST_MILES: Record<string, [number, number, number]> = {"buenos-aires": [7000, 14000, 30000], "santiago": [7000, 14000, 30000], "miami": [25000, 50000, 85000], "madrid": [45000, 90000, 150000], "londres": [55000, 110000, 170000], "sydney": [60000, 120000, 180000]};

// Valor de referencia editorial de la milla LATAM Pass (~1,2¢ USD) usado como
// umbral del veredicto: los relevamientos de mercado ubican la milla de los
// programas latinoamericanos entre 1 y 1,2 centavos de dólar. NO es un dato
// oficial del programa.
const REF_CENT_POR_MILLA = 1.2;
const TASAS_DEFAULT_USD = 190;

export function millasLatamDestino(i: MillasLatamDestinoInputs): MillasLatamDestinoOutputs {
  const dest = String(i.destino || "");
  const cab = String(i.cabina || "economy");
  const viaje = String(i.tipoViaje || "ida-vuelta");
  const arr = DEST_MILES[dest];
  if (!arr) throw new Error("Destino inválido");
  let millasTabla = 0;
  if (cab === "business") millasTabla = arr[2];
  else if (viaje === "ida-vuelta") millasTabla = arr[1];
  else millasTabla = arr[0];

  const millasCotizadas = Number(i.millasCotizadas || 0);
  const millas = millasCotizadas > 0 ? millasCotizadas : millasTabla;
  const tasas = Number.isFinite(Number(i.tasasUsd)) && Number(i.tasasUsd) >= 0 && String(i.tasasUsd ?? '') !== ''
    ? Number(i.tasasUsd)
    : TASAS_DEFAULT_USD;

  const valor = millas * REF_CENT_POR_MILLA / 100;
  const precioPasaje = Number(i.precioPasajeUsd || 0);

  // Comparador millas vs cash: cuánto vale cada milla en ESTE canje concreto.
  let valorPorMilla: string | undefined;
  let decisionCanje: string | undefined;
  let cpm = 0;
  if (precioPasaje > 0) {
    const ahorroNeto = precioPasaje - tasas; // lo que evitás pagar en plata
    cpm = (ahorroNeto / millas) * 100; // centavos USD por milla
    const usdPorMil = (ahorroNeto / millas) * 1000; // USD por 1.000 millas
    valorPorMilla = `${cpm.toFixed(2).replace('.', ',')} ¢USD/milla (USD ${usdPorMil.toFixed(2).replace('.', ',')} por 1.000 millas)`;
    if (ahorroNeto <= 0) {
      decisionCanje = `No conviene canjear: las tasas (USD ${tasas.toFixed(0)}) igualan o superan el precio cash del pasaje (USD ${precioPasaje.toFixed(0)}).`;
    } else if (cpm >= REF_CENT_POR_MILLA) {
      decisionCanje = `Conviene canjear: obtenés ${cpm.toFixed(2).replace('.', ',')}¢ por milla, por encima de la referencia de mercado de ~${String(REF_CENT_POR_MILLA).replace('.', ',')}¢/milla (referencia editorial, no oficial).`;
    } else {
      decisionCanje = `Conviene pagar cash o esperar mejor canje: obtenés ${cpm.toFixed(2).replace('.', ',')}¢ por milla, por debajo de la referencia de ~${String(REF_CENT_POR_MILLA).replace('.', ',')}¢/milla (referencia editorial, no oficial).`;
    }
  }

  const cabLabel = cab === "business" ? "Business" : "Economy";
  const viajeLabel = viaje === "ida-vuelta" ? "ida y vuelta" : "solo ida";
  const origenMillas = millasCotizadas > 0 ? 'las millas cotizadas que ingresaste' : 'la tabla de referencia por destino';
  return {
    millasRequeridas: millas,
    impuestos: millasCotizadas > 0 || precioPasaje > 0
      ? `USD ${tasas.toFixed(0)} (tasas y fees usados en el cálculo).`
      : "USD 120-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2)),
    ...(valorPorMilla ? { valorPorMilla } : {}),
    ...(decisionCanje ? { decisionCanje } : {}),
    _insight: {
      title: precioPasaje > 0 ? "Millas vs cash: lo que rinde este canje" : "Lo que rinde este canje",
      text: `Necesitás **${millas.toLocaleString("es-AR")} millas LATAM Pass** para ${cabLabel} ${viajeLabel} (según ${origenMillas}), un canje valuado en **USD ${valor.toFixed(2)}** (a ${String(REF_CENT_POR_MILLA).replace('.', ',')}¢ por milla, referencia editorial). Las tasas e impuestos (**USD ${tasas.toFixed(0)}**) se pagan aparte, en plata.${valorPorMilla ? ` Con el precio cash que ingresaste, cada milla te rinde **${valorPorMilla}**.` : ''}${decisionCanje ? ` ${decisionCanje}` : ''}`,
      tone: precioPasaje > 0 ? (cpm >= REF_CENT_POR_MILLA ? "good" : "warn") : "neutral",
      icon: "✈️"
    }
  };
}
