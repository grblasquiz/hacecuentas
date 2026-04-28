// Calculadora IRPF Capital Mobiliario España 2026
// Fuente: Ley 35/2006 IRPF (BOE-A-2006-20764) + tramos vigentes 2026 (AEAT)

export interface Inputs {
  dividendos: number;          // Dividendos brutos recibidos (€)
  intereses: number;           // Intereses brutos de depósitos, bonos, cuentas (€)
  otros_rendimientos: number;  // Otros rendimientos de capital mobiliario (€)
  gastos_deducibles: number;   // Gastos de administración y custodia deducibles (€)
  retencion_soportada: number; // Retenciones a cuenta ya practicadas en origen (€)
}

export interface Outputs {
  rendimiento_neto: number;      // Base imponible del ahorro (capital mobiliario)
  cuota_tramo_19: number;        // Cuota al 19% — hasta 6.000 €
  cuota_tramo_21: number;        // Cuota al 21% — de 6.000,01 € a 50.000 €
  cuota_tramo_23: number;        // Cuota al 23% — de 50.000,01 € a 200.000 €
  cuota_tramo_27: number;        // Cuota al 27% — de 200.000,01 € a 300.000 €
  cuota_tramo_28: number;        // Cuota al 28% — más de 300.000 €
  cuota_integra_total: number;   // Suma de todas las cuotas por tramo
  tipo_medio_efectivo: number;   // Tipo efectivo en % (cuota / base)
  resultado_declaracion: number; // A pagar (+) o a devolver (−)
  mensaje_resultado: string;     // Diagnóstico para el usuario
}

export function compute(i: Inputs): Outputs {
  // --- Sanear entradas (nunca negativos) ---
  const dividendos = Math.max(0, i.dividendos ?? 0);
  const intereses = Math.max(0, i.intereses ?? 0);
  const otros = Math.max(0, i.otros_rendimientos ?? 0);
  const gastos = Math.max(0, i.gastos_deducibles ?? 0);
  const retencion = Math.max(0, i.retencion_soportada ?? 0);

  // --- Rendimiento neto: ingresos − gastos deducibles ---
  // Art. 26.1.a) Ley 35/2006: solo gastos de administración y custodia
  const ingresos_brutos = dividendos + intereses + otros;
  const rendimiento_neto = Math.max(0, ingresos_brutos - gastos);

  // --- Tramos base del ahorro 2026 (Art. 66 Ley IRPF) ---
  // Tramo 1: 0 – 6.000 €       → 19%
  // Tramo 2: 6.000 – 50.000 €  → 21%
  // Tramo 3: 50.000 – 200.000 €→ 23%
  // Tramo 4: 200.000 – 300.000 €→ 27%
  // Tramo 5: > 300.000 €        → 28%

  const LIMITE_T1 = 6_000;    // €
  const LIMITE_T2 = 50_000;   // €
  const LIMITE_T3 = 200_000;  // €
  const LIMITE_T4 = 300_000;  // €

  const TIPO_T1 = 0.19;
  const TIPO_T2 = 0.21;
  const TIPO_T3 = 0.23;
  const TIPO_T4 = 0.27;
  const TIPO_T5 = 0.28;

  // Cálculo por tramos de forma secuencial
  let base_restante = rendimiento_neto;

  // Tramo 1
  const base_t1 = Math.min(base_restante, LIMITE_T1);
  const cuota_tramo_19 = round2(base_t1 * TIPO_T1);
  base_restante = Math.max(0, base_restante - LIMITE_T1);

  // Tramo 2
  const base_t2 = Math.min(base_restante, LIMITE_T2 - LIMITE_T1);
  const cuota_tramo_21 = round2(base_t2 * TIPO_T2);
  base_restante = Math.max(0, base_restante - (LIMITE_T2 - LIMITE_T1));

  // Tramo 3
  const base_t3 = Math.min(base_restante, LIMITE_T3 - LIMITE_T2);
  const cuota_tramo_23 = round2(base_t3 * TIPO_T3);
  base_restante = Math.max(0, base_restante - (LIMITE_T3 - LIMITE_T2));

  // Tramo 4
  const base_t4 = Math.min(base_restante, LIMITE_T4 - LIMITE_T3);
  const cuota_tramo_27 = round2(base_t4 * TIPO_T4);
  base_restante = Math.max(0, base_restante - (LIMITE_T4 - LIMITE_T3));

  // Tramo 5 (sin límite superior)
  const base_t5 = base_restante;
  const cuota_tramo_28 = round2(base_t5 * TIPO_T5);

  // --- Cuota íntegra total ---
  const cuota_integra_total = round2(
    cuota_tramo_19 + cuota_tramo_21 + cuota_tramo_23 + cuota_tramo_27 + cuota_tramo_28
  );

  // --- Tipo medio efectivo ---
  const tipo_medio_efectivo =
    rendimiento_neto > 0
      ? round4((cuota_integra_total / rendimiento_neto) * 100)
      : 0;

  // --- Resultado en declaración ---
  // Positivo → a pagar; negativo → a devolver
  const resultado_declaracion = round2(cuota_integra_total - retencion);

  // --- Mensaje diagnóstico ---
  let mensaje_resultado: string;

  if (rendimiento_neto === 0) {
    mensaje_resultado =
      "No hay rendimientos netos de capital mobiliario que declarar. Comprueba que hayas introducido al menos un importe de ingresos.";
  } else if (resultado_declaracion > 0.005) {
    mensaje_resultado =
      `Las retenciones soportadas (${formatEUR(retencion)}) no cubren la cuota íntegra (${formatEUR(cuota_integra_total)}). Deberás ingresar ${formatEUR(resultado_declaracion)} adicionales en la declaración de la renta.`;
  } else if (resultado_declaracion < -0.005) {
    mensaje_resultado =
      `Las retenciones soportadas (${formatEUR(retencion)}) superan la cuota íntegra (${formatEUR(cuota_integra_total)}). La AEAT te devolverá ${formatEUR(Math.abs(resultado_declaracion))}.`;
  } else {
    mensaje_resultado =
      `Las retenciones soportadas (${formatEUR(retencion)}) coinciden exactamente con la cuota íntegra. El resultado de la declaración es 0,00 €.`;
  }

  return {
    rendimiento_neto,
    cuota_tramo_19,
    cuota_tramo_21,
    cuota_tramo_23,
    cuota_tramo_27,
    cuota_tramo_28,
    cuota_integra_total,
    tipo_medio_efectivo,
    resultado_declaracion,
    mensaje_resultado,
  };
}

// --- Utilidades internas ---

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

function formatEUR(n: number): string {
  // Formato español: 1.234,56 €
  return (
    n
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
  );
}
