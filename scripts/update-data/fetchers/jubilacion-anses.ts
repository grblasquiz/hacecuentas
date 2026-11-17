/** ANSES mensual: IMSS + resolución oficial con centavos. Sin IPC proyectado ni LLM. */
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { reportMode, reportWarn } from '../utils/run-status.ts';
const IMSS = 'https://www.argentina.gob.ar/trabajo/seguridadsocial/imss';
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export function officialText(html: string): string {
 return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ')
 .replace(/&nbsp;|&#160;|\u00a0/gi,' ').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();
}
const amount = (s: string) => Number(s.replace(/\./g,'').replace(',','.'));
export function identifyAnsesSource(html: string, day: string) {
 const text=officialText(html), publication=text.match(/Publicación\s+([a-záéíóú]+)\s*\/\s*(\d{4})/i);
 if(!publication) throw new Error('IMSS sin período de publicación');
 const month=MONTHS.indexOf(publication[1].toLowerCase())+1;
 const period=publication[2]+'-'+String(month).padStart(2,'0');
 if(!month || period!==day.slice(0,7)) throw new Error('IMSS no corresponde al mes solicitado: '+period);
 const anchors=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
 const anchor=anchors.find(a=>/Resolución\s+ANSES\s+\d+\/\d{4}/i.test(officialText(a[2])));
 if(!anchor)throw new Error('IMSS sin enlace a resolución ANSES');
 const source=new URL(anchor[1].replace(/&amp;/g,'&'),IMSS);
 if(source.protocol!=='https:'||source.hostname!=='www.boletinoficial.gob.ar')throw new Error('Origen no oficial de resolución');
 return {period,month,year:publication[2],url:source.href,name:officialText(anchor[2])};
}
export function parseAnsesOfficial(imss: string, resolution: string, day: string) {
 const source=identifyAnsesSource(imss,day), text=officialText(resolution);
 const sections=[...text.matchAll(/ART[ÍI]CULO\s+([1-8])\s*[°º]?\s*\.\s*[-–]/gi)];
 function article(n:number){const i=sections.findIndex(m=>Number(m[1])===n);if(i<0)throw new Error('Falta artículo '+n);return text.slice(sections[i].index,sections[i+1]?.index??text.length);}
 function values(n:number){return [...article(n).matchAll(/\$\s*([\d.]+,\d{2})/g)].map(m=>amount(m[1]));}
 if(!new RegExp('mes de '+MONTHS[source.month-1]+' de '+source.year,'i').test(article(1)))throw new Error('Vigencia de resolución no coincide con IMSS');
 const min=values(1),max=values(2),bases=values(3),pbu=values(4),puam=values(5);
 if(min.length!==1||max.length!==1||bases.length!==2||pbu.length!==1||puam.length!==1)throw new Error('Importes oficiales incompletos/ambiguos');
 function row(label:RegExp){const rows=[...imss.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>officialText(m[1]));const found=rows.find(r=>label.test(r));const m=found?.match(/\$\s*([\d.]+(?:,\d{2})?)/);if(!m)throw new Error('Fila IMSS faltante');return amount(m[1]);}
 const imssMin=row(/^Haber mínimo SIPA\s+\$/i),imssMax=row(/^Haber máximo SIPA\s+\$/i),imssPbu=row(/^Prestación Básica Universal/i),imssPuam=row(/^Pensión Universal para el Adulto Mayor/i),bonus=row(/^Bono extrao?r?dinario previsional/i);
 const ceiling=officialText(imss).match(/cantidad necesaria hasta alcanzar la suma de\s*\$\s*([\d.]+,\d{2})/i);
 if(!ceiling||Math.abs(amount(ceiling[1])-(min[0]+bonus))>.02)throw new Error('Regla proporcional del bono no verificada');
 if(Math.abs(min[0]+bonus-row(/^Haber mínimo SIPA con bono/i))>.51)throw new Error('IMSS total con bono inconsistente');
 if([min[0],max[0],pbu[0],puam[0]].some((v,i)=>Math.abs(v-[imssMin,imssMax,imssPbu,imssPuam][i])>.51))throw new Error('Resolución e IMSS discrepan');
 if(min[0]<1000||max[0]<=min[0]||pbu[0]<=0||pbu[0]>=min[0]||Math.abs(puam[0]-min[0]*.8)>.02||bonus<0||bonus>min[0])throw new Error('Relaciones previsionales inválidas');
 const pct=text.match(/resultando.{0,220}?\(([\d.,]+)\s*%\)/i);if(!pct)throw new Error('Movilidad oficial no encontrada');
 const movilidadPct=amount(pct[1]);if(movilidadPct<0||movilidadPct>30)throw new Error('Movilidad fuera de rango');
 const ipc=new Date(Date.UTC(Number(source.year),source.month-3,1)).toISOString().slice(0,7);
 return {periodo:MONTHS[source.month-1]+' '+source.year,mes:source.period,vigenteDesde:source.period+'-01',haberMinimo:min[0],haberMaximo:max[0],puam:puam[0],pbu:pbu[0],baseImponibleMinima:bases[0],baseImponibleMaxima:bases[1],movilidadPct,mesIpc:ipc,bonoMaximo:bonus,fuente:source.name,fuenteUrl:source.url,bonoFuenteUrl:IMSS,lastReviewed:day};
}
export async function fetchJubilacionAnses({dry=false,asOf,snapshotPath}:{dry?:boolean;asOf?:string;snapshotPath?:string}={}) {
 const day=asOf??new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 try {
  const read=async(url:string)=>{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('HTTP '+r.status);return r.text();};
  const imss=await read(IMSS),source=identifyAnsesSource(imss,day),norm=await read(source.url),next=parseAnsesOfficial(imss,norm,day);
  const path=snapshotPath??join(process.cwd(),'src/data/live/anses.json'),previous=JSON.parse(readFileSync(path,'utf8'));
  if(previous.mes>next.mes)throw new Error('No se permite retroceder el snapshot');
  reportMode('jubilacion-anses','deterministic');
  const same=Object.keys(next).filter(k=>k!=='lastReviewed').every(k=>previous[k]===next[k as keyof typeof next]);
  if(same)return false;
  if(!dry){writeFileSync(path+'.tmp',JSON.stringify(next,null,2)+'\n');renameSync(path+'.tmp',path);}
  console.log('[jubilacion-anses] '+(dry?'would update ':'updated ')+next.mes+' desde '+next.fuente);
  return true;
 }catch(e){reportMode('jubilacion-anses','pending');reportWarn('jubilacion-anses',(e as Error).message+'; snapshot oficial preservado');return false;}
}
