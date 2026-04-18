export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function edadIngresoEscolarPrimariaJardin(i: Inputs): Outputs {
  const f=String(i.fechaNac||''); const n=String(i.nivel||'jardin3');
  if (!f) return { anio:'—', edad:'—', resumen:'Ingresá fecha nacimiento.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { anio:'—', edad:'—', resumen:'Fecha inválida.' };
  const edades:Record<string,number>={jardin3:3,preescolar:5,primaria:6,secundaria:12};
  const e=edades[n]||6;
  const anio=d.getFullYear()+e;
  return { anio:anio.toString(), edad:`${e} años`, resumen:`Nacido ${d.getFullYear()}: ingresa ${n} en ${anio} con ${e} años.` };
}
