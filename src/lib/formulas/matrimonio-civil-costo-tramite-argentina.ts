export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function matrimonioCivilCostoTramiteArgentina(i: Inputs): Outputs {
  const p=String(i.provincia||'caba'); const s=String(i.sede||'ofic');
  const c=s==='ofic'?0:(p==='caba'?250000:200000);
  return { costo:c===0?'Gratuito':'$'+c.toLocaleString('es-AR'), documentos:'DNI + partida + 2 testigos + turno', resumen:`Matrimonio ${p} ${s}: ${c===0?'gratuito':'$'+c.toLocaleString('es-AR')}.` };
}
