/**
 * Calculadora de Retenciones de Ganancias RG 830 — Anexo VIII ARCA
 *
 * Retención sobre pagos a proveedores personas humanas o jurídicas. El agente
 * de retención (pagador) retiene al momento del pago.
 *
 * IMPORTANTE sobre los valores 2026:
 * Los MNI y tramos de escala del Anexo VIII NO se actualizan desde la
 * RG 5423/2023. ARCA los mantiene congelados pese a la inflación acumulada,
 * lo que hace que casi cualquier pago a proveedores caiga bajo retención.
 * Por eso los valores de abajo lucen "ridículamente bajos" — son los oficiales.
 * Fuente: https://biblioteca.afip.gob.ar/search/query/adjunto.aspx?p=t:RAG%7Cn:830%7Co:3%7Ca:2000%7Cd:A8_RG5423.pdf
 *
 * Fórmula:
 *   monto_acumulado = pago_actual + pagos_anteriores_mes
 *   base_retencion = max(0, monto_acumulado - MNI)
 *   retencion_total = base × alícuota (o escala para honorarios/profesionales)
 *   retencion_a_pagar = retencion_total - retenciones_anteriores
 *   Mínimo operativo: $240 (general) o $1.020 (alquileres inmuebles urbanos no inscriptos)
 */

export interface GananciasRG830Inputs {
  concepto: string; // slug del concepto
  condicion: string; // 'inscripto' | 'no-inscripto'
  montoPago: number; // neto de IVA
  pagosAnteriores: number; // acumulado del mes
  retencionesAnteriores: number; // retenciones ya hechas al proveedor este mes
}

interface ConceptoConfig {
  nombre: string;
  codigo: string;
  mniInscripto: number;
  /** Si tiene alícuota fija, va acá. Si usa escala, queda 0 y se marca escalaTipo. */
  alicuotaInscripto: number;
  alicuotaNoInscripto: number;
  /** Qué escala progresiva aplicar: 'general' (cód 25/116/124/110) o 'profesionales' (cód 119). */
  escalaTipo?: 'general' | 'profesionales';
}

// Valores oficiales Anexo VIII RG 830 (últimos publicados por RG 5423/2023).
// Vigentes en 2026 — ARCA no los actualizó.
const conceptos: Record<string, ConceptoConfig> = {
  'honorarios-profesionales': {
    nombre: 'Honorarios profesionales, profesiones liberales, oficios (cód. 119)',
    codigo: '119',
    mniInscripto: 160_000,
    alicuotaInscripto: 0,
    alicuotaNoInscripto: 28,
    escalaTipo: 'profesionales',
  },
  'locacion-obras-servicios': {
    nombre: 'Locación obras y servicios no personales (cód. 94)',
    codigo: '94',
    mniInscripto: 67_170,
    alicuotaInscripto: 2,
    alicuotaNoInscripto: 28,
  },
  'alquileres-urbanos': {
    nombre: 'Alquiler de inmuebles urbanos (cód. 31)',
    codigo: '31',
    mniInscripto: 11_200,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  'alquileres-rurales': {
    nombre: 'Alquiler de inmuebles rurales (cód. 32)',
    codigo: '32',
    mniInscripto: 11_200,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  comisiones: {
    nombre: 'Comisiones / intermediación (cód. 25)',
    codigo: '25',
    mniInscripto: 16_830,
    alicuotaInscripto: 0,
    alicuotaNoInscripto: 28,
    escalaTipo: 'general',
  },
  intereses: {
    nombre: 'Intereses no financieros (cód. 21)',
    codigo: '21',
    mniInscripto: 7_870,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  'enajenacion-bienes': {
    nombre: 'Enajenación de bienes muebles y bienes de cambio (cód. 78)',
    codigo: '78',
    mniInscripto: 224_000,
    alicuotaInscripto: 2,
    alicuotaNoInscripto: 10,
  },
  transporte: {
    nombre: 'Transporte de cargas (cód. 95)',
    codigo: '95',
    mniInscripto: 67_170,
    alicuotaInscripto: 0.25,
    alicuotaNoInscripto: 28,
  },
};

/**
 * Escala general Anexo VIII (cód. 25, 110, 116/124). Valores absolutos pequeños
 * porque NO se actualizan desde la RG 5423/2023.
 */
interface TramoEscala {
  desde: number;
  hasta: number;
  fijo: number;
  alicuota: number;
}
const ESCALA_GENERAL: TramoEscala[] = [
  { desde: 0,       hasta: 8_000,  fijo: 0,       alicuota: 0.05 },
  { desde: 8_000,   hasta: 16_000, fijo: 400,     alicuota: 0.09 },
  { desde: 16_000,  hasta: 24_000, fijo: 1_120,   alicuota: 0.12 },
  { desde: 24_000,  hasta: 32_000, fijo: 2_080,   alicuota: 0.15 },
  { desde: 32_000,  hasta: 48_000, fijo: 3_280,   alicuota: 0.19 },
  { desde: 48_000,  hasta: 64_000, fijo: 6_320,   alicuota: 0.23 },
  { desde: 64_000,  hasta: 96_000, fijo: 10_000,  alicuota: 0.27 },
  { desde: 96_000,  hasta: Infinity, fijo: 18_640, alicuota: 0.31 },
];

/**
 * Escala específica código 119 (profesiones liberales, oficios).
 * Valores oficiales Anexo VIII RG 830 vía RG 5423/2023.
 */
const ESCALA_PROFESIONALES: TramoEscala[] = [
  { desde: 0,        hasta: 71_000,  fijo: 0,        alicuota: 0.05 },
  { desde: 71_000,   hasta: 142_000, fijo: 3_550,    alicuota: 0.09 },
  { desde: 142_000,  hasta: 213_000, fijo: 9_940,    alicuota: 0.12 },
  { desde: 213_000,  hasta: 284_000, fijo: 18_460,   alicuota: 0.15 },
  { desde: 284_000,  hasta: 426_000, fijo: 29_110,   alicuota: 0.19 },
  { desde: 426_000,  hasta: 568_000, fijo: 56_090,   alicuota: 0.23 },
  { desde: 568_000,  hasta: 852_000, fijo: 88_750,   alicuota: 0.27 },
  { desde: 852_000,  hasta: Infinity, fijo: 165_430, alicuota: 0.31 },
];

function aplicarEscala(base: number, escala: TramoEscala[]): number {
  if (base <= 0) return 0;
  for (const tramo of escala) {
    if (base <= tramo.hasta) {
      return tramo.fijo + (base - tramo.desde) * tramo.alicuota;
    }
  }
  const last = escala[escala.length - 1];
  return last.fijo + (base - last.desde) * last.alicuota;
}

export interface GananciasRG830Outputs {
  conceptoNombre: string;
  montoAcumulado: number;
  mniAplicado: number;
  baseRetencion: number;
  alicuotaAplicada: string;
  retencionTotal: number;
  retencionEstePago: number;
  netoACobrar: number;
  aplicoMinimo: boolean;
  resumen: string;
}

export function gananciasRG830(inputs: GananciasRG830Inputs): GananciasRG830Outputs {
  const concepto = inputs.concepto;
  const condicion = inputs.condicion || 'inscripto';
  const pago = Number(inputs.montoPago);
  const anteriores = Number(inputs.pagosAnteriores) || 0;
  const retPrev = Number(inputs.retencionesAnteriores) || 0;

  const cfg = conceptos[concepto];
  if (!cfg) throw new Error('Seleccioná un concepto válido');
  if (!pago || pago <= 0) throw new Error('Ingresá el monto del pago neto de IVA');

  const montoAcumulado = pago + anteriores;

  // No inscriptos no tienen MNI (retienen desde el primer peso)
  const mniAplicado = condicion === 'inscripto' ? cfg.mniInscripto : 0;
  const baseRetencion = Math.max(0, montoAcumulado - mniAplicado);

  let retencionTotal = 0;
  let alicuotaAplicada = '';

  if (condicion === 'inscripto') {
    if (cfg.escalaTipo === 'profesionales') {
      retencionTotal = aplicarEscala(baseRetencion, ESCALA_PROFESIONALES);
      alicuotaAplicada = 'Escala específica cód. 119 (5% a 31%)';
    } else if (cfg.escalaTipo === 'general') {
      retencionTotal = aplicarEscala(baseRetencion, ESCALA_GENERAL);
      alicuotaAplicada = 'Escala general Anexo VIII (5% a 31%)';
    } else {
      retencionTotal = baseRetencion * (cfg.alicuotaInscripto / 100);
      alicuotaAplicada = `${cfg.alicuotaInscripto}%`;
    }
  } else {
    retencionTotal = baseRetencion * (cfg.alicuotaNoInscripto / 100);
    alicuotaAplicada = `${cfg.alicuotaNoInscripto}% (no inscripto)`;
  }

  const retencionEstePago = Math.max(0, retencionTotal - retPrev);

  // Mínimo operativo: $240 general; $1.020 alquileres inmuebles urbanos no inscriptos
  const minimoOperativo =
    cfg.codigo === '31' && condicion === 'no-inscripto' ? 1020 : 240;

  let aplicoMinimo = false;
  let retencionFinal = retencionEstePago;
  if (retencionEstePago < minimoOperativo) {
    retencionFinal = 0;
    aplicoMinimo = true;
  }

  const netoACobrar = pago - retencionFinal;

  const resumen = aplicoMinimo
    ? `Retención menor al mínimo operativo ($${minimoOperativo}). No se retiene.`
    : baseRetencion === 0
    ? 'Monto acumulado no supera el mínimo no sujeto. No se retiene.'
    : `Retención aplicada: ${alicuotaAplicada} sobre base de $${Math.round(baseRetencion).toLocaleString('es-AR')}`;

  return {
    conceptoNombre: cfg.nombre,
    montoAcumulado: Math.round(montoAcumulado),
    mniAplicado: Math.round(mniAplicado),
    baseRetencion: Math.round(baseRetencion),
    alicuotaAplicada,
    retencionTotal: Math.round(retencionTotal),
    retencionEstePago: Math.round(retencionFinal),
    netoACobrar: Math.round(netoACobrar),
    aplicoMinimo,
    resumen,
  };
}
