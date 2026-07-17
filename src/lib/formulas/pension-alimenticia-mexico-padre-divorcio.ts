import { MEXICO_2026 } from '../data/mexico-2026';

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
  _insight?: any;
  _chart?: any;
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

  // Salario mínimo nacional 2026: $315.04/día ≈ $9,577.22/mes (CONASAMI/DOF Res. 09-dic-2025, vigente 01-ene-2026)
  const SALARIO_MINIMO_MENSUAL = MEXICO_2026.salarioMinimo.generalMensual;
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
  const pensionTotalSinTope = pensionBasica + aportacionEducacion + aportacionSalud;
  let pensionTotal = pensionTotalSinTope;

  // Aplicar límite máximo 50% ingresos (CCDF)
  const pensionMaxima = ingresos * PORCENTAJE_MAXIMO;
  const fueTopeada = pensionTotal > pensionMaxima;
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

  const fmtMXN = (v: number) =>
    '$' + Math.round(v).toLocaleString('es-MX') + ' MXN';

  // Insight dinámico según capacidad de pago del deudor
  let insight: any = undefined;
  if (ingresos > 0) {
    const pctTotal = ingresos > 0 ? (pensionTotal / ingresos) * 100 : 0;
    let tone: 'good' | 'warn' | 'neutral' = 'neutral';
    let title = 'Pensión estimada';
    let text = '';
    let icon = '⚖️';
    if (ingresoNeto < MINIMO_SUBSISTENCIA) {
      tone = 'warn';
      icon = '⚠️';
      title = 'Pensión por encima de tu margen';
      text = `La pensión de **${fmtMXN(pensionTotal)}** deja un ingreso neto de **${fmtMXN(ingresoNeto)}**, por debajo del mínimo de subsistencia (${fmtMXN(MINIMO_SUBSISTENCIA)}). Conviene pedir revisión judicial del monto.`;
    } else if (fueTopeada) {
      tone = 'warn';
      icon = '🚧';
      title = 'Pensión topada al 50%';
      text = `La suma de manutención más gastos superaba el límite legal, así que se ajustó al tope del **50% (${fmtMXN(pensionMaxima)})** que marca el Código Civil de CDMX.`;
    } else {
      tone = 'good';
      icon = '⚖️';
      title = 'Pensión dentro de lo razonable';
      text = `Pagarías **${fmtMXN(pensionTotal)}** al mes (**${pctTotal.toFixed(0)}%** de tu ingreso bruto) y te quedan **${fmtMXN(ingresoNeto)}** para tus gastos, por encima del mínimo de subsistencia.`;
    }
    insight = { title, text, tone, icon };
  }

  // Donut: composición de la pensión (sólo cuando hay partes reales y no fue topeada)
  let chart: any = undefined;
  if (ingresos > 0 && !fueTopeada && pensionTotal > 0 &&
      (aportacionEducacion > 0 || aportacionSalud > 0)) {
    const slices = [
      { label: 'Manutención básica', value: parseFloat(pensionBasica.toFixed(2)) },
    ];
    if (aportacionEducacion > 0)
      slices.push({ label: 'Educación', value: parseFloat(aportacionEducacion.toFixed(2)) });
    if (aportacionSalud > 0)
      slices.push({ label: 'Salud', value: parseFloat(aportacionSalud.toFixed(2)) });
    chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtMXN(pensionTotal),
      centerLabel: 'Pensión mensual',
      ariaLabel: 'Composición de la pensión alimenticia mensual entre manutención, educación y salud',
    };
  }

  return {
    pension_basica_mensual: parseFloat(pensionBasica.toFixed(2)),
    aportacion_educacion_mensual: parseFloat(aportacionEducacion.toFixed(2)),
    aportacion_salud_mensual: parseFloat(aportacionSalud.toFixed(2)),
    pension_total_estimada: parseFloat(pensionTotal.toFixed(2)),
    porcentaje_aplicado: parseFloat((porcentajeAplicado * 100).toFixed(2)),
    nota_capacidad_pago: notaCapacidad,
    ...(insight ? { _insight: insight } : {}),
    ...(chart ? { _chart: chart } : {})
  };
}
