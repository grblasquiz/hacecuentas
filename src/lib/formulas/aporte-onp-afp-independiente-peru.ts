/** Aporte previsional para independientes Perú — ONP (13%) o AFP (10% + comisión + prima). */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  ingreso: number;
  sistema?: string;        // 'ONP' | 'AFP'
  afp?: string;            // 'Habitat' | 'Integra' | 'Prima' | 'Profuturo'
  incluyeSeguro?: string;  // 'si' | 'no' — suma la prima de seguro (AFP)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingreso) || 0;
  const sistema = String(i.sistema || 'AFP').toUpperCase() === 'ONP' ? 'ONP' : 'AFP';
  const afp = String(i.afp || 'Habitat');
  const incluyeSeguro = String(i.incluyeSeguro || 'si') === 'si';
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');

  // La base de aporte no puede ser menor a la RMV.
  const base = Math.max(ingreso, PERU_2026.rmv);
  const baseMinimaAplicada = base > ingreso;

  let aporteFondo = 0, comisionPrima = 0, total = 0;
  let detalleSistema = '';

  if (sistema === 'ONP') {
    aporteFondo = base * PERU_2026.onp; // 13%
    comisionPrima = 0;
    total = aporteFondo;
    detalleSistema = `ONP: 13% de ${fmtPEN(base)}`;
  } else {
    aporteFondo = base * PERU_2026.afp.fondo; // 10%
    const comFlujo = (PERU_2026.afp.comisionFlujo as Record<string, number>)[afp] ?? PERU_2026.afp.comisionFlujo.Habitat;
    const comision = base * comFlujo;
    const prima = incluyeSeguro ? base * PERU_2026.afp.primaSeguro : 0;
    comisionPrima = comision + prima;
    total = aporteFondo + comisionPrima;
    detalleSistema = `AFP ${afp}: 10% fondo + ${(comFlujo * 100).toFixed(2)}% comisión${incluyeSeguro ? ` + ${(PERU_2026.afp.primaSeguro * 100).toFixed(2)}% prima` : ''} sobre ${fmtPEN(base)}`;
  }

  const _insight = {
    title: 'Tu aporte previsional como independiente',
    text: `Con un ingreso de **${fmtPEN(ingreso)}**${baseMinimaAplicada ? ` (la base se eleva a la RMV de ${fmtPEN(PERU_2026.rmv)})` : ''} en **${sistema}**, tu aporte mensual estimado es de **${fmtPEN(total)}**: **${fmtPEN(aporteFondo)}** al fondo${sistema === 'AFP' ? ` y **${fmtPEN(comisionPrima)}** de comisión y prima` : ''}. ${sistema === 'AFP' ? 'La prima de seguro (~1,74%) es referencial y la fija la SBS por trimestre; verificá el valor vigente.' : 'En ONP el 13% va a un fondo común estatal que paga pensión recién con 20 años de aportes.'}`,
    tone: 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fondo', value: Math.round(aporteFondo) },
      { label: 'Comisión + prima', value: Math.round(comisionPrima) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Aporte mensual',
    ariaLabel: `Aporte previsional ${sistema}: ${fmtPEN(total)} mensuales.`,
  };

  return {
    aporteFondo: fmtPEN(aporteFondo),
    comisionPrima: fmtPEN(comisionPrima),
    total: fmtPEN(total),
    detalle: `${detalleSistema} = ${fmtPEN(total)} al mes.`,
    _insight,
    _chart,
  };
}
