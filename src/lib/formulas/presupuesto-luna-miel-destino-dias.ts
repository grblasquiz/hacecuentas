/**
 * Calculadora de Presupuesto Luna de Miel por Destino.
 */
export interface PresupuestoLunaMielDestinoDiasInputs { destino:string; dias:number; nivel:string; }
export interface PresupuestoLunaMielDestinoDiasOutputs { costoTotal:number; costoPorDia:number; vuelosEstimados:number; hotelEstimado:number; comidaActividades:number; _insight?: any; _chart?: any; }
export function presupuestoLunaMielDestinoDias(inputs: PresupuestoLunaMielDestinoDiasInputs): PresupuestoLunaMielDestinoDiasOutputs {
  const destino = inputs.destino;
  const dias = Number(inputs.dias);
  const nivel = inputs.nivel;
  if (!dias || dias <= 0) throw new Error('Ingresá días');
  const perDay: Record<string, Record<string, number>> = {
    argentina: { economico: 100, medio: 200, lujo: 400 },
    uruguay: { economico: 150, medio: 250, lujo: 500 },
    caribe: { economico: 240, medio: 400, lujo: 800 },
    brasil: { economico: 180, medio: 320, lujo: 650 },
    europa: { economico: 250, medio: 450, lujo: 1100 },
    asia: { economico: 300, medio: 550, lujo: 1700 },
    usa: { economico: 300, medio: 500, lujo: 1150 },
  };
  const costoPorDia = perDay[destino]?.[nivel] || 300;
  const costoTotal = costoPorDia * dias;
  const vuelosEstimados = Math.round(costoTotal * 0.35);
  const hotelEstimado = Math.round(costoTotal * 0.4);
  const comidaActividades = costoTotal - vuelosEstimados - hotelEstimado;
  const destinoLabel: Record<string, string> = {
    argentina: "Argentina", uruguay: "Uruguay", caribe: "el Caribe", brasil: "Brasil",
    europa: "Europa", asia: "Asia", usa: "Estados Unidos",
  };
  const dLabel = destinoLabel[destino] || "tu destino";
  const nivelLabel = nivel === 'economico' ? 'económico' : nivel === 'lujo' ? 'de lujo' : 'nivel medio';
  return {
    costoTotal,
    costoPorDia,
    vuelosEstimados,
    hotelEstimado,
    comidaActividades,
    _insight: {
      title: "Tu luna de miel en números",
      text: `**${dias} días** en **${dLabel}** en plan **${nivelLabel}** salen unos **USD ${costoTotal.toLocaleString("es-AR")}** (**USD ${costoPorDia}/día**). Vuelos y hotel se llevan el **75%** del total, así que reservarlos con tiempo es lo que más mueve el presupuesto.`,
      tone: "neutral",
      icon: "💍",
    },
    _chart: {
      type: "doughnut",
      slices: [
        { label: "Hotel", value: hotelEstimado },
        { label: "Vuelos", value: vuelosEstimados },
        { label: "Comida y actividades", value: comidaActividades },
      ],
      prefix: "USD ",
      centerValue: `USD ${costoTotal.toLocaleString("es-AR")}`,
      centerLabel: "Total estimado",
      ariaLabel: "Distribución del presupuesto de luna de miel por categoría de gasto",
    },
  };
}
