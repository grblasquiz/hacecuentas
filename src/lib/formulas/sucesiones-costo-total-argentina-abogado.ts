export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sucesionesCostoTotalArgentinaAbogado(i: Inputs): Outputs {
  const v=Number(i.valorPatrimonio)||0; const c=String(i.complejidad||'simple');
  const pct:Record<string,number>={'simple':0.04,'mediana':0.08,'compleja':0.15};
  const hon=v*(pct[c]||0.04); const tasa=v*0.015; const total=hon+tasa;
  return { honorarios:`$${Math.round(hon).toLocaleString('es-AR')}`, tasaJusticia:`$${Math.round(tasa).toLocaleString('es-AR')}`, costoTotal:`$${Math.round(total).toLocaleString('es-AR')}` };
}
