/**
 * Calculadora de Retenciones de Ganancias RG 830/2000 AFIP/ARCA
 *
 * Retención sobre pagos a proveedores personas humanas o jurídicas.
 * El agente de retención (pagador) retiene al momento del pago.
 *
 * Valores Anexo VIII (aprox 2026, actualizados por última RG de ARCA).
 * Para validación oficial, consultar https://servicioscf.afip.gob.ar/calc-rg830/
 *
 * Fórmula:
 *   monto_acumulado = pago_actual + pagos_anteriores_mes
 *   base_retencion = max(0, monto_acumulado - MNI)
 *   retencion_total = base × alicuota (con escala para profesionales)
 *   retencion_a_pagar = retencion_total - retenciones_anteriores
 *   Mínimo operativo: $240 para inscriptos en servicios, $1020 para no inscriptos en alquileres
 */

export interface GananciasRG830Inputs {
  concepto: string; // código del concepto
  condicion: string; // 'inscripto' | 'no-inscripto'
  montoPago: number; // neto de IVA
  pagosAnteriores: number; // acumulado del mes
  retencionesAnteriores: number; // retenciones ya hechas al proveedor este mes
}

interface ConceptoConfig {
  nombre: string;
  mniInscripto: number;
  alicuotaInscripto: number; // en %
  alicuotaNoInscripto: number; // en %
  escalaProgresiva?: boolean;
}

// Valores aproximados 2026 — consultar simulador AFIP para casos precisos
const conceptos: Record<string, ConceptoConfig> = {
  'honorarios-profesionales': {
    nombre: 'Honorarios profesionales (cód. 119)',
    mniInscripto: 160000,
    alicuotaInscripto: 10, // promedio de la escala progresiva (aprox)
    alicuotaNoInscripto: 28,
    escalaProgresiva: true,
  },
  'locacion-obras-servicios': {
    nombre: 'Locación obras y servicios no personales (cód. 111/112)',
    mniInscripto: 293000,
    alicuotaInscripto: 2,
    alicuotaNoInscripto: 28,
  },
  'alquileres-urbanos': {
    nombre: 'Alquiler de inmuebles urbanos (cód. 128)',
    mniInscripto: 193000,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  'alquileres-rurales': {
    nombre: 'Alquiler de inmuebles rurales (cód. 129)',
    mniInscripto: 193000,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  comisiones: {
    nombre: 'Comisiones / Intermediación (cód. 127)',
    mniInscripto: 293000,
    alicuotaInscripto: 2,
    alicuotaNoInscripto: 28,
  },
  intereses: {
    nombre: 'Intereses (cód. 131)',
    mniInscripto: 44000,
    alicuotaInscripto: 6,
    alicuotaNoInscripto: 28,
  },
  'enajenacion-bienes': {
    nombre: 'Enajenación de bienes muebles (cód. 114)',
    mniInscripto: 224000,
    alicuotaInscripto: 2,
    alicuotaNoInscripto: 10,
  },
  transporte: {
    nombre: 'Transporte de cargas (cód. 125)',
    mniInscripto: 293000,
    alicuotaInscripto: 0.25,
    alicuotaNoInscripto: 28,
  },
};

/**
 * Escala progresiva para honorarios profesionales (cód. 119).
 * Basada en RG 5423/2023 y ajustes periódicos de ARCA.
 * Tramos: { desde, hasta, fijo, alicuota }. Último tramo usa hasta=Infinity.
 * Mantenido por scripts/update-data/fetchers/ganancias-rg830.ts.
 */
interface TramoProfesionales {
  desde: number;
  hasta: number;
  fijo: number;
  alicuota: number;
}
const ESCALA_PROFESIONALES: TramoProfesionales[] = [
  { desde: 0,           hasta: 1_300_000,  fijo: 0,          alicuota: 0.05 },
  { desde: 1_300_000,   hasta: 2_600_000,  fijo: 65_000,     alicuota: 0.09 },
  { desde: 2_600_000,   hasta: 3_900_000,  fijo: 182_000,    alicuota: 0.12 },
  { desde: 3_900_000,   hasta: 5_200_000,  fijo: 338_000,    alicuota: 0.15 },
  { desde: 5_200_000,   hasta: 6_500_000,  fijo: 533_000,    alicuota: 0.19 },
  { desde: 6_500_000,   hasta: 13_000_000, fijo: 780_000,    alicuota: 0.23 },
  { desde: 13_000_000,  hasta: 26_000_000, fijo: 2_275_000,  alicuota: 0.27 },
  { desde: 26_000_000,  hasta: Infinity,   fijo: 5_785_000,  alicuota: 0.31 },
];

function calcularEscalaProfesionales(baseExcedente: number): number {
  if (baseExcedente <= 0) return 0;
  for (const tramo of ESCALA_PROFESIONALES) {
    if (baseExcedente <= tramo.hasta) {
      return tramo.fijo + (baseExcedente - tramo.desde) * tramo.alicuota;
    }
  }
  const last = ESCALA_PROFESIONALES[ESCALA_PROFESIONALES.length - 1];
  return last.fijo + (baseExcedente - last.desde) * last.alicuota;
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

  // Para no inscriptos, el MNI es $0 (retienen desde el primer peso)
  const mniAplicado = condicion === 'inscripto' ? cfg.mniInscripto : 0;
  const baseRetencion = Math.max(0, montoAcumulado - mniAplicado);

  let retencionTotal = 0;
  let alicuotaAplicada = '';

  if (condicion === 'inscripto') {
    if (cfg.escalaProgresiva) {
      retencionTotal = calcularEscalaProfesionales(baseRetencion);
      alicuotaAplicada = 'Escala progresiva (5% a 31%)';
    } else {
      retencionTotal = baseRetencion * (cfg.alicuotaInscripto / 100);
      alicuotaAplicada = `${cfg.alicuotaInscripto}%`;
    }
  } else {
    retencionTotal = baseRetencion * (cfg.alicuotaNoInscripto / 100);
    alicuotaAplicada = `${cfg.alicuotaNoInscripto}% (no inscripto)`;
  }

  const retencionEstePago = Math.max(0, retencionTotal - retPrev);

  // Mínimo operativo: $240 ($1020 para alquileres no inscriptos)
  const minimoOperativo =
    concepto.startsWith('alquileres') && condicion === 'no-inscripto' ? 1020 : 240;

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
