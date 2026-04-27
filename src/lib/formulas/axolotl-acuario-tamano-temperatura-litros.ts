export interface Inputs {
  cantidad: number;
  edad: string;
  temp_ambiente: number;
}

export interface Outputs {
  litros_minimos: number;
  litros_recomendados: number;
  caudal_max: number;
  temp_objetivo: string;
  chiller_watts: number;
  alerta_temp: string;
  resumen: string;
}

// Parámetros biológicos recomendados para Ambystoma mexicanum
// Fuente: AGSC (University of Kentucky) y Axolotl.org
const TEMP_OPTIMA_MIN = 16;   // °C
const TEMP_OPTIMA_MAX = 18;   // °C
const TEMP_OBJETIVO = 17;     // °C (punto medio del rango óptimo)
const TEMP_ESTRES = 20;       // °C — inicio de estrés térmico
const TEMP_PELIGRO = 22;      // °C — peligro real, actuar de inmediato
const FACTOR_CAUDAL_MAX = 4;  // multiplicador: caudal (L/h) ≤ volumen × 4

// Calor específico volumétrico del agua: ~1.16 Wh/(L·°C)
const C_AGUA = 1.16;
// Factor de seguridad para el chiller (pérdidas de instalación, ciclo compresor)
const FACTOR_SEG_CHILLER = 1.5;

// Volúmenes mínimos y recomendados según etapa de vida
const VOLUMEN_BASE: Record<string, { min: number; rec: number }> = {
  juvenil:   { min: 40,  rec: 55  },
  subadulto: { min: 60,  rec: 80  },
  adulto:    { min: 75,  rec: 100 },
};
// Extra por cada ejemplar adicional (misma etapa)
const VOLUMEN_EXTRA: Record<string, { min: number; rec: number }> = {
  juvenil:   { min: 25, rec: 35 },
  subadulto: { min: 35, rec: 50 },
  adulto:    { min: 40, rec: 55 },
};

export function compute(i: Inputs): Outputs {
  // --- Validación de inputs ---
  const cantidad = Math.floor(Math.max(1, Number(i.cantidad) || 1));
  const edad = ["juvenil", "subadulto", "adulto"].includes(i.edad)
    ? i.edad
    : "adulto";
  const temp_ambiente = Number(i.temp_ambiente) || 25;

  // --- Cálculo de volumen ---
  const base = VOLUMEN_BASE[edad];
  const extra = VOLUMEN_EXTRA[edad];

  const litros_minimos = cantidad === 1
    ? base.min
    : base.min + (cantidad - 1) * extra.min;

  const litros_recomendados = cantidad === 1
    ? base.rec
    : base.rec + (cantidad - 1) * extra.rec;

  // --- Caudal máximo del filtro ---
  // Se toma el volumen recomendado como base de cálculo para no subestimar
  const caudal_max = Math.round(litros_recomendados * FACTOR_CAUDAL_MAX);

  // --- Temperatura objetivo ---
  const temp_objetivo = `${TEMP_OPTIMA_MIN}-${TEMP_OPTIMA_MAX} °C (nunca superar ${TEMP_PELIGRO} °C)`;

  // --- Potencia del chiller ---
  // Solo es necesario si la temperatura ambiente supera la temperatura objetivo
  let chiller_watts = 0;
  let alerta_temp = "";

  if (temp_ambiente <= TEMP_OPTIMA_MAX) {
    chiller_watts = 0;
    alerta_temp = `✅ Tu temperatura ambiente (${temp_ambiente} °C) está dentro del rango óptimo. No necesitás chiller activo, pero monitoreá en épocas de calor.`;
  } else {
    const deltaT = temp_ambiente - TEMP_OBJETIVO;
    // W = L × ΔT × C_agua × factor_seguridad
    const watts_calc = litros_recomendados * deltaT * C_AGUA * FACTOR_SEG_CHILLER;
    // Redondear al múltiplo de 50 W inmediatamente superior (tamaños comerciales)
    chiller_watts = Math.ceil(watts_calc / 50) * 50;

    if (temp_ambiente > TEMP_PELIGRO) {
      alerta_temp = `🔴 ALERTA: ${temp_ambiente} °C supera el límite de ${TEMP_PELIGRO} °C. Chiller imprescindible. Sin él, la vida del axolotl está en riesgo.`;
    } else if (temp_ambiente > TEMP_ESTRES) {
      alerta_temp = `🟠 Atención: ${temp_ambiente} °C causa estrés térmico al axolotl. Se recomienda chiller o medidas de enfriamiento activas (ventilador + botellas de hielo).`;
    } else {
      alerta_temp = `🟡 La temperatura ambiente (${temp_ambiente} °C) está cerca del límite superior. Monitorear y considerar chiller preventivo.`;
    }
  }

  // --- Resumen ---
  const etapaLabel: Record<string, string> = {
    juvenil: "juvenil(es) (< 15 cm)",
    subadulto: "subadulto(s) (15-20 cm)",
    adulto: "adulto(s) (> 20 cm)",
  };

  const chillerTexto = chiller_watts > 0
    ? `Chiller recomendado: ≥ ${chiller_watts} W.`
    : "No se requiere chiller activo en tu clima.";

  const resumen =
    `Setup para ${cantidad} axolotl(s) ${etapaLabel[edad]}: ` +
    `acuario mínimo ${litros_minimos} L (recomendado ${litros_recomendados} L), ` +
    `filtro con caudal ≤ ${caudal_max} L/h, ` +
    `temperatura objetivo ${TEMP_OPTIMA_MIN}-${TEMP_OPTIMA_MAX} °C. ` +
    chillerTexto;

  return {
    litros_minimos,
    litros_recomendados,
    caudal_max,
    temp_objetivo,
    chiller_watts,
    alerta_temp,
    resumen,
  };
}
