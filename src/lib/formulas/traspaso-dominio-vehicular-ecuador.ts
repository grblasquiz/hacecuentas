/**
 * Traspaso de dominio vehicular (Ecuador) — costo total del cambio de propietario de un usado.
 * Componentes:
 *  - Impuesto a la transferencia de dominio de vehículos usados: 1% sobre el MAYOR entre el
 *    valor del contrato de compraventa y el avalúo del vehículo registrado en el SRI (FONDVIAL).
 *  - Trámite de traspaso en la ANT: ~USD 9 · Nueva especie de matrícula: ~USD 24.
 *  - Notaría (contrato de compraventa legalizado): varía por notaría (~USD 30-60).
 *  - Tasa de mantenimiento vial según tipo de vehículo.
 * Fuente: SRI (gob.ec/sri) y ANT. Valores de trámite referenciales, verificado 2026-07-16.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  valorCompraventa: number;  // precio pactado en el contrato
  avaluoSRI?: number;        // avalúo del vehículo en el SRI (si es mayor, manda como base)
  tipoVehiculo?: string;     // 'liviano' | 'moto' | 'pesado' | 'extrapesado'
  costoNotaria?: number;     // honorario de la notaría (opcional; por defecto ~45)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const IMPUESTO_TRANSFERENCIA = 0.01; // 1% sobre la base
const TRAMITE_TRASPASO = 9;          // USD (ANT)
const ESPECIE_MATRICULA = 24;        // USD (nueva especie)
const NOTARIA_DEFAULT = 45;          // USD referencial

const MANT_VIAL: Record<string, number> = {
  moto: 2.5,
  liviano: 5,
  pesado: 10,
  extrapesado: 15,
};

export function compute(i: Inputs): Outputs {
  const precio = Number(i.valorCompraventa) || 0;
  const avaluo = Math.max(0, Number(i.avaluoSRI) || 0);
  const tipo = String(i.tipoVehiculo || 'liviano');
  const notaria = Number(i.costoNotaria) > 0 ? Number(i.costoNotaria) : NOTARIA_DEFAULT;
  if (precio <= 0) throw new Error('Ingresá el valor de compraventa del vehículo');

  const base = Math.max(precio, avaluo);
  const impuesto = base * IMPUESTO_TRANSFERENCIA;
  const mantVial = MANT_VIAL[tipo] ?? MANT_VIAL.liviano;
  const gastosTramite = TRAMITE_TRASPASO + ESPECIE_MATRICULA + mantVial;
  const total = impuesto + gastosTramite + notaria;

  const _insight = {
    title: 'Costo total del traspaso',
    text: `Sobre una base de **${fmtUSDec(base)}**${avaluo > precio ? ' (mandó el avalúo del SRI por ser mayor)' : ''}, el impuesto del **1%** es **${fmtUSDec(impuesto)}**. Sumando notaría (${fmtUSDec(notaria)}), trámite ANT (${fmtUSDec(TRAMITE_TRASPASO)}), especie de matrícula (${fmtUSDec(ESPECIE_MATRICULA)}) y mantenimiento vial (${fmtUSDec(mantVial)}), el traspaso cuesta **${fmtUSDec(total)}**.`,
    tone: 'neutral',
    icon: '🚗',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Impuesto 1%', value: Math.round(impuesto * 100) / 100 },
      { label: 'Notaría', value: Math.round(notaria * 100) / 100 },
      { label: 'Trámite ANT + especie', value: Math.round((TRAMITE_TRASPASO + ESPECIE_MATRICULA) * 100) / 100 },
      { label: 'Mantenimiento vial', value: Math.round(mantVial * 100) / 100 },
    ],
    ariaLabel: `Impuesto ${fmtUSDec(impuesto)}, notaría ${fmtUSDec(notaria)}, trámite ${fmtUSDec(TRAMITE_TRASPASO + ESPECIE_MATRICULA)}, mantenimiento ${fmtUSDec(mantVial)}.`,
  };

  return {
    costoTotal: fmtUSDec(total),
    impuestoTransferencia: fmtUSDec(impuesto),
    gastosTramite: fmtUSDec(gastosTramite),
    honorarioNotaria: fmtUSDec(notaria),
    detalle: `Base ${fmtUSDec(base)} → impuesto 1% ${fmtUSDec(impuesto)} + notaría ${fmtUSDec(notaria)} + trámite ${fmtUSDec(gastosTramite)} = ${fmtUSDec(total)}.`,
    _insight,
    _chart,
  };
}
