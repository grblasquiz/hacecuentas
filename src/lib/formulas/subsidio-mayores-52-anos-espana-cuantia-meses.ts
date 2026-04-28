// Subsidio para mayores de 52 años — España 2026
// Fuente: SEPE, LGSS art. 274-277, IPREM 2026

export interface Inputs {
  edad: number;
  anos_cotizados: number;
  agotada_prestacion: boolean;
  ingresos_mensuales: number;
  responsabilidades_familiares: boolean;
  ingresos_unidad_familiar: number;
  edad_jubilacion_ordinaria: "65" | "67";
}

export interface Outputs {
  cumple_requisitos: string;
  motivos_incumplimiento: string;
  cuantia_mensual: number;
  meses_restantes: number;
  anos_restantes: number;
  total_estimado: number;
  cotiza_jubilacion: string;
  nota_fiscal: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 ---
  // IPREM mensual 2026 (Ley de PGE 2026 / Ministerio de Trabajo)
  const IPREM_MENSUAL = 600.84;
  // Cuantía subsidio: 80% del IPREM mensual (LGSS art. 278.1.a)
  const PORCENTAJE_SUBSIDIO = 0.80;
  const CUANTIA_SUBSIDIO = IPREM_MENSUAL * PORCENTAJE_SUBSIDIO; // 480,67 €

  // SMI 2026 mensual: 1.512,00 € (14 pagas) → mensual = 1.512,00 €
  // 75% SMI = límite de ingresos para acceder al subsidio
  const SMI_MENSUAL = 1512.00;
  const LIMITE_INGRESOS = SMI_MENSUAL * 0.75; // 1.134,00 €

  // Años mínimos cotizados exigidos
  const ANOS_COTIZADOS_MIN = 6;
  // Edad mínima de acceso
  const EDAD_MINIMA = 52;

  // --- Validación de requisitos ---
  const motivos: string[] = [];

  // 1. Edad mínima
  const edadNum = Number(i.edad) || 0;
  if (edadNum < EDAD_MINIMA) {
    motivos.push(`Edad insuficiente: tienes ${edadNum} años y se requieren al menos ${EDAD_MINIMA} años.`);
  }

  // 2. Años cotizados
  const anosCotizados = Number(i.anos_cotizados) || 0;
  if (anosCotizados < ANOS_COTIZADOS_MIN) {
    motivos.push(`Cotización insuficiente: acreditas ${anosCotizados} año(s) y se requieren al menos ${ANOS_COTIZADOS_MIN} años.`);
  }

  // 3. Agotamiento de prestación contributiva
  // En el supuesto general se exige haberla agotado.
  // Si no la ha agotado, solo puede acceder si tiene responsabilidades familiares
  // y carece de derecho a la prestación contributiva (supuesto residual).
  // Simplificación: si no ha agotado y no tiene responsabilidades → no cumple.
  if (!i.agotada_prestacion && !i.responsabilidades_familiares) {
    motivos.push("No has agotado la prestación contributiva y no acreditas responsabilidades familiares. En el supuesto general se exige haber agotado la prestación contributiva.");
  }

  // 4. Límite de ingresos propios
  const ingresosPropios = Number(i.ingresos_mensuales) || 0;
  if (ingresosPropios >= LIMITE_INGRESOS) {
    motivos.push(`Ingresos propios (${ingresosPropios.toFixed(2).replace(".", ",")}€) iguales o superiores al límite del 75% del SMI (${LIMITE_INGRESOS.toFixed(2).replace(".", ",")}€/mes).`);
  }

  // 5. Límite de renta media por miembro de la unidad familiar
  const ingresosUF = Number(i.ingresos_unidad_familiar) || 0;
  if (ingresosUF >= LIMITE_INGRESOS) {
    motivos.push(`La renta media por miembro de la unidad familiar (${ingresosUF.toFixed(2).replace(".", ",")}€) supera el límite del 75% del SMI (${LIMITE_INGRESOS.toFixed(2).replace(".", ",")}€/mes).`);
  }

  const cumple = motivos.length === 0;

  // --- Cálculo de duración ---
  const edadJubilacion = Number(i.edad_jubilacion_ordinaria) || 67;
  const anosRestantes = Math.max(0, edadJubilacion - edadNum);
  const mesesRestantes = anosRestantes * 12;

  // --- Totales ---
  const cuantiaMensual = cumple ? CUANTIA_SUBSIDIO : 0;
  const totalEstimado = cumple ? cuantiaMensual * mesesRestantes : 0;

  // --- Textos de salida ---
  const cumpleTexto = cumple
    ? "✅ Cumples los requisitos para solicitar el subsidio para mayores de 52 años."
    : "❌ No cumples todos los requisitos. Consulta los motivos indicados.";

  const motivosTexto = motivos.length > 0
    ? motivos.map((m, idx) => `${idx + 1}. ${m}`).join(" | ")
    : "Ninguno. Todos los requisitos están satisfechos.";

  const cotizaJubilacion = cumple
    ? "Sí. Durante el cobro del subsidio, el SEPE cotiza por jubilación en tu nombre sobre la base mínima de cotización vigente."
    : "No aplica (no cumples los requisitos de acceso).";

  const notaFiscal =
    "El subsidio tributa como rendimiento del trabajo en el IRPF. " +
    `La cuantía anual estimada es de ${(CUANTIA_SUBSIDIO * 12).toFixed(2).replace(".", ",")}€, ` +
    "por lo que en la mayoría de los casos la retención aplicada es del 0% " +
    "y no existe obligación de presentar la declaración si es el único ingreso (límite 22.000€).";

  return {
    cumple_requisitos: cumpleTexto,
    motivos_incumplimiento: motivosTexto,
    cuantia_mensual: parseFloat(cuantiaMensual.toFixed(2)),
    meses_restantes: mesesRestantes,
    anos_restantes: anosRestantes,
    total_estimado: parseFloat(totalEstimado.toFixed(2)),
    cotiza_jubilacion: cotizaJubilacion,
    nota_fiscal: notaFiscal,
  };
}
