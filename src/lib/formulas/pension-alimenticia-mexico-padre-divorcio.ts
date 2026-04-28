export interface Inputs {
  ingresos_mensuales_brutos: number;
  numero_hijos: string;
  tipo_custodia: string;
  gastos_educacion_anual?: number;
  gastos_salud_anual?: number;
  porcentaje_personalizado?: number;
}

export interface Outputs {
  pension_basica_mensual: number;
  aportacion_educacion_mensual: number;
  aportacion_salud_mensual: number;
  pension_total_estimada: number;
  porcentaje_aplicado: number;
  nota_capacidad_pago: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes CCDF 2026 - Tabla porcentajes pensión por número hijos
  // Fuente: Código Civil CDMX Arts. 308-323, jurisprudencia SAT
  const TABLA_PORCENTAJES: Record<string, number> = {
    "1": 0.20,   // 1 hijo: 20% ingreso bruto
    "2": 0.30,   // 2 hijos: 30%
    "3": 0.40,   // 3 hijos: 40%
    "4": 0.50,   // 4+ hijos: 50%
    "5": 0.50    // 5+ hijos: 50% (máximo CCDF)
  };

  // Salario mínimo nacional 2026 aprox $248 MXN/día = $7,440 MXN/mes
  const SALARIO_MINIMO_MENSUAL = 7440;
  // Margen subsistencia deudor: salario mínimo + 30% gastos propios
  const MINIMO_SUBSISTENCIA = SALARIO_MINIMO_MENSUAL * 1.3;
  // Máximo porcentaje pensión (CCDF límite): 50%
  const PORCENTAJE_MAXIMO = 0.50;

  // Validaciones y valores por defecto
  const ingresos = Math.max(0, i.ingresos_mensuales_brutos || 0);
  const numHijos = i.numero_hijos || "1";
  const custodia = i.tipo_custodia || "exclusiva";
  const gastoEdAnual = Math.max(0, i.gastos_educacion_anual || 0);
  const gastoSalAnual = Math.max(0, i.gastos_salud_anual || 0);

  // Determinar porcentaje a aplicar
  let porcentajeAplicado = i.porcentaje_personalizado
    ? i.porcentaje_personalizado / 100
    : (TABLA_PORCENTAJES[numHijos] || 0.20);

  // En custodia compartida, reducir porcentaje (ambos aportan)
  if (custodia === "compartida") {
    porcentajeAplicado = porcentajeAplicado * 0.6; // Ejemplo: ambos al ~60% propio
  } else if (custodia === "visitas") {
    porcentajeAplicado = porcentajeAplicado * 0.4; // Padre con visitas ≈40% obligación
  }

  // Cálculo pensión básica (manutención)
  const pensionBasica = ingresos * porcentajeAplicado;

  // Aportaciones educación y salud (mensualizadas)
  const aportacionEducacion = gastoEdAnual / 12;
  const aportacionSalud = gastoSalAnual / 12;

  // Pensión total estimada
  let pensionTotal = pensionBasica + aportacionEducacion + aportacionSalud;

  // Aplicar límite máximo 50% ingresos (CCDF)
  const pensionMaxima = ingresos * PORCENTAJE_MAXIMO;
  if (pensionTotal > pensionMaxima) {
    pensionTotal = pensionMaxima;
  }

  // Generar nota sobre capacidad de pago
  const ingresoNeto = ingresos - pensionTotal;
  let notaCapacidad = "✓ Capacidad de pago verificada.";

  if (pensionTotal > pensionMaxima) {
    notaCapacidad = `⚠️ Pensión ajustada al máximo 50% ($${pensionMaxima.toFixed(2)} MXN). Revisa con abogado.`;
  }

  if (ingresoNeto < MINIMO_SUBSISTENCIA) {
    notaCapacidad = `⚠️ ALERTA: Pensión ($${pensionTotal.toFixed(2)} MXN) reduce ingresos neto por debajo subsistencia. Solicita revisión judicial.`;
  }

  if (ingresos <= 0) {
    notaCapacidad = "❌ Ingreso no válido. Ingresa monto > 0.";
  }

  return {
    pension_basica_mensual: parseFloat(pensionBasica.toFixed(2)),
    aportacion_educacion_mensual: parseFloat(aportacionEducacion.toFixed(2)),
    aportacion_salud_mensual: parseFloat(aportacionSalud.toFixed(2)),
    pension_total_estimada: parseFloat(pensionTotal.toFixed(2)),
    porcentaje_aplicado: parseFloat((porcentajeAplicado * 100).toFixed(2)),
    nota_capacidad_pago: notaCapacidad
  };
}
