export interface Inputs {
  vehiculo: string;
  precioVehiculo: number;
  vidaUtilAnios: number;
  valorResidualPct: number;
  kmDiarios: number;
  diasMes: number;
  consumoCombustible: number;
  precioCombustible: number;
  seguroMensual: number;
  mantenimientoMensual: number;
  patenteMensual: number;
}

export interface Outputs {
  costoTotalMes: number;
  costoPorKm: number;
  amortizacionMes: number;
  combustibleMes: number;
  kmMes: number;
  desglose: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Sanitizar inputs
  const precio = Math.max(0, Number(i.precioVehiculo) || 0);
  const vidaUtil = Math.max(1, Number(i.vidaUtilAnios) || 5);
  const residualPct = Math.min(100, Math.max(0, Number(i.valorResidualPct) || 0));
  const kmDiarios = Math.max(0, Number(i.kmDiarios) || 0);
  const diasMes = Math.max(0, Math.min(31, Number(i.diasMes) || 22));
  const consumo = Math.max(0, Number(i.consumoCombustible) || 0);
  const precioComb = Math.max(0, Number(i.precioCombustible) || 0);
  const seguro = Math.max(0, Number(i.seguroMensual) || 0);
  const mantenimiento = Math.max(0, Number(i.mantenimientoMensual) || 0);
  const patente = Math.max(0, Number(i.patenteMensual) || 0);
  const vehiculo = i.vehiculo || "ebike";

  if (precio <= 0) {
    return {
      costoTotalMes: 0,
      costoPorKm: 0,
      amortizacionMes: 0,
      combustibleMes: 0,
      kmMes: 0,
      desglose: "Ingresá un precio de vehículo válido."
    };
  }

  // Amortización lineal con valor residual
  // Amortización mensual = Precio × (1 - residual%) / (vidaUtil × 12)
  const valorAmortizable = precio * (1 - residualPct / 100);
  const mesesVidaUtil = vidaUtil * 12;
  const amortizacionMes = valorAmortizable / mesesVidaUtil;

  // Kilómetros por mes
  const kmMes = kmDiarios * diasMes;

  // Costo de energía mensual
  // Para auto/moto: consumo en L/100km × km/mes × precio por litro
  // Para e-bike: consumo en kWh/100km × km/mes × precio por kWh
  const combustibleMes = kmMes > 0 ? (consumo / 100) * kmMes * precioComb : 0;

  // TCO mensual = amortización + energía + seguro + mantenimiento + patente
  const costoTotalMes = amortizacionMes + combustibleMes + seguro + mantenimiento + patente;

  // Costo por km
  const costoPorKm = kmMes > 0 ? costoTotalMes / kmMes : 0;

  // Etiquetas según vehículo
  const energiaLabel: Record<string, string> = {
    ebike: "Electricidad",
    auto: "Combustible (nafta/GNC)",
    moto: "Combustible (nafta)"
  };
  const label = energiaLabel[vehiculo] ?? "Energía";

  // Desglose textual
  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  const desglose =
    `Amortización: ${fmt(amortizacionMes)}/mes` +
    ` | ${label}: ${fmt(combustibleMes)}/mes` +
    ` | Seguro: ${fmt(seguro)}/mes` +
    ` | Mantenimiento: ${fmt(mantenimiento)}/mes` +
    (patente > 0 ? ` | Patente/VTV: ${fmt(patente)}/mes` : "") +
    ` | Km/mes: ${kmMes.toFixed(0)} km` +
    ` | Costo/km: ${fmt(costoPorKm)}`;

  // Insight: costo mensual y por km del vehículo elegido
  const vehLabel: Record<string, string> = { ebike: "tu e-bike", auto: "tu auto", moto: "tu moto" };
  const vLabel = vehLabel[vehiculo] ?? "tu vehículo";
  const _insight = {
    title: "Costo real por mes",
    text: `Mover ${vLabel} cuesta **${fmt(costoTotalMes)}/mes**${kmMes > 0 ? ` (**${fmt(costoPorKm)}/km** sobre ${kmMes.toFixed(0)} km)` : ""}. La amortización pesa **${fmt(amortizacionMes)}/mes** y la energía **${fmt(combustibleMes)}/mes**.`,
    tone: "neutral",
    icon: vehiculo === "ebike" ? "🚲" : vehiculo === "moto" ? "🏍️" : "🚗",
  };
  const slices = [
    { label: "Amortización", value: Math.round(amortizacionMes) },
    { label: label, value: Math.round(combustibleMes) },
    { label: "Seguro", value: Math.round(seguro) },
    { label: "Mantenimiento", value: Math.round(mantenimiento) },
  ];
  if (patente > 0) slices.push({ label: "Patente/VTV", value: Math.round(patente) });
  const _chart = {
    type: "doughnut",
    slices,
    prefix: "$",
    centerValue: fmt(costoTotalMes),
    centerLabel: "por mes",
    ariaLabel: `Costo mensual ${fmt(costoTotalMes)} desglosado en amortización, energía, seguro y mantenimiento.`,
  };

  return {
    costoTotalMes,
    costoPorKm,
    amortizacionMes,
    combustibleMes,
    kmMes,
    desglose,
    _insight,
    _chart
  };
}
