import fs from 'node:fs';
import path from 'node:path';

type Row = { url: string; title: string; locale: string; slug: string; data: any; jsonPath: string };
type Group = { locale: string; silo: string; slug: string; title: string; question: string; format?: 'ars'|'plain'|'unit'; routes: Row[] };
const root = process.cwd();
const pendingDir = path.join(root, 'work/hubs-pendientes');
const indexText = fs.readFileSync(path.join(root, 'src/lib/formulas/index.ts'), 'utf8');
const claimedText = fs.readdirSync(path.join(root, 'src/lib/hubs'), { recursive: true })
  .filter((f) => String(f).endsWith('.ts'))
  .map((f) => fs.readFileSync(path.join(root, 'src/lib/hubs', String(f)), 'utf8'))
  .filter((text) => !text.includes('Fórmulas originales reutilizadas'))
  .join('\n');

const rows: Row[] = [];
for (const file of fs.readdirSync(pendingDir).filter((f) => /^sueltas-.*\.tsv$/.test(f))) {
  for (const line of fs.readFileSync(path.join(pendingDir, file), 'utf8').trim().split('\n')) {
    const [url, title] = line.split('\t');
    if (claimedText.includes(`'${url}'`) || claimedText.includes(`"${url}"`)) continue;
    const locale = url.split('/')[1], slug = url.split('/').pop()!;
    const dir = path.join(root, `src/content/calcs-${locale}`);
    const jsonPath = fs.readdirSync(dir).map((f) => path.join(dir, f)).find((p) => {
      try { return JSON.parse(fs.readFileSync(p, 'utf8')).slug === slug; } catch { return false; }
    });
    if (!jsonPath) throw new Error(`No JSON for ${url}`);
    rows.push({ url, title, locale, slug, data: JSON.parse(fs.readFileSync(jsonPath, 'utf8')), jsonPath });
  }
}

function classify(r: Row): Omit<Group,'routes'> {
  const s = `${r.slug} ${r.data.category || ''}`.toLowerCase();
  if (r.locale === 'pt') {
    if (/1rm|imc|macros|tmb|pace|projecao-21k|trail-running|padel|rugby/.test(s)) return {locale:'pt',silo:'saude',slug:'treino-e-desempenho',title:'Treino e desempenho',question:'Quanto devo treinar e qual é o meu resultado?' ,format:'unit'};
    if (/bolo|cafe|chocolate|colher|cups|churrasco|porcoes|hamburguer|sushi|cozimento/.test(s)) return {locale:'pt',silo:'cozinha',slug:'comida-para-receitas-e-festas',title:'Receitas e festas',question:'Quanto de comida eu preciso preparar?',format:'unit'};
    if (/biberon|blw|data-parto|ovulacao|fraldas|mesada|dia-dos-pais|idade-anos/.test(s)) return {locale:'pt',silo:'familia',slug:'bebe-e-familia',title:'Bebê e família',question:'O que preciso planejar para o bebê e a família?',format:'unit'};
    if (/aquario|cobaia|coelho|idade-cachorro|passeios-cachorro|furao|tartaruga/.test(s)) return {locale:'pt',silo:'pets',slug:'cuidar-do-meu-pet',title:'Cuidados com pets',question:'Quanto meu animal precisa por dia?',format:'unit'};
    if (/aco-|caldeira|custo-obra|drenagem|parede|mudanca|mulch/.test(s)) return {locale:'pt',silo:'casa',slug:'obra-e-manutencao',title:'Obra e manutenção',question:'Quanto material e dinheiro preciso para a casa?',format:'unit'};
    if (/bandwidth|bateria|claude|midjourney|pc-gamer|tokens-openai|usb|servo|stepper|email-anexos|papel-poupado/.test(s)) return {locale:'pt',silo:'tecnologia',slug:'capacidade-custo-e-consumo',title:'Tecnologia',question:'Quanto custa, consome ou demora minha tecnologia?',format:'unit'};
    if (/aplicativos-idioma|aulas-semanais|cbc-uba|media-escolar|media-para|media-ponderada|podcasts/.test(s)) return {locale:'pt',silo:'estudos',slug:'aprender-e-passar',title:'Estudos',question:'Quanto preciso estudar ou tirar para passar?',format:'unit'};
    if (/energia-cinetica|diluicao|queda-livre|empuxo|integral|mdc-mmc|moles|paralaxe|regra-de-tres/.test(s)) return {locale:'pt',silo:'ciencia',slug:'resolver-contas',title:'Ciência e matemática',question:'Como resolvo esta conta de ciência ou matemática?',format:'unit'};
    if (/calendario-plantio|colheita|quando-podar|biodegradacao|pegada-carbono/.test(s)) return {locale:'pt',silo:'jardim',slug:'plantar-e-reduzir-impacto',title:'Jardim e ambiente',question:'Quando plantar e qual é o impacto da minha escolha?',format:'unit'};
    if (/geladeira|conta-de-luz|eletrodomestico/.test(s)) return {locale:'pt',silo:'casa',slug:'energia-da-casa',title:'Energia da casa',question:'Quanto de energia minha casa consome?',format:'ars'};
    if (/pneu|quintal|torque|velocidade-kmh/.test(s)) return {locale:'pt',silo:'ferramentas',slug:'converter-medidas',title:'Conversores',question:'Como converto esta medida sem errar?',format:'unit'};
    return {locale:'pt',silo:'vida',slug:'decisoes-e-calculos-do-dia-a-dia',title:'Cálculos do dia a dia',question:'Qual é o número para decidir melhor no dia a dia?',format:'unit'};
  }
  if (r.locale === 'en') {
    if (/budget|discount|safe-deposit|itba-utdt/.test(s)) return {locale:'en',silo:'money',slug:'family-budget-and-big-expenses',title:'Family budget',question:'How much can my family afford?',format:'ars'};
    if (/bac|body-fat|boxing|burnout|celiac|competition-weight|vegan|fodmap|food-ph|keto|sleep|postpartum|pral|spf/.test(s)) return {locale:'en',silo:'health',slug:'health-screening-food-and-fitness',title:'Health decisions',question:'What does this health or nutrition number mean?',format:'unit'};
    if (/certificate|license|permit|residency|visa|uba-cbc/.test(s)) return {locale:'en',silo:'life',slug:'identity-permits-and-applications',title:'Permits and applications',question:'What will this permit or application cost?',format:'ars'};
    if (/auto-|dnrpa|car-registration|used-car-transfer/.test(s)) return {locale:'en',silo:'cars',slug:'titles-registration-and-transfer',title:'Car paperwork',question:'What will it cost to title, register or transfer my car?',format:'ars'};
    return {locale:'en',silo:'family',slug:'events-and-family-transitions',title:'Family events and transitions',question:'What should I budget for this family event or change?',format:'ars'};
  }
  const defs: Record<string, Array<[RegExp,Omit<Group,'routes'>]>> = {
    es: [[/.*/, {locale:'es',silo:'vida',slug:'comida-cuentas-y-tiempo-con-amigos',title:'Planes con amigos',question:'¿Cuánto necesitamos para comer, pagar y organizar el plan?',format:'unit'}]],
    pe: [[/universidad|promedio/, {locale:'pe',silo:'estudio',slug:'estudiar-y-aprobar',title:'Estudiar en Perú',question:'¿Cuánto cuesta estudiar y qué nota necesito?',format:'unit'}],[/.*/, {locale:'pe',silo:'hogar',slug:'costo-de-construir',title:'Construir en Perú',question:'¿Cuánto cuesta construir mi casa?',format:'ars'}]],
    ec: [[/.*/, {locale:'ec',silo:'hogar',slug:'comida-salud-y-construccion',title:'Cuentas del hogar',question:'¿Cuánto necesito para mi salud, cocina o construcción?',format:'unit'}]],
    ve: [[/credito|gasolina/, {locale:'ve',silo:'finanzas',slug:'credito-y-gasolina',title:'Crédito y gasolina',question:'¿Cuánto pago y cuánto ahorro cada mes?',format:'ars'}],[/.*/, {locale:'ve',silo:'vida',slug:'salud-estudio-y-tramites',title:'Salud, estudio y trámites',question:'¿Qué número necesito para mi salud, estudio o trámite?',format:'unit'}]],
    uy: [[/credito|prestamo/, {locale:'uy',silo:'finanzas',slug:'cuotas-y-prestamos',title:'Préstamos en Uruguay',question:'¿Cuánto voy a pagar por mes?',format:'ars'}],[/viaje|patente/, {locale:'uy',silo:'finanzas',slug:'costos-del-auto',title:'Costos del auto',question:'¿Cuánto cuesta tener y usar el auto?',format:'ars'}],[/ute|courier/, {locale:'uy',silo:'finanzas',slug:'cuentas-y-compras',title:'Cuentas y compras',question:'¿Cuánto termino pagando?',format:'ars'}],[/.*/, {locale:'uy',silo:'trabajo',slug:'estudio-y-vida-cotidiana',title:'Vida cotidiana',question:'¿Qué resultado necesito para decidir?',format:'unit'}]],
    py: [[/bebidas|carne/, {locale:'py',silo:'vivienda',slug:'organizar-un-evento',title:'Eventos en Paraguay',question:'¿Cuánto comprar para el evento?',format:'unit'}],[/cuota-alimentaria|transporte|mundial/, {locale:'py',silo:'finanzas',slug:'presupuesto-familiar-y-viajes',title:'Presupuesto familiar',question:'¿Cuánto necesito por mes o para el viaje?',format:'ars'}],[/.*/, {locale:'py',silo:'trabajo',slug:'dias-y-notas',title:'Días y notas',question:'¿Cuántos días o qué promedio tengo?',format:'unit'}]],
    co: [[/pasaporte|cedula/, {locale:'co',silo:'vida',slug:'documentos-y-pasaporte',title:'Documentos en Colombia',question:'¿Cuánto cuesta y cuánto dura mi documento?',format:'ars'}],[/.*/, {locale:'co',silo:'finanzas',slug:'vuelos-millas-y-tiempo',title:'Vuelos y millas',question:'¿Cuánto cuesta el vuelo y cuánto valen mis millas?',format:'ars'}]],
    do: [[/.*/, {locale:'do',silo:'finanzas',slug:'comprar-y-financiar-un-vehiculo',title:'Comprar un vehículo',question:'¿Cuánto cuesta importar y financiar el vehículo?',format:'ars'}]],
    'pt-pt': [[/.*/, {locale:'pt-pt',silo:'financas',slug:'impostos-do-automovel',title:'Impostos do automóvel',question:'Quanto vou pagar de ISV e IUC?',format:'ars'}]],
    cl: [[/.*/, {locale:'cl',silo:'impuestos',slug:'cobre-y-finanzas-publicas',title:'Cobre y finanzas públicas',question:'¿Cómo impacta el precio del cobre en los ingresos fiscales?',format:'ars'}]],
  };
  for (const [re,g] of defs[r.locale] || []) if (re.test(s)) return g;
  throw new Error(`No group for ${r.url}`);
}

const grouped = new Map<string,Group>();
for (const row of rows) {
  const g = classify(row), key = `${g.locale}/${g.silo}/${g.slug}`;
  if (!grouped.has(key)) grouped.set(key,{...g,routes:[]});
  grouped.get(key)!.routes.push(row);
}

const importByVar = new Map<string,{ from: string; original: string }>();
for (const m of indexText.matchAll(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+'([^']+)';/gm)) {
  const spec=m[1].trim(), from=m[2];
  const alias=spec.match(/^(\w+)\s+as\s+(\w+)$/);
  importByVar.set(alias ? alias[2] : spec, { from, original: alias ? alias[1] : spec });
}
const varByFormula = new Map<string,string>();
for (const m of indexText.matchAll(/^\s*'([^']+)':\s*([^,\s]+),/gm)) varByFormula.set(m[1],m[2]);

const labels: Record<string,string> = {pt:'Brasil',en:'United States',es:'España',pe:'Perú',ec:'Ecuador',ve:'Venezuela',uy:'Uruguay',py:'Paraguay',co:'Colombia',do:'República Dominicana','pt-pt':'Portugal',cl:'Chile'};
const audience: Record<string,string> = {pt:'BR',en:'US',es:'ES',pe:'PE',ec:'EC',ve:'VE',uy:'UY',py:'PY',co:'CO',do:'DO','pt-pt':'PT',cl:'CL'};
const lang: Record<string,string> = {pt:'pt-BR',en:'en',es:'es',pe:'es',ec:'es',ve:'es',uy:'es',py:'es',co:'es',do:'es','pt-pt':'pt-PT',cl:'es'};
const q = (v:any) => JSON.stringify(v, null, 2);
const safeDefault = (f:any) => {
  if (f.default !== undefined && f.default !== '') return f.default;
  if (f.value !== undefined && f.value !== '') return f.value;
  if (f.type === 'select') return f.options?.[0]?.value ?? '';
  if (f.type === 'date') return '2026-07-28';
  const n=Number(String(f.placeholder ?? '').replace(/[^\d.-]/g,'')); return Number.isFinite(n) && n !== 0 ? n : 1;
};
const hubDir=(l:string)=>path.join(root,'src/lib/hubs',l);
const pageDir=(l:string,s:string)=>path.join(root,'src/pages',l,s);
const bridgeDir=path.join(root,'src/lib/hub-formulas-generated');
fs.mkdirSync(bridgeDir,{recursive:true});

for (const g of grouped.values()) {
  fs.mkdirSync(hubDir(g.locale),{recursive:true}); fs.mkdirSync(pageDir(g.locale,g.silo),{recursive:true});
  const cases=g.routes.map((r,i)=>({id:`c${i+1}`,label:r.data.h1||r.title,hint:r.data.answerSnippet||r.data.description||r.title,yes:[r.data.keyTakeaway||r.data.answerSnippet||'El cálculo usa la fórmula original de esta calculadora.'],warn:[r.data.disclaimer||'Resultado orientativo: verifica los datos de entrada y la fuente aplicable.'],plazo:r.data.dataUpdate?.lastUpdated?`Datos revisados el ${r.data.dataUpdate.lastUpdated}.`:'Revisa el resultado antes de tomar una decisión.',answer:r.data.answerSnippet||r.data.description||r.title}));
  const fieldMap=new Map<string,any>();
  for(const r of g.routes) for(const f of r.data.fields||[]) {
    const id=`c${g.routes.indexOf(r)+1}__${f.id}`;
    fieldMap.set(id,{id,label:`${r.data.h1||r.title}: ${f.label}`,type:f.type||'number',value:safeDefault(f),prefix:f.prefix,suffix:f.suffix,min:f.min,max:f.max,step:f.step,options:f.options,thousands:!!f.thousands,help:f.help});
  }
  const faqs=g.routes.flatMap(r=>r.data.faq||[]).filter((x:any)=>x?.q&&x?.a).slice(0,Math.max(7,Math.min(14,g.routes.length*2)));
  while(faqs.length<7) faqs.push({q:`¿Qué calcula ${g.title.toLowerCase()}?`,a:'Reúne las cuentas relacionadas en una sola decisión y conserva la fórmula de cada calculadora original.'});
  const sources=[] as any[]; const seen=new Set<string>();
  for(const r of g.routes) for(const s of r.data.sources||[]) if(s?.url&&!seen.has(s.url)){seen.add(s.url);sources.push(s);}
  const slug=`${g.locale}/${g.silo}/${g.slug}`;
  const dataFile=`import type { HubData } from '../types';\n\nexport const hub: HubData = {\n  slug: '${slug}',\n  title: ${JSON.stringify(g.question+' | Hacé Cuentas')},\n  description: ${JSON.stringify(`Hub de decisión con ${g.routes.length} cálculos: ${g.routes.map(r=>r.data.h1||r.title).join('; ')}.`)},\n  silo: ${JSON.stringify(g.title)},\n  siloHref: '/${g.locale}/${g.silo}',\n  locale: '${g.locale}',\n  eyebrow: ${JSON.stringify(`${labels[g.locale]} · ${g.title}`)},\n  h1: ${JSON.stringify(g.question)},\n  lede: ${JSON.stringify(`Elige tu caso y completa sólo sus campos. Este hub conserva las ${g.routes.length} fórmulas originales y reúne la decisión en una sola página.`)},\n  stamps: ['${g.routes.length} calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],\n  resultLabel: ${JSON.stringify(g.locale==='en'?'Your result':g.locale.startsWith('pt')?'Seu resultado':'Tu resultado')},\n  cases: { title: ${JSON.stringify(g.locale==='en'?'What do you need to calculate?':g.locale.startsWith('pt')?'O que precisa calcular?':'¿Qué necesitas calcular?')}, intro: ${JSON.stringify(g.locale==='en'?'Choose one case; the hub applies its original formula.':g.locale.startsWith('pt')?'Escolha um caso; o hub aplica a fórmula original.':'Elige un caso; el hub aplica su fórmula original.')}, items: ${q(cases)} },\n  inputsTitle: ${JSON.stringify(g.locale==='en'?'Your inputs':g.locale.startsWith('pt')?'Seus dados':'Tus datos')},\n  inputsIntro: ${JSON.stringify(g.locale==='en'?'Fields are prefixed with the case they belong to. Other fields are ignored.':g.locale.startsWith('pt')?'Os campos indicam a qual caso pertencem; os demais são ignorados.':'Cada campo indica a qué caso pertenece; los demás se ignoran.')},\n  fields: ${q([...fieldMap.values()].map(f=>Object.fromEntries(Object.entries(f).filter(([,v])=>v!==undefined))))},\n  fineprint: ${JSON.stringify(g.locale==='en'?'Informational estimate. Verify inputs and official sources before acting.':g.locale.startsWith('pt')?'Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.':'Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.')},\n  chart: { type: 'bars', caption: ${JSON.stringify(g.locale==='en'?'The main numeric outputs returned by the selected formula.':g.locale.startsWith('pt')?'Os principais resultados numéricos da fórmula selecionada.':'Los principales resultados numéricos de la fórmula seleccionada.')} },\n  breakdownTitle: ${JSON.stringify(g.locale==='en'?'Formula results':g.locale.startsWith('pt')?'Resultados da fórmula':'Resultados de la fórmula')},\n  breakdownIntro: ${JSON.stringify(g.locale==='en'?'Each row is returned by the original calculator formula.':g.locale.startsWith('pt')?'Cada linha vem da fórmula da calculadora original.':'Cada fila proviene de la fórmula de la calculadora original.')},\n  faq: ${q(faqs)},\n  sources: ${q(sources.length?sources:[{name:'Hacé Cuentas — fórmula original',url:'https://hacecuentas.com/'}])},\n  replaces: [\n${g.routes.map(r=>`    '${r.url}', // Absorbida como caso calculable con formulaId ${r.data.formulaId}.`).join('\n')}\n  ],\n  lastReviewed: '2026-07-28',\n};\n`;
  fs.writeFileSync(path.join(hubDir(g.locale),`${g.slug}.ts`),dataFile);

  const imports:string[]=[]; const entries:string[]=[];
  g.routes.forEach((r,i)=>{const v=varByFormula.get(r.data.formulaId);const imp=v&&importByVar.get(v);if(!v||!imp)throw new Error(`Formula import missing ${r.data.formulaId} ${r.url}`);const alias=`f${i+1}`;imports.push(`import { ${imp.original} as ${alias} } from '../formulas/${imp.from.replace('./','')}';`);entries.push(`  c${i+1}: ${alias},`);});
  fs.writeFileSync(path.join(bridgeDir,`${g.locale}-${g.slug}.ts`),`${imports.join('\n')}\nexport const formulaMap: Record<string,(v:any)=>any> = {\n${entries.join('\n')}\n};\n`);
  const configs=Object.fromEntries(g.routes.map((r,i)=>[`c${i+1}`,{formulaId:r.data.formulaId,fields:(r.data.fields||[]).map((f:any)=>f.id),outputs:r.data.outputs||[],title:r.data.h1||r.title}]));
  const page=`---\nexport const prerender = true;\nimport Layout from '../../../layouts/Layout.astro';\nimport Header from '../../../components/Header.astro';\nimport Footer from '../../../components/Footer.astro';\nimport DecisionHub from '../../../components/hub/DecisionHub.astro';\nimport { hub } from '../../../lib/hubs/${g.locale}/${g.slug}';\nconst canonical = \`https://hacecuentas.com/\${hub.slug}\`;\nconst schema = {'@context':'https://schema.org','@type':'FAQPage',mainEntity:hub.faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))};\n---\n<Layout title={hub.title} description={hub.description} canonical={canonical} schema={schema} audience="${audience[g.locale]}" lang="${lang[g.locale]}" ogType="article" articleSection={hub.silo}>\n  <Header /><DecisionHub data={hub} /><Footer />\n</Layout>\n<script>\n  import { formulaMap } from '../../../lib/hub-formulas-generated/${g.locale}-${g.slug}';\n  const configs = ${JSON.stringify(configs)};\n  const H = (window as any).HC_HUB;\n  const numeric = (o:any) => Object.entries(o || {}).filter(([k,v]) => !k.startsWith('_') && typeof v === 'number' && Number.isFinite(v as number));\n  const labelFor = (cfg:any,key:string) => cfg.outputs.find((o:any)=>o.id===key)?.label || key.replace(/_/g,' ');\n  H.onCompute((all:any, selected:any) => {\n    const id=selected?.id || Object.keys(configs)[0], cfg=(configs as any)[id];\n    const values:any={}; for(const key of cfg.fields) values[key]=all[id+'__'+key];\n    let out:any; try { out=formulaMap[id](values) || {}; } catch(e:any) { return {total:'—',sub:e?.message||'Revisa los datos',rows:[],chart:[],format:'plain'}; }\n    const nums=numeric(out); const preferred=cfg.outputs.find((x:any)=>x.primary && typeof out[x.id]==='number') || cfg.outputs.find((x:any)=>typeof out[x.id]==='number');\n    const mainKey=preferred?.id || nums[0]?.[0], main=Number(out[mainKey] ?? nums[0]?.[1] ?? 0);\n    const rows=nums.slice(0,12).map(([k,v])=>({k:labelFor(cfg,k),v:Number(v),format:'${g.format || 'plain'}'}));\n    const chart=nums.slice(0,6).map(([k,v],i)=>({label:labelFor(cfg,k),value:Math.abs(Number(v)),tone:i===0?'main':i===1?'good':'prop'}));\n    return {total:main.toLocaleString('${lang[g.locale]}',{maximumFractionDigits:2}),sub:out._insight || out.detalle || out.resumen || cfg.title,rows,chart,format:'${g.format || 'plain'}'};\n  });\n</script>\n`;
  fs.writeFileSync(path.join(pageDir(g.locale,g.silo),`${g.slug}.astro`),page);
}

for (const g of grouped.values()) {
  const index=path.join(pageDir(g.locale,g.silo),'index.astro');
  if (fs.existsSync(index)) continue;
  fs.writeFileSync(index,`---\nexport const prerender = true;\nimport Layout from '../../../layouts/Layout.astro';\nimport Header from '../../../components/Header.astro';\nimport Footer from '../../../components/Footer.astro';\nimport SiloIndex from '../../../components/hub/SiloIndex.astro';\nimport { hubsOfSilo } from '../../../lib/hubs/registry';\nconst href='/${g.locale}/${g.silo}';\nconst hubs=hubsOfSilo(href);\n---\n<Layout title="${g.title} | Hacé Cuentas" description="${g.question}" canonical={\`https://hacecuentas.com\${href}\`} audience="${audience[g.locale]}" lang="${lang[g.locale]}">\n  <Header /><SiloIndex silo="${g.title}" href={href} lede="${g.question}" hubs={hubs} /><Footer />\n</Layout>\n`);
}
const manifest=[...grouped.values()].flatMap(g=>g.routes.map(r=>({old:r.url,next:`/${g.locale}/${g.silo}/${g.slug}`,jsonPath:path.relative(root,r.jsonPath)})));
fs.writeFileSync(path.join(root,'work/pending-hubs-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({routes:rows.length,hubs:grouped.size,markets:[...new Set(rows.map(r=>r.locale))],manifest:manifest.length},null,2));
