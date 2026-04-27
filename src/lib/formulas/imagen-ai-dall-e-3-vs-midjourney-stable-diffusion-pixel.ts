export interface Inputs {
  imagenesPerMes: number;
  calidadDalle: string;
  planMidjourney: string;
  sdInfra: string;
  fluxPro: string;
  imagen3: string;
}

export interface Outputs {
  costeDalle: number;
  costeDallePorImagen: number;
  costeMidjourney: number;
  costeMidPorImagen: number;
  costeSD: number;
  costeSDPorImagen: number;
  costeFlux: number;
  costeFluxPorImagen: number;
  costeImagen3: number;
  costeImagen3PorImagen: number;
  modeloMasBarato: string;
  resumen: string;
}

// Precios DALL-E 3 por imagen (USD) — OpenAI API 2026
const DALLE_PRECIOS: Record<string, number> = {
  standard_1024: 0.040,
  standard_1792: 0.080,
  hd_1024: 0.080,
  hd_1792: 0.120,
};

// Precios Midjourney por plan (USD/mes) — Midjourney 2026
const MJ_PLANES: Record<string, { precio: number; imagenes: number; ilimitado: boolean }> = {
  basic:    { precio: 10,  imagenes: 200,  ilimitado: false },
  standard: { precio: 30,  imagenes: 9999, ilimitado: true  },
  pro:      { precio: 60,  imagenes: 9999, ilimitado: true  },
  mega:     { precio: 120, imagenes: 9999, ilimitado: true  },
};

// Stable Diffusion GPU config (tarifa USD/hora, segundos por imagen, watts para local)
const SD_INFRA: Record<string, { tarifaHora: number; segPorImg: number; esLocal: boolean; watts: number }> = {
  runpod_a100:    { tarifaHora: 1.89, segPorImg: 3, esLocal: false, watts: 0   },
  runpod_rtx4090: { tarifaHora: 0.74, segPorImg: 5, esLocal: false, watts: 0   },
  lambda_a10:     { tarifaHora: 0.60, segPorImg: 8, esLocal: false, watts: 0   },
  local_3090:     { tarifaHora: 0,    segPorImg: 8, esLocal: true,  watts: 350 },
  local_4090:     { tarifaHora: 0,    segPorImg: 5, esLocal: true,  watts: 450 },
};

// Electricidad local USD/kWh (promedio global 2026)
const ELECTRICIDAD_KWH = 0.12;

// Precios Flux (fal.ai 2026)
const FLUX_PRECIOS: Record<string, number> = {
  si:           0.055, // Flux Pro
  flux_schnell: 0.003, // Flux Schnell
  no:           0,
};

// Precio Google Imagen 3 (Vertex AI 2026)
const IMAGEN3_PRECIO = 0.040;

export function compute(i: Inputs): Outputs {
  const imagenes = Math.max(0, Math.round(Number(i.imagenesPerMes) || 0));

  if (imagenes <= 0) {
    return {
      costeDalle: 0,
      costeDallePorImagen: 0,
      costeMidjourney: 0,
      costeMidPorImagen: 0,
      costeSD: 0,
      costeSDPorImagen: 0,
      costeFlux: 0,
      costeFluxPorImagen: 0,
      costeImagen3: 0,
      costeImagen3PorImagen: 0,
      modeloMasBarato: "Ingresá un número de imágenes válido",
      resumen: "Sin imágenes, el costo es $0 en todos los modelos.",
    };
  }

  // --- DALL-E 3 ---
  const precioDalle = DALLE_PRECIOS[i.calidadDalle] ?? DALLE_PRECIOS["standard_1024"];
  const costeDalle = imagenes * precioDalle;
  const costeDallePorImagen = precioDalle;

  // --- Midjourney ---
  const mjPlan = MJ_PLANES[i.planMidjourney] ?? MJ_PLANES["standard"];
  const costeMidjourney = mjPlan.precio;
  // Costo efectivo por imagen: si ilimitado, dividir precio entre imágenes reales; si basic, máx de imágenes incluidas
  const imagenesMJEfectivas = mjPlan.ilimitado ? imagenes : Math.min(imagenes, mjPlan.imagenes);
  const costeMidPorImagen = imagenesMJEfectivas > 0 ? mjPlan.precio / imagenesMJEfectivas : mjPlan.precio;

  // --- Stable Diffusion ---
  const sdConfig = SD_INFRA[i.sdInfra] ?? SD_INFRA["runpod_rtx4090"];
  let costeSD = 0;
  let costeSDPorImagen = 0;

  if (sdConfig.esLocal) {
    // Costo solo electricidad
    const horasGPU = (imagenes * sdConfig.segPorImg) / 3600;
    const kWhUsados = (sdConfig.watts / 1000) * horasGPU;
    costeSD = kWhUsados * ELECTRICIDAD_KWH;
    costeSDPorImagen = (sdConfig.watts / 1000) * (sdConfig.segPorImg / 3600) * ELECTRICIDAD_KWH;
  } else {
    const horasGPU = (imagenes * sdConfig.segPorImg) / 3600;
    costeSD = horasGPU * sdConfig.tarifaHora;
    costeSDPorImagen = (sdConfig.segPorImg / 3600) * sdConfig.tarifaHora;
  }

  // --- Flux Pro / Schnell ---
  const precioFlux = FLUX_PRECIOS[i.fluxPro] ?? 0;
  const costeFlux = imagenes * precioFlux;
  const costeFluxPorImagen = precioFlux;

  // --- Google Imagen 3 ---
  let costeImagen3 = 0;
  let costeImagen3PorImagen = 0;
  if (i.imagen3 === "si") {
    costeImagen3 = imagenes * IMAGEN3_PRECIO;
    costeImagen3PorImagen = IMAGEN3_PRECIO;
  }

  // --- Modelo más barato ---
  const candidatos: Array<{ nombre: string; costo: number }> = [
    { nombre: "DALL-E 3", costo: costeDalle },
    { nombre: "Midjourney", costo: costeMidjourney },
    { nombre: "Stable Diffusion", costo: costeSD },
  ];
  if (precioFlux > 0) {
    const nombreFlux = i.fluxPro === "flux_schnell" ? "Flux Schnell" : "Flux Pro";
    candidatos.push({ nombre: nombreFlux, costo: costeFlux });
  }
  if (i.imagen3 === "si") {
    candidatos.push({ nombre: "Imagen 3", costo: costeImagen3 });
  }

  const masBarato = candidatos.reduce((prev, curr) => curr.costo < prev.costo ? curr : prev);

  // --- Resumen ---
  const fmt = (n: number) => "$" + n.toFixed(2);
  const fmtU = (n: number) => "$" + n.toFixed(4);

  const lineas = [
    `Para ${imagenes} imágenes/mes:`,
    `• DALL-E 3: ${fmt(costeDalle)} (${fmtU(costeDallePorImagen)}/img)`,
    `• Midjourney (${i.planMidjourney}): ${fmt(costeMidjourney)} (${fmtU(costeMidPorImagen)}/img efectivo)`,
    `• Stable Diffusion (${i.sdInfra}): ${fmt(costeSD)} (${fmtU(costeSDPorImagen)}/img)`,
  ];
  if (precioFlux > 0) {
    const nombreFlux = i.fluxPro === "flux_schnell" ? "Flux Schnell" : "Flux Pro";
    lineas.push(`• ${nombreFlux}: ${fmt(costeFlux)} (${fmtU(costeFluxPorImagen)}/img)`);
  }
  if (i.imagen3 === "si") {
    lineas.push(`• Imagen 3: ${fmt(costeImagen3)} (${fmtU(costeImagen3PorImagen)}/img)`);
  }
  lineas.push(`✅ Más económico: ${masBarato.nombre} con ${fmt(masBarato.costo)}/mes`);

  const resumen = lineas.join("\n");

  return {
    costeDalle,
    costeDallePorImagen,
    costeMidjourney,
    costeMidPorImagen,
    costeSD,
    costeSDPorImagen,
    costeFlux,
    costeFluxPorImagen,
    costeImagen3,
    costeImagen3PorImagen,
    modeloMasBarato: `${masBarato.nombre} — ${fmt(masBarato.costo)}/mes`,
    resumen,
  };
}
