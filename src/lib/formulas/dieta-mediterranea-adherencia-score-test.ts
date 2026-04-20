export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dietaMediterraneaAdherenciaScoreTest(i: Inputs): Outputs {
  const a=String(i.aceiteOliva||'no')==='si'?1:0;
  const p=String(i.pescadoSemana||'no')==='si'?1:0;
  const v=String(i.vinoTintoDiario||'no')==='si'?1:0;
  const f=String(i.frutasDiarias||'no')==='si'?1:0;
  const total=a+p+v+f;
  const adh=total>=3?'Alta':total>=2?'Media':'Baja';
  const cons=total<3?'Sumá más vegetales, pescado y aceite oliva.':'Buena base. Optimizar detalles.';
  return { puntaje:`${total}/4 (versión reducida)`, adherencia:adh, consejo:cons };
}
