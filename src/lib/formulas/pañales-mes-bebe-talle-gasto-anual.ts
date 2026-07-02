export interface Inputs {
  edadMeses: number;
  marca: string;
  talle: string;
  precioPaquete: number;
}

export interface Outputs {
  panialesPorDia: number;
  panialesPorMes: number;
  costoMensual: number;
  costoAnual: number;
  precioUnitario: number;
  detalle: string;
  _insight?: any;
}

// Precios de referencia por unidad en ARS — julio 2026
// Fuente: relevamiento cadenas de pañaleras (Pañal Once, Pañales Online), líneas estándar/premium, paquete mediano
const PRECIO_UNITARIO_2026: Record<string, Record<string, number>> = {
  pampers: { rn: 500, p: 500, m: 510, g: 510, xg: 610, xxg: 610 },
  huggies: { rn: 500, p: 500, m: 440, g: 440, xg: 520, xxg: 520 },
  estrella: { rn: 350, p: 350, m: 350, g: 350, xg: 420, xxg: 420 },
};

// Unidades por paquete estándar de referencia (paquete mediano)
// Se usa solo cuando el usuario ingresa precioPaquete > 0
const UNIDADES_PAQUETE: Record<string, Record<string, number>> = {
  pampers: { rn: 28, p: 28, m: 26, g: 24, xg: 22, xxg: 20 },
  huggies: { rn: 30, p: 30, m: 28, g: 24, xg: 22, xxg: 20 },
  estrella: { rn: 32, p: 32, m: 30, g: 28, xg: 24, xxg: 22 },
};

// Cambios de pañal por día según edad en meses
function getPanialesPorDia(edadMeses: number): number {
  if (edadMeses < 1) return 11;   // RN estricto (0 meses)
  if (edadMeses < 3) return 9;    // 1–2 meses
  if (edadMeses < 6) return 7;    // 3–5 meses
  if (edadMeses < 12) return 6;   // 6–11 meses
  if (edadMeses < 24) return 5;   // 12–23 meses
  if (edadMeses < 36) return 4;   // 24–35 meses
  return 3;                        // 36+ meses (control parcial)
}

export function compute(i: Inputs): Outputs {
  const edadMeses = Math.max(0, Math.floor(Number(i.edadMeses) || 0));
  const marca = (i.marca || "pampers").toLowerCase();
  const talle = (i.talle || "rn").toLowerCase();
  const precioPaqueteInput = Math.max(0, Number(i.precioPaquete) || 0);

  // Validar marca y talle
  const marcaValida = PRECIO_UNITARIO_2026[marca] ? marca : "pampers";
  const talleValido = PRECIO_UNITARIO_2026[marcaValida][talle] !== undefined ? talle : "rn";

  // Calcular precio unitario
  let precioUnitario: number;
  let fuentePrecio: string;

  if (precioPaqueteInput > 0) {
    const unidadesPaquete = UNIDADES_PAQUETE[marcaValida][talleValido];
    precioUnitario = precioPaqueteInput / unidadesPaquete;
    fuentePrecio = `precio ingresado ($${precioPaqueteInput.toLocaleString("es-AR")} / ${unidadesPaquete} unidades)`;
  } else {
    precioUnitario = PRECIO_UNITARIO_2026[marcaValida][talleValido];
    fuentePrecio = "precio de referencia julio 2026";
  }

  // Calcular consumo
  const panialesPorDia = getPanialesPorDia(edadMeses);
  const panialesPorMes = panialesPorDia * 30;

  // Calcular costos
  const costoMensual = Math.round(panialesPorMes * precioUnitario);
  const costoAnual = costoMensual * 12;

  // Descripción de etapa
  let etapa: string;
  if (edadMeses < 1) etapa = "recién nacido";
  else if (edadMeses < 3) etapa = `${edadMeses} mes${edadMeses === 1 ? "" : "es"} (0–3 meses)`;
  else if (edadMeses < 6) etapa = `${edadMeses} meses (3–6 meses)`;
  else if (edadMeses < 12) etapa = `${edadMeses} meses (6–12 meses)`;
  else if (edadMeses < 24) etapa = `${edadMeses} meses (1–2 años)`;
  else if (edadMeses < 36) etapa = `${edadMeses} meses (2–3 años)`;
  else etapa = `${edadMeses} meses (más de 3 años)`;

  const marcaLabel: Record<string, string> = { pampers: "Pampers", huggies: "Huggies", estrella: "Estrella" };
  const talleLabel: Record<string, string> = { rn: "RN", p: "P", m: "M", g: "G", xg: "XG", xxg: "XXG" };

  const detalle =
    `Bebé de ${etapa}. ` +
    `${marcaLabel[marcaValida] || marcaValida} talle ${talleLabel[talleValido] || talleValido}. ` +
    `${panialesPorDia} cambios/día × 30 días = ${panialesPorMes} pañales/mes. ` +
    `Precio unitario: $${Math.round(precioUnitario).toLocaleString("es-AR")} (${fuentePrecio}).`;

  const insight = {
    title: 'Cuánto se van en pañales',
    text: `Con **${panialesPorDia} cambios/día** gastás unos **${panialesPorMes} pañales/mes**, que a $${Math.round(precioUnitario).toLocaleString('es-AR')} la unidad son **$${costoMensual.toLocaleString('es-AR')}/mes** y **$${costoAnual.toLocaleString('es-AR')} en el año**. El número baja a medida que el bebé crece y usa menos cambios por día.`,
    tone: 'neutral',
    icon: '🍼',
  };

  return {
    panialesPorDia,
    panialesPorMes,
    costoMensual,
    costoAnual,
    precioUnitario: Math.round(precioUnitario),
    detalle,
    _insight: insight,
  };
}
