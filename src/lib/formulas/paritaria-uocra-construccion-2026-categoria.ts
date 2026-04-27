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
  adicional_zona: number;
  adicional_antiguedad: number;
  adicional_presentismo: number;
  horas_extra_total: number;
  fondo_cese: number;
  total_bruto: number;
  descuentos_trabajador: number;
  sueldo_neto: number;
  costo_empleador: number;
  detalle: string;
}

// Básicos mensuales por categoría — paritaria UOCRA 2026 (enero 2026)
// Fuente: acuerdo UOCRA-CAMARCO. Actualizar con cada ronda paritaria.
const BASICOS_2026: Record<string, number> = {
  ayudante: 720000,
  medio_oficial: 810000,
  oficial: 900000,
  oficial_especializado: 990000,
  capataz: 1080000,
  capataz_general: 1170000,
};

// Porcentaje adicional por zona geográfica (CCT 76/75)
const ZONA_PORCENTAJE: Record<string, number> = {
  zona1: 0.00,
  zona2: 0.10,
  zona3: 0.20,
  zona4: 0.30,
};

// Días hábiles de referencia mensuales en construcción
const DIAS_MES_BASE = 25;

// Horas mensuales de referencia para cálculo de hora simple
const HORAS_MES_BASE = 200;

// Antigüedad: 1% por año de actividad en la construcción (CCT 76/75, art. antigüedad)
const PORC_ANTIGUEDAD_POR_ANIO = 0.01;
const MAX_ANTIGUEDAD_PORC = 1.00; // tope 100%

// Presentismo: 5% del básico proporcional (CCT 76/75)
const PORC_PRESENTISMO = 0.05;

// Fondo de cese laboral: 12% del salario remunerativo (CCT 76/75 / Ley 22.250)
const PORC_FONDO_CESE = 0.12;

// Aportes del trabajador: jubilación 11% + obra social 3% + INSSJP 3% = 17%
const PORC_APORTES_TRABAJADOR = 0.17;

// Contribuciones patronales aproximadas: ~23% (jubilación 12% + OS 5% + otros fondos)
const PORC_CONTRIBUCIONES_PATRON = 0.23;

export function compute(i: Inputs): Outputs {
  const categoria = i.categoria || "oficial";
  const zona = i.zona || "zona1";
  const diasTrabajados = Math.min(Math.max(Number(i.dias_trabajados) || 0, 0), 31);
  const antiguedadAnios = Math.max(Number(i.antiguedad_anios) || 0, 0);
  const cobranPresentismo = (i.presentismo === "si");
  const horasExtra50 = Math.max(Number(i.horas_extra_50) || 0, 0);
  const horasExtra100 = Math.max(Number(i.horas_extra_100) || 0, 0);

  // Obtener básico mensual según categoría
  const basicoMensual = BASICOS_2026[categoria] ?? BASICOS_2026["oficial"];

  // Proporcionar por días trabajados
  const basicoProporcional = basicoMensual * (diasTrabajados / DIAS_MES_BASE);

  // Adicional zona sobre el básico proporcional
  const porcZona = ZONA_PORCENTAJE[zona] ?? 0;
  const adicionalZona = basicoProporcional * porcZona;

  // Adicional antigüedad (1% por año, tope 100%) sobre básico proporcional
  const porcAntiguedad = Math.min(antiguedadAnios * PORC_ANTIGUEDAD_POR_ANIO, MAX_ANTIGUEDAD_PORC);
  const adicionalAntiguedad = basicoProporcional * porcAntiguedad;

  // Presentismo sobre básico proporcional
  const adicionalPresentismo = cobranPresentismo ? basicoProporcional * PORC_PRESENTISMO : 0;

  // Horas extra
  // Hora simple = básico mensual / 200
  const horaSimple = basicoMensual / HORAS_MES_BASE;
  const importeHorasExtra50 = horasExtra50 * horaSimple * 1.5;
  const importeHorasExtra100 = horasExtra100 * horaSimple * 2.0;
  const horasExtraTotal = importeHorasExtra50 + importeHorasExtra100;

  // Base remunerativa para fondo de cese (básico proporcional + zona + antigüedad + presentismo)
  const baseRemunerativa = basicoProporcional + adicionalZona + adicionalAntiguedad + adicionalPresentismo + horasExtraTotal;

  // Fondo de cese: 12% — lo paga el empleador, no descuenta del neto del trabajador
  const fondoCese = baseRemunerativa * PORC_FONDO_CESE;

  // Total bruto (lo que se usa para calcular aportes del trabajador)
  const totalBruto = baseRemunerativa;

  // Aportes del trabajador (se descuentan del bruto)
  const descuentosTrabajador = totalBruto * PORC_APORTES_TRABAJADOR;

  // Sueldo neto
  const sueldoNeto = totalBruto - descuentosTrabajador;

  // Costo empleador = bruto + contribuciones patronales + fondo de cese
  const contribucionesPatron = totalBruto * PORC_CONTRIBUCIONES_PATRON;
  const costoEmpleador = totalBruto + contribucionesPatron + fondoCese;

  // Armar detalle textual
  const categoriasLabels: Record<string, string> = {
    ayudante: "Ayudante",
    medio_oficial: "Medio Oficial",
    oficial: "Oficial",
    oficial_especializado: "Oficial Especializado",
    capataz: "Capataz",
    capataz_general: "Capataz General",
  };
  const zonasLabels: Record<string, string> = {
    zona1: "Zona 1 (sin adicional)",
    zona2: "Zona 2 (+10%)",
    zona3: "Zona 3 (+20%)",
    zona4: "Zona 4 (+30%)",
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const detalle =
    `Categoría: ${categoriasLabels[categoria] ?? categoria} | ` +
    `Básico mensual: $${fmt(basicoMensual)} | ` +
    `Días trabajados: ${diasTrabajados}/25 | ` +
    `${zonasLabels[zona] ?? zona} | ` +
    `Antigüedad: ${antiguedadAnios} año/s (${(porcAntiguedad * 100).toFixed(0)}%) | ` +
    `Presentismo: ${cobranPresentismo ? "Sí" : "No"} | ` +
    `HS extra 50%: ${horasExtra50} hs | HS extra 100%: ${horasExtra100} hs. ` +
    `Aportes trabajador: 17% sobre bruto. Fondo de cese: 12% (a cargo del empleador). ` +
    `Valores orientativos — verificar última circular UOCRA-CAMARCO.`;

  return {
    salario_basico: Math.round(basicoProporcional),
    adicional_zona: Math.round(adicionalZona),
    adicional_antiguedad: Math.round(adicionalAntiguedad),
    adicional_presentismo: Math.round(adicionalPresentismo),
    horas_extra_total: Math.round(horasExtraTotal),
    fondo_cese: Math.round(fondoCese),
    total_bruto: Math.round(totalBruto),
    descuentos_trabajador: Math.round(descuentosTrabajador),
    sueldo_neto: Math.round(sueldoNeto),
    costo_empleador: Math.round(costoEmpleador),
    detalle,
  };
}
