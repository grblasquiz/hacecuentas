export interface Inputs {
  ingresos_sueldos_salarios: number;
  ingresos_honorarios: number;
  ingresos_arrendamiento: number;
  ingresos_intereses: number;
  retencion_isr: number;
  deducciones_medicas: number;
  deducciones_educacion: number;
  deducciones_intereses_hipotecarios: number;
  deducciones_donativos: number;
  deducciones_aportaciones_planes: number;
  gastos_arrendamiento: number;
}

export interface Outputs {
  ingreso_total: number;
  ingreso_neto_arrendamiento: number;
  total_deducciones_personales: number;
  base_gravable: number;
  isr_causado: number;
  isr_retenido_total: number;
  diferencia: number;
  tipo_resultado: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes SAT 2026 - Tarifa ISR Personas Físicas
  // Fuente: SAT (https://www.sat.gob.mx/ingresos)
  const TARIFA_2026 = [
    { limite: 732040, cuotaFija: 0, tasaMarginal: 0.0192 },
    { limite: 895060, cuotaFija: 14054.13, tasaMarginal: 0.06 },
    { limite: 1090090, cuotaFija: 24778.41, tasaMarginal: 0.1088 },
    { limite: 1335664, cuotaFija: 45944.50, tasaMarginal: 0.16 },
    { limite: 1627122, cuotaFija: 91846.16, tasaMarginal: 0.1792 },
    { limite: 1960564, cuotaFija: 152266.34, tasaMarginal: 0.1984 },
    { limite: 2348806, cuotaFija: 233867.66, tasaMarginal: 0.2176 },
    { limite: 2791160, cuotaFija: 338528.95, tasaMarginal: 0.2368 },
    { limite: Infinity, cuotaFija: 468819.85, tasaMarginal: 0.35 }
  ];

  // Límites de deducciones personales - Art. 151 LISR 2026
  const LIMITE_DEDUCCION_MEDICOS = 0.15; // 15% de ingresos totales
  const LIMITE_DEDUCCION_EDUCACION = 12900; // Monto máximo anual
  const LIMITE_EDUCACION_PORCENTAJE = 0.25; // 25% de ingresos totales
  const LIMITE_DEDUCCION_HIPOTECARIOS = 120000; // Monto máximo anual
  const LIMITE_HIPOTECARIOS_PORCENTAJE = 0.15; // 15% de ingresos totales
  const LIMITE_DEDUCCION_PLANES = 156276; // Monto máximo anual
  const LIMITE_PLANES_PORCENTAJE = 0.10; // 10% de ingresos totales

  // 1. Calcular ingresos totales
  const ingreso_sueldos = Math.max(0, i.ingresos_sueldos_salarios || 0);
  const ingreso_honorarios = Math.max(0, i.ingresos_honorarios || 0);
  const ingreso_arrendamiento_bruto = Math.max(0, i.ingresos_arrendamiento || 0);
  const gastos_arrendamiento = Math.max(0, i.gastos_arrendamiento || 0);
  const ingreso_neto_arrendamiento = Math.max(0, ingreso_arrendamiento_bruto - gastos_arrendamiento);
  const ingreso_intereses = Math.max(0, i.ingresos_intereses || 0);

  const ingreso_total = ingreso_sueldos + ingreso_honorarios + ingreso_neto_arrendamiento + ingreso_intereses;

  // 2. Validar y limitar deducciones personales según Art. 151 LISR
  // Gastos médicos: hasta 15% de ingresos totales
  const deduccion_medicas_base = Math.max(0, i.deducciones_medicas || 0);
  const deduccion_medicas_limite = ingreso_total * LIMITE_DEDUCCION_MEDICOS;
  const deduccion_medicas = Math.min(deduccion_medicas_base, deduccion_medicas_limite);

  // Educación: hasta $12,900 y máximo 25% de ingresos
  const deduccion_educacion_base = Math.max(0, i.deducciones_educacion || 0);
  const deduccion_educacion_limite1 = LIMITE_DEDUCCION_EDUCACION;
  const deduccion_educacion_limite2 = ingreso_total * LIMITE_EDUCACION_PORCENTAJE;
  const deduccion_educacion = Math.min(deduccion_educacion_base, Math.min(deduccion_educacion_limite1, deduccion_educacion_limite2));

  // Intereses hipotecarios: hasta $120,000 y máximo 15% de ingresos
  const deduccion_hipotecarios_base = Math.max(0, i.deducciones_intereses_hipotecarios || 0);
  const deduccion_hipotecarios_limite1 = LIMITE_DEDUCCION_HIPOTECARIOS;
  const deduccion_hipotecarios_limite2 = ingreso_total * LIMITE_HIPOTECARIOS_PORCENTAJE;
  const deduccion_hipotecarios = Math.min(deduccion_hipotecarios_base, Math.min(deduccion_hipotecarios_limite1, deduccion_hipotecarios_limite2));

  // Donativos: sin límite de porcentaje
  const deduccion_donativos = Math.max(0, i.deducciones_donativos || 0);

  // Planes de retiro/ahorro: hasta $156,276 y máximo 10% de ingresos
  const deduccion_planes_base = Math.max(0, i.deducciones_aportaciones_planes || 0);
  const deduccion_planes_limite1 = LIMITE_DEDUCCION_PLANES;
  const deduccion_planes_limite2 = ingreso_total * LIMITE_PLANES_PORCENTAJE;
  const deduccion_planes = Math.min(deduccion_planes_base, Math.min(deduccion_planes_limite1, deduccion_planes_limite2));

  const total_deducciones_personales = deduccion_medicas + deduccion_educacion + deduccion_hipotecarios + deduccion_donativos + deduccion_planes;

  // 3. Calcular base gravable
  const base_gravable = Math.max(0, ingreso_total - total_deducciones_personales);

  // 4. Aplicar tarifa progresiva ISR 2026 (SAT)
  let isr_causado = 0;
  for (let tramo of TARIFA_2026) {
    if (base_gravable <= tramo.limite) {
      isr_causado = tramo.cuotaFija + (base_gravable - (tramo === TARIFA_2026[0] ? 0 : TARIFA_2026[TARIFA_2026.indexOf(tramo) - 1].limite)) * tramo.tasaMarginal;
      break;
    }
  }

  // 5. Calcular ISR retenido
  const isr_retenido_total = Math.max(0, i.retencion_isr || 0);

  // 6. Calcular diferencia (saldo a favor o a pagar)
  const diferencia = isr_causado - isr_retenido_total;

  // 7. Determinar tipo de resultado
  let tipo_resultado = "Equilibrado";
  if (diferencia > 0) {
    tipo_resultado = `Saldo a pagar: $${diferencia.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  } else if (diferencia < 0) {
    tipo_resultado = `Saldo a favor (devolución): $${Math.abs(diferencia).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  } else {
    tipo_resultado = "Tu ISR está pagado correctamente. Saldo $0.00 MXN";
  }

  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const tasaEfectiva = ingreso_total > 0 ? Math.round((isr_causado / ingreso_total) * 1000) / 10 : 0;

  const _insight = {
    title: diferencia > 0 ? 'Te falta pagar ISR' : diferencia < 0 ? 'Tenés saldo a favor' : 'ISR al día',
    text: diferencia > 0
      ? `Tu ISR causado anual es **${fmtMXN(isr_causado)}** y solo retuviste **${fmtMXN(isr_retenido_total)}**: te queda un saldo a pagar de **${fmtMXN(diferencia)}** en la anual. Tasa efectiva: **${tasaEfectiva}%**.`
      : diferencia < 0
      ? `Retuviste **${fmtMXN(isr_retenido_total)}** contra un ISR causado de **${fmtMXN(isr_causado)}**: tenés **${fmtMXN(Math.abs(diferencia))}** a favor para solicitar en devolución. Tasa efectiva: **${tasaEfectiva}%**.`
      : `Tus retenciones igualaron el ISR causado de **${fmtMXN(isr_causado)}**: no pagás ni te devuelven. Tasa efectiva: **${tasaEfectiva}%**.`,
    tone: diferencia > 0 ? 'warn' : diferencia < 0 ? 'good' : 'neutral',
    icon: diferencia > 0 ? '🇲🇽' : diferencia < 0 ? '💸' : '⚖️',
  };

  const out: Outputs = {
    ingreso_total: Math.round(ingreso_total * 100) / 100,
    ingreso_neto_arrendamiento: Math.round(ingreso_neto_arrendamiento * 100) / 100,
    total_deducciones_personales: Math.round(total_deducciones_personales * 100) / 100,
    base_gravable: Math.round(base_gravable * 100) / 100,
    isr_causado: Math.round(isr_causado * 100) / 100,
    isr_retenido_total: Math.round(isr_retenido_total * 100) / 100,
    diferencia: Math.round(diferencia * 100) / 100,
    tipo_resultado: tipo_resultado,
    _insight,
  };

  // Donut: cómo se reparte el ingreso total entre base gravable y deducciones (suman el ingreso total)
  if (ingreso_total > 0 && total_deducciones_personales > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Base gravable', value: Math.round(base_gravable) },
        { label: 'Deducciones personales', value: Math.round(total_deducciones_personales) },
      ],
      prefix: '$',
      centerValue: fmtMXN(Math.round(ingreso_total)),
      centerLabel: 'Ingreso total',
      ariaLabel: 'Reparto del ingreso anual entre base gravable y deducciones personales',
    };
  }

  return out;
}
