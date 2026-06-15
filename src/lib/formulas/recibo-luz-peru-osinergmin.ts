/**
 * Calculadora de recibo de luz residencial en Perú (tarifa BT5B, regulada por Osinergmin).
 *
 * La tarifa BT5B residencial (baja tensión, demanda ≤ 20 kW, consumo ≤ 140 kWh con tarifa social)
 * tiene una estructura por bloques que cambia según el consumo del mes:
 *   - Usuarios con consumo ≤ 140 kWh/mes:
 *       · Cargo fijo mensual
 *       · 0–30 kWh: cargo por energía del primer bloque (tarifa social)
 *       · 31–140 kWh: cargo fijo por los primeros 30 kWh + cargo por energía del exceso
 *   - Usuarios con consumo > 140 kWh/mes:
 *       · Cargo fijo mensual (algo mayor)
 *       · Cargo por energía único sobre TODO el consumo (más caro)
 *
 * Los precios del pliego YA INCLUYEN IGV (18%). Además del consumo, el recibo agrega un cargo
 * por alumbrado público (variable por municipio/consumo) y un cargo por reposición y
 * mantenimiento de la conexión.
 *
 * Fuente principal (verificada, incluye IGV):
 *   Luz del Sur — Pliego Tarifario 04 MAYO 2026 (LDS2026-06), tarifa BT5B residencial.
 *   https://cdn.luzdelsur.com.pe/weblds/nuestraempresa/lds_tarifas.pdf
 *   Dato 2026: Osinergmin redujo las tarifas residenciales del SEIN ~2,96% desde el 4-feb-2026.
 *   https://www.osinergmin.gob.pe/seccion/institucional/regulacion-tarifaria/pliegos-tarifarios/electricidad/pliegos-tarifiarios-cliente-final
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  consumoKwh: number;          // consumo del mes en kWh
  distribuidora?: string;      // 'luzdelsur' | 'enel' | 'hidrandina'
  alumbradoPublico?: number;   // cargo de alumbrado público del recibo (S/), opcional
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/**
 * Tarifas BT5B residencial 2026 por distribuidora (S/, IGV incluido).
 * - cargoFijoBajo / cargoFijoAlto: cargo fijo mensual para ≤140 kWh y >140 kWh.
 * - p1: cargo por energía del primer bloque (0–30 kWh), S/ por kWh.
 * - fijo30: cargo fijo por los primeros 30 kWh cuando se consume entre 31 y 140 kWh, S/.
 * - exceso: cargo por energía del exceso sobre 30 kWh (tramo 31–140), S/ por kWh.
 * - plano: cargo por energía único sobre todo el consumo cuando se supera 140 kWh, S/ por kWh.
 * - reposicion: cargo aproximado por reposición y mantenimiento de la conexión, S/.
 */
const TARIFAS_BT5B: Record<string, {
  nombre: string; cargoFijoBajo: number; cargoFijoAlto: number;
  p1: number; fijo30: number; exceso: number; plano: number; reposicion: number;
}> = {
  // fuente: Luz del Sur, Pliego 04 MAYO 2026 (LDS2026-06), BT5B residencial, incluye IGV.
  luzdelsur: { nombre: 'Luz del Sur', cargoFijoBajo: 2.62, cargoFijoAlto: 2.68, p1: 0.4948, fijo30: 14.84, exceso: 0.7068, plano: 0.7238, reposicion: 1.80 },
  // fuente: PLUZ Energía Perú S.A.A. (ex Enel), Pliego Tarifario MAYO 2026 Nº 6-2026 (vigente 04-may-2026),
  // BT5B RESIDENCIAL, Unidad LIMA NORTE, precios CON IGV.
  // https://www.pluz.pe/content/dam/distribuidora-peru-rebranding/documentos-pluz/tarifas/2026-05/260504_1%20Pliego%20PLUZ%20Consumo%20energia%20y%20potencia_con%20IGV_ENV_v0.pdf
  enel:      { nombre: 'Enel / PLUZ Lima', cargoFijoBajo: 2.70, cargoFijoAlto: 2.76, p1: 0.5075, fijo30: 15.22, exceso: 0.7250, plano: 0.7423, reposicion: 1.90 },
  // fuente: Hidrandina (Distriluz), pliego tarifario BT5B residencial (Osinergmin), incluye IGV. VALORES REFERENCIALES
  // (el pliego 2026 oficial no es fetcheable de forma estable; revisar mensual en Osinergmin/Distriluz Hidrandina).
  // https://www.osinergmin.gob.pe/seccion/institucional/regulacion-tarifaria/pliegos-tarifarios/electricidad/pliegos-tarifiarios-cliente-final
  hidrandina:{ nombre: 'Hidrandina (norte)', cargoFijoBajo: 2.85, cargoFijoAlto: 2.92, p1: 0.5550, fijo30: 16.65, exceso: 0.7820, plano: 0.8010, reposicion: 1.70 },
};

export function compute(i: Inputs): Outputs {
  const consumo = Number(i.consumoKwh);
  if (!Number.isFinite(consumo) || consumo <= 0) {
    throw new Error('Ingresá tu consumo del mes en kWh (mayor a 0).');
  }

  const distKey = String(i.distribuidora || 'luzdelsur');
  const t = TARIFAS_BT5B[distKey] || TARIFAS_BT5B.luzdelsur;

  // Alumbrado público: si el usuario no lo ingresa, estimamos ~S/ 0.045 por kWh (referencial,
  // varía por municipio; en la práctica suele estar entre S/ 3 y S/ 10/mes). Lo limitamos a un piso.
  const apIngresado = Number(i.alumbradoPublico);
  const alumbrado = Number.isFinite(apIngresado) && apIngresado > 0
    ? apIngresado
    : Math.max(3, consumo * 0.045);

  const cargoFijo = consumo <= 140 ? t.cargoFijoBajo : t.cargoFijoAlto;

  // Cargo por energía según el bloque BT5B residencial.
  let cargoEnergia = 0;
  let desgloseEnergia = '';
  if (consumo <= 30) {
    cargoEnergia = consumo * t.p1;
    desgloseEnergia = `${consumo} kWh × ${fmtPEN(t.p1)}/kWh`;
  } else if (consumo <= 140) {
    const exc = consumo - 30;
    cargoEnergia = t.fijo30 + exc * t.exceso;
    desgloseEnergia = `Primeros 30 kWh: ${fmtPEN(t.fijo30)} + ${exc} kWh × ${fmtPEN(t.exceso)}/kWh`;
  } else {
    cargoEnergia = consumo * t.plano;
    desgloseEnergia = `${consumo} kWh × ${fmtPEN(t.plano)}/kWh (tarifa única, consumo > 140 kWh)`;
  }

  const reposicion = t.reposicion;

  // Total del recibo (los precios del pliego ya incluyen IGV).
  const total = cargoFijo + cargoEnergia + alumbrado + reposicion;

  // Tarifa promedio efectiva (todo incluido) por kWh.
  const tarifaPromedio = total / consumo;

  // Tramo BT5B en el que cae el usuario.
  const tramo = consumo <= 140
    ? 'Tarifa social BT5B (≤ 140 kWh): primeros 30 kWh más baratos.'
    : 'BT5B consumo alto (> 140 kWh): tarifa única sobre todo el consumo, más cara.';

  // Insight: el salto de los 140 kWh es la palanca de ahorro más fuerte.
  let _insight: any;
  if (consumo > 140) {
    // Cuánto ahorraría si bajara a 140 kWh (sale del tramo caro al tramo social).
    const cargoFijo140 = t.cargoFijoBajo;
    const energia140 = t.fijo30 + (140 - 30) * t.exceso;
    const ap140 = Number.isFinite(apIngresado) && apIngresado > 0 ? apIngresado : Math.max(3, 140 * 0.045);
    const total140 = cargoFijo140 + energia140 + ap140 + reposicion;
    const ahorro = total - total140;
    _insight = {
      title: 'Estás en el tramo caro (más de 140 kWh)',
      text: `Con **${consumo} kWh** en ${t.nombre} tu recibo es **${fmtPEN(total)}**. Al pasar los **140 kWh/mes**, BT5B te cobra la tarifa única de **${fmtPEN(t.plano)}/kWh sobre todo el consumo** (no solo el exceso). Si lograras bajar a 140 kWh pagarías ~**${fmtPEN(total140)}**: un ahorro de **${fmtPEN(ahorro)}** por mes.`,
      tone: 'warn',
      icon: '⚡',
    };
  } else {
    _insight = {
      title: 'Estás en la tarifa social BT5B',
      text: `Con **${consumo} kWh** en ${t.nombre} tu recibo es **${fmtPEN(total)}** (≈ ${fmtPEN(tarifaPromedio)}/kWh todo incluido). Mientras te mantengas en **140 kWh o menos**, conservás la tarifa social: los primeros 30 kWh son los más baratos. Pasar los 140 kWh activa la tarifa única, mucho más cara.`,
      tone: 'good',
      icon: '💡',
    };
  }

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Energía (kWh)', value: Math.round(cargoEnergia * 100) / 100 },
      { label: 'Cargo fijo', value: Math.round(cargoFijo * 100) / 100 },
      { label: 'Alumbrado público', value: Math.round(alumbrado * 100) / 100 },
      { label: 'Reposición/mantenimiento', value: Math.round(reposicion * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total del recibo',
    ariaLabel: `Recibo de luz de ${fmtPEN(total)}: energía ${fmtPEN(cargoEnergia)}, cargo fijo ${fmtPEN(cargoFijo)}, alumbrado público ${fmtPEN(alumbrado)} y reposición ${fmtPEN(reposicion)}.`,
  };

  return {
    total: fmtPEN(total),
    cargoEnergia: fmtPEN(cargoEnergia),
    cargoFijo: fmtPEN(cargoFijo),
    alumbrado: fmtPEN(alumbrado),
    reposicion: fmtPEN(reposicion),
    tarifaPromedio: fmtPEN(tarifaPromedio) + '/kWh',
    tramo,
    detalle: `${t.nombre} · ${desgloseEnergia} = ${fmtPEN(cargoEnergia)} en energía + cargo fijo ${fmtPEN(cargoFijo)} + alumbrado ${fmtPEN(alumbrado)} + reposición ${fmtPEN(reposicion)} = ${fmtPEN(total)} (IGV incluido).`,
    _insight,
    _chart,
  };
}
