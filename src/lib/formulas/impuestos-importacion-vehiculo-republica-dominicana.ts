/**
 * Impuestos de importación / nacionalización ("desaduanar") de un vehículo en
 * República Dominicana. Estructura DGA (Dirección General de Aduanas) + DGII:
 *   Gravamen (arancel) → ISC por cilindrada → ITBIS → Primera Placa + CO₂.
 * Fuentes: DGA (calculadora de impuestos de vehículos) y DGII. ITBIS 18% del módulo país.
 */
import { REPUBLICA_DOMINICANA_2026 as RD, fmtDOP, usdToDop } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  cifUsd: number;        // valor CIF (precio + flete + seguro) en USD
  origen?: string;       // 'usa' | 'caricom' | 'ue' | 'otro'
  cilindrada?: string;   // 'e0' | 'e16' | 'e32' | 'e50' | 'e130'
  co2?: string;          // 'c0' | 'c1' | 'c2' | 'c3'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Arancel según origen (DR-CAFTA/EE.UU. 0%, CARICOM 5%, UE-EPA 10%, resto 20%).
const ARANCEL: Record<string, number> = { usa: 0, caricom: 0.05, ue: 0.10, otro: 0.20 };
// ISC (Impuesto Selectivo al Consumo) por cilindrada del motor. DGA.
const ISC: Record<string, number> = { e0: 0, e16: 0.16, e32: 0.32, e50: 0.50, e130: 1.30 };
// Impuesto por emisiones de CO₂ (Norma 06-2012), % del CIF según g/km.
const CO2: Record<string, number> = { c0: 0, c1: 0.01, c2: 0.02, c3: 0.03 };
const PRIMERA_PLACA = 0.17; // DGII: 17% del CIF (impuesto de primera placa)

export function compute(i: Inputs): Outputs {
  const usd = Number(i.cifUsd) || 0;
  if (usd <= 0) throw new Error('Ingresá el valor CIF del vehículo en USD');
  const origen = i.origen && ARANCEL[i.origen] !== undefined ? i.origen : 'usa';
  const cil = i.cilindrada && ISC[i.cilindrada] !== undefined ? i.cilindrada : 'e16';
  const co2k = i.co2 && CO2[i.co2] !== undefined ? i.co2 : 'c1';

  const cif = usdToDop(usd);                          // CIF en RD$
  const gravamen = cif * ARANCEL[origen];             // arancel
  const isc = (cif + gravamen) * ISC[cil];            // ISC sobre CIF + arancel
  const itbis = (cif + gravamen + isc) * RD.itbis;    // ITBIS 18% sobre CIF+arancel+ISC
  const primeraPlaca = cif * PRIMERA_PLACA;           // 17% del CIF
  const impCo2 = cif * CO2[co2k];                     // 0–3% del CIF
  const totalImpuestos = gravamen + isc + itbis + primeraPlaca + impCo2;
  const costoTotal = cif + totalImpuestos;
  const pctSobreCif = cif > 0 ? (totalImpuestos / cif) * 100 : 0;

  const _insight = {
    title: 'Impuestos para nacionalizar el vehículo',
    text: `Sobre un CIF de **${fmtDOP(cif)}** (US$ ${usd.toLocaleString('de-DE')}), los impuestos suman **${fmtDOP(totalImpuestos)}** — un **${pctSobreCif.toFixed(1)}%** del valor CIF. El vehículo, ya con placa, te queda en **${fmtDOP(costoTotal)}**. El ISC por cilindrada es el componente que más mueve el total.`,
    tone: pctSobreCif > 60 ? 'warn' : 'neutral',
    icon: '🚗',
  };
  const _chart = {
    type: 'bar',
    labels: ['Gravamen', 'ISC', 'ITBIS', 'Primera placa', 'CO₂'],
    values: [Math.round(gravamen), Math.round(isc), Math.round(itbis), Math.round(primeraPlaca), Math.round(impCo2)],
    prefix: 'RD$ ',
    ariaLabel: `Desglose de impuestos de importación del vehículo.`,
  };

  return {
    cif: fmtDOP(cif),
    gravamen: fmtDOP(gravamen),
    isc: fmtDOP(isc),
    itbis: fmtDOP(itbis),
    primeraPlaca: fmtDOP(primeraPlaca),
    impCo2: fmtDOP(impCo2),
    totalImpuestos: fmtDOP(totalImpuestos),
    costoTotal: fmtDOP(costoTotal),
    detalle: `CIF ${fmtDOP(cif)} · impuestos ${fmtDOP(totalImpuestos)} (${pctSobreCif.toFixed(1)}% del CIF) · costo nacionalizado ${fmtDOP(costoTotal)}.`,
    _insight,
    _chart,
  };
}
