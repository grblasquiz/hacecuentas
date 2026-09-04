import {readFileSync, existsSync} from 'node:fs';
import {parse} from 'parse5';
const failures=[];
const read=path=>readFileSync(path,'utf8');
const html=path=>{const file=`dist/client${path}.html`; const alternate=`dist/client${path}/index.html`;return read(existsSync(file)?file:alternate)};
function nodes(source){const all=[];const walk=n=>{all.push(n);for(const child of n.childNodes||[])walk(child)};walk(parse(source));return all}
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const links=source=>nodes(source).filter(n=>n.tagName==='a').map(n=>attr(n,'href'));
const start=html('/blog');const pages=[...new Set(links(start).filter(p=>/^\/blog\/pagina\/\d+$/.test(p)))];
if(pages.length<2)failures.push('Blog sin paginación rastreable');
const discovered=new Set([start,...pages.map(html)].flatMap(links));
const indexed=[...read('public/sitemap-blog.xml').matchAll(/<loc>https:\/\/hacecuentas.com([^<]+)<\/loc>/g)].map(m=>m[1]);
for(const path of indexed) if(!discovered.has(path))failures.push(`Blog sin enlace desde el catálogo: ${path}`);
for(const [path,id] of [['/datos-ganancias-2026','scaleBody'],['/datos-topes-sipa-2026','tableBody'],['/blog/escala-ganancias-2026-argentina-tabla-completa-explicada','taxBody'],['/conversores/talles','table'],['/en/fitness/competition-and-rankings','rows'],['/pt/casa/obra-e-manutencao','rows'],['/mx/tramites/costo-de-mis-documentos','compare-body']]){
 const table=nodes(html(path)).find(n=>n.tagName==='tbody'&&attr(n,'id')===id);
 if(!table?.childNodes?.some(n=>n.tagName==='tr'))failures.push(`Tabla vacía sin JavaScript: ${path} #${id}`);
}
for(const [path,fields,cases] of [['/en/math/algebra',8,6],['/en/math/geometry-trigonometry',6,4],['/matematica/ecuaciones-y-polinomios',10,5]]){
 const ns=nodes(html(path));
 if(ns.filter(n=>n.attrs?.some(a=>a.name==='data-field')).length<fields) failures.push(`${path}: campos prometidos ausentes`);
 if(ns.filter(n=>n.attrs?.some(a=>a.name==='data-case')).length<cases) failures.push(`${path}: modos de cálculo ausentes`);
 if(ns.filter(n=>n.tagName==='h1').length!==1)failures.push(`${path}: H1 duplicado`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`[seo-repairs] PASS: ${indexed.length} artículos enlazados, 7 tablas SSR, 3 calculadoras completas`);
