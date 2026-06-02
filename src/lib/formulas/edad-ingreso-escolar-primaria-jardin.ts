export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
  const nombres:Record<string,string>={jardin3:'Jardín (sala de 3)',preescolar:'Preescolar (sala de 5)',primaria:'1.º grado de primaria',secundaria:'1.º año de secundaria'};
  const nivelLabel=nombres[n]||'la escuela';
  const _insight={
    title:'Cuándo arranca la escuela',
    text:`Naciendo en **${d.getFullYear()}**, le corresponde empezar **${nivelLabel}** en **${anio}**, al cumplir **${e} años**. El corte de matrícula suele exigir tener la edad cumplida al 30/06 o 31/12 del año de ingreso, así que conviene chequear la fecha exacta de nacimiento contra el reglamento de la escuela.`,
    tone:'neutral' as const,
    icon:'🎒',
  };
  return { anio:anio.toString(), edad:`${e} años`, resumen:`Nacido ${d.getFullYear()}: ingresa ${n} en ${anio} con ${e} años.`, _insight };
}
