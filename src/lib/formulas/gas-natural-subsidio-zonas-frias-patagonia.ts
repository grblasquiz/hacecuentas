export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gasNaturalSubsidioZonasFriasPatagonia(i: Inputs): Outputs {
  const m=Number(i.m3Mes)||0; const z=String(i.zona||'sin_subsidio'); const tb=Number(i.tarifaBase)||200;
  const desc={'patagonia':0.6,'cordillera':0.5,'resto_sur':0.3,'sin_subsidio':0}[z];
  const costo=m*tb*(1-desc)*1.21;
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, descuentoAplicado:`${(desc*100).toFixed(0)}%`, interpretacion:`Zona ${z.replace('_',' ')}: pagás $${Math.round(costo).toLocaleString('es-AR')} (${(desc*100).toFixed(0)}% subsidio).` };
}
