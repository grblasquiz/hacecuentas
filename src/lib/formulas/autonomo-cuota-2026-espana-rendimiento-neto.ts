export interface Inputs {
  rendimiento_neto_mensual: number;
  tipo_autonomo: 'fisica' | 'societario';
  meses_cotizados: number;
  anios_cotizados: number;
}

export interface Outputs {
  rendimiento_neto_ajustado: number;
  tramo_numero: string;
  base_cotizacion_min: number;
  base_cotizacion_max: number;
  cuota_mensual_min: number;
  cuota_mensual_max: number;
  cuota_anual_min: number;
  porcentaje_sobre_rendimiento: number;
  pension_estimada_mensual: number;
  descripcion_tramo: string;
}

// Fuente: Seguridad Social / BOE - Tramos RETA 2026
// https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10938/32561
interface TramoRETA {
  numero: number;
  descripcion: string;
  rendNeto_min: number;   // rendimiento neto ajustado minimo (inclusive)
  rendNeto_max: number;   // rendimiento neto ajustado maximo (exclusive, Infinity para ultimo)
  base_min: number;       // base de cotizacion minima (EUR/mes)
  base_max: number;       // base de cotizacion maxima (EUR/mes)
  cuota_min: number;      // cuota minima mensual (EUR/mes) segun tablas SS 2026
}

const TRAMOS_RETA_2026: TramoRETA[] = [
  // Tramo 1
  { numero: 1,  descripcion: '≤ 670 €/mes',            rendNeto_min: 0,       rendNeto_max: 670,      base_min: 653.59,   base_max: 718.95,   cuota_min: 200.00 },
  // Tramo 2
  { numero: 2,  descripcion: '670 – 900 €/mes',         rendNeto_min: 670,     rendNeto_max: 900,      base_min: 718.95,   base_max: 900.00,   cuota_min: 220.00 },
  // Tramo 3
  { numero: 3,  descripcion: '900 – 1.166,70 €/mes',    rendNeto_min: 900,     rendNeto_max: 1166.70,  base_min: 849.67,   base_max: 1166.70,  cuota_min: 260.00 },
  // Tramo 4
  { numero: 4,  descripcion: '1.166,70 – 1.300 €/mes',  rendNeto_min: 1166.70, rendNeto_max: 1300,     base_min: 950.98,   base_max: 1300.00,  cuota_min: 290.00 },
  // Tramo 5
  { numero: 5,  descripcion: '1.300 – 1.500 €/mes',     rendNeto_min: 1300,    rendNeto_max: 1500,     base_min: 960.78,   base_max: 1500.00,  cuota_min: 294.00 },
  // Tramo 6
  { numero: 6,  descripcion: '1.500 – 1.700 €/mes',     rendNeto_min: 1500,    rendNeto_max: 1700,     base_min: 960.78,   base_max: 1700.00,  cuota_min: 294.00 },
  // Tramo 7
  { numero: 7,  descripcion: '1.700 – 1.850 €/mes',     rendNeto_min: 1700,    rendNeto_max: 1850,     base_min: 1013.07,  base_max: 1850.00,  cuota_min: 310.00 },
  // Tramo 8
  { numero: 8,  descripcion: '1.850 – 2.030 €/mes',     rendNeto_min: 1850,    rendNeto_max: 2030,     base_min: 1029.41,  base_max: 2030.00,  cuota_min: 315.00 },
  // Tramo 9
  { numero: 9,  descripcion: '2.030 – 2.330 €/mes',     rendNeto_min: 2030,    rendNeto_max: 2330,     base_min: 1045.75,  base_max: 2330.00,  cuota_min: 320.00 },
  // Tramo 10
  { numero: 10, descripcion: '2.330 – 2.760 €/mes',     rendNeto_min: 2330,    rendNeto_max: 2760,     base_min: 1078.43,  base_max: 2760.00,  cuota_min: 330.00 },
  // Tramo 11
  { numero: 11, descripcion: '2.760 – 3.190 €/mes',     rendNeto_min: 2760,    rendNeto_max: 3190,     base_min: 1143.79,  base_max: 3190.00,  cuota_min: 350.00 },
  // Tramo 12
  { numero: 12, descripcion: '3.190 – 3.620 €/mes',     rendNeto_min: 3190,    rendNeto_max: 3620,     base_min: 1209.15,  base_max: 3620.00,  cuota_min: 370.00 },
  // Tramo 13
  { numero: 13, descripcion: '3.620 – 4.050 €/mes',     rendNeto_min: 3620,    rendNeto_max: 4050,     base_min: 1274.51,  base_max: 4050.00,  cuota_min: 390.00 },
  // Tramo 14
  { numero: 14, descripcion: '4.050 – 6.000 €/mes',     rendNeto_min: 4050,    rendNeto_max: 6000,     base_min: 1372.55,  base_max: 4139.40,  cuota_min: 420.00 },
  // Tramo 15
  { numero: 15, descripcion: '> 6.000 €/mes',           rendNeto_min: 6000,    rendNeto_max: Infinity, base_min: 1633.99,  base_max: 4139.40,  cuota_min: 500.00 },
];

// Tipo de cotizacion global RETA 2026 (contingencias comunes + profesionales + cese + FP + FOGASA)
// Fuente: Orden de cotizacion SS 2026 / BOE
const TIPO_COTIZACION_RETA = 0.3120;

// Porcentaje de reduccion por gastos genericos SS (personas fisicas: 7%, societarios: 3%)
// Fuente: RD-ley 13/2022 y circular SS
const REDUCCION_FISICA = 0.07;
const REDUCCION_SOCIETARIO = 0.03;

// Parametros estimacion pension contributiva de jubilacion (referencia orientativa)
// Fuente: LGSS art. 209 y siguientes; porcentaje por anio cotizado ~1,83% (15-25 anios) / ~2% (>25)
const PORCENTAJE_PENSION_POR_ANIO = 0.0183;
const MAX_PORCENTAJE_PENSION = 1.00; // 100% base reguladora
const MINIMO_ANIOS_PENSION = 15;      // minimo para acceder a pension contributiva

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // Valores de entrada con saneamiento
  const rendimientoNeto = Math.max(0, i.rendimiento_neto_mensual || 0);
  const tipoAutonomo = i.tipo_autonomo === 'societario' ? 'societario' : 'fisica';
  const mesesCotizados = Math.min(12, Math.max(1, i.meses_cotizados || 12));
  const aniosCotizados = Math.min(50, Math.max(0, i.anios_cotizados || 0));

  // Paso 1: Calculo del rendimiento neto ajustado
  // Fuente: RD-ley 13/2022 - reduccion por gastos genericos para determinar tramo
  const reduccion = tipoAutonomo === 'societario' ? REDUCCION_SOCIETARIO : REDUCCION_FISICA;
  const rendimientoNeto_ajustado = redondear2(rendimientoNeto * (1 - reduccion));

  // Paso 2: Asignacion de tramo segun rendimiento neto ajustado
  let tramoSeleccionado: TramoRETA = TRAMOS_RETA_2026[0]; // default tramo 1
  for (const tramo of TRAMOS_RETA_2026) {
    if (rendimientoNeto_ajustado >= tramo.rendNeto_min && rendimientoNeto_ajustado < tramo.rendNeto_max) {
      tramoSeleccionado = tramo;
      break;
    }
  }
  // Caso borde: rendimiento exactamente en el limite superior del ultimo tramo
  if (rendimientoNeto_ajustado >= TRAMOS_RETA_2026[TRAMOS_RETA_2026.length - 1].rendNeto_min) {
    tramoSeleccionado = TRAMOS_RETA_2026[TRAMOS_RETA_2026.length - 1];
  }

  // Paso 3: Cuotas
  const cuotaMensualMin = tramoSeleccionado.cuota_min;
  // Cuota maxima: tipo de cotizacion sobre base maxima del tramo
  const cuotaMensualMax = redondear2(tramoSeleccionado.base_max * TIPO_COTIZACION_RETA);
  const cuotaAnualMin = redondear2(cuotaMensualMin * 12);

  // Paso 4: Porcentaje de la cuota sobre el rendimiento neto bruto
  const porcentajeSobreRendimiento = rendimientoNeto > 0
    ? redondear2((cuotaMensualMin / rendimientoNeto) * 100)
    : 0;

  // Paso 5: Estimacion orientativa de pension de jubilacion
  // Base reguladora aproximada = base minima del tramo
  // Porcentaje aplicable = anios_cotizados * 1,83% (con tope 100%)
  // Solo se estima si hay al menos 15 anios cotizados
  // Fuente: INSS - LGSS art. 209 y 210
  let pensionEstimadaMensual = 0;
  if (aniosCotizados >= MINIMO_ANIOS_PENSION) {
    const porcentajePension = Math.min(
      aniosCotizados * PORCENTAJE_PENSION_POR_ANIO,
      MAX_PORCENTAJE_PENSION
    );
    pensionEstimadaMensual = redondear2(
      tramoSeleccionado.base_min * porcentajePension
    );
  }

  return {
    rendimiento_neto_ajustado: rendimientoNeto_ajustado,
    tramo_numero: `Tramo ${tramoSeleccionado.numero} de 15`,
    base_cotizacion_min: tramoSeleccionado.base_min,
    base_cotizacion_max: tramoSeleccionado.base_max,
    cuota_mensual_min: cuotaMensualMin,
    cuota_mensual_max: cuotaMensualMax,
    cuota_anual_min: cuotaAnualMin,
    porcentaje_sobre_rendimiento: porcentajeSobreRendimiento,
    pension_estimada_mensual: pensionEstimadaMensual,
    descripcion_tramo: tramoSeleccionado.descripcion,
  };
}
