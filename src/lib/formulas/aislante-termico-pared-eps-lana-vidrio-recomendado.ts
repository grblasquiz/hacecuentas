export interface Inputs {
  zona: string;
  material: string;
  nivel_norma: string;
  superficie: number;
}

export interface Outputs {
  espesor_cm: number;
  r_valor: number;
  costo_m2: number;
  costo_total: number;
  resumen: string;
}

// Resistencia térmica mínima requerida [m²·K/W] según IRAM 11605 (paredes)
// Fuente: IRAM 11605:1996, Tabla 1
const R_REQUERIDO: Record<string, Record<string, number>> = {
  I:   { C: 0.55, B: 0.75 },
  II:  { C: 0.80, B: 1.00 },
  III: { C: 1.00, B: 1.35 },
  IV:  { C: 1.20, B: 1.60 },
  V:   { C: 1.60, B: 2.10 },
  VI:  { C: 2.00, B: 2.60 },
};

// Conductividad térmica λ [W/(m·K)] — valores de diseño típicos
// Fuente: fabricantes + IRAM 11601
const LAMBDA: Record<string, number> = {
  eps:          0.038,
  lana_vidrio:  0.040,
  lana_mineral: 0.036,
  poliuretano:  0.026,
  corcho:       0.045,
};

// Precio orientativo por m² por cm de espesor [ARS, abril 2026]
// Solo material, sin mano de obra
const PRECIO_POR_CM: Record<string, number> = {
  eps:          1800,
  lana_vidrio:  2100,
  lana_mineral: 2600,
  poliuretano:  4500,
  corcho:       3800,
};

const NOMBRES_MATERIAL: Record<string, string> = {
  eps:          "EPS (poliestireno expandido)",
  lana_vidrio:  "Lana de vidrio",
  lana_mineral: "Lana mineral (roca)",
  poliuretano:  "Poliuretano (PUR)",
  corcho:       "Corcho expandido",
};

export function compute(i: Inputs): Outputs {
  const zona = (i.zona || "III").toUpperCase();
  const material = i.material || "eps";
  const nivel = (i.nivel_norma || "B").toUpperCase();
  const superficie = Math.max(Number(i.superficie) || 0, 0);

  // Validaciones
  const rMap = R_REQUERIDO[zona];
  if (!rMap) {
    return {
      espesor_cm: 0,
      r_valor: 0,
      costo_m2: 0,
      costo_total: 0,
      resumen: "Zona bioclimática no reconocida. Seleccioná entre Zona I y Zona VI.",
    };
  }

  const lambda = LAMBDA[material];
  if (lambda === undefined) {
    return {
      espesor_cm: 0,
      r_valor: 0,
      costo_m2: 0,
      costo_total: 0,
      resumen: "Material no reconocido. Seleccioná uno de los materiales disponibles.",
    };
  }

  const nivelKey = nivel === "C" ? "C" : "B";
  const r_requerido = rMap[nivelKey];

  // Cálculo de espesor: e (m) = R × λ
  const espesor_m = r_requerido * lambda;
  const espesor_cm_exacto = espesor_m * 100;

  // Redondear al cm entero superior (espesor mínimo comercial)
  const espesor_cm = Math.ceil(espesor_cm_exacto * 10) / 10;

  // Resistencia térmica real con el espesor redondeado
  const r_valor = parseFloat((espesor_cm / 100 / lambda).toFixed(3));

  // Costos
  const precio_por_cm = PRECIO_POR_CM[material] || 0;
  const costo_m2 = precio_por_cm * espesor_cm;
  const costo_total = superficie > 0 ? costo_m2 * superficie : 0;

  // Resumen textual
  const nombreMaterial = NOMBRES_MATERIAL[material] || material;
  const nivelTexto = nivelKey === "B" ? "recomendado (Nivel B)" : "mínimo aceptable (Nivel C)";
  let resumen = `Zona ${zona} · ${nivelTexto}: se recomienda ${nombreMaterial} con ${espesor_cm.toFixed(1)} cm de espesor. `;
  resumen += `Resistencia térmica resultante: ${r_valor} m²·K/W (norma exige ${r_requerido} m²·K/W). `;
  if (superficie > 0) {
    resumen += `Para ${superficie} m², el costo estimado de materiales es ARS ${costo_total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}.`;
  } else {
    resumen += `Ingresá la superficie para obtener el costo total.`;
  }

  return {
    espesor_cm: parseFloat(espesor_cm.toFixed(1)),
    r_valor,
    costo_m2: parseFloat(costo_m2.toFixed(0)),
    costo_total: parseFloat(costo_total.toFixed(0)),
    resumen,
  };
}
