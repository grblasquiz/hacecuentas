export interface Inputs {
  categoria: string;
  zona: string;
  dias_trabajados: number;
  antiguedad_anios: number;
  presentismo: string;
  horas_extra_50: number;
  horas_extra_100: number;
}

export interface Outputs {
  salario_basico: number;
  adicional_presentismo: number;
  horas_extra_total: number;
  fondo_cese: number;
  total_bruto: number;
  descuentos_trabajador: number;
  sueldo_neto: number;
  costo_empleador: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

// Básicos HORARIOS por categoría y zona — CCT 76/75, escala JULIO 2026.
// Acuerdo UOCRA-CAMARCO (mayo 2026): cuotas junio +2,1%, julio +2%, agosto +1,9%.
// Zona A: CABA, GBA y la mayoría de las provincias. Zona B: La Pampa, Neuquén,
// Río Negro, Chubut. Zona C: Santa Cruz. Zona C Austral: Tierra del Fuego.
// Verificar la escala vigente en uocra.org / camarco.org.ar tras cada acuerdo.
const JORNAL_HORA_JULIO_2026: Record<string, Record<string, number>> = {
  ayudante: { a: 4948, b: 5517, c: 9170, c_austral: 9895 },
  medio_oficial: { a: 5375, b: 5958, c: 9444, c_austral: 10750 },
  oficial: { a: 5817, b: 6460, c: 9787, c_austral: 11633 },
  oficial_especializado: { a: 6800, b: 7548, c: 10439, c_austral: 13599 },
};
// El sereno cobra sueldo MENSUAL (no jornal horario) — escala julio 2026.
const SERENO_MENSUAL_JULIO_2026: Record<string, number> = {
  a: 898817, b: 1001322, c: 1502627, c_austral: 1797634,
};

const HORAS_JORNADA = 8;        // jornada diurna típica
const DIAS_MES_BASE = 22;       // jornadas de referencia por mes

// Presentismo: "premio por asistencia perfecta" = 20% del básico devengado (art. 52 CCT 76/75, base quincenal)
const PORC_PRESENTISMO = 0.20;

// Fondo de cese laboral (Ley 22.250 art. 15): 12% durante el 1er año, 8% a partir del 2do
const PORC_FONDO_CESE_PRIMER_ANIO = 0.12;
const PORC_FONDO_CESE_RESTO = 0.08;

// Aportes del trabajador: jubilación 11% + obra social 3% + INSSJP (PAMI) 3% = 17%
const PORC_APORTES_TRABAJADOR = 0.17;

// Contribuciones patronales aproximadas: ~23% (jubilación 12% + OS 5% + otros fondos, sin ART)
const PORC_CONTRIBUCIONES_PATRON = 0.23;

export function compute(i: Inputs): Outputs {
  const categoria = String(i.categoria || "oficial");
  const zona = String(i.zona || "a");
  const diasTrabajados = Math.min(Math.max(Number(i.dias_trabajados) || 0, 0), 31);
  const antiguedadAnios = Math.max(Number(i.antiguedad_anios) || 0, 0);
  const cobranPresentismo = (i.presentismo === "si");
  const horasExtra50 = Math.max(Number(i.horas_extra_50) || 0, 0);
  const horasExtra100 = Math.max(Number(i.horas_extra_100) || 0, 0);

  const esSereno = categoria === "sereno";
  const jornalHora = esSereno
    ? (SERENO_MENSUAL_JULIO_2026[zona] ?? SERENO_MENSUAL_JULIO_2026.a) / (DIAS_MES_BASE * HORAS_JORNADA)
    : (JORNAL_HORA_JULIO_2026[categoria]?.[zona] ?? JORNAL_HORA_JULIO_2026.oficial.a);

  // Básico devengado del mes: jornal horario × 8 hs × días trabajados
  // (el sereno cobra mensual: se prorratea por días sobre 22 jornadas)
  const basicoDevengado = esSereno
    ? (SERENO_MENSUAL_JULIO_2026[zona] ?? SERENO_MENSUAL_JULIO_2026.a) * (diasTrabajados / DIAS_MES_BASE)
    : jornalHora * HORAS_JORNADA * diasTrabajados;

  // Presentismo 20% del básico devengado (asistencia perfecta, art. 52 CCT 76/75)
  const adicionalPresentismo = cobranPresentismo ? basicoDevengado * PORC_PRESENTISMO : 0;

  // Horas extra sobre el jornal horario real de la categoría/zona
  const importeHorasExtra50 = horasExtra50 * jornalHora * 1.5;
  const importeHorasExtra100 = horasExtra100 * jornalHora * 2.0;
  const horasExtraTotal = importeHorasExtra50 + importeHorasExtra100;

  // Total bruto remunerativo
  const totalBruto = basicoDevengado + adicionalPresentismo + horasExtraTotal;

  // Fondo de cese laboral (Ley 22.250): 12% el primer año, 8% después. Lo deposita
  // el empleador en la cuenta del trabajador — NO se descuenta del neto.
  const porcFondoCese = antiguedadAnios < 1 ? PORC_FONDO_CESE_PRIMER_ANIO : PORC_FONDO_CESE_RESTO;
  const fondoCese = totalBruto * porcFondoCese;

  // Aportes del trabajador (se descuentan del bruto)
  const descuentosTrabajador = totalBruto * PORC_APORTES_TRABAJADOR;
  const sueldoNeto = totalBruto - descuentosTrabajador;

  // Costo empleador = bruto + contribuciones patronales + fondo de cese
  const contribucionesPatron = totalBruto * PORC_CONTRIBUCIONES_PATRON;
  const costoEmpleador = totalBruto + contribucionesPatron + fondoCese;

  const categoriasLabels: Record<string, string> = {
    ayudante: "Ayudante",
    medio_oficial: "Medio Oficial",
    oficial: "Oficial",
    oficial_especializado: "Oficial Especializado",
    sereno: "Sereno (mensualizado)",
  };
  const zonasLabels: Record<string, string> = {
    a: "Zona A (CABA/GBA y mayoría de provincias)",
    b: "Zona B (La Pampa, Neuquén, Río Negro, Chubut)",
    c: "Zona C (Santa Cruz)",
    c_austral: "Zona C Austral (Tierra del Fuego)",
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const detalle =
    `Categoría: ${categoriasLabels[categoria] ?? categoria} | ` +
    (esSereno
      ? `Sueldo mensual de convenio: $${fmt(SERENO_MENSUAL_JULIO_2026[zona] ?? SERENO_MENSUAL_JULIO_2026.a)} | `
      : `Jornal horario julio 2026: $${fmt(jornalHora)}/h | `) +
    `Días trabajados: ${diasTrabajados}/${DIAS_MES_BASE} (jornada ${HORAS_JORNADA} hs) | ` +
    `${zonasLabels[zona] ?? zona} | ` +
    `Presentismo (asistencia perfecta 20%): ${cobranPresentismo ? "Sí" : "No"} | ` +
    `HS extra 50%: ${horasExtra50} hs | HS extra 100%: ${horasExtra100} hs. ` +
    `Aportes trabajador: 17% sobre bruto. Fondo de cese (Ley 22.250): ${(porcFondoCese * 100).toFixed(0)}% ` +
    `(${antiguedadAnios < 1 ? "primer año" : "a partir del 2º año"}, a cargo del empleador). ` +
    `El CCT 76/75 no prevé adicional por antigüedad. Valores escala julio 2026 — verificar última circular UOCRA-CAMARCO.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Básico devengado', value: Math.round(basicoDevengado) },
      { label: 'Presentismo (20%)', value: Math.round(adicionalPresentismo) },
      { label: 'Horas extra', value: Math.round(horasExtraTotal) },
    ].filter(s => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(totalBruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del bruto remunerativo: básico devengado, presentismo y horas extra.',
  };

  const insight = {
    title: 'Bruto, neto y costo real',
    text: `De un bruto remunerativo de **$${fmt(totalBruto)}**, te llevás **$${fmt(sueldoNeto)}** de neto tras los aportes ($${fmt(descuentosTrabajador)}, 17%). El fondo de cese ($${fmt(fondoCese)}, ${(porcFondoCese * 100).toFixed(0)}%) lo deposita el empleador a tu favor: emplearte le cuesta $${fmt(costoEmpleador)}.`,
    tone: 'warn',
    icon: '👷',
  };

  return {
    salario_basico: Math.round(basicoDevengado),
    adicional_presentismo: Math.round(adicionalPresentismo),
    horas_extra_total: Math.round(horasExtraTotal),
    fondo_cese: Math.round(fondoCese),
    total_bruto: Math.round(totalBruto),
    descuentos_trabajador: Math.round(descuentosTrabajador),
    sueldo_neto: Math.round(sueldoNeto),
    costo_empleador: Math.round(costoEmpleador),
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
