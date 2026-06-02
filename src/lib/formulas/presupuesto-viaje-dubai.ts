/**
 * Calculadora de Presupuesto de Viaje a Dubái
 */
export interface PresupuestoViajeDubaiInputs {
  dias: number;
  nivelHotel: string;
  personas: number;
  incluirVuelo: string;
}
export interface PresupuestoViajeDubaiOutputs {
  presupuestoTotalUsd: number;
  desglose: string;
  perDiemPorPersona: number;
  _insight?: any;
  _chart?: any;
}
const HOTEL: Record<string, number> = { bajo: 100, medio: 250, alto: 600 };
const FOOD = 80;
const TRANS = 15;
const ACTS = 60;
const VUELO_EST = 900; // USD promedio desde Latam
export function presupuestoViajeDubai(i: PresupuestoViajeDubaiInputs): PresupuestoViajeDubaiOutputs {
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
  const esCaro = perDiem >= 250;
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
      title: "Tu viaje a Dubái en números",
      text: esCaro
        ? `Atención al gasto: **${dias} días** para **${personas} ${personas === 1 ? "persona" : "personas"}** suman unos **USD ${tot.toLocaleString("es-AR")}**${vuelo ? ` (vuelos ${vueloPct}%)` : ""}, con un per-diem alto de **USD ${perDiem}/día por persona**. Dubái es caro: hotel y actividades disparan el presupuesto.`
        : `Para **${personas} ${personas === 1 ? "persona" : "personas"}** y **${dias} días** vas a necesitar unos **USD ${tot.toLocaleString("es-AR")}**${vuelo ? ` (vuelos ${vueloPct}%)` : ""}, con **USD ${perDiem}/día por persona** en destino. Elegir hotel medio en vez de lujo es lo que más baja la cuenta.`,
      tone: esCaro ? "warn" : "neutral",
      icon: "🏙️",
    },
    _chart: {
      type: "doughnut",
      slices,
      prefix: "USD ",
      centerValue: `USD ${tot.toLocaleString("es-AR")}`,
      centerLabel: "Total estimado",
      ariaLabel: "Distribución del presupuesto de viaje a Dubái por categoría de gasto",
    },
  };
}
