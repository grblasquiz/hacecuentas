/**
 * Calculadora de Presupuesto de Viaje a Nueva York
 */
export interface PresupuestoViajeNuevaYorkInputs {
  dias: number;
  nivelHotel: string;
  personas: number;
  incluirVuelo: string;
}
export interface PresupuestoViajeNuevaYorkOutputs {
  presupuestoTotalUsd: number;
  desglose: string;
  perDiemPorPersona: number;
  _insight?: any;
  _chart?: any;
}
const HOTEL: Record<string, number> = { bajo: 150, medio: 280, alto: 500 };
const FOOD = 100;
const TRANS = 20;
const ACTS = 50;
const VUELO_EST = 900; // USD promedio desde Latam
export function presupuestoViajeNuevaYork(i: PresupuestoViajeNuevaYorkInputs): PresupuestoViajeNuevaYorkOutputs {
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
  const vueloShare = total > 0 ? vueloTotal / total : 0;
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  const _insight = {
    title: 'Tu presupuesto para Nueva York',
    text: vuelo
      ? `El viaje completo da **USD ${fmt(total)}** para ${personas} ${personas === 1 ? 'persona' : 'personas'} por ${dias} ${dias === 1 ? 'día' : 'días'}. El vuelo aporta **USD ${fmt(vueloTotal)}** (${Math.round(vueloShare * 100)}%), pero en destino ya gastás **USD ${perDiem}** por persona y día: el hotel y la comida son lo más caro.`
      : `Sin vuelos, gastás **USD ${fmt(total)}** en destino: **USD ${perDiem}** por persona y día. Nueva York es de los destinos más caros del mundo; el hotel solo puede comerse la mitad del presupuesto.`,
    tone: 'warn',
    icon: '🗽'
  };
  const slices = [
    { label: 'Hotel', value: Math.round(hotelTotal) },
    { label: 'Comida', value: Math.round(foodTotal) },
    { label: 'Transporte', value: Math.round(transTotal) },
    { label: 'Actividades', value: Math.round(actsTotal) }
  ];
  if (vuelo) slices.push({ label: 'Vuelos', value: Math.round(vueloTotal) });
  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `USD ${fmt(total)}`,
    centerLabel: 'Total',
    ariaLabel: `Desglose del presupuesto de viaje a Nueva York: total USD ${fmt(total)}`
  };
  return {
    presupuestoTotalUsd: Number(total.toFixed(0)),
    desglose,
    perDiemPorPersona: perDiem,
    _insight,
    _chart
  };
}
