/**
 * Calculadora de Presupuesto de Viaje a Barcelona
 */
export interface PresupuestoViajeBarcelonaInputs {
  dias: number;
  nivelHotel: string;
  personas: number;
  incluirVuelo: string;
}
export interface PresupuestoViajeBarcelonaOutputs {
  presupuestoTotalUsd: number;
  desglose: string;
  perDiemPorPersona: number;
  _insight?: any;
  _chart?: any;
}
const HOTEL: Record<string, number> = { bajo: 70, medio: 140, alto: 300 };
const FOOD = 50;
const TRANS = 12;
const ACTS = 30;
const VUELO_EST = 900; // USD promedio desde Latam
export function presupuestoViajeBarcelona(i: PresupuestoViajeBarcelonaInputs): PresupuestoViajeBarcelonaOutputs {
  const dias = Number(i.dias);
  const personas = Number(i.personas);
  const nivel = String(i.nivelHotel || "medio");
  const vuelo = String(i.incluirVuelo || "no") === "si";
  if (!dias || dias <= 0) throw new Error("Ingresá días válidos");
  if (!personas || personas <= 0) throw new Error("Ingresá personas válidas");
  const hotelNoche = HOTEL[nivel] || HOTEL.medio;
  const habitaciones = Math.ceil(personas / 2);
  const hotelTotal = hotelNoche * habitaciones * dias;
  const foodTotal = FOOD * dias * personas;
  const transTotal = TRANS * dias * personas;
  const actsTotal = ACTS * dias * personas;
  const vueloTotal = vuelo ? VUELO_EST * personas : 0;
  const total = hotelTotal + foodTotal + transTotal + actsTotal + vueloTotal;
  const perDiem = Math.round((total - vueloTotal) / (dias * personas));
  const desglose = `Hotel USD ${hotelTotal.toFixed(0)} | Comida USD ${foodTotal.toFixed(0)} | Transporte USD ${transTotal.toFixed(0)} | Actividades USD ${actsTotal.toFixed(0)}${vuelo ? ` | Vuelos USD ${vueloTotal.toFixed(0)}` : ""}`;
  const tot = Number(total.toFixed(0));
  const vueloPct = vuelo ? Math.round((vueloTotal / total) * 100) : 0;
  const slices = [
    { label: "Hotel", value: hotelTotal },
    { label: "Comida", value: foodTotal },
    { label: "Transporte", value: transTotal },
    { label: "Actividades", value: actsTotal },
  ];
  if (vuelo) slices.push({ label: "Vuelos", value: vueloTotal });
  return {
    presupuestoTotalUsd: tot,
    desglose,
    perDiemPorPersona: perDiem,
    _insight: {
      title: "Tu viaje a Barcelona en números",
      text: vuelo
        ? `Para **${personas} ${personas === 1 ? "persona" : "personas"}** y **${dias} días** necesitás unos **USD ${tot.toLocaleString("es-AR")}**, de los cuales los vuelos son el **${vueloPct}%**. En destino calculá **USD ${perDiem}/día por persona**: alojamiento y comida son los rubros que más mueven la aguja.`
        : `**${dias} días en Barcelona** para **${personas} ${personas === 1 ? "persona" : "personas"}** (sin vuelos) rondan los **USD ${tot.toLocaleString("es-AR")}**, o **USD ${perDiem}/día por persona**. Reservar hotel con anticipación es la palanca de ahorro más grande.`,
      tone: "neutral",
      icon: "🇪🇸",
    },
    _chart: {
      type: "doughnut",
      slices,
      prefix: "USD ",
      centerValue: `USD ${tot.toLocaleString("es-AR")}`,
      centerLabel: "Total estimado",
      ariaLabel: "Distribución del presupuesto de viaje a Barcelona por categoría de gasto",
    },
  };
}
