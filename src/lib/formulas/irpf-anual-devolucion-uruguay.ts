/**
 * IRPF Anual Uruguay 2026 — ¿te devuelven o pagás? (liquidación anual / declaración jurada).
 *
 * Lógica (DGI, Cat. II rentas del trabajo):
 *   1) Impuesto bruto = escala progresiva por franjas en BPC aplicada sobre el INGRESO ANUAL
 *      (los límites de cada franja, que son mensuales, se anualizan multiplicando por 12).
 *   2) Crédito por deducciones = (deducción por hijos + otros aportes deducibles) × 8%.
 *      - Deducción por hijo a cargo: 13 BPC anuales por hijo (monto sobre el que se aplica el
 *        crédito; ver NOTA: el monto exacto puede variar según la situación —menor / discapacidad—
 *        y el régimen de declaración conjunta).
 *   3) Impuesto anual = max(0, bruto − crédito).
 *   4) Saldo = retenido en el año − impuesto anual.
 *        saldo > 0 → A DEVOLVER ; saldo ≤ 0 → A PAGAR (saldo a abonar en la declaración).
 *
 * Importa la BPC de la data del país.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Ingreso anual nominal (suma de los 12 sueldos nominales + partidas gravadas). */
  ingreso_anual_nominal: number;
  /** IRPF retenido durante todo el año (lo que ya te descontaron). */
  retenido_anual: number;
  /** Hijos a cargo (deducción de 13 BPC anuales por hijo). */
  hijos_a_cargo: number;
  /** Aportes BPS y otros deducibles del año (monto sobre el que se aplica el crédito del 8%). */
  aportes_bps_anual: number;
}

export interface Outputs {
  impuesto_anual: number;
  deducciones: number;
  saldo: number;
  resultado: string;
  impuesto_bruto: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

const FRANJAS = URUGUAY_2026.irpf.franjas;

/** Escala progresiva por franjas en BPC sobre una base ANUAL (límites mensuales × 12). */
function impuestoBrutoAnual(baseAnual: number): number {
  const bpcAnual = URUGUAY_2026.bpc * 12;
  if (baseAnual <= 0) return 0;
  let impuesto = 0;
  let anteriorBpc = 0;
  for (const f of FRANJAS) {
    const limite = f.hastaBpc === Infinity ? Infinity : f.hastaBpc * bpcAnual;
    const piso = anteriorBpc * bpcAnual;
    const enTramo = Math.min(baseAnual, limite) - piso;
    if (enTramo > 0) impuesto += enTramo * f.tasa;
    anteriorBpc = f.hastaBpc;
    if (baseAnual <= limite) break;
  }
  return impuesto;
}

export function irpfAnualDevolucionUruguay(i: Inputs): Outputs {
  const bpc = URUGUAY_2026.bpc;

  const ingreso = Math.max(0, Number(i.ingreso_anual_nominal) || 0);
  const retenido = Math.max(0, Number(i.retenido_anual) || 0);
  const hijos = Math.max(0, Math.round(Number(i.hijos_a_cargo) || 0));
  const aportes = Math.max(0, Number(i.aportes_bps_anual) || 0);

  if (ingreso <= 0) {
    return {
      impuesto_anual: 0,
      deducciones: 0,
      saldo: 0,
      resultado: 'Ingresá tu ingreso anual nominal para estimar la liquidación.',
      impuesto_bruto: 0,
      desglose: '—',
      nota: 'Cargá tu ingreso anual y lo que te retuvieron para saber si te devuelven o tenés que pagar.',
    };
  }

  // 1) Impuesto bruto sobre el ingreso anual.
  const impuestoBruto = impuestoBrutoAnual(ingreso);

  // 2) Crédito por deducciones (8% sobre hijos + aportes deducibles).
  const deducHijos = hijos * 13 * bpc;     // 13 BPC anuales por hijo (ver NOTA)
  const baseCredito = deducHijos + aportes;
  const deducciones = baseCredito * 0.08;

  // 3) Impuesto anual neto.
  const impuestoAnual = Math.max(0, impuestoBruto - deducciones);

  // 4) Saldo de la liquidación.
  const saldo = retenido - impuestoAnual;
  const devuelve = saldo > 0;
  const resultadoTxt = devuelve ? 'A devolver' : 'A pagar';
  const montoSaldo = Math.abs(saldo);

  const resultado = devuelve
    ? `Te corresponde una devolución estimada de ${fmtUYU(montoSaldo)}.`
    : saldo === 0
      ? 'Tu liquidación da cero: ni te devuelven ni tenés que pagar.'
      : `Te quedaría un saldo a pagar estimado de ${fmtUYU(montoSaldo)}.`;

  const desglose =
    `Impuesto bruto ${fmtUYU(impuestoBruto)} − crédito por deducciones ${fmtUYU(deducciones)} = impuesto anual ${fmtUYU(impuestoAnual)}. ` +
    `Retenido ${fmtUYU(retenido)} − ${fmtUYU(impuestoAnual)} = ${fmtUYU(saldo)} (${resultadoTxt}).`;

  const nota =
    'Estimación de la declaración jurada anual (se presenta en junio ante DGI). ' +
    'El monto deducible por hijo (13 BPC) es una aproximación: el valor exacto varía según se trate de hijo menor o con discapacidad y de si la deducción se divide entre ambos padres. ' +
    'No incluye deducción por alquiler ni crédito hipotecario; cargalos en "aportes deducibles" si corresponde. No sustituye la liquidación oficial.';

  return {
    impuesto_anual: Math.round(impuestoAnual),
    deducciones: Math.round(deducciones),
    saldo: Math.round(saldo),
    resultado,
    impuesto_bruto: Math.round(impuestoBruto),
    desglose,
    nota,
    _insight: {
      type: 'highlight',
      icon: devuelve ? '💰' : '⚠️',
      text: devuelve
        ? `Con un ingreso anual de ${fmtUYU(ingreso)} y ${fmtUYU(retenido)} retenidos, tu impuesto real fue ${fmtUYU(impuestoAnual)}: te sobra ${fmtUYU(montoSaldo)} y DGI te lo devuelve.`
        : `Con un ingreso anual de ${fmtUYU(ingreso)} y ${fmtUYU(retenido)} retenidos, tu impuesto real fue ${fmtUYU(impuestoAnual)}: faltó retener ${fmtUYU(montoSaldo)}, que abonás en la declaración.`,
    },
    _table: {
      title: 'Franjas del IRPF 2026 anualizadas (escala progresiva en BPC × 12)',
      headers: ['Franja (BPC mensual)', 'Tramo anual (pesos)', 'Tasa marginal'],
      rows: FRANJAS.map((f, idx) => {
        const desde = idx === 0 ? 0 : FRANJAS[idx - 1].hastaBpc;
        const bpcAnual = bpc * 12;
        const desdePesos = fmtUYU(desde * bpcAnual);
        const hastaPesos = f.hastaBpc === Infinity ? '∞' : fmtUYU(f.hastaBpc * bpcAnual);
        const hastaTxt = f.hastaBpc === Infinity ? 'en adelante' : `${f.hastaBpc} BPC`;
        return [
          `${desde} – ${hastaTxt}`,
          f.hastaBpc === Infinity ? `desde ${desdePesos}` : `${desdePesos} – ${hastaPesos}`,
          `${(f.tasa * 100).toFixed(0)}%`,
        ];
      }),
      note: `BPC 2026 = ${fmtUYU(bpc)} (anual = ${fmtUYU(bpc * 12)}). Mínimo no imponible: 7 BPC mensuales = ${fmtUYU(7 * bpc * 12)} al año. Cada tramo paga su tasa solo sobre la porción del ingreso que cae en él.`,
    },
  };
}
