/**
 * Calculadora de Presupuesto de Viaje a Lima
 */
export interface PresupuestoViajeLimaPeruInputs {
  dias: number;
  nivelHotel: string;
  personas: number;
  incluirVuelo: string;
}
export interface PresupuestoViajeLimaPeruOutputs {
  presupuestoTotalUsd: number;
  desglose: string;
  perDiemPorPersona: number;
  _insight?: any;
  _chart?: any;
}
const HOTEL: Record<string, number> = { bajo: 30, medio: 90, alto: 200 };
const FOOD = 25;
const TRANS = 6;
const ACTS = 20;
const VUELO_EST = 900; // USD promedio desde Latam
export function presupuestoViajeLimaPeru(i: PresupuestoViajeLimaPeruInputs): PresupuestoViajeLimaPeruOutputs {
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
    title: 'Tu presupuesto para Lima',
    text: vuelo
      ? `El viaje completo da **USD ${fmt(total)}** para ${personas} ${personas === 1 ? 'persona' : 'personas'} por ${dias} ${dias === 1 ? 'día' : 'días'}. El vuelo se lleva **USD ${fmt(vueloTotal)}** (${Math.round(vueloShare * 100)}% del total); en destino gastás **USD ${perDiem}** por persona y día.`
      : `Sin vuelos, gastás **USD ${fmt(total)}** en destino: unos **USD ${perDiem}** por persona y día. Lima es de los destinos más accesibles de la región, sobre todo en comida.`,
    tone: vueloShare >= 0.4 ? 'warn' : 'neutral',
    icon: '🇵🇪'
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
    ariaLabel: `Desglose del presupuesto de viaje a Lima: total USD ${fmt(total)}`
  };
  return {
    presupuestoTotalUsd: Number(total.toFixed(0)),
    desglose,
    perDiemPorPersona: perDiem,
    _insight,
    _chart
  };
}
