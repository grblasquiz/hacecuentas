export interface Inputs { nombre: string; genero?: string; }
export interface Outputs { nombreElfico: string; significado: string; mensaje: string; _insight?: any; }
function clean(s:string):string{return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');}
const RAICES=['Gal','Eä','Celeb','Anar','Ithil','Nim','Faer','Maer','Elen','Tinu','Laer','Hir'];
const SUF_M=['thon','ion','dil','nor','las','orn','we','gon'];
const SUF_F=['iel','wen','riel','eth','il','ril','iel','ith'];
const SUF_N=['dil','las','nor','fin','rin','wen','ion','el'];
const SIGS:Record<string,string>={'Gal':'luz','Eä':'ser','Celeb':'plata','Anar':'sol','Ithil':'luna','Nim':'blanco','Faer':'espíritu','Maer':'bello','Elen':'estrella','Tinu':'chispa','Laer':'canción','Hir':'señor'};
const SUF_SIGS_M:Record<string,string>={'thon':'guerrero','ion':'hijo','dil':'amigo','nor':'tierra','las':'hoja','orn':'árbol','we':'persona','gon':'piedra'};
const SUF_SIGS_F:Record<string,string>={'iel':'hija','wen':'doncella','riel':'coronada','eth':'mujer','il':'brillo','ril':'resplandor','ith':'flor'};
export function nombreElfo(i: Inputs): Outputs {
  const nom = clean(String(i.nombre||''));
  if (!nom) throw new Error('Ingresá tu nombre');
  const g = String(i.genero||'m');
  const hash = nom.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const raiz = RAICES[hash % RAICES.length];
  const sufArr = g==='f'?SUF_F:g==='nb'?SUF_N:SUF_M;
  const sigArr = g==='f'?SUF_SIGS_F:SUF_SIGS_M;
  const suf = sufArr[(hash*7) % sufArr.length];
  const nombre = raiz + suf;
  const sigRaiz = SIGS[raiz]||'noble';
  const sigSuf = sigArr[suf]||'del bosque';
  const display = nombre.charAt(0).toUpperCase()+nombre.slice(1);
  const casa = g==='f' ? 'las doncellas de Lothlórien' : g==='nb' ? 'los guardianes del bosque' : 'los señores de Rivendell';
  return {
    nombreElfico: display,
    significado: `${sigRaiz} + ${sigSuf}`,
    mensaje: `${display} — '${sigSuf} de ${sigRaiz}' en Sindarin. Un nombre digno de la Tierra Media.`,
    _insight: {
      title: 'Tu identidad élfica',
      text: `**${display}** significa "${sigSuf} de ${sigRaiz}": un nombre que sonaría natural entre **${casa}**. Compartilo y desafiá a tus amigos a sacar el suyo.`,
      tone: 'good',
      icon: '🧝',
    },
  };
}
