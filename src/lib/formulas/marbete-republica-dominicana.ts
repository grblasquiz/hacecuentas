/**
 * Calculadora de marbete (placa / impuesto de circulación) — R. Dominicana 2026.
 *
 * El marbete es el sello anual de circulación de vehículos de motor que emite la
 * DGII. Su costo depende del año del vehículo:
 *   - Vehículos del año 2020 o anteriores: RD$1.500
 *   - Vehículos del año 2021 en adelante: RD$3.000
 * Pasada la fecha límite de renovación (1 de febrero), la DGII aplica un recargo.
 *
 * ⚠️ NOTA: el monto del recargo por pago tardío (RD$2.000 usado aquí) es un valor
 * de referencia y la DGII puede ajustarlo cada año. Confirmá el recargo vigente en
 * dgii.gov.do antes de pagar fuera de plazo.
 *
 * Data/símbolo de moneda: src/lib/data/republica-dominicana-2026.ts.
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

/** Año de corte: 2020 o anterior paga la tarifa baja. */
const ANIO_CORTE = 2020;
const COSTO_HASTA_2020 = 1500;
const COSTO_DESDE_2021 = 3000;
/** Recargo de referencia por renovar fuera de plazo (DUDOSO → confirmar DGII). */
const RECARGO_TARDIO = 2000;

export interface MarbeteInputs {
  /** Año del modelo del vehículo (p. ej. 2018, 2023). */
  anioVehiculo?: number | string;
  /** "si" si se renueva fuera de plazo (con recargo). */
  conRecargo?: string;
}

export interface MarbeteOutputs {
  total: number | string;
  costoBase: number;
  recargo: number;
  costoBaseTexto: string;
  recargoTexto: string;
  totalTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function marbeteRepublicaDominicana(i: MarbeteInputs): MarbeteOutputs {
  const anioVehiculo = Math.floor(Number(i.anioVehiculo) || 0);
  const conRecargo = String(i.conRecargo) === 'si';

  if (anioVehiculo < 1900 || anioVehiculo > 2100) {
    throw new Error('Ingresá el año del vehículo (p. ej. 2019)');
  }

  const costoBase = anioVehiculo <= ANIO_CORTE ? COSTO_HASTA_2020 : COSTO_DESDE_2021;
  const recargo = conRecargo ? RECARGO_TARDIO : 0;
  const total = costoBase + recargo;

  const tramoTxt =
    anioVehiculo <= ANIO_CORTE
      ? `año ${anioVehiculo} (2020 o anterior → ${fmtDOP(COSTO_HASTA_2020)})`
      : `año ${anioVehiculo} (2021 o posterior → ${fmtDOP(COSTO_DESDE_2021)})`;

  const detalle =
    `Marbete: ${tramoTxt} = ${fmtDOP(costoBase)}` +
    (conRecargo ? ` + recargo por pago tardío ${fmtDOP(recargo)} = ${fmtDOP(total)}.` : `. Total: ${fmtDOP(total)}.`);

  const _insight = {
    title: `Tu marbete cuesta ${fmtDOP(total)}`,
    text:
      `Por un vehículo del **año ${anioVehiculo}** el marbete base es **${fmtDOP(costoBase)}** ` +
      `(${anioVehiculo <= ANIO_CORTE ? '2020 o anterior' : '2021 en adelante'})` +
      (conRecargo
        ? `, más **${fmtDOP(recargo)}** de recargo por renovar fuera de plazo, total **${fmtDOP(total)}**.`
        : `. Renovando dentro del plazo (antes del 1 de febrero) no hay recargo.`),
    tone: (conRecargo ? 'warn' : 'info') as 'warn' | 'info',
    icon: '🚙',
  };

  const _table = {
    title: 'Costo del marbete por año del vehículo',
    headers: ['Año del vehículo', 'Costo base', 'Con recargo tardío'],
    align: ['left', 'right', 'right'],
    rows: [
      ['2020 o anterior', fmtDOP(COSTO_HASTA_2020), fmtDOP(COSTO_HASTA_2020 + RECARGO_TARDIO)],
      ['2021 en adelante', fmtDOP(COSTO_DESDE_2021), fmtDOP(COSTO_DESDE_2021 + RECARGO_TARDIO)],
    ],
    note: 'El recargo por pago tardío (RD$2.000 de referencia) puede variar cada año. Confirmá el monto vigente y la fecha límite en dgii.gov.do.',
  };

  return {
    total: fmtDOP(total) + ' · marbete a pagar',
    costoBase,
    recargo,
    costoBaseTexto: fmtDOP(costoBase),
    recargoTexto: fmtDOP(recargo),
    totalTexto: fmtDOP(total),
    detalle,
    _insight,
    _table,
  };
}
