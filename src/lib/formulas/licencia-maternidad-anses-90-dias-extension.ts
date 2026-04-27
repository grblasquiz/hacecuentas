export interface Inputs {
  modalidad: string;
  sueldoBruto: number;
  distribucionDias: string;
  extension: string;
  partoMultiple: string;
}

export interface Outputs {
  asignacionMensual: number;
  totalCobrado90dias: number;
  diasTotalesLicencia: number;
  aplicaTope: string;
  detalleExtension: string;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 — fuente: ANSES / Secretaría de Seguridad Social
  const TOPE_RIPTE_2026 = 1_980_000; // Tope salarial mensual sujeto a aportes (RIPTE Q1 2026)
  const AUH_EMBARAZO_MENSUAL_2026 = 89_745; // Asignación por Embarazo sin empleo formal (movilidad Q1 2026)
  const AUH_PORCENTAJE_MENSUAL = 0.8; // 80% se cobra mensualmente; 20% al presentar certificado de parto
  const DIAS_LICENCIA_BASE = 90; // días corridos Ley LCT art. 177
  const DIAS_EXTRA_MULTIPLE = 30; // días adicionales por parto múltiple o discapacidad (Ley 27.716)
  const MESES_BASE = 3; // 90 días ≈ 3 meses

  const modalidad = i.modalidad || "dependencia";
  const sueldoBruto = Math.max(0, Number(i.sueldoBruto) || 0);
  const extension = i.extension || "ninguna";
  const partoMultiple = i.partoMultiple || "no";

  // ── Días con goce remunerado ──────────────────────────────────────────────
  const diasExtrasMultiple = partoMultiple === "si" ? DIAS_EXTRA_MULTIPLE : 0;
  const diasRemunerados = DIAS_LICENCIA_BASE + diasExtrasMultiple;
  const mesesRemunerados = diasRemunerados / 30; // aproximación mensual

  // ── Días sin goce por extensión ───────────────────────────────────────────
  let diasSinGoce = 0;
  let textoExtension = "Sin extensión sin goce solicitada.";
  if (extension === "3meses") {
    diasSinGoce = 90;
    textoExtension = "Extensión de 3 meses (90 días) sin goce de haberes — Art. 183 LCT. No cobra sueldo ni ANSES, pero conserva puesto y obra social.";
  } else if (extension === "6meses") {
    diasSinGoce = 180;
    textoExtension = "Extensión de 6 meses (180 días) sin goce de haberes — Art. 183 LCT. No cobra sueldo ni ANSES, pero conserva puesto y obra social.";
  }

  const diasTotalesLicencia = diasRemunerados + diasSinGoce;

  // ── Rama: AUH por Embarazo (sin empleo formal) ────────────────────────────
  if (modalidad === "auh_embarazo") {
    const cobro80 = AUH_EMBARAZO_MENSUAL_2026 * AUH_PORCENTAJE_MENSUAL;
    const cobro20acumulado = AUH_EMBARAZO_MENSUAL_2026 * (1 - AUH_PORCENTAJE_MENSUAL);
    // Máximo 6 liquidaciones (desde semana 12 hasta mes previo al parto)
    const maxMesesAUH = 6;
    const totalAUH = AUH_EMBARAZO_MENSUAL_2026 * maxMesesAUH;

    return {
      asignacionMensual: cobro80,
      totalCobrado90dias: totalAUH,
      diasTotalesLicencia: diasTotalesLicencia,
      aplicaTope: "No aplica (régimen AUH por Embarazo, no LCT)",
      detalleExtension: textoExtension,
      resumen:
        `AUH por Embarazo: $${cobro80.toLocaleString("es-AR")} /mes (80% mensual) + $${cobro20acumulado.toLocaleString("es-AR")} al presentar certificado de parto. ` +
        `Máximo ${maxMesesAUH} liquidaciones = $${totalAUH.toLocaleString("es-AR")} total. ` +
        `Días totales de licencia considerados: ${diasTotalesLicencia}.`,
    };
  }

  // ── Rama: Empleada en relación de dependencia (LCT) ──────────────────────
  if (sueldoBruto <= 0) {
    return {
      asignacionMensual: 0,
      totalCobrado90dias: 0,
      diasTotalesLicencia: diasTotalesLicencia,
      aplicaTope: "Ingresá tu sueldo bruto para calcular",
      detalleExtension: textoExtension,
      resumen: "Ingresá un sueldo bruto válido mayor a $0.",
    };
  }

  const superaTope = sueldoBruto > TOPE_RIPTE_2026;
  const asignacionMensual = superaTope ? TOPE_RIPTE_2026 : sueldoBruto;
  const totalCobrado90dias = asignacionMensual * mesesRemunerados;
  const diferenciaMensual = superaTope ? sueldoBruto - TOPE_RIPTE_2026 : 0;

  const aplicaTopeTexto = superaTope
    ? `Sí — Tu sueldo ($${sueldoBruto.toLocaleString("es-AR")}) supera el tope RIPTE ($${TOPE_RIPTE_2026.toLocaleString("es-AR")}). Diferencia no cubierta por ANSES: $${diferenciaMensual.toLocaleString("es-AR")}/mes.`
    : `No — Tu sueldo ($${sueldoBruto.toLocaleString("es-AR")}) está dentro del tope RIPTE ($${TOPE_RIPTE_2026.toLocaleString("es-AR")}). ANSES cubre el 100%.`;

  // Distribución de días (informativa, no afecta monto)
  let distribucionTexto = "45 días antes + 45 días después del parto";
  if (i.distribucionDias === "30_60") distribucionTexto = "30 días antes + 60 días después del parto";
  if (i.distribucionDias === "10_80") distribucionTexto = "10 días antes + 80 días después del parto";

  const extraMultipleTexto = partoMultiple === "si"
    ? ` (+${DIAS_EXTRA_MULTIPLE} días adicionales por parto múltiple/discapacidad = ${diasRemunerados} días remunerados totales.)`
    : "";

  const resumen =
    `Asignación ANSES: $${asignacionMensual.toLocaleString("es-AR")}/mes durante ${diasRemunerados} días (~${mesesRemunerados.toFixed(1)} meses). ` +
    `Total aproximado cobrado: $${totalCobrado90dias.toLocaleString("es-AR")}.` +
    extraMultipleTexto +
    ` Distribución: ${distribucionTexto}.` +
    (diasSinGoce > 0 ? ` Más ${diasSinGoce} días sin goce de haberes.` : "");

  return {
    asignacionMensual,
    totalCobrado90dias,
    diasTotalesLicencia,
    aplicaTope: aplicaTopeTexto,
    detalleExtension: textoExtension,
    resumen,
  };
}
