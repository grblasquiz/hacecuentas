/**
 * Calculadora de Presupuesto de Viaje a Santiago
 */
export interface PresupuestoViajeSantiagoChileInputs {
  dias: number;
  nivelHotel: string;
  personas: number;
  incluirVuelo: string;
}
export interface PresupuestoViajeSantiagoChileOutputs {
  presupuestoTotalUsd: number;
  desglose: string;
  perDiemPorPersona: number;
  _insight?: any;
  _chart?: any;
}
const HOTEL: Record<string, number> = { bajo: 40, medio: 100, alto: 220 };
const FOOD = 30;
const TRANS = 7;
const ACTS = 20;
const VUELO_EST = 900; // USD promedio desde Latam
export function presupuestoViajeSantiagoChile(i: PresupuestoViajeSantiagoChileInputs): PresupuestoViajeSantiagoChileOutputs {
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

  const fmt = (n: number) => "USD " + Math.round(n).toLocaleString("es-AR");
  const _insight = {
    title: "Tu presupuesto para Santiago",
    text: `Para **${dias} día${dias === 1 ? "" : "s"}** y **${personas} persona${personas === 1 ? "" : "s"}** vas a necesitar cerca de **${fmt(total)}**${vuelo ? " (vuelos incluidos)" : " sin contar vuelos"}, lo que da un per diem en destino de **${fmt(perDiem)} por persona por día**. ${nivel === "alto" ? "El hotel de categoría alta es el que más empuja el total." : nivel === "bajo" ? "Con hotel económico el grueso se va en comida y actividades." : "El alojamiento de gama media equilibra bien el gasto diario."}`,
    tone: "neutral" as const,
    icon: "🇨🇱",
  };

  const slices = [
    { label: "Hotel", value: Math.round(hotelTotal) },
    { label: "Comida", value: Math.round(foodTotal) },
    { label: "Transporte", value: Math.round(transTotal) },
    { label: "Actividades", value: Math.round(actsTotal) },
  ];
  if (vuelo) slices.push({ label: "Vuelos", value: Math.round(vueloTotal) });
  const _chart = {
    type: "doughnut" as const,
    slices: slices.filter((s) => s.value > 0),
    prefix: "$",
    centerValue: fmt(total),
    centerLabel: "Total",
    ariaLabel: "Composición del presupuesto de viaje a Santiago por categoría de gasto",
  };

  return {
    presupuestoTotalUsd: Number(total.toFixed(0)),
    desglose,
    perDiemPorPersona: perDiem,
    _insight,
    _chart
  };
}
