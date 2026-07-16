/**
 * Costo de matrícula de un vehículo NUEVO en Colombia 2026.
 *
 * Estima los dos grandes componentes del trámite de matrícula inicial:
 *   1) Impuesto sobre vehículos automotores del primer año (Ley 488/1998).
 *   2) Derechos de matrícula + placas (trámite ante el RUNT / organismo de tránsito).
 *
 * VERIFICADO (Ley 488 de 1998, estable): la estructura de tarifas del impuesto
 *   es 1,5% / 2,5% / 3,5% del avalúo comercial, por rangos.
 * ⚠️ REFERENCIAL: los UMBRALES de cada rango los fija el Ministerio de Hacienda
 *   por resolución CADA AÑO (la base gravable se reajusta con la inflación), y
 *   los derechos de matrícula/placas VARÍAN por organismo de tránsito. Los
 *   valores por defecto son de orden de magnitud: confirmá en el RUNT y en tu
 *   secretaría de movilidad antes de presupuestar.
 */
import { fmtCOP } from '../data/colombia-2026.ts';

// Umbrales de rango del impuesto vehicular (COP) — REFERENCIALES 2026.
// Los reajusta el Ministerio de Hacienda por resolución anual; verificá el valor vigente.
const RANGO_TARIFA_BAJA = 58_000_000;   // hasta este avalúo → 1,5%
const RANGO_TARIFA_MEDIA = 130_000_000; // hasta este avalúo → 2,5%; por encima → 3,5%

// Tarifas del impuesto (Ley 488/1998) — VERIFICADO, estructura estable.
const TARIFA_BAJA = 0.015;
const TARIFA_MEDIA = 0.025;
const TARIFA_ALTA = 0.035;

// Motos de bajo cilindraje/valor suelen quedar exentas o con menor tarifa — REFERENCIAL.
const EXENCION_MOTO_VALOR = 6_000_000;

// Derechos de matrícula + placas por defecto — REFERENCIAL (varía por organismo de tránsito).
const DERECHOS_MATRICULA_REF = 200_000;

export interface Inputs {
  valorComercial: number;   // avalúo/valor comercial del vehículo nuevo (COP)
  tipoVehiculo?: string;    // 'particular' | 'moto'
  derechosTramite?: number; // derechos de matrícula + placas (COP); 0 → usa referencial
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = i.valorComercial === undefined || i.valorComercial === null || (i.valorComercial as any) === ''
    ? NaN : Number(i.valorComercial);
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('Ingresa el valor comercial del vehículo nuevo');
  }

  const esMoto = String(i.tipoVehiculo ?? 'particular') === 'moto';
  const dt = Number(i.derechosTramite) || 0;
  const derechosMatricula = dt > 0 ? dt : DERECHOS_MATRICULA_REF;

  let tarifa: number;
  let tarifaTxt: string;
  if (esMoto && valor < EXENCION_MOTO_VALOR) {
    tarifa = 0;
    tarifaTxt = 'Exento (moto de bajo valor)';
  } else if (valor <= RANGO_TARIFA_BAJA) {
    tarifa = TARIFA_BAJA;
    tarifaTxt = '1,5%';
  } else if (valor <= RANGO_TARIFA_MEDIA) {
    tarifa = TARIFA_MEDIA;
    tarifaTxt = '2,5%';
  } else {
    tarifa = TARIFA_ALTA;
    tarifaTxt = '3,5%';
  }

  // Impuesto aproximado a la centena.
  const impuestoVehicular = Math.round((valor * tarifa) / 100) * 100;
  const total = impuestoVehicular + derechosMatricula;

  const _insight = {
    title: tarifa > 0 ? `Matrícula estimada ${fmtCOP(total)}` : 'Moto de bajo valor: sin impuesto vehicular',
    text: `Para ${esMoto ? 'una moto nueva' : 'un vehículo particular nuevo'} de **${fmtCOP(valor)}**, la matrícula inicial estimada es **${fmtCOP(total)}**: ${tarifa > 0 ? `impuesto vehicular **${fmtCOP(impuestoVehicular)}** (${tarifaTxt} del valor comercial, Ley 488/1998)` : 'sin impuesto vehicular por tratarse de una moto de bajo valor'} más **${fmtCOP(derechosMatricula)}** de derechos de matrícula y placas. ⚠️ Los umbrales de tarifa se reajustan cada año y los derechos varían por organismo: confirmá en el RUNT.`,
    tone: 'info',
    icon: '🚗',
  };

  const _chart = {
    type: 'bar',
    labels: ['Impuesto vehicular', 'Derechos matrícula'],
    values: [Math.round(impuestoVehicular), Math.round(derechosMatricula)],
    prefix: '$ ',
    ariaLabel: `Impuesto vehicular ${fmtCOP(impuestoVehicular)} y derechos de matrícula ${fmtCOP(derechosMatricula)}, total ${fmtCOP(total)}.`,
  };

  return {
    impuestoVehicular: fmtCOP(impuestoVehicular),
    tarifaAplicada: tarifa > 0 ? `${tarifaTxt} del valor comercial (Ley 488/1998)` : tarifaTxt,
    derechosMatricula: dt > 0 ? fmtCOP(derechosMatricula) : `${fmtCOP(derechosMatricula)} (referencial)`,
    totalMatricula: fmtCOP(total),
    detalle: `Impuesto vehicular: ${tarifa > 0 ? `${fmtCOP(valor)} × ${tarifaTxt} = ${fmtCOP(impuestoVehicular)}` : `$0 (moto de bajo valor)`}. Derechos de matrícula y placas: ${fmtCOP(derechosMatricula)}${dt > 0 ? '' : ' (referencial)'}. Total estimado de matrícula: ${fmtCOP(total)}. ⚠️ Umbrales y derechos referenciales — verificá en el RUNT y tu secretaría de movilidad.`,
    _insight,
    _chart,
  };
}
