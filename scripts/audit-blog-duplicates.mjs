import {readFileSync,readdirSync} from 'node:fs';
const redirects=new Set([...readFileSync('src/lib/pruning-redirects.ts','utf8').matchAll(/'([^']+)':/g)].map(m=>m[1]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s*\|\s*hace cuentas$/,'').replace(/[^a-z0-9]+/g,' ').trim();
const seen=new Map(),failures=[];
for(const file of readdirSync('src/content/blog').filter(p=>p.endsWith('.json'))){
 const p=JSON.parse(readFileSync(`src/content/blog/${file}`,'utf8'));
 if(p.noindex||p.canonicalSlug||redirects.has(`/blog/${p.slug}`))continue;
 const key=normalize(p.title)+'|'+normalize(p.description);
 if(seen.has(key))failures.push(`${seen.get(key)} y ${p.slug}: mismo título y descripción; consolidar antes de publicar`);
 seen.set(key,p.slug);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`[blog-duplicates] PASS: ${seen.size} artículos activos sin título y descripción duplicados`);
