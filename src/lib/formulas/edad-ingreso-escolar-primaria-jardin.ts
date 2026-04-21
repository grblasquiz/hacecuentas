export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function edadIngresoEscolarPrimariaJardin(i: Inputs): Outputs {
  const f=String(i.fechaNac||''); const n=String(i.nivel||'jardin3');
  if (!f) return { anio:'—', edad:'—', resumen:'Ingresá fecha nacimiento.' };
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { anio:'—', edad:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { anio:'—', edad:'—', resumen:'Fecha inválida.' };
  const edades:Record<string,number>={jardin3:3,preescolar:5,primaria:6,secundaria:12};
  const e=edades[n]||6;
  const anio=d.getFullYear()+e;
  return { anio:anio.toString(), edad:`${e} años`, resumen:`Nacido ${d.getFullYear()}: ingresa ${n} en ${anio} con ${e} años.` };
}
