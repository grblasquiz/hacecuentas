export interface Inputs {
  dias_cotizados: number;
  base_reguladora: number;
  num_hijos: number; // 0, 1 o 2 (2 = dos o más)
}

export interface Outputs {
  duracion_meses: string;
  cuantia_primeros_6: number;
  cuantia_resto: number;
  total_estimado: number;
  tope_aplicado: string;
  nota_irpf: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (Fuente: SEPE / BOE) ---
  // IPREM mensual 2026: 600,00 € (pendiente confirmación PGE 2026; valor vigente)
  const IPREM_MENSUAL = 600.00;

  // Topes mínimos (% IPREM) según hijos — Fuente: Art. 270 LGSS
  const TOPES_MIN: Record<number, number> = {
    0: IPREM_MENSUAL * 0.95,    // 570,00 €
    1: IPREM_MENSUAL * 1.125,   // 675,00 €
    2: IPREM_MENSUAL * 1.20,    // 720,00 €
  };

  // Topes máximos (% IPREM) según hijos — Fuente: Art. 270 LGSS
  const TOPES_MAX: Record<number, number> = {
    0: IPREM_MENSUAL * 1.75,    // 1.050,00 €
    1: IPREM_MENSUAL * 2.00,    // 1.200,00 €
    2: IPREM_MENSUAL * 2.25,    // 1.575,00 €
  };

  // Tabla de duración — Fuente: Art. 269 LGSS
  const TABLA_DURACION: Array<{ min: number; max: number; meses: number }> = [
    { min: 360,   max: 539,  meses: 4  },
    { min: 540,   max: 719,  meses: 6  },
    { min: 720,   max: 899,  meses: 8  },
    { min: 900,   max: 1079, meses: 10 },
    { min: 1080,  max: 1259, meses: 12 },
    { min: 1260,  max: 1439, meses: 14 },
    { min: 1440,  max: 1619, meses: 16 },
    { min: 1620,  max: 1799, meses: 18 },
    { min: 1800,  max: 1979, meses: 20 },
    { min: 1980,  max: 2159, meses: 22 },
    { min: 2160,  max: Infinity, meses: 24 },
  ];

  // --- Validaciones y valores seguros ---
  const diasCotizados = Math.max(0, Math.floor(i.dias_cotizados ?? 0));
  const baseReguladora = Math.max(0, i.base_reguladora ?? 0);
  const hijos = [0, 1, 2].includes(i.num_hijos) ? i.num_hijos : 0;

  // --- Duración ---
  if (diasCotizados < 360) {
    return {
      duracion_meses: "Sin derecho a prestación contributiva (mínimo 360 días cotizados)",
      cuantia_primeros_6: 0,
      cuantia_resto: 0,
      total_estimado: 0,
      tope_aplicado: "No aplica",
      nota_irpf: "Con menos de 360 días cotizados no se genera prestación contributiva. Consulta el subsidio por desempleo en el SEPE.",
    };
  }

  const tramo = TABLA_DURACION.find(
    (t) => diasCotizados >= t.min && diasCotizados <= t.max
  );
  const duracionMeses = tramo ? tramo.meses : 24;

  // --- Cuantía bruta ---
  const brutaPrimeros6 = baseReguladora * 0.70; // 70% primeros 6 meses
  const brutaResto = baseReguladora * 0.60;      // 60% a partir del mes 7

  // --- Topes mínimo y máximo ---
  const topeMin = TOPES_MIN[hijos];
  const topeMax = TOPES_MAX[hijos];

  const aplicarTope = (bruta: number): { valor: number; etiqueta: string } => {
    if (bruta < topeMin) return { valor: topeMin, etiqueta: "mínimo" };
    if (bruta > topeMax) return { valor: topeMax, etiqueta: "máximo" };
    return { valor: bruta, etiqueta: "sin tope" };
  };

  const primeros6Result = aplicarTope(brutaPrimeros6);
  const restoResult = aplicarTope(brutaResto);

  const cuantiaPrimeros6 = primeros6Result.valor;
  const cuantiaResto = restoResult.valor;

  // --- Total estimado ---
  // Meses a 70%: mínimo entre duracionMeses y 6
  // Meses a 60%: lo que resta
  const mesesAl70 = Math.min(duracionMeses, 6);
  const mesesAl60 = Math.max(0, duracionMeses - 6);

  const totalEstimado =
    mesesAl70 * cuantiaPrimeros6 + mesesAl60 * cuantiaResto;

  // --- Etiqueta de tope aplicado ---
  const hijosLabel = hijos === 0 ? "sin hijos" : hijos === 1 ? "1 hijo" : "2 hijos o más";
  let topeAplicadoMsj = `Topes para ${hijosLabel}: mín. ${topeMin.toFixed(2).replace(".", ",")} € / máx. ${topeMax.toFixed(2).replace(".", ",")} €`;
  if (primeros6Result.etiqueta !== "sin tope" || restoResult.etiqueta !== "sin tope") {
    const partes: string[] = [];
    if (primeros6Result.etiqueta !== "sin tope") {
      partes.push(`primeros 6 meses: se aplica tope ${primeros6Result.etiqueta}`);
    }
    if (restoResult.etiqueta !== "sin tope" && duracionMeses > 6) {
      partes.push(`a partir del mes 7: se aplica tope ${restoResult.etiqueta}`);
    }
    topeAplicadoMsj += " — " + partes.join("; ");
  }

  // --- Nota IRPF ---
  const totalAnualEstimado = totalEstimado;
  let notaIRPF =
    "La prestación por desempleo tributa como rendimiento del trabajo en el IRPF. ";
  if (totalAnualEstimado > 14000) {
    notaIRPF +=
      "Tu prestación supera 14.000 € anuales: es probable que debas presentar la Declaración de la Renta. El SEPE aplica retención mínima del 2%.";
  } else {
    notaIRPF +=
      "Si no tienes otros ingresos relevantes, puede que no estés obligado a declarar, pero conviene verificarlo con la AEAT (umbral general: 22.000 € con un pagador o 14.000 € con más de uno).";
  }

  // --- Etiqueta duración ---
  const duracionLabel = `${duracionMeses} meses (${mesesAl70} mes${mesesAl70 !== 1 ? "es" : ""} al 70% + ${mesesAl60} mes${mesesAl60 !== 1 ? "es" : ""} al 60%)`;

  return {
    duracion_meses: duracionLabel,
    cuantia_primeros_6: Math.round(cuantiaPrimeros6 * 100) / 100,
    cuantia_resto: Math.round(cuantiaResto * 100) / 100,
    total_estimado: Math.round(totalEstimado * 100) / 100,
    tope_aplicado: topeAplicadoMsj,
    nota_irpf: notaIRPF,
  };
}
