import { reportWarn } from '../utils/run-status.ts';
import { parse } from 'parse5';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

export const UI_SOURCE = 'https://www.gub.uy/direccion-general-impositiva/datos-y-estadisticas/datos/unidad-indexada';
export const UR_SOURCE = 'https://www.gub.uy/direccion-general-impositiva/datos-y-estadisticas/datos/unidad-reajustable-ur';
const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre'];
const text = (n: any): string => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join(' ');
const nodes = (root: any): any[] => [root, ...(root.childNodes || []).flatMap(nodes)];
const number = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').trim());
export function parseUruguayUnits(uiHtml: string, urHtml: string, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Fecha de referencia inválida');
  const ui = new Map<string, number>();
  for (const table of nodes(parse(uiHtml)).filter(n => n.tagName === 'table')) {
    for (const tr of nodes(table).filter(n => n.tagName === 'tr')) {
      const cells = (tr.childNodes || []).filter((n: any) => ['td','th'].includes(n.tagName)).map(text);
      for (let i=0; i+1<cells.length; i+=2) {
        const m = cells[i].trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) continue;
        const date = `${m[3]}-${m[2]}-${m[1]}`;
        if (date !== today) continue; // Esta tarea valida el día solicitado, no una serie histórica.
        const value=number(cells[i+1]);
        if (!Number.isFinite(value) || value<1 || value>100) throw new Error('UI fuera de rango');
        if (ui.has(date) && ui.get(date)!==value) throw new Error('UI duplicada con valores distintos');
        ui.set(date,value);
      }
    }
  }
  // No reemplazar un snapshot válido por otro viejo ni usar valores futuros.
  if (!ui.has(today)) throw new Error(`DGI no publicó UI para ${today}; se conserva el archivo anterior`);
  const month = today.slice(0,7);
  const previous = new Date(`${month}-01T12:00:00Z`); previous.setUTCMonth(previous.getUTCMonth()-1);
  const urMonth = previous.toISOString().slice(0,7), year=urMonth.slice(0,4), monthName=months[previous.getUTCMonth()];
  let ur: number|undefined;
  for (const table of nodes(parse(urHtml)).filter(n => n.tagName === 'table')) {
    const caption = nodes(table).find(n => n.tagName === 'caption');
    if (!caption || !new RegExp(`\\b${year}\\b`).test(text(caption))) continue;
    for (const tr of nodes(table).filter(n => n.tagName === 'tr')) {
      const cells = (tr.childNodes || []).filter((n: any) => ['td','th'].includes(n.tagName)).map(text);
      if (cells[0]?.trim().toLowerCase().replace('septiembre','setiembre')===monthName) ur=number(cells[1] || '');
    }
  }
  if (!ur || !Number.isFinite(ur) || ur<100 || ur>10000) throw new Error(`UR de ${urMonth} no publicada o inválida`);
  return { ui:{value:ui.get(today)!,date:today,source:UI_SOURCE}, ur:{value:ur,month:urMonth,validFrom:`${month}-01`,source:UR_SOURCE} };
}
export async function fetchUruguayUnits({dry=false}: {dry?:boolean}={}): Promise<boolean> {
 try {
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const fetchPage=async(url:string)=>{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'hacecuentas-data-refresh/1.0'}});if(!r.ok)throw new Error(`DGI HTTP ${r.status}`);return r.text()};
  const [ui,ur]=await Promise.all([fetchPage(UI_SOURCE),fetchPage(UR_SOURCE)]);
  const payload=JSON.stringify(parseUruguayUnits(ui,ur,today),null,2)+'\n';
  const path=join(process.cwd(),'db/uruguay-units.json');
  let old='';try{old=readFileSync(path,'utf8')}catch{}
  if (old===payload) return false;
  if (!dry) {writeFileSync(path+'.tmp',payload);renameSync(path+'.tmp',path)}
  console.log(`[uruguay-units] UI ${today}, UR mes previo; ${dry?'dry: sin escritura':'actualizado'}`);
  return true;
 } catch (error) {
  reportWarn('uruguay-units', `${(error as Error).message}; snapshot anterior sin modificar`);
  return false; // Una fuente bloqueada no impide publicar los demás proveedores.
 }
}
