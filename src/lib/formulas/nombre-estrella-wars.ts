export interface Inputs { nombre: string; apellido: string; apellidoMaterno: string; ciudad: string; }
export interface Outputs { nombreStarWars: string; titulo: string; mensaje: string; }
function clean(s: string): string { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z]/g,''); }
function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
export function nombreEstrellaWars(i: Inputs): Outputs {
  const nom = clean(String(i.nombre||'')); const ape = clean(String(i.apellido||''));
  const mat = clean(String(i.apellidoMaterno||'')); const ciu = clean(String(i.ciudad||''));
  if (!nom||!ape||!mat||!ciu) throw new Error('Completá todos los campos');
  const first = cap(ape.slice(0,3) + nom.slice(0,2));
  const last = cap(mat.slice(0,2) + ciu.slice(0,3));
  const hash = (nom+ape+mat+ciu).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const titulos = ['Maestro/a Jedi','Caballero Jedi','Padawan','Lord Sith','Contrabandista','Senador/a','Cazarrecompensas','Piloto rebelde','General de la Resistencia','Mandaloriano/a'];
  const titulo = titulos[hash % titulos.length];
  const planetas = ['Coruscant','Tatooine','Naboo','Endor','Dagobah','Mandalore','Bespin','Jakku'];
  const planeta = planetas[hash % planetas.length];
  return { nombreStarWars: `${first} ${last}`, titulo, mensaje: `${first} ${last}, ${titulo} del planeta ${planeta}. Que la Fuerza te acompañe.` };
}
