/** Comparador de comisiones AFP Perú — costo mensual total por AFP (Habitat, Integra, Prima, Profuturo). */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;
  primaSeguro?: number; // % de prima de seguro (editable, varía por trimestre SBS). Default 1.74.
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  // Prima de seguro editable (la SBS la fija cada trimestre; default 1,74%).
  const primaPct = (i.primaSeguro === undefined || i.primaSeguro === null || Number.isNaN(Number(i.primaSeguro)))
    ? PERU_2026.afp.primaSeguro * 100
    : Number(i.primaSeguro);
  const primaSeguro = sueldo * (primaPct / 100);

  const aporteFondo = sueldo * PERU_2026.afp.fondo; // 10% obligatorio
  const com = PERU_2026.afp.comisionFlujo;          // { Habitat, Integra, Prima, Profuturo }

  const totalDe = (c: number) => aporteFondo + primaSeguro + sueldo * c;
  const habitat = totalDe(com.Habitat);
  const integra = totalDe(com.Integra);
  const prima = totalDe(com.Prima);
  const profuturo = totalDe(com.Profuturo);

  // La menor comisión por flujo es la que conviene a igualdad de rentabilidad/servicio.
  const ranking = [
    { afp: 'Habitat', com: com.Habitat, total: habitat },
    { afp: 'Integra', com: com.Integra, total: integra },
    { afp: 'Prima', com: com.Prima, total: prima },
    { afp: 'Profuturo', com: com.Profuturo, total: profuturo },
  ].sort((a, b) => a.com - b.com);
  const mejor = ranking[0];
  const peor = ranking[ranking.length - 1];
  const ahorroMensual = peor.total - mejor.total;

  const recomendada = `${mejor.afp} (${(mejor.com * 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}% de comisión por flujo)`;

  const _insight = {
    title: 'Cuál AFP te descuenta menos',
    text: `Sobre un sueldo de **${fmtPEN(sueldo)}**, las 4 AFP te cobran el mismo **10% al fondo** (${fmtPEN(aporteFondo)}) y la misma **prima de seguro** (~${primaPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}% = ${fmtPEN(primaSeguro)}). La diferencia está en la **comisión por flujo**: con **${mejor.afp}** pagás **${fmtPEN(mejor.total)}** al mes y con **${peor.afp}** **${fmtPEN(peor.total)}** — una diferencia de **${fmtPEN(ahorroMensual)}** mensuales. A igualdad de rentabilidad, conviene la comisión más baja.`,
    tone: 'good',
    icon: '🏦',
  };
  const _chart = {
    type: 'bar',
    labels: ['Habitat', 'Integra', 'Prima', 'Profuturo'],
    values: [Math.round(habitat), Math.round(integra), Math.round(prima), Math.round(profuturo)],
    prefix: 'S/ ',
    ariaLabel: `Descuento mensual total por AFP: Habitat ${fmtPEN(habitat)}, Integra ${fmtPEN(integra)}, Prima ${fmtPEN(prima)}, Profuturo ${fmtPEN(profuturo)}.`,
  };

  return {
    habitat: fmtPEN(habitat),
    integra: fmtPEN(integra),
    prima: fmtPEN(prima),
    profuturo: fmtPEN(profuturo),
    recomendada,
    detalle: `Fondo ${fmtPEN(aporteFondo)} (10%) + prima ${fmtPEN(primaSeguro)} (${primaPct.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%) iguales en las 4 AFP · comisión por flujo distinta. Menor: ${recomendada}.`,
    _insight,
    _chart,
  };
}
