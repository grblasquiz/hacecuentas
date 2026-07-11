/**
 * Calculadora de Millas Avianca (LifeMiles)
 */
export interface MillasAviancaLifemilesInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
  precioPasajeUsd?: number;
  /** Millas exactas que cotiza LifeMiles para ese vuelo (si no, se usa la tabla de referencia). */
  millasCotizadas?: number;
  /** Tasas e impuestos en USD que se pagan en plata aunque se canjee. */
  tasasUsd?: number;
}
export interface MillasAviancaLifemilesOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
  valorPorMilla?: string;
  decisionCanje?: string;
  _insight?: any;
}
const DEST_MILES: Record<string, [number, number, number]> = {"bogota": [7500, 15000, 30000], "buenos-aires": [20000, 40000, 70000], "miami": [15000, 30000, 55000], "madrid": [30000, 60000, 100000], "são-paulo": [17500, 35000, 60000], "lima": [10000, 20000, 40000]};

// Valor de referencia editorial de la milla LifeMiles (~1,6¢ USD) usado como
// umbral del veredicto; el piso de mercado genérico para programas de la
// región es ~1-1,2¢. NO es un dato oficial del programa.
const REF_CENT_POR_MILLA = 1.6;
const TASAS_DEFAULT_USD = 220;

export function millasAviancaLifemiles(i: MillasAviancaLifemilesInputs): MillasAviancaLifemilesOutputs {
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
    const ahorroNeto = precioPasaje - tasas;
    cpm = (ahorroNeto / millas) * 100;
    const usdPorMil = (ahorroNeto / millas) * 1000;
    valorPorMilla = `${cpm.toFixed(2).replace('.', ',')} ¢USD/milla (USD ${usdPorMil.toFixed(2).replace('.', ',')} por 1.000 millas)`;
    if (ahorroNeto <= 0) {
      decisionCanje = `No conviene canjear: las tasas (USD ${tasas.toFixed(0)}) igualan o superan el precio cash del pasaje (USD ${precioPasaje.toFixed(0)}).`;
    } else if (cpm >= REF_CENT_POR_MILLA) {
      decisionCanje = `Conviene canjear: obtenés ${cpm.toFixed(2).replace('.', ',')}¢ por milla, por encima de la referencia de ~${String(REF_CENT_POR_MILLA).replace('.', ',')}¢/milla para LifeMiles (referencia editorial, no oficial).`;
    } else {
      decisionCanje = `Conviene pagar cash o esperar mejor canje: obtenés ${cpm.toFixed(2).replace('.', ',')}¢ por milla, por debajo de la referencia de ~${String(REF_CENT_POR_MILLA).replace('.', ',')}¢/milla (referencia editorial, no oficial).`;
    }
  }

  const destNombre: Record<string, string> = { bogota: 'Bogotá', 'buenos-aires': 'Buenos Aires', miami: 'Miami', madrid: 'Madrid', 'são-paulo': 'São Paulo', lima: 'Lima' };
  const dn = destNombre[dest] || dest;
  const cabNombre = cab === 'business' ? 'business' : 'económica';
  const millasFmt = millas.toLocaleString('es-AR');
  const origenMillas = millasCotizadas > 0 ? 'millas cotizadas por vos' : 'tabla de referencia';
  const extraCanje = `${valorPorMilla ? ` Con el precio cash ingresado, cada milla rinde **${valorPorMilla}**.` : ''}${decisionCanje ? ` ${decisionCanje}` : ''}`;
  const _insight = cab === 'business'
    ? { title: 'Canje premium', text: `Volar a **${dn}** en **business** con LifeMiles cuesta **${millasFmt} millas** (${origenMillas}; valor aprox. **USD ${valor.toFixed(0)}**). LifeMiles no cobra fuel surcharges, así que el canje en cabina premium rinde.${extraCanje}`, tone: precioPasaje > 0 && cpm < REF_CENT_POR_MILLA ? 'warn' : 'good', icon: '🛫' }
    : { title: `Canje a ${dn}`, text: `Llegar a **${dn}** en ${cabNombre} sale **${millasFmt} millas** (${origenMillas}; valor aprox. **USD ${valor.toFixed(0)}**). Sumá **USD ${tasas.toFixed(0)}** de tasas y fees aparte.${extraCanje}`, tone: precioPasaje > 0 ? (cpm >= REF_CENT_POR_MILLA ? 'good' : 'warn') : 'neutral', icon: '✈️' };
  return {
    millasRequeridas: millas,
    impuestos: millasCotizadas > 0 || precioPasaje > 0
      ? `USD ${tasas.toFixed(0)} (tasas y fees usados en el cálculo).`
      : "USD 160-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2)),
    ...(valorPorMilla ? { valorPorMilla } : {}),
    ...(decisionCanje ? { decisionCanje } : {}),
    _insight
  };
}
