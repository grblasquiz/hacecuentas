/**
 * Impuestos de importación (Ecuador) — régimen Courier 4x4 (Categoría B) e importación general.
 * - Categoría B / 4x4: paquetes hasta 4 kg y USD 400 FOB, uso personal. Desde 2025 paga
 *   un ARANCEL FIJO de USD 20 + FODINFA 0,5% del CIF. NO paga IVA ni ICE. Tope anual
 *   acumulado USD 1.600; superado, el paquete pasa a Categoría C (importación general).
 *   Fuente: SENAE (aduana.gob.ec), verificado 2026-07-16.
 * - Importación general (Categoría C): AD-VALOREM (% arancel según partida) sobre el CIF,
 *   FODINFA 0,5% del CIF e IVA 15% sobre (CIF + arancel + FODINFA).
 * IVA general 15% (ECUADOR_2026.iva).
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  regimen?: string;     // '4x4' | 'general'
  valorFOB: number;     // valor de la mercancía (FOB)
  flete?: number;       // costo de envío hasta Ecuador
  seguro?: number;      // seguro (opcional)
  adValorem?: number;   // % de arancel ad-valorem (solo Categoría C / general)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const IVA = ECUADOR_2026.iva;       // 0,15
const FODINFA = 0.005;              // 0,5% del CIF
const ARANCEL_4X4 = 20;            // USD fijo por paquete (2025-2026)
const LIMITE_4X4_FOB = 400;        // USD FOB por paquete
const LIMITE_4X4_KG = 4;           // kg por paquete

export function compute(i: Inputs): Outputs {
  const regimen = String(i.regimen || '4x4');
  const fob = Number(i.valorFOB) || 0;
  const flete = Math.max(0, Number(i.flete) || 0);
  const seguro = Math.max(0, Number(i.seguro) || 0);
  const adv = Math.max(0, Number(i.adValorem) || 0) / 100;
  if (fob <= 0) throw new Error('Ingresá el valor FOB de la mercancía');

  const cif = fob + flete + seguro;
  const fodinfa = cif * FODINFA;

  let arancel: number;
  let iva: number;
  let nota: string;

  if (regimen === '4x4') {
    arancel = ARANCEL_4X4;
    iva = 0; // el régimen 4x4 no paga IVA
    nota = fob > LIMITE_4X4_FOB
      ? `Ojo: este paquete supera los ${fmtUSDec(LIMITE_4X4_FOB)} FOB del régimen 4x4 y debería entrar como importación general (Categoría C).`
      : `Régimen 4x4 (Categoría B): arancel fijo de ${fmtUSDec(ARANCEL_4X4)} + FODINFA 0,5%. Sin IVA ni ICE. Límite ${LIMITE_4X4_KG} kg / ${fmtUSDec(LIMITE_4X4_FOB)} por paquete.`;
  } else {
    arancel = cif * adv;
    iva = (cif + arancel + fodinfa) * IVA;
    nota = `Importación general: AD-VALOREM ${Math.round(adv * 100)}% sobre el CIF + FODINFA 0,5% + IVA 15% sobre (CIF + arancel + FODINFA).`;
  }

  const tributos = arancel + fodinfa + iva;
  const total = cif + tributos;

  const _insight = {
    title: 'Lo que pagás al importar',
    text: `Con un CIF de **${fmtUSDec(cif)}**, los tributos suman **${fmtUSDec(tributos)}** (arancel ${fmtUSDec(arancel)} + FODINFA ${fmtUSDec(fodinfa)}${iva > 0 ? ` + IVA ${fmtUSDec(iva)}` : ' + sin IVA'}). El costo total nacionalizado es **${fmtUSDec(total)}**.`,
    tone: 'neutral',
    icon: '📦',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Mercancía (CIF)', value: Math.round(cif * 100) / 100 },
      { label: 'Arancel', value: Math.round(arancel * 100) / 100 },
      { label: 'FODINFA', value: Math.round(fodinfa * 100) / 100 },
      ...(iva > 0 ? [{ label: 'IVA', value: Math.round(iva * 100) / 100 }] : []),
    ],
    ariaLabel: `CIF ${fmtUSDec(cif)}, arancel ${fmtUSDec(arancel)}, FODINFA ${fmtUSDec(fodinfa)}, IVA ${fmtUSDec(iva)}.`,
  };

  return {
    totalPagar: fmtUSDec(total),
    arancel: fmtUSDec(arancel),
    fodinfa: fmtUSDec(fodinfa),
    iva: fmtUSDec(iva),
    tributosTotales: fmtUSDec(tributos),
    detalle: `${nota} Total nacionalizado: ${fmtUSDec(total)}.`,
    _insight,
    _chart,
  };
}
