export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cognadosIdiomaPorcentajeEspanolAyuda(i: Inputs): Outputs {
  const id=String(i.idioma||'italiano');
  const c:Record<string,[string,string]>={italiano:['~82%','Altísima'],portugues:['~89%','Altísima'],frances:['~75%','Alta'],ingles:['~30-40%','Media'],aleman:['~25%','Baja'],japones:['~0%','Nula']};
  const [pct,vn]=c[id]||c.italiano;

  const altas=vn==='Altísima'||vn==='Alta';
  const tono=altas?'good':vn==='Media'?'neutral':'warn';
  const lectura=altas
    ?`vas a reconocer buena parte del vocabulario casi sin estudiar; arrancás con una **ventaja enorme**`
    :vn==='Media'
      ?`hay un puente útil de palabras compartidas, pero la gramática y el resto pesan más`
      :`casi no hay atajos desde el español: prepárate para empezar **casi de cero**`;
  const insight={
    title:`El español te ayuda en ${id}`,
    text:`El **${id}** comparte **${pct}** de cognados con el español (ventaja **${vn.toLowerCase()}**): ${lectura}.`,
    tone:tono,
    icon:'🗣️',
  };

  return { pct, ventaja:vn, resumen:`${id}: ${pct} cognados con ES. Ventaja ${vn}.`, _insight:insight };
}
