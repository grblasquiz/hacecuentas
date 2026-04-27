export interface Inputs {
  frecuencia: string;
  modalidad: string;
  tipo_cambio: number;
}

export interface Outputs {
  costo_usd_mes: number;
  costo_ars_mes: number;
  costo_por_sesion_usd: number;
  detalle: string;
  alternativas: string;
}

// Costo por sesión en USD por modalidad (valores de referencia 2026)
const COSTO_POR_SESION_USD: Record<string, number> = {
  particular_bajo: 30,   // Honorario bajo, zona interior / terapeuta en formación
  particular_medio: 55,  // Honorario medio, CABA/GBA con experiencia
  particular_alto: 80,   // Alta especialización, CABA premium
  prepaga: 8,            // Copago estimado promedio con prepaga
  osde: 12,              // Copago estimado OSDE plan 210/310
};

// BetterHelp: suscripción mensual fija (punto medio USD 200–320)
const BETTERHELP_MENSUAL_USD = 260;

const LABEL_MODALIDAD: Record<string, string> = {
  particular_bajo: "Particular honorario bajo",
  particular_medio: "Particular honorario medio",
  particular_alto: "Particular honorario alto",
  prepaga: "Prepaga con cobertura",
  osde: "OSDE 50%",
  betterhelp: "BetterHelp (suscripción fija)",
};

export function compute(i: Inputs): Outputs {
  const sesiones = parseInt(i.frecuencia, 10) || 4;
  const modalidad = i.modalidad || "particular_medio";
  const tipoCambio = Number(i.tipo_cambio) || 1200;

  if (tipoCambio <= 0) {
    return {
      costo_usd_mes: 0,
      costo_ars_mes: 0,
      costo_por_sesion_usd: 0,
      detalle: "Ingresá un tipo de cambio válido (mayor a 0).",
      alternativas: "",
    };
  }

  if (sesiones < 1 || sesiones > 4) {
    return {
      costo_usd_mes: 0,
      costo_ars_mes: 0,
      costo_por_sesion_usd: 0,
      detalle: "La frecuencia debe estar entre 1 y 4 sesiones por mes.",
      alternativas: "",
    };
  }

  let costoPorSesionUsd: number;
  let costoMensualUsd: number;
  let detalleCalculo: string;

  if (modalidad === "betterhelp") {
    costoPorSesionUsd = parseFloat((BETTERHELP_MENSUAL_USD / sesiones).toFixed(2));
    costoMensualUsd = BETTERHELP_MENSUAL_USD;
    detalleCalculo =
      `BetterHelp cobra una suscripción mensual fija de USD ${BETTERHELP_MENSUAL_USD} ` +
      `(rango USD 200–320). Con ${sesiones} sesión${sesiones > 1 ? "es" : ""}/mes, ` +
      `el costo efectivo por sesión es USD ${costoPorSesionUsd.toFixed(2)}.`;
  } else {
    const precioPorSesion = COSTO_POR_SESION_USD[modalidad] ?? 55;
    costoPorSesionUsd = precioPorSesion;
    costoMensualUsd = precioPorSesion * sesiones;
    const labelMod = LABEL_MODALIDAD[modalidad] ?? modalidad;
    detalleCalculo =
      `Modalidad: ${labelMod}. ` +
      `USD ${precioPorSesion}/sesión × ${sesiones} sesión${sesiones > 1 ? "es" : ""} = ` +
      `USD ${costoMensualUsd.toFixed(2)}/mes.`;
  }

  const costoMensualArs = costoMensualUsd * tipoCambio;

  // Tabla comparativa de todas las modalidades para la frecuencia elegida
  const comparativaLineas: string[] = [
    `Comparativa para ${sesiones} sesión${sesiones > 1 ? "es" : ""}/mes (TC $${tipoCambio}):`,
  ];

  const modalidades = [
    "particular_bajo",
    "particular_medio",
    "particular_alto",
    "prepaga",
    "osde",
    "betterhelp",
  ];

  for (const mod of modalidades) {
    let usdMes: number;
    let usdSesion: number;
    if (mod === "betterhelp") {
      usdMes = BETTERHELP_MENSUAL_USD;
      usdSesion = parseFloat((BETTERHELP_MENSUAL_USD / sesiones).toFixed(2));
    } else {
      const precio = COSTO_POR_SESION_USD[mod] ?? 55;
      usdSesion = precio;
      usdMes = precio * sesiones;
    }
    const arsMes = Math.round(usdMes * tipoCambio);
    const marcador = mod === modalidad ? " ◀" : "";
    comparativaLineas.push(
      `• ${LABEL_MODALIDAD[mod]}: USD ${usdMes.toFixed(0)}/mes (~$${arsMes.toLocaleString("es-AR")} ARS)${marcador}`
    );
  }

  const alternativas = comparativaLineas.join("\n");

  return {
    costo_usd_mes: parseFloat(costoMensualUsd.toFixed(2)),
    costo_ars_mes: Math.round(costoMensualArs),
    costo_por_sesion_usd: parseFloat(costoPorSesionUsd.toFixed(2)),
    detalle: detalleCalculo,
    alternativas,
  };
}
