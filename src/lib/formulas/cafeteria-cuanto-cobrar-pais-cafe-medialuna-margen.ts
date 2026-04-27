export interface Inputs {
  producto: string;
  costo_insumo: number;
  ventas_dia: number;
  dias_mes: number;
  alquiler_mes: number;
  sueldos_mes: number;
  otros_fijos_mes: number;
  margen_objetivo: string;
  iva_incluido: string;
}

export interface Outputs {
  precio_sugerido: number;
  precio_sin_iva: number;
  margen_real: number;
  costo_fijo_unitario: number;
  costo_total_unitario: number;
  punto_equilibrio_unidades: number;
  comparacion_mercado: string;
  resumen: string;
}

// Rangos de precios de referencia de mercado 2026 (CABA)
// Fuente: relevamiento propio de carta pública de cadenas, abril 2026
const PRECIOS_MERCADO: Record<string, { cadena_low: number; cadena_high: number; barrio_low: number; barrio_high: number; cadena_nombre: string }> = {
  cafe_simple:  { cadena_low: 2200, cadena_high: 4500, barrio_low: 1400, barrio_high: 2200, cadena_nombre: "Café Martínez / Starbucks" },
  cafe_leche:   { cadena_low: 2800, cadena_high: 5500, barrio_low: 1800, barrio_high: 2800, cadena_nombre: "Café Martínez / Starbucks" },
  medialuna:    { cadena_low:  800, cadena_high: 1800, barrio_low:  600, barrio_high: 1000, cadena_nombre: "Café Martínez" },
  tostado:      { cadena_low: 3500, cadena_high: 6500, barrio_low: 2500, barrio_high: 3800, cadena_nombre: "Café Martínez / Starbucks" },
  facturas:     { cadena_low:  700, cadena_high: 1000, barrio_low:  500, barrio_high:  900, cadena_nombre: "Café Martínez" },
};

const TASA_IVA = 0.21; // IVA servicios gastronómicos — AFIP/ARCA 2026

export function compute(i: Inputs): Outputs {
  // --- Sanitización de inputs ---
  const costoInsumo     = Math.max(0, Number(i.costo_insumo)     || 0);
  const ventasDia       = Math.max(1, Number(i.ventas_dia)       || 1);
  const diasMes         = Math.max(1, Math.min(31, Number(i.dias_mes) || 26));
  const alquilerMes     = Math.max(0, Number(i.alquiler_mes)     || 0);
  const sueldosMes      = Math.max(0, Number(i.sueldos_mes)      || 0);
  const otrosFijosMes   = Math.max(0, Number(i.otros_fijos_mes)  || 0);
  const margenObj       = Math.max(0.01, Math.min(0.99, (Number(i.margen_objetivo) || 65) / 100));
  const conIva          = (i.iva_incluido ?? "si") === "si";
  const producto        = i.producto ?? "cafe_leche";

  // --- Cálculo de unidades mensuales ---
  const unidadesMes = ventasDia * diasMes;

  // --- Costos fijos totales mensuales ---
  const costosFijosMes = alquilerMes + sueldosMes + otrosFijosMes;

  // --- Costo fijo unitario ---
  const costoFijoUnitario = unidadesMes > 0 ? costosFijosMes / unidadesMes : 0;

  // --- Costo total unitario ---
  const costoTotalUnitario = costoInsumo + costoFijoUnitario;

  // --- Precio neto (sin IVA) para alcanzar el margen objetivo ---
  // Margen = (Precio - CostoTotal) / Precio  =>  Precio = CostoTotal / (1 - Margen)
  const precioNeto = costoTotalUnitario / (1 - margenObj);

  // --- Precio final (con o sin IVA) ---
  const precioSugerido = conIva ? precioNeto * (1 + TASA_IVA) : precioNeto;

  // --- Margen real sobre el precio sugerido (neto) ---
  // Expresado como porcentaje bruto sobre precio neto
  const margenReal = precioNeto > 0
    ? ((precioNeto - costoTotalUnitario) / precioNeto) * 100
    : 0;

  // --- Punto de equilibrio (unidades/mes) ---
  // PE = Costos fijos / (Precio neto - Costo variable unitario)
  const contribucionMarginal = precioNeto - costoInsumo;
  const puntoEquilibrio = contribucionMarginal > 0
    ? Math.ceil(costosFijosMes / contribucionMarginal)
    : 0;

  // --- Comparación con el mercado ---
  const ref = PRECIOS_MERCADO[producto] ?? PRECIOS_MERCADO["cafe_leche"];
  let posicion = "";
  let comparacion = "";

  if (precioSugerido < ref.barrio_low) {
    posicion = "por debajo del rango de cafeterías de barrio";
    comparacion = `⚠️ Tu precio sugerido ($${Math.round(precioSugerido).toLocaleString("es-AR")}) está por debajo del piso de cafeterías de barrio ($${ref.barrio_low.toLocaleString("es-AR")}–$${ref.barrio_high.toLocaleString("es-AR")}). Revisá si tus costos están completos o si el volumen estimado es realista.`;
  } else if (precioSugerido <= ref.barrio_high) {
    posicion = "dentro del rango de cafeterías de barrio";
    comparacion = `✅ Tu precio sugerido ($${Math.round(precioSugerido).toLocaleString("es-AR")}) es competitivo dentro del rango de cafeterías de barrio ($${ref.barrio_low.toLocaleString("es-AR")}–$${ref.barrio_high.toLocaleString("es-AR")}). Referencia de cadenas (${ref.cadena_nombre}): $${ref.cadena_low.toLocaleString("es-AR")}–$${ref.cadena_high.toLocaleString("es-AR")}.`;
  } else if (precioSugerido <= ref.cadena_high) {
    posicion = "en zona premium / cadenas";
    comparacion = `🔶 Tu precio sugerido ($${Math.round(precioSugerido).toLocaleString("es-AR")}) está en el rango de cadenas como ${ref.cadena_nombre} ($${ref.cadena_low.toLocaleString("es-AR")}–$${ref.cadena_high.toLocaleString("es-AR")}). Es viable si tu propuesta de valor lo justifica.`;
  } else {
    posicion = "por encima de las cadenas premium";
    comparacion = `🚨 Tu precio sugerido ($${Math.round(precioSugerido).toLocaleString("es-AR")}) supera el techo de ${ref.cadena_nombre} ($${ref.cadena_high.toLocaleString("es-AR")}). Revisá costos fijos, volumen de ventas o margen objetivo.`;
  }

  // --- Resumen general ---
  const ivaTexto = conIva ? " (IVA 21% incluido)" : " (sin IVA — monotributista)";
  const peTexto = puntoEquilibrio > 0
    ? `Punto de equilibrio: ${puntoEquilibrio.toLocaleString("es-AR")} unidades/mes (${Math.round(puntoEquilibrio / diasMes)} por día). `
    : "";
  const resumen =
    `Producto: ${producto.replace("_", " ")}. ` +
    `Costo total unitario: $${Math.round(costoTotalUnitario).toLocaleString("es-AR")} (insumos $${Math.round(costoInsumo).toLocaleString("es-AR")} + fijos $${Math.round(costoFijoUnitario).toLocaleString("es-AR")}). ` +
    `Precio sugerido: $${Math.round(precioSugerido).toLocaleString("es-AR")}${ivaTexto}. ` +
    `Margen bruto: ${margenReal.toFixed(1)}%. ` +
    peTexto +
    `Posición de mercado: ${posicion}.`;

  return {
    precio_sugerido:          Math.round(precioSugerido),
    precio_sin_iva:           Math.round(precioNeto),
    margen_real:              parseFloat(margenReal.toFixed(2)),
    costo_fijo_unitario:      parseFloat(costoFijoUnitario.toFixed(2)),
    costo_total_unitario:     parseFloat(costoTotalUnitario.toFixed(2)),
    punto_equilibrio_unidades: puntoEquilibrio,
    comparacion_mercado:      comparacion,
    resumen,
  };
}
