/**
 * Calculadora de Pensión de Viudedad — Seguridad Social España
 *
 * Regulación: LGSS RDL 8/2015 Arts. 219-222 + Ley 53/2002.
 *
 * Cuantía:
 *   - Regla general: 52% de la Base Reguladora del causante.
 *   - 60% cuando el pensionista tenga 65+ años y cumpla ciertos requisitos de ingresos.
 *   - 70% (pensión "mejorada") cuando concurran simultáneamente:
 *       a) Cargas familiares (hijos a cargo o familiares dependientes).
 *       b) Ingresos propios del pensionista no superen determinado tope (2 × SMI anual, aprox).
 *       c) La pensión de viudedad sea la principal o única fuente de ingresos.
 *
 * Topes: pensión máxima anual SS ≈ 3.267 €/mes (2026 estimado),
 *        pensión mínima viudedad con cargas ≈ 960 €/m, sin cargas ≈ 835 €/m.
 */

export interface PensionViudezEsInputs {
  baseReguladoraMensual: number; // base reguladora mensual del causante
  edadViudo: number;
  tieneCargasFamiliares: boolean;
  ingresosPropiosAnuales: number; // ingresos anuales del pensionista en €
}

export interface PensionViudezEsOutputs {
  pensionMensualBruta: string;
  porcentajeAplicado: string;
  tipoPorcentaje: string;
  pensionAnualBruta14Pagas: string;
  observaciones: string;
}

const fmtEUR = (n: number) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function pensionViudezEspana(i: PensionViudezEsInputs): PensionViudezEsOutputs {
  const br = Number(i.baseReguladoraMensual);
  const edad = Math.max(0, Number(i.edadViudo) || 0);
  const cargas = Boolean(i.tieneCargasFamiliares);
  const ingresos = Math.max(0, Number(i.ingresosPropiosAnuales) || 0);

  if (!br || br <= 0) {
    throw new Error('Ingresá la base reguladora mensual del causante');
  }

  // Límite de ingresos para acceder al 70% (2026 estimado: 2 × SMI anual)
  const smiAnual2026 = 16800; // SMI 2026 estimado ~1.200 €/m × 14 pagas
  const limite70 = smiAnual2026 * 1.75;

  let porcentaje = 0.52;
  let tipo = 'Regla general 52% (LGSS Art. 219)';

  if (cargas && ingresos <= limite70) {
    porcentaje = 0.7;
    tipo =
      'Pensión mejorada 70% por cargas familiares e ingresos bajos (Ley 53/2002 y RD 296/2009)';
  } else if (edad >= 65 && ingresos <= smiAnual2026) {
    porcentaje = 0.6;
    tipo = 'Pensión 60% por edad ≥ 65 y ingresos limitados';
  }

  const pensionMensual = br * porcentaje;

  // 14 pagas (12 mensualidades + 2 extras junio y navidad)
  const anual14 = pensionMensual * 14;

  let observaciones = '';
  if (porcentaje === 0.7) {
    observaciones =
      'Se aplica la pensión mejorada del 70%. Requisitos: cargas familiares + ingresos anuales propios ≤ 1,75 × SMI anual + la pensión de viudedad es fuente principal. Revisar anualmente si se mantiene el derecho.';
  } else if (porcentaje === 0.6) {
    observaciones =
      'Se aplica el 60% por edad ≥ 65 e ingresos bajos. Es compatible con otras pensiones pero suma al límite conjunto.';
  } else {
    observaciones =
      'Se aplica la regla general del 52%. Para subir al 70% necesitás acreditar cargas familiares e ingresos anuales ≤ 1,75 × SMI.';
  }

  return {
    pensionMensualBruta: fmtEUR(pensionMensual) + '/mes',
    porcentajeAplicado: (porcentaje * 100).toFixed(0) + '% de la base reguladora',
    tipoPorcentaje: tipo,
    pensionAnualBruta14Pagas: fmtEUR(anual14) + '/año (14 pagas)',
    observaciones,
  };
}
