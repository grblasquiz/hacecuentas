export interface Inputs {
  edadSemanas: number;
  pesoKg: number;
  tipoAlimentacion: string;
  marca: string;
  precioLata: number;
}

export interface Outputs {
  mlPorDia: number;
  tomasPorDia: number;
  mlPorToma: number;
  gramosPolvosDia: number;
  gramosPolvosMes: number;
  latasMes: number;
  costoMensual: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const edadSemanas = Math.round(Number(i.edadSemanas) || 0);
  const pesoKg = Number(i.pesoKg) || 0;
  const tipoAlimentacion = i.tipoAlimentacion || "exclusiva";
  const precioLata = Number(i.precioLata) || 0;

  if (edadSemanas <= 0 || pesoKg <= 0) {
    return {
      mlPorDia: 0,
      tomasPorDia: 0,
      mlPorToma: 0,
      gramosPolvosDia: 0,
      gramosPolvosMes: 0,
      latasMes: 0,
      costoMensual: 0,
      detalle: "Ingresá la edad y el peso del bebé para calcular.",
    };
  }

  // --- Tabla de recomendaciones por edad (SAP / AAP) ---
  // { semanas_max, mlKgDia, tomasDia }
  const TABLA_EDAD: Array<{ semMax: number; mlKgDia: number; tomas: number }> = [
    { semMax: 4,  mlKgDia: 150, tomas: 8 },
    { semMax: 8,  mlKgDia: 140, tomas: 7 },
    { semMax: 16, mlKgDia: 130, tomas: 6 },
    { semMax: 24, mlKgDia: 120, tomas: 5 },
    { semMax: Infinity, mlKgDia: 110, tomas: 5 },
  ];

  const fila = TABLA_EDAD.find((f) => edadSemanas <= f.semMax) ?? TABLA_EDAD[TABLA_EDAD.length - 1];
  const mlKgDia = fila.mlKgDia;
  const tomasPorDia = fila.tomas;

  // Volumen diario total (máx 1000 ml)
  const ML_MAX_DIA = 1000;
  let mlPorDia = Math.min(mlKgDia * pesoKg, ML_MAX_DIA);

  // Si es suplementaria, la fórmula cubre aprox. el 40 % del total
  const PORCENTAJE_SUPLEMENTARIA = 0.40;
  if (tipoAlimentacion === "suplementaria") {
    mlPorDia = mlPorDia * PORCENTAJE_SUPLEMENTARIA;
  }

  const mlPorToma = mlPorDia / tomasPorDia;

  // Proporción polvo estándar: 1 g de polvo por cada ~7 ml de fórmula preparada
  // (equivale a 1 medida de ~4.3 g cada 30 ml — instrucción estándar etapa 1)
  const ML_POR_GRAMO_POLVO = 7.0;
  const gramosPolvosDia = mlPorDia / ML_POR_GRAMO_POLVO;
  const DIAS_MES = 30.4;
  const gramosPolvosMes = gramosPolvosDia * DIAS_MES;

  // Latas de 400 g
  const GRAMOS_POR_LATA = 400;
  const latasMes = gramosPolvosMes / GRAMOS_POR_LATA;
  const latasEnteras = Math.ceil(latasMes);

  const costoMensual = precioLata > 0 ? latasEnteras * precioLata : 0;

  // Nombres amigables de marcas
  const NOMBRES_MARCA: Record<string, string> = {
    nan: "NAN (Nestlé)",
    aptamil: "Aptamil (Danone)",
    sma: "SMA (Wyeth/Pfizer)",
  };
  const nombreMarca = NOMBRES_MARCA[i.marca] ?? i.marca;

  const tipoLabel = tipoAlimentacion === "suplementaria" ? "suplementaria (40 % del total)" : "exclusiva";

  const detalle =
    `Bebé de ${edadSemanas} sem, ${pesoKg} kg | Alimentación ${tipoLabel} | Marca: ${nombreMarca}. ` +
    `${mlKgDia} ml/kg/día → ${mlPorDia.toFixed(0)} ml/día en ${tomasPorDia} tomas de ${mlPorToma.toFixed(0)} ml. ` +
    `Polvo: ${gramosPolvosDia.toFixed(1)} g/día = ${gramosPolvosMes.toFixed(0)} g/mes → ${latasMes.toFixed(2)} latas (redondeado: ${latasEnteras} latas).` +
    (precioLata > 0 ? ` Costo estimado: $${costoMensual.toLocaleString("es-AR")} ARS.` : "");

  return {
    mlPorDia: Math.round(mlPorDia * 10) / 10,
    tomasPorDia,
    mlPorToma: Math.round(mlPorToma * 10) / 10,
    gramosPolvosDia: Math.round(gramosPolvosDia * 10) / 10,
    gramosPolvosMes: Math.round(gramosPolvosMes * 10) / 10,
    latasMes: Math.round(latasMes * 100) / 100,
    costoMensual,
    detalle,
  };
}
