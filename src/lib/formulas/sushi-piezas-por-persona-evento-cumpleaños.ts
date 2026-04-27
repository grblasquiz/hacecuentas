export interface Inputs {
  invitados: number;
  rol: string;
  perfil: string;
  incluye_extras: string;
}

export interface Outputs {
  piezas_por_persona: number;
  piezas_totales: number;
  rolls_estimados: number;
  rango_recomendado: string;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const invitados = Math.round(Number(i.invitados) || 0);

  if (invitados <= 0) {
    return {
      piezas_por_persona: 0,
      piezas_totales: 0,
      rolls_estimados: 0,
      rango_recomendado: "Ingresá al menos 1 invitado",
      detalle: "Sin invitados no hay cálculo posible.",
    };
  }

  // Base de piezas según rol del sushi en el menú
  const BASE_PRINCIPAL = 10; // 8-12 piezas, punto medio
  const BASE_ENTRADA = 5;    // 4-6 piezas, punto medio

  const baseRol = i.rol === "entrada" ? BASE_ENTRADA : BASE_PRINCIPAL;
  const rolLabel = i.rol === "entrada" ? "entrada/aperitivo" : "plato principal";

  // Factor según perfil del grupo
  const FACTORES_PERFIL: Record<string, number> = {
    mixto:    1.00,
    hombres:  1.20,
    mujeres:  0.90,
    jovenes:  1.15,
    familia:  0.85,
    mayores:  0.80,
  };

  const LABELS_PERFIL: Record<string, string> = {
    mixto:    "mixto (hombres y mujeres adultos)",
    hombres:  "mayoría hombres adultos",
    mujeres:  "mayoría mujeres adultas",
    jovenes:  "adultos jóvenes (18-30 años)",
    familia:  "familia con niños",
    mayores:  "adultos mayores (60+)",
  };

  const factorPerfil = FACTORES_PERFIL[i.perfil] ?? 1.00;
  const perfilLabel = LABELS_PERFIL[i.perfil] ?? i.perfil;

  // Factor por presencia de otros platos
  const factorExtras = i.incluye_extras === "si" ? 0.80 : 1.00;
  const extrasLabel = i.incluye_extras === "si"
    ? "con otros platos en el menú (reducción 20%)"
    : "sin otros platos";

  // Cálculo central
  const piezas_por_persona = Math.round((baseRol * factorPerfil * factorExtras) * 10) / 10;
  const piezas_totales = Math.round(piezas_por_persona * invitados);

  // Rolls de 8 piezas, redondeado hacia arriba
  const PIEZAS_POR_ROLL = 8;
  const rolls_estimados = Math.ceil(piezas_totales / PIEZAS_POR_ROLL);

  // Rango ±20%
  const rangoMin = Math.round(piezas_totales * 0.80);
  const rangoMax = Math.round(piezas_totales * 1.20);
  const rango_recomendado = `${rangoMin} – ${rangoMax} piezas en total (${Math.round(piezas_por_persona * 0.80)}–${Math.round(piezas_por_persona * 1.20)} por persona)`;

  const detalle =
    `Base (${rolLabel}): ${baseRol} piezas | ` +
    `Perfil: ${perfilLabel} (×${factorPerfil.toFixed(2)}) | ` +
    `Extras: ${extrasLabel} (×${factorExtras.toFixed(2)}) | ` +
    `Total: ${piezas_totales} piezas para ${invitados} invitado${invitados !== 1 ? "s" : ""}`;

  return {
    piezas_por_persona,
    piezas_totales,
    rolls_estimados,
    rango_recomendado,
    detalle,
  };
}
