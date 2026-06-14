import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoChoferColectivoUtaUrbano(i: Inputs): Outputs {
  const antig = Number(i.antiguedad) || 0;
  const cat = String(i.categoria || 'chofer');
  // Básico conformado del CHOFER (1ra) urbano AMBA vigente JUNIO 2026: $1.545.278,25.
  // Paritaria UTA / cámaras del AMBA (acuerdo dic-2025 a abr-2026), sin nuevos
  // ajustes a junio. Fuente: paritarias UTA jun-2026 (El Destape/iProfesional).
  const BASICO_CHOFER_1RA = 1_545_278.25;
  // Chofer 2da y boletero son categorías menores del mismo CCT 460/73. La paritaria
  // sólo publica el básico del chofer; estas proporciones son ESTIMACIÓN de referencia.
  const ratioCat: Record<string, number> = { chofer: 1, chofer2: 0.95, boletero: 0.9 };
  const basico = BASICO_CHOFER_1RA * (ratioCat[cat] ?? 1);
  // Antigüedad: el CCT paga un monto fijo por año (~$23k/año a jun-2026, ~1,5% del
  // básico). Se modela como 1,5% del básico por año.
  const plusAntig = basico * 0.015 * antig;
  const bruto = basico + plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias = Math.max(0, (bruto - 1_931_926) * 0.05); // simplificación: bruto < MNI ⇒ $0
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const descTotal = jubilacion + obraSocial + pami + ganancias;
  const pctDesc = bruto > 0 ? (descTotal / bruto) * 100 : 0;
  const fmtAr = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'El bolsillo del chofer',
    text: `Sobre un bruto de **${fmtAr(bruto)}** se descuentan **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) en aportes y el neto urbano queda en **${fmtAr(neto)}**. La antigüedad de ${antig} año${antig === 1 ? '' : 's'} suma **${fmtAr(plusAntig)}**; este cálculo es por el básico UTA, sin contar viáticos, suma fija ni horas extra.`,
    tone: 'neutral' as const,
    icon: '🚌',
  };
  return {
    basico: '$' + Math.round(basico).toLocaleString('es-AR'),
    bruto: '$' + bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    neto: '$' + neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    sac: '$' + sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    resumen: `Básico ${cat} ${fmtAr(basico)} (escala UTA jun-2026). Con antigüedad ${antig} años: neto ~${fmtAr(neto)}. Sin viáticos ni suma fija.`,
    _chart: chart,
    _insight: insight,
  };
}
