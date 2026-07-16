/**
 * Canasta Básica en salarios mínimos (integrales) — Venezuela.
 *
 * La cifra que la prensa publica cada mes ("la canasta cuesta X salarios
 * mínimos") sale de dividir el costo de la Canasta Básica Familiar (CENDAS-FVM)
 * entre el ingreso mensual del hogar:
 *
 *   salariosMinimos  = canastaBasica / ingresoMensual
 *   deficit          = canastaBasica − ingresoMensual   (si > 0)
 *   porcentajeCubierto = ingresoMensual / canastaBasica × 100
 *
 * Ambos montos se ingresan (en USD o Bs.) porque cambian mes a mes: la canasta
 * la publica CENDAS y el ingreso integral depende del salario + cestaticket +
 * bono de guerra vigentes. La tasa BCV (para pasar USD↔Bs.) sale del módulo.
 *
 * Fuente: CENDAS-FVM (Canasta Básica Familiar), BCV (conversión).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  canastaBasica?: number;
  canastaMoneda?: string;  // 'usd' | 'bs' (default 'usd')
  ingresoMensual?: number;
  ingresoMoneda?: string;  // 'usd' | 'bs' (default 'usd')
  tasaBcv?: number;        // Bs. por USD; default BCV en vivo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function compute(i: Inputs): Outputs {
  const tasaBcv = i.tasaBcv != null && Number(i.tasaBcv) > 0 ? Number(i.tasaBcv) : VENEZUELA_2026.fx.bcv;
  const canastaIn = Math.max(0, Number(i.canastaBasica) || 0);
  const ingresoIn = Math.max(0, Number(i.ingresoMensual) || 0);
  if (canastaIn <= 0) throw new Error('Ingresá el costo de la canasta básica (CENDAS)');
  if (ingresoIn <= 0) throw new Error('Ingresá el ingreso mensual del hogar');

  const canastaMoneda = String(i.canastaMoneda ?? 'usd') === 'bs' ? 'bs' : 'usd';
  const ingresoMoneda = String(i.ingresoMoneda ?? 'usd') === 'bs' ? 'bs' : 'usd';

  // Normalizar todo a USD para comparar (independiente de la tasa).
  const canastaUsd = canastaMoneda === 'usd' ? canastaIn : canastaIn / tasaBcv;
  const ingresoUsd = ingresoMoneda === 'usd' ? ingresoIn : ingresoIn / tasaBcv;
  const canastaBs = canastaUsd * tasaBcv;
  const ingresoBs = ingresoUsd * tasaBcv;

  const salariosMinimos = ingresoUsd > 0 ? canastaUsd / ingresoUsd : 0;
  const deficitUsd = Math.max(0, canastaUsd - ingresoUsd);
  const deficitBs = deficitUsd * tasaBcv;
  const porcentajeCubierto = canastaUsd > 0 ? (ingresoUsd / canastaUsd) * 100 : 0;

  const narrativa =
    `Una canasta básica de ${fmtUSD(canastaUsd)} (${fmtVES(canastaBs)}) frente a un ingreso de ${fmtUSD(ingresoUsd)} (${fmtVES(ingresoBs)}) ` +
    `equivale a ${salariosMinimos.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ingresos mensuales: el ingreso cubre el ${porcentajeCubierto.toLocaleString('de-DE', { maximumFractionDigits: 1 })}% de la canasta` +
    (deficitUsd > 0 ? `, con un déficit de ${fmtUSD(deficitUsd)} (${fmtVES(deficitBs)}) al mes.` : `, alcanzando a cubrirla.`);

  return {
    salariosMinimos: Number(salariosMinimos.toFixed(2)),
    deficitMensualUsd: Number(deficitUsd.toFixed(2)),
    deficitMensualBs: Number(deficitBs.toFixed(2)),
    porcentajeCubierto: Number(porcentajeCubierto.toFixed(1)),
    detalle: `La canasta equivale a ${salariosMinimos.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ingresos mensuales (cubrís el ${porcentajeCubierto.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%)`,
    _insight: { type: deficitUsd > 0 ? 'warning' : 'highlight', icon: deficitUsd > 0 ? '⚠️' : '🛒', text: narrativa },
    _table: {
      title: 'Canasta básica frente al ingreso mensual',
      headers: ['Concepto', 'En dólares', 'En bolívares (BCV)'],
      rows: [
        ['Canasta básica (CENDAS)', fmtUSD(canastaUsd), fmtVES(canastaBs)],
        ['Ingreso mensual del hogar', fmtUSD(ingresoUsd), fmtVES(ingresoBs)],
        ['Ingresos que hacen falta', `${salariosMinimos.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ×`, '—'],
        ['Déficit mensual', fmtUSD(deficitUsd), fmtVES(deficitBs)],
      ],
      note: 'La Canasta Básica Familiar la publica mensualmente el CENDAS-FVM; el ingreso mensual depende del salario, el cestaticket y el bono de guerra vigentes. Ambos se ingresan porque cambian cada mes.',
    },
  };
}
