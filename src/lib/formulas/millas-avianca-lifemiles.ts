/**
 * Calculadora de Millas Avianca (LifeMiles)
 */
export interface MillasAviancaLifemilesInputs {
  destino: string;
  cabina: string;
  tipoViaje: string;
  precioPasajeUsd?: number;
}
export interface MillasAviancaLifemilesOutputs {
  millasRequeridas: number;
  impuestos: string;
  valorEstimadoUsd: number;
  decisionCanje?: string;
  _insight?: any;
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
  const precioPasaje = Number(i.precioPasajeUsd || 0);
  const tasasEstimadas = 220;
  const ahorroVsCash = precioPasaje > 0 ? precioPasaje - tasasEstimadas - valor : 0;
  const decisionCanje = precioPasaje > 0
    ? ahorroVsCash > 0
      ? `Conviene usar millas: el pasaje cash menos tasas supera el valor estimado de las millas por USD ${ahorroVsCash.toFixed(0)}.`
      : `Conviene revisar cash: el pasaje no supera el valor estimado de las millas más tasas.`
    : undefined;
  const destNombre: Record<string, string> = { bogota: 'Bogotá', 'buenos-aires': 'Buenos Aires', miami: 'Miami', madrid: 'Madrid', 'são-paulo': 'São Paulo', lima: 'Lima' };
  const dn = destNombre[dest] || dest;
  const cabNombre = cab === 'business' ? 'business' : 'económica';
  const millasFmt = millas.toLocaleString('es-AR');
  const _insight = cab === 'business'
    ? { title: 'Canje premium', text: `Volar a **${dn}** en **business** con LifeMiles cuesta **${millasFmt} millas** (valor aprox. **USD ${valor.toFixed(0)}**). LifeMiles no cobra fuel surcharges, así que el canje en cabina premium rinde.${decisionCanje ? ` ${decisionCanje}` : ''}`, tone: 'good', icon: '🛫' }
    : { title: `Canje a ${dn}`, text: `Llegar a **${dn}** en ${cabNombre} sale **${millasFmt} millas** (valor aprox. **USD ${valor.toFixed(0)}**). Sumá **USD 160-300** de tasas y fees aparte.${decisionCanje ? ` ${decisionCanje}` : ''}`, tone: 'neutral', icon: '✈️' };
  return {
    millasRequeridas: millas,
    impuestos: "USD 160-300 aprox según ruta (tasas y fees).",
    valorEstimadoUsd: Number(valor.toFixed(2)),
    ...(decisionCanje ? { decisionCanje } : {}),
    _insight
  };
}
