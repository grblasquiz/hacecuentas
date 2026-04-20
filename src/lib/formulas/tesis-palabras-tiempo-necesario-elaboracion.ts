export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tesisPalabrasTiempoNecesarioElaboracion(i: Inputs): Outputs {
  const p=Number(i.palabras)||0; const ps=Number(i.palabrasSemana)||1;
  const s=p/ps; const m=s/4.33;
  const rec=s>26?'Muy largo. Aumenta ritmo o consulta con tu directora.':s>12?'Razonable.':'Buen ritmo — mantenelo.';
  return { semanas:`${Math.ceil(s)} semanas`, meses:`${m.toFixed(1)} meses`, recomendacion:rec };
}
