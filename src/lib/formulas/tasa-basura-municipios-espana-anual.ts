export interface Inputs {
  municipio: string;
  tipo_uso: string;
  metros: number;
  familia_numerosa: boolean;
  compostaje: boolean;
  renta_baja: boolean;
}

export interface Outputs {
  cuota_base: number;
  descuento_familia_numerosa: number;
  descuento_compostaje: number;
  descuento_renta_baja: number;
  cuota_final: number;
  cuota_trimestral: number;
  fecha_pago_habitual: string;
  nota_municipal: string;
}

// Tarifas 2026 por municipio: [tarifa_fija_euros, tarifa_variable_euros_por_m2]
// Fuente: Ordenanzas Fiscales municipales aprobadas o proyectadas 2026
const TARIFAS_MUNICIPIO: Record<string, [number, number]> = {
  madrid:        [45.00, 0.55], // Ordenanza Fiscal nº 3.10 Ayto. Madrid 2026
  barcelona:     [52.00, 0.68], // Taxa AMB tractament residus 2026
  valencia:      [38.00, 0.45], // Ordenanza Fiscal Ayto. Valencia 2026
  sevilla:       [34.00, 0.40], // Ordenanza Fiscal Ayto. Sevilla 2026
  zaragoza:      [36.00, 0.42], // Ordenanza Fiscal Ayto. Zaragoza 2026
  malaga:        [35.00, 0.43], // Ordenanza Fiscal Ayto. Málaga 2026
  bilbao:        [48.00, 0.52], // Ordenanza Fiscal Ayto. Bilbao 2026
  alicante:      [33.00, 0.38], // Ordenanza Fiscal Ayto. Alicante 2026
  valladolid:    [30.00, 0.35], // Ordenanza Fiscal Ayto. Valladolid 2026
  cordoba:       [28.00, 0.33], // Ordenanza Fiscal Ayto. Córdoba 2026
  granada:       [27.00, 0.32], // Ordenanza Fiscal Ayto. Granada 2026
  murcia:        [26.00, 0.31], // Ordenanza Fiscal Ayto. Murcia 2026
  palma:         [42.00, 0.50], // Ordenanza Fiscal Ayto. Palma 2026
  santander:     [32.00, 0.37], // Ordenanza Fiscal Ayto. Santander 2026
  otro_grande:   [32.00, 0.38], // Media estimada ciudades > 100.000 hab.
  otro_mediano:  [22.00, 0.27], // Media estimada municipios 10.000-100.000 hab.
  otro_pequeno:  [14.00, 0.18], // Media estimada municipios < 10.000 hab.
};

// Multiplicadores por tipo de uso
// Fuente: práctica habitual en ordenanzas fiscales españolas
const MULTIPLICADOR_USO: Record<string, number> = {
  vivienda: 1.0,
  segunda:  1.4, // Segunda residencia: mismo coste servicio, menor ocupación
  local:    1.8, // Local comercial: mayor generación de residuos
};

// Fechas de pago habituales por municipio
const FECHAS_PAGO: Record<string, string> = {
  madrid:       "Febrero–abril (período voluntario habitual)",
  barcelona:    "Mayo–julio (período voluntario habitual)",
  valencia:     "Abril–junio (período voluntario habitual)",
  sevilla:      "Marzo–mayo (período voluntario habitual)",
  zaragoza:     "Marzo–mayo (período voluntario habitual)",
  malaga:       "Abril–junio (período voluntario habitual)",
  bilbao:       "Marzo–mayo (período voluntario habitual)",
  alicante:     "Abril–junio (período voluntario habitual)",
  valladolid:   "Marzo–mayo (período voluntario habitual)",
  cordoba:      "Marzo–mayo (período voluntario habitual)",
  granada:      "Marzo–mayo (período voluntario habitual)",
  murcia:       "Abril–junio (período voluntario habitual)",
  palma:        "Abril–junio (período voluntario habitual)",
  santander:    "Marzo–mayo (período voluntario habitual)",
  otro_grande:  "Generalmente entre marzo y junio",
  otro_mediano: "Generalmente entre marzo y julio",
  otro_pequeno: "Generalmente entre abril y septiembre",
};

// Notas informativas por municipio
const NOTAS_MUNICIPIO: Record<string, string> = {
  madrid:       "Madrid aplica la Ordenanza Fiscal nº 3.10. Fraccionamiento en 2 plazos disponible con domiciliación.",
  barcelona:    "Barcelona integra la tasa metropolitana de tratamiento gestionada por el AMB junto con la tasa municipal.",
  valencia:     "Valencia permite fraccionamiento semestral sin recargo si se solicita antes del inicio del período voluntario.",
  sevilla:      "Sevilla gestiona la tasa a través de OPAEF (Organismo Provincial de Asistencia Económica y Fiscal).",
  zaragoza:     "Zaragoza aplica tarifa por categorías de vías. Esta estimación usa la categoría media.",
  malaga:       "Málaga aplica tarifas diferenciadas por zonas de la ciudad. Estimación sobre tarifa media.",
  bilbao:       "Bilbao incluye en la tasa el servicio de recogida selectiva de biorresiduos exigido por la Ley 7/2022.",
  alicante:     "Alicante tiene convenio con la Diputación Provincial para la gestión tributaria.",
  valladolid:   "Valladolid aplica tarifa única sin diferenciación de zonas para uso residencial.",
  cordoba:      "Córdoba gestiona la tasa a través delSUM (Servicio de Recaudación Municipal).",
  granada:      "Granada aplica tarifa por categorías según anchura de vía. Estimación sobre tarifa media.",
  murcia:       "Murcia aplica tarifas diferenciadas por pedanías. Estimación para el núcleo urbano principal.",
  palma:        "Palma de Mallorca incluye la tasa de tratamiento de residuos del Consell de Mallorca.",
  santander:    "Santander permite domiciliación con fraccionamiento en 2 plazos semestrales.",
  otro_grande:  "Estimación media para ciudades de más de 100.000 habitantes. Consulta la ordenanza fiscal de tu municipio.",
  otro_mediano: "Estimación media para municipios de 10.000 a 100.000 habitantes. Consulta la ordenanza fiscal de tu municipio.",
  otro_pequeno: "Estimación media para municipios de menos de 10.000 habitantes. Consulta la ordenanza fiscal de tu municipio.",
};

// Porcentajes de descuento
// Fuente: práctica mayoritaria en ordenanzas fiscales de capitales de provincia España 2026
const PCT_DESCUENTO_FAMILIA_NUMEROSA = 0.20; // 20 %
const PCT_DESCUENTO_COMPOSTAJE       = 0.15; // 15 %
const PCT_DESCUENTO_RENTA_BAJA       = 0.25; // 25 %
const MAX_DESCUENTO_TOTAL            = 0.50; // Tope acumulado del 50 %

export function compute(i: Inputs): Outputs {
  // Valores por defecto
  const municipio = i.municipio || "otro_mediano";
  const tipo_uso  = i.tipo_uso  || "vivienda";
  const metros    = Math.max(15, Math.min(1000, i.metros || 80));

  // Obtener tarifa base del municipio
  const [tarifaFija, tarifaVariable] = TARIFAS_MUNICIPIO[municipio] ?? [22.00, 0.27];
  const multiplicadorUso = MULTIPLICADOR_USO[tipo_uso] ?? 1.0;

  // Cuota base = (tarifa fija + tarifa variable × m²) × multiplicador uso
  const cuota_base = Math.round(
    (tarifaFija + tarifaVariable * metros) * multiplicadorUso * 100
  ) / 100;

  // Los descuentos solo se aplican en vivienda habitual
  // Las segunda residencia y locales comerciales generalmente no tienen derecho a bonificaciones sociales
  const aplicaDescuentos = tipo_uso === "vivienda";

  // Calcular descuentos individuales
  const pct_fn   = aplicaDescuentos && i.familia_numerosa ? PCT_DESCUENTO_FAMILIA_NUMEROSA : 0;
  const pct_comp = aplicaDescuentos && i.compostaje       ? PCT_DESCUENTO_COMPOSTAJE       : 0;
  const pct_rb   = aplicaDescuentos && i.renta_baja       ? PCT_DESCUENTO_RENTA_BAJA       : 0;

  // Porcentaje total acumulado, con tope del 50 %
  const pct_total_raw = pct_fn + pct_comp + pct_rb;
  const pct_total     = Math.min(pct_total_raw, MAX_DESCUENTO_TOTAL);

  // Distribuir el cap proporcionalmente si se supera el límite
  let factor = 1.0;
  if (pct_total_raw > 0 && pct_total_raw > MAX_DESCUENTO_TOTAL) {
    factor = MAX_DESCUENTO_TOTAL / pct_total_raw;
  }

  const descuento_familia_numerosa = Math.round(cuota_base * pct_fn   * factor * 100) / 100;
  const descuento_compostaje       = Math.round(cuota_base * pct_comp * factor * 100) / 100;
  const descuento_renta_baja       = Math.round(cuota_base * pct_rb   * factor * 100) / 100;

  const total_descuentos = descuento_familia_numerosa + descuento_compostaje + descuento_renta_baja;

  const cuota_final = Math.round(Math.max(0, cuota_base - total_descuentos) * 100) / 100;

  // Equivalente trimestral (meramente orientativo)
  const cuota_trimestral = Math.round((cuota_final / 4) * 100) / 100;

  // Fecha de pago y nota
  const fecha_pago_habitual = FECHAS_PAGO[municipio] ?? "Consulta el calendario fiscal de tu ayuntamiento";
  const nota_municipal      = NOTAS_MUNICIPIO[municipio] ?? "Consulta la ordenanza fiscal de tu ayuntamiento para conocer el importe exacto.";

  return {
    cuota_base,
    descuento_familia_numerosa,
    descuento_compostaje,
    descuento_renta_baja,
    cuota_final,
    cuota_trimestral,
    fecha_pago_habitual,
    nota_municipal,
  };
}
