import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const root = '/Users/marrod/hacecuentas';
const sourceDir = '/Users/marrod/Documents/Codex/2026-07-27/aga';
const targetDir = path.join(root, 'src/components/generated');

const pages = [
  ['como-calcular-aguinaldo-2026-mockup.html','ComoCalcularAguinaldoExperience','como-calcular-aguinaldo','blog/como-calcular-aguinaldo-2026','Cómo calcular el aguinaldo 2026'],
  ['costo-de-vida-argentina-2026-mockup.html','CostoVidaArgentinaExperience','costo-vida-argentina','blog/costo-de-vida-argentina-2026','Costo de vida en Argentina 2026'],
  ['informe-financiero-argentina-2026-07-mockup.html','InformeFinancieroArgentinaExperience','informe-financiero-argentina','blog/informe-financiero-argentina-2026-07','Informe financiero de Argentina'],
  ['feriados-mexico-2026-mockup.html','FeriadosMexicoExperience','feriados-mexico','feriados-mexico-2026','Feriados México 2026'],
  ['triangulos-y-trigonometria-mockup.html','TriangulosExperience','triangulos','matematica/triangulos-y-trigonometria','Triángulos y trigonometría'],
  ['calorias-diarias-mockup.html','CaloriasDiariasExperience','calorias-diarias','nutricion/calorias-diarias','Calculadora de calorías diarias'],
  ['tabla-imc-peso-altura-mockup.html','TablaImcExperience','tabla-imc','tabla/tabla-imc-peso-altura','Tabla de IMC por peso y altura'],
  ['dias-entre-fechas-mockup.html','DiasEntreFechasHubExperience','dias-entre-fechas-hub','fechas/dias-entre-fechas','Días entre fechas'],
  ['sueldos-y-trabajo-mockup.html','SueldosTrabajoExperience','sueldos-trabajo','sueldos-y-trabajo','Sueldos y trabajo'],
  ['trabajo-mockup.html','TrabajoHomeExperience','trabajo-home','trabajo','Trabajo'],
  ['alquiler-mockup.html','AlquilerHomeExperience','alquiler-home','alquiler','Alquiler'],
  ['auto-mockup.html','AutoHomeExperience','auto-home','auto','Auto'],
  ['finanzas-personales-mockup.html','FinanzasHomeExperience','finanzas-home','finanzas-personales','Finanzas personales'],
  ['feriados-mockup.html','FeriadosHomeExperience','feriados-home','fechas/feriados','Feriados'],
  ['salario-minimo-latam-2026-mockup.html','SalarioMinimoLatamExperience','salario-minimo-latam','datos-salario-minimo-latam-2026','Salario mínimo en Latinoamérica 2026'],
  ['metodologia-mockup.html','MetodologiaExperience','metodologia','metodologia','Metodología de Hacé Cuentas'],
  ['colombia-home-mockup.html','ColombiaHomeExperience','colombia-home','co','Hacé Cuentas Colombia'],
  ['ecuador-home-mockup.html','EcuadorHomeExperience','ecuador-home','ec','Hacé Cuentas Ecuador'],
  ['dominicana-home-v2-mockup.html','DominicanaHomeV2Experience','dominicana-home-v2','do','Hacé Cuentas República Dominicana'],
  ['english-home-decision-hubs-mockup.html','EnglishHomeExperience','english-home','en','Hacé Cuentas in English'],
  ['portugal-home-decision-hubs-mockup.html','PortugalHomeExperience','portugal-home','pt-pt','Hacé Cuentas Portugal'],
  ['espana-home-mockup.html','EspanaHomeExperience','espana-home','es','Hacé Cuentas España'],
  ['uruguay-home-mockup.html','UruguayHomeExperience','uruguay-home','uy','Hacé Cuentas Uruguay'],
  ['peru-home-mockup.html','PeruHomeExperience','peru-home','pe','Hacé Cuentas Perú'],
  ['mexico-home-mockup.html','MexicoHomeExperience','mexico-home','mx','Hacé Cuentas México'],
  ['ciencia-home-mockup.html','CienciaHomeExperience','ciencia-home','ciencia','Ciencia'],
  ['conversores-home-mockup.html','ConversoresHomeExperience','conversores-home','conversores','Conversores'],
  ['eventos-home-mockup.html','EventosHomeExperience','eventos-home','eventos','Eventos'],
  ['impuestos-mockup.html','ImpuestosHomeExperience','impuestos-home','impuestos','Impuestos'],
  ['jubilacion-home-mockup.html','JubilacionHomeExperience','jubilacion-home','jubilacion','Jubilación'],
  ['negocios-home-mockup.html','NegociosHomeExperience','negocios-home','negocios','Negocios'],
  ['viajes-home-mockup.html','ViajesHomeExperience','viajes-home','viajes','Viajes'],
  ['cocina-home-mockup.html','CocinaHomeExperience','cocina-home','cocina','Cocina'],
  ['embarazo-home-mockup.html','EmbarazoHomeExperience','embarazo-home','embarazo','Embarazo'],
  ['familia-home-mockup.html','FamiliaHomeExperience','familia-home','familia','Familia'],
  ['futbol-home-mockup.html','FutbolHomeExperience','futbol-home','futbol','Fútbol'],
  ['inversiones-home-mockup.html','InversionesHomeExperience','inversiones-home','inversiones','Inversiones'],
  ['mascotas-home-mockup.html','MascotasHomeExperience','mascotas-home','mascotas','Mascotas'],
  ['nutricion-home-mockup.html','NutricionHomeExperience','nutricion-home','nutricion','Nutrición'],
  ['tecnologia-home-mockup.html','TecnologiaHomeExperience','tecnologia-home','tecnologia','Tecnología'],
  ['vivienda-home-mockup.html','ViviendaHomeExperience','vivienda-home','vivienda','Vivienda'],
  ['ocio-home-mockup.html','OcioHomeExperience','ocio-home','ocio','Ocio'],
  ['matematica-home-mockup.html','MatematicaHomeExperience','matematica-home','matematica','Matemática'],
  ['jardin-home-mockup.html','JardinHomeExperience','jardin-home','jardin','Jardín'],
  ['hogar-home-mockup.html','HogarHomeExperience','hogar-home','hogar','Hogar'],
  ['fechas-home-mockup.html','FechasHomeExperience','fechas-home','fechas','Fechas'],
  ['estudio-home-mockup.html','EstudioHomeExperience','estudio-home','estudio','Estudio'],
  ['construccion-home-mockup.html','ConstruccionHomeExperience','construccion-home','construccion','Construcción'],
  ['bebes-home-mockup.html','BebesHomeExperience','bebes-home','bebes','Bebés'],
  ['escala-ganancias-2026-blog-mockup.html','EscalaGananciasBlogExperience','escala-ganancias-blog','blog/escala-ganancias-2026-argentina-tabla-completa-explicada','Escala de Ganancias 2026'],
  ['viajar-comprar-afuera-chile-mockup.html','ViajarComprarChileExperience','viajar-comprar-chile','cl/vida/viajar-y-comprar-afuera','Viajar y comprar afuera desde Chile'],
  ['credito-hipotecario-mockup.html','CreditoHipotecarioExperience','credito-hipotecario','vivienda/credito-hipotecario','Crédito hipotecario'],
  ['electrico-vs-nafta-mockup.html','ElectricoNaftaExperience','electrico-nafta','auto/electrico-vs-nafta','Eléctrico vs. nafta'],
  ['calculadora-cientifica-mockup.html','CalculadoraCientificaExperience','calculadora-cientifica','calculadora-cientifica','Calculadora científica'],
  ['patrimonio-herencia-colombia-mockup.html','PatrimonioHerenciaExperience','patrimonio-herencia','co/impuestos/patrimonio-y-herencia','Patrimonio y herencia Colombia'],
  ['adaptar-receta-mockup.html','AdaptarRecetaExperience','adaptar-receta','cocina/adaptar-una-receta','Adaptar una receta'],
  ['feriados-peru-2026-mockup.html','FeriadosPeruExperience','feriados-peru','feriados-peru-2026','Feriados Perú 2026'],
  ['huerta-mockup.html','HuertaExperience','huerta','jardin/huerta','Planificador de huerta'],
  ['dados-inss-irrf-2026-mockup.html','DadosInssIrrfExperience','dados-inss-irrf','pt/dados-inss-irrf-2026','Dados INSS e IRRF 2026'],
  ['liquidacion-lottt-venezuela-mockup.html','LiquidacionLotttExperience','liquidacion-lottt','ve/trabajo/liquidacion-lottt','Liquidación LOTTT Venezuela'],
  ['credito-vivienda-mexico-mockup.html','CreditoViviendaMexicoExperience','credito-vivienda-mexico','mx/finanzas/credito-de-vivienda','Crédito de vivienda en México'],
  ['finiquito-liquidacion-mexico-mockup.html','FiniquitoLiquidacionMexicoExperience','finiquito-liquidacion-mexico','mx/trabajo/finiquito-y-liquidacion','Finiquito y liquidación en México'],
  ['unidades-valores-uruguay-mockup.html','UnidadesValoresUruguayExperience','unidades-valores-uruguay','uy/finanzas/unidades-y-valores','Unidades y valores en Uruguay'],
  ['ingresos-brutos-cordoba-mockup.html','IngresosBrutosCordobaExperience','ingresos-brutos-cordoba','argentina/cordoba/calculadora-ingresos-brutos-provincial','Ingresos Brutos en Córdoba'],
  ['fonasa-isapre-chile-mockup.html','FonasaIsapreChileExperience','fonasa-isapre-chile','cl/vida/fonasa-o-isapre','Fonasa o Isapre en Chile'],
  ['conversor-temperatura-mockup.html','ConversorTemperaturaExperience','conversor-temperatura','conversores/temperatura','Conversor de temperatura'],
  ['feriados-colombia-2026-mockup.html','FeriadosColombiaExperience','feriados-colombia','feriados-colombia-2026','Feriados de Colombia 2026'],
  ['limpieza-hogar-mockup.html','LimpiezaHogarExperience','limpieza-hogar','hogar/limpieza','Planificador de limpieza'],
  ['eventos-home-mockup.html','EventosHomeExperience','eventos-home','eventos','Eventos'],
  ['comprar-exterior-impuestos-mockup.html','ComprarExteriorImpuestosExperience','comprar-exterior-impuestos','impuestos/comprar-en-el-exterior','Comprar en el exterior'],
  ['mascotas-home-mockup.html','MascotasHomeExperience','mascotas-home','mascotas','Mascotas'],
  ['potencias-y-raices-mockup.html','PotenciasRaicesExperience','potencias-raices','matematica/potencias-y-raices','Potencias y raíces'],
  ['comprar-o-vender-auto-mx-mockup.html','ComprarVenderAutoMexicoExperience','comprar-vender-auto-mexico','mx/auto/comprar-o-vender-auto','Comprar o vender un auto en México'],
  ['servicios-y-obra-mx-mockup.html','ServiciosObraMexicoExperience','servicios-obra-mexico','mx/hogar/servicios-y-obra','Servicios y obra en México'],
  ['isr-por-mi-cuenta-mx-mockup.html','IsrCuentaPropiaMexicoExperience','isr-cuenta-propia-mexico','mx/impuestos/isr-por-mi-cuenta','ISR por mi cuenta en México'],
  ['negocios-home-mockup.html','NegociosHomeExperience','negocios-home','negocios','Negocios'],
  ['grasa-corporal-mockup.html','GrasaCorporalExperience','grasa-corporal','salud/grasa-corporal','Grasa corporal'],
  ['resistencias-mockup.html','ResistenciasExperience','resistencias','tecnologia/resistencias','Calculadora de resistencias'],
  ['trabajo-independiente-uy-mockup.html','TrabajoIndependienteUruguayExperience','trabajo-independiente-uruguay','uy/impuestos/trabajo-independiente','Trabajo independiente en Uruguay'],
  ['impuesto-renta-ecuador-mockup.html','ImpuestoRentaEcuadorExperience','impuesto-renta-ecuador','ec/impuestos/impuesto-a-la-renta','Impuesto a la renta en Ecuador'],
];

const selectedPages = process.argv.includes('--current-batch') ? pages.slice(-20) : pages;

const prefixCss = (css, scope) => {
  const ast = postcss.parse(css);
  ast.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map((selector) => {
      const s = selector.trim();
      if (['body','html',':root'].includes(s)) return scope;
      if (s.startsWith('body ')) return `${scope} ${s.slice(5)}`;
      if (s.startsWith('html ')) return `${scope} ${s.slice(5)}`;
      return `${scope} ${s}`;
    });
  });
  return ast.toString();
};
const escapeTemplate = (s) => s.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');

fs.mkdirSync(targetDir,{recursive:true});
for (const [file,component,slug] of selectedPages) {
  const html=fs.readFileSync(path.join(sourceDir,file),'utf8');
  const css=[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
  const markup=html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'';
  const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean).map(s=>s
    .replaceAll('document.querySelectorAll(','root.querySelectorAll(')
    .replaceAll('document.querySelector(','root.querySelector(')
    .replaceAll('document.getElementById(','root.querySelector("#"+')
  );
  const referencedIds = new Set([
    ...[...html.matchAll(/\$\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]),
    ...[...html.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]),
    ...[...html.matchAll(/querySelector\(\s*['"]#([^'"]+)['"]\s*\)/g)].map((m) => m[1]),
  ].map((id) => id.replace(/^#/, '')));
  const compatibilityMarkup = [...referencedIds]
    .filter((id) => html.includes(`id="${id}"`) && !markup.includes(`id="${id}"`))
    .map((id) => `<button type="button" id="${id}" hidden aria-hidden="true"></button>`)
    .join('');
  const scope=`.mockup-${slug}`;
  const output=`---\n---\n<div class="mockup-${slug}" set:html={\`${escapeTemplate(markup + compatibilityMarkup)}\`} />\n<script is:inline>\n(()=>{const root=document.currentScript.previousElementSibling?.matches('${scope}')?document.currentScript.previousElementSibling:document.querySelector('${scope}');if(!root)return;\n${scripts.join('\n')}\n})();\n</script>\n<style is:global>\n${prefixCss(css,scope)}\n${scope}{width:100%;overflow:hidden}\n/* Keep the legacy site's global typography palette from overriding text that\n   intentionally inherits a light color inside dark mockup surfaces. */\n${scope} :where(h1,h2,h3,h4,h5,h6,p,span,strong,b,small,em,i,a,label,button,summary,li,th,td){color:inherit}\n${scope} input[type="number"]{-moz-appearance:textfield;appearance:textfield}\n${scope} input[type="number"]::-webkit-inner-spin-button,${scope} input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}\n</style>\n`;
  fs.writeFileSync(path.join(targetDir,`${component}.astro`),output);
}

// These hubs need hand-authored SEO fallbacks because their imported mockups can
// be empty. Keep regenerating the visual components, but never overwrite the
// canonical Astro pages (H1, hreflang and internal-link copy live there).
const protectedSeoRoutes = new Set(['es', 'mx', 'pe', 'uy', 'trabajo', 'fechas/dias-entre-fechas']);

for (const [,component,,route,title] of selectedPages) {
  if (protectedSeoRoutes.has(route)) continue;
  const flatPath=path.join(root,'src/pages',`${route}.astro`);
  const pagePath=route==='calculadora-cientifica'
    ? path.join(root,'src/pages/calculadora-cientifica.astro')
    : (fs.existsSync(flatPath) ? flatPath : path.join(root,'src/pages',route,'index.astro'));
  const pageDir=path.dirname(pagePath);
  const rel=(target)=>{let p=path.relative(pageDir,path.join(root,target)).replaceAll(path.sep,'/');return p.startsWith('.')?p:`./${p}`};
  const canonical=`https://hacecuentas.com/${route}`;
  const lang=route==='en'?'en':route.startsWith('pt')?'pt':'es';
  const schema=lang==='en'?'WebApplication':'WebApplication';
  const hubFile=path.join(root,'src/lib/hubs',`${route}.ts`);
  const hasHub=fs.existsSync(hubFile);
  const hubImport=hasHub?`\nimport { hub } from '${rel(`src/lib/hubs/${route}.ts`).replace(/\\.ts$/, '')}';`:'';
  const layoutTitle=hasHub?'{hub.title}':JSON.stringify(title+' | Hacé Cuentas');
  const layoutDescription=hasHub?'{hub.description}':JSON.stringify(title+'. Herramienta clara, gratuita y actualizada.');
  const schemaName=hasHub?'hub.title':JSON.stringify(title);
  const output=`---\nexport const prerender = true;\nimport Layout from '${rel('src/layouts/Layout.astro')}';\nimport Header from '${rel('src/components/Header.astro')}';\nimport Footer from '${rel('src/components/Footer.astro')}';\nimport ${component} from '${rel(`src/components/generated/${component}.astro`)}';${hubImport}\nconst canonical='${canonical}';\nconst schema={'@context':'https://schema.org','@type':'${schema}',name:${schemaName},url:canonical,operatingSystem:'Web'};\n---\n<Layout title=${layoutTitle} description=${layoutDescription} canonical={canonical} schema={schema} lang="${lang}">\n  <Header />\n  <${component} />\n  <Footer />\n</Layout>\n`;
  fs.mkdirSync(pageDir,{recursive:true});
  fs.writeFileSync(pagePath,output);
}

console.log(`Generated ${selectedPages.length} experiences and pages.`);
