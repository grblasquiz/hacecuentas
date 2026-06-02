export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function subteColectivoSubeTarifa2026Mensual(i: Inputs): Outputs {
  const v=Number(i.viajesMensuales)||0; const tc=Number(i.tarifaColectivo)||0; const ts=Number(i.tarifaSubte)||0;
  const prom=(tc+ts)/2;
  const costo=v*prom;
  const social=costo*0.45;
  const ahorroSocial=costo-social;
  const _insight = {
    title: 'Tu gasto en transporte',
    text: `Hacés **${v} viajes/mes** a un promedio de **$${Math.round(prom).toLocaleString('es-AR')}** entre colectivo y subte: **$${Math.round(costo).toLocaleString('es-AR')}/mes**. Con la **tarifa social** (55% off) pagarías solo **$${Math.round(social).toLocaleString('es-AR')}**, ahorrando **$${Math.round(ahorroSocial).toLocaleString('es-AR')}/mes**.`,
    tone: 'neutral',
    icon: '🚇',
  };
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, tarifaSocial:`$${Math.round(social).toLocaleString('es-AR')}`, interpretacion:`${v} viajes × $${Math.round(prom).toLocaleString('es-AR')} promedio = $${Math.round(costo).toLocaleString('es-AR')}/mes. Con tarifa social: $${Math.round(social).toLocaleString('es-AR')}.`, _insight };
}
