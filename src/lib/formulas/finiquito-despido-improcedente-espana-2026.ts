// Calculadora de Finiquito y Despido Improcedente España 2026
// Fuentes: ET arts. 53, 56; Ley 35/2006 IRPF art. 7.e); RDL 3/2012; BOE

export interface Inputs {
  salario_bruto_mensual: number;      // € brutos/mes (con pagas prorrateadas o sin ellas)
  fecha_alta: string;                 // ISO: 'YYYY-MM-DD'
  fecha_baja: string;                 // ISO: 'YYYY-MM-DD'
  tipo_despido: 'improcedente' | 'objetivo' | 'disciplinario_procedente';
  vacaciones_disfrutadas: number;     // días naturales ya disfrutados este año
  dias_pendientes_mes: number;        // días trabajados del mes en curso sin cobrar
  pagas_extras: '2' | '0';           // número de pagas extras al año
  tipo_contrato: 'indefinido' | 'temporal';
}

export interface Outputs {
  anios_anteriores_2012: number;
  anios_posteriores_2012: number;
  indemnizacion_tramo_anterior: number;
  indemnizacion_tramo_posterior: number;
  indemnizacion_total: number;
  dias_vacaciones_pendientes: number;
  importe_vacaciones: number;
  paga_extra_prorrateada: number;
  dias_pendientes_importe: number;
  finiquito_bruto: number;
  total_bruto: number;
  indemnizacion_exenta_irpf: number;
  base_irpf: number;
  retencion_irpf_estimada: number;
  total_neto_estimado: number;
  aviso: string;
}

// ─── Constantes 2026 ──────────────────────────────────────────────────────────

// Fecha de corte reforma laboral (RDL 3/2012, BOE 11/02/2012)
const FECHA_CORTE_2012 = new Date('2012-02-12');

// Días de indemnización por año (ET arts. 53 y 56)
const DIAS_IMPROCEDENTE_POST_2012 = 33;   // desde 12/02/2012
const DIAS_IMPROCEDENTE_PRE_2012  = 45;   // antes de 12/02/2012
const DIAS_OBJETIVO               = 20;   // despido objetivo/colectivo

// Topes en mensualidades (ET)
const TOPE_IMPROCEDENTE_MENSUALIDADES = 24;  // tope global despido improcedente
const TOPE_PRE_2012_MENSUALIDADES     = 42;  // tope tramo anterior a 2012
const TOPE_OBJETIVO_MENSUALIDADES     = 12;  // tope despido objetivo

// Días de vacaciones mínimas legales por año (ET art. 38)
const VACACIONES_DIAS_ANIO = 30; // días naturales

// Límite exención IRPF indemnización despido (art. 7.e LIRPF + RDL 9/2015)
const LIMITE_EXENCION_IRPF = 180000;

// Escala simplificada de retención IRPF 2026 (renta del trabajo, sin deducciones personales)
// Fuente: AEAT - tabla de retenciones sobre rendimientos del trabajo
const TRAMOS_IRPF_2026: Array<{ hasta: number; tipo: number }> = [
  { hasta: 12450,  tipo: 0.19 },
  { hasta: 20200,  tipo: 0.24 },
  { hasta: 35200,  tipo: 0.30 },
  { hasta: 60000,  tipo: 0.37 },
  { hasta: 300000, tipo: 0.45 },
  { hasta: Infinity, tipo: 0.47 },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Parsea fecha ISO 'YYYY-MM-DD' de forma segura (evita offset de zona horaria) */
function parseFecha(iso: string): Date | null {
  if (!iso || typeof iso !== 'string') return null;
  const partes = iso.split('-');
  if (partes.length !== 3) return null;
  const y = parseInt(partes[0], 10);
  const m = parseInt(partes[1], 10) - 1;
  const d = parseInt(partes[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const fecha = new Date(y, m, d);
  if (isNaN(fecha.getTime())) return null;
  return fecha;
}

/** Diferencia en días entre dos fechas */
function diffDias(inicio: Date, fin: Date): number {
  const ms = fin.getTime() - inicio.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Diferencia en meses (fraccional) entre dos fechas */
function diffMeses(inicio: Date, fin: Date): number {
  const anios = fin.getFullYear() - inicio.getFullYear();
  const meses = fin.getMonth() - inicio.getMonth();
  const dias  = fin.getDate() - inicio.getDate();
  return anios * 12 + meses + dias / 30.44;
}

/**
 * Calcula la retención marginal estimada de IRPF sobre la base imponible.
 * Aplica la escala por tramos (tipo marginal del último tramo alcanzado).
 * Nota: es una estimación; la retención real la calcula la empresa según el
 * procedimiento del art. 80 Reglamento IRPF considerando situación familiar.
 */
function calcularRetencionIRPF(base: number): number {
  if (base <= 0) return 0;
  let impuesto = 0;
  let baseRestante = base;
  let tramoAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2026) {
    const tramoBase = Math.min(baseRestante, tramo.hasta - tramoAnterior);
    if (tramoBase <= 0) break;
    impuesto += tramoBase * tramo.tipo;
    baseRestante -= tramoBase;
    tramoAnterior = tramo.hasta;
    if (baseRestante <= 0) break;
  }
  return Math.round(impuesto * 100) / 100;
}

// ─── Función principal ────────────────────────────────────────────────────────

export function compute(i: Inputs): Outputs {
  const avisos: string[] = [];

  // ── Validación de entradas ──────────────────────────────────────────────────
  const salarioBrutoMensual = Math.max(0, i.salario_bruto_mensual || 0);
  const vacacionesDisfrutadas = Math.max(0, i.vacaciones_disfrutadas || 0);
  const diasPendientesMes = Math.max(0, i.dias_pendientes_mes || 0);
  const pagasExtras = parseInt(i.pagas_extras || '2', 10);

  const fechaAlta = parseFecha(i.fecha_alta);
  const fechaBaja = parseFecha(i.fecha_baja);

  if (!fechaAlta || !fechaBaja) {
    avisos.push('Introduce fechas válidas en formato AAAA-MM-DD.');
    return {
      anios_anteriores_2012: 0, anios_posteriores_2012: 0,
      indemnizacion_tramo_anterior: 0, indemnizacion_tramo_posterior: 0,
      indemnizacion_total: 0, dias_vacaciones_pendientes: 0,
      importe_vacaciones: 0, paga_extra_prorrateada: 0,
      dias_pendientes_importe: 0, finiquito_bruto: 0, total_bruto: 0,
      indemnizacion_exenta_irpf: 0, base_irpf: 0,
      retencion_irpf_estimada: 0, total_neto_estimado: 0,
      aviso: 'Introduce fechas válidas en formato AAAA-MM-DD.',
    };
  }

  if (fechaBaja < fechaAlta) {
    avisos.push('La fecha de baja no puede ser anterior a la fecha de alta.');
  }

  if (salarioBrutoMensual <= 0) {
    avisos.push('El salario bruto mensual debe ser mayor que 0.');
  }

  // ── Salario anual y diario ──────────────────────────────────────────────────
  // El salario bruto mensual introducido ya debe incluir la parte proporcional
  // de pagas extras si pagas_extras = '0'.
  // Si hay 2 pagas extras separadas, el salario anual = mensual × 14.
  // Para el cómputo de indemnización se usa salario diario = anual / 365.
  const salarioBrutoAnual = pagasExtras === 2
    ? salarioBrutoMensual * 14
    : salarioBrutoMensual * 12;

  // Mensualidad a efectos de topes (incluyendo pagas prorrateadas)
  // = salario anual / 12
  const mensualidadAEfectosTopes = salarioBrutoAnual / 12;

  // Salario diario (ET y jurisprudencia: base = salario anual / 365)
  const salarioDiario = salarioBrutoAnual / 365;

  // ── Cómputo de antigüedad ───────────────────────────────────────────────────
  // Días trabajados antes y después del corte 12/02/2012
  let diasAnteriores2012 = 0;
  let diasPosteriores2012 = 0;

  if (fechaAlta < FECHA_CORTE_2012) {
    // Hay tramo anterior
    const finTramoAnterior = fechaBaja < FECHA_CORTE_2012 ? fechaBaja : FECHA_CORTE_2012;
    diasAnteriores2012 = Math.max(0, diffDias(fechaAlta, finTramoAnterior));
    if (fechaBaja > FECHA_CORTE_2012) {
      diasPosteriores2012 = Math.max(0, diffDias(FECHA_CORTE_2012, fechaBaja));
    }
  } else {
    // Todo el período es posterior a 2012
    diasPosteriores2012 = Math.max(0, diffDias(fechaAlta, fechaBaja));
  }

  const aniosAnteriores2012  = Math.round((diasAnteriores2012 / 365) * 100) / 100;
  const aniosPosteriores2012 = Math.round((diasPosteriores2012 / 365) * 100) / 100;

  // ── Indemnización según tipo de despido ────────────────────────────────────
  let indemnizacionTramoAnterior  = 0;
  let indemnizacionTramoPost      = 0;
  let indemnizacionTotal          = 0;
  let indemnizacionExentaIRPF     = 0;

  if (i.tipo_despido === 'disciplinario_procedente') {
    // Despido procedente: sin indemnización (ET art. 55.7)
    indemnizacionTotal      = 0;
    indemnizacionExentaIRPF = 0;
    avisos.push('El despido disciplinario declarado procedente no genera derecho a indemnización (art. 55.7 ET).');

  } else if (i.tipo_despido === 'objetivo') {
    // Despido objetivo/colectivo: 20 días/año, tope 12 mensualidades (ET art. 53)
    const topeObjetivo = TOPE_OBJETIVO_MENSUALIDADES * mensualidadAEfectosTopes;
    const diasTotales = diasAnteriores2012 + diasPosteriores2012;
    const aniosTotales = diasTotales / 365;
    indemnizacionTotal = Math.min(
      aniosTotales * DIAS_OBJETIVO * salarioDiario,
      topeObjetivo
    );
    indemnizacionTotal = Math.round(indemnizacionTotal * 100) / 100;
    // Para despido objetivo, la indemnización legal mínima también está exenta (art. 7.e LIRPF)
    indemnizacionExentaIRPF = Math.min(indemnizacionTotal, LIMITE_EXENCION_IRPF);

  } else {
    // Despido improcedente: doble tramo (RDL 3/2012)
    // Tramo anterior a 2012: 45 días/año, tope 42 mensualidades
    const topeAnterior = TOPE_PRE_2012_MENSUALIDADES * mensualidadAEfectosTopes;
    indemnizacionTramoAnterior = Math.min(
      (diasAnteriores2012 / 365) * DIAS_IMPROCEDENTE_PRE_2012 * salarioDiario,
      topeAnterior
    );
    indemnizacionTramoAnterior = Math.round(indemnizacionTramoAnterior * 100) / 100;

    // Tramo posterior a 2012: 33 días/año
    indemnizacionTramoPost = (diasPosteriores2012 / 365) * DIAS_IMPROCEDENTE_POST_2012 * salarioDiario;
    indemnizacionTramoPost = Math.round(indemnizacionTramoPost * 100) / 100;

    // Tope global: 24 mensualidades para despido improcedente
    const topeGlobal = TOPE_IMPROCEDENTE_MENSUALIDADES * mensualidadAEfectosTopes;
    indemnizacionTotal = Math.min(
      indemnizacionTramoAnterior + indemnizacionTramoPost,
      topeGlobal
    );
    indemnizacionTotal = Math.round(indemnizacionTotal * 100) / 100;

    // Si se aplicó el tope global, ajustar el tramo posterior proporcionalmente
    if (indemnizacionTramoAnterior + indemnizacionTramoPost > topeGlobal) {
      avisos.push(`Se ha aplicado el tope de ${TOPE_IMPROCEDENTE_MENSUALIDADES} mensualidades (${topeGlobal.toFixed(2)} €).`);
    }

    // Exención IRPF: la indemnización legal mínima del ET está exenta hasta 180.000 €
    indemnizacionExentaIRPF = Math.min(indemnizacionTotal, LIMITE_EXENCION_IRPF);
  }

  // ── Finiquito ────────────────────────────────────────────────────────────────

  // 1. Vacaciones pendientes
  // Meses trabajados en el año en curso (desde 1 enero hasta fecha de baja)
  const inicioAnio = new Date(fechaBaja.getFullYear(), 0, 1); // 1 enero del año de baja
  const mesesTrabajadosAnio = diffMeses(inicioAnio, fechaBaja);
  const diasVacacionesDevengados = (VACACIONES_DIAS_ANIO * Math.min(mesesTrabajadosAnio, 12)) / 12;
  const diasVacacionesPendientes = Math.max(0, diasVacacionesDevengados - vacacionesDisfrutadas);
  const importeVacaciones = Math.round(diasVacacionesPendientes * salarioDiario * 100) / 100;

  // 2. Paga extra prorrateada (solo si hay 2 pagas extras separadas)
  // Convenio habitual: paga de verano (devenga ene-jun, paga julio) y
  // paga de navidad (devenga jul-dic, paga diciembre).
  // Calculamos los meses desde el último devengo (inicio del semestre en curso).
  let pagaExtraProrrateada = 0;
  if (pagasExtras === 2) {
    const mesBaja = fechaBaja.getMonth(); // 0=enero ... 11=diciembre
    // Paga de verano: devenga enero(0) a junio(5) → inicio devengo = 1 enero
    // Paga de navidad: devenga julio(6) a diciembre(11) → inicio devengo = 1 julio
    let inicioPagaExtra: Date;
    if (mesBaja <= 5) {
      // Primer semestre: paga de verano
      inicioPagaExtra = new Date(fechaBaja.getFullYear(), 0, 1); // 1 enero
    } else {
      // Segundo semestre: paga de navidad
      inicioPagaExtra = new Date(fechaBaja.getFullYear(), 6, 1); // 1 julio
    }
    const mesesDesdeInicioPaga = diffMeses(inicioPagaExtra, fechaBaja);
    // Cada paga extra equivale a 1 mensualidad; devenga en 6 meses
    pagaExtraProrrateada = Math.min(
      (salarioBrutoMensual * Math.min(mesesDesdeInicioPaga, 6)) / 6,
      salarioBrutoMensual
    );
    pagaExtraProrrateada = Math.max(0, Math.round(pagaExtraProrrateada * 100) / 100);
  }

  // 3. Días pendientes del mes en curso
  const diasPendientesImporte = Math.round(diasPendientesMes * salarioDiario * 100) / 100;

  // 4. Finiquito bruto total
  const finiquitoBruto = Math.round(
    (importeVacaciones + pagaExtraProrrateada + diasPendientesImporte) * 100
  ) / 100;

  // ── Total bruto ──────────────────────────────────────────────────────────────
  const totalBruto = Math.round((indemnizacionTotal + finiquitoBruto) * 100) / 100;

  // ── IRPF ────────────────────────────────────────────────────────────────────
  // Base sujeta a retención = finiquito (siempre tributa) + exceso de indemnización sobre límite legal
  const indemnizacionNoExenta = Math.max(0, indemnizacionTotal - indemnizacionExentaIRPF);
  const baseIRPF = Math.round((finiquitoBruto + indemnizacionNoExenta) * 100) / 100;
  const retencionIRPF = calcularRetencionIRPF(baseIRPF);

  // ── Total neto estimado ──────────────────────────────────────────────────────
  const totalNetoEstimado = Math.round((totalBruto - retencionIRPF) * 100) / 100;

  // ── Avisos adicionales ───────────────────────────────────────────────────────
  if (i.tipo_contrato === 'temporal') {
    avisos.push(
      'Para contratos temporales finalizados antes del término pactado, la indemnización puede ser distinta (art. 49.1.c ET: 12 días/año). Consulta con un asesor laboral.'
    );
  }

  if (totalBruto > 50000) {
    avisos.push(
      'Importes elevados: te recomendamos contrastar el cálculo con un abogado laboralista o el SMAC antes de firmar el finiquito.'
    );
  }

  avisos.push(
    'Cálculo orientativo. La retención real de IRPF la determina la empresa según tu situación personal y familiar (Reglamento IRPF art. 80).'
  );

  return {
    anios_anteriores_2012:          Math.round(aniosAnteriores2012  * 100) / 100,
    anios_posteriores_2012:         Math.round(aniosPosteriores2012 * 100) / 100,
    indemnizacion_tramo_anterior:   indemnizacionTramoAnterior,
    indemnizacion_tramo_posterior:  indemnizacionTramoPost,
    indemnizacion_total:            indemnizacionTotal,
    dias_vacaciones_pendientes:     Math.round(diasVacacionesPendientes * 100) / 100,
    importe_vacaciones:             importeVacaciones,
    paga_extra_prorrateada:         pagaExtraProrrateada,
    dias_pendientes_importe:        diasPendientesImporte,
    finiquito_bruto:                finiquitoBruto,
    total_bruto:                    totalBruto,
    indemnizacion_exenta_irpf:      Math.round(indemnizacionExentaIRPF * 100) / 100,
    base_irpf:                      baseIRPF,
    retencion_irpf_estimada:        retencionIRPF,
    total_neto_estimado:            totalNetoEstimado,
    aviso:                          avisos.join(' | '),
  };
}
