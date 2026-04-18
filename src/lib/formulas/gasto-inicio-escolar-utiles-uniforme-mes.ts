export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gastoInicioEscolarUtilesUniformeMes(i: Inputs): Outputs {
  const n=String(i.nivel||'primaria'); const p=String(i.privado||'no')==='si';
  const uti:Record<string,number>={inicial:75,primaria:150,secundaria:225};
  const uni=p?300:0;
  const u=uti[n]||150;
  return { util:`$${u}`, uniforme:`$${uni}`, total:`$${u+uni}`, resumen:`${n} ${p?'privada':'pública'}: útiles $${u} + uniforme $${uni} = $${u+uni}.` };
}
