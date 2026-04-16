export interface Inputs { nombre: string; apellido: string; estilo?: string; }
export interface Outputs { nombreRapero: string; mensaje: string; }
function clean(s:string):string{return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z]/g,'');}
function cap(s:string):string{return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();}
const PRE_TRAP=['Lil','Young','Baby','El','La','Bad'];
const PRE_OLD=['Big','MC','DJ','Grand','OG','Don'];
const PRE_FREE=['El','La','King','Queen','Rima','Flow'];
export function nombreRapper(i: Inputs): Outputs {
  const nom = clean(String(i.nombre||''));const ape = clean(String(i.apellido||''));
  if(!nom||!ape) throw new Error('Ingresá nombre y apellido');
  const estilo = String(i.estilo||'trap');
  const hash = (nom+ape).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const pres = estilo==='old-school'?PRE_OLD:estilo==='freestyle'?PRE_FREE:PRE_TRAP;
  const pre = pres[hash%pres.length];
  const bases = [cap(nom.slice(0,4)),cap(ape.slice(0,4)),cap(nom.slice(0,2)+ape.slice(0,2)),cap(ape.slice(0,3)+nom.slice(-1))];
  const base = bases[(hash*3)%bases.length];
  const nombre = `${pre} ${base}`;
  const estiloDesc = estilo==='old-school'?'Old school, boom bap, flow clásico.':estilo==='freestyle'?'Freestyle, batalla, improvisación pura.':'Trap argentino, urban, flow moderno.';
  return { nombreRapero: nombre, mensaje: `${nombre} — ${estiloDesc} Listo para romperla en el escenario.` };
}
