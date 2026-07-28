import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const sourceDir = '/Users/marrod/Documents/Codex/2026-07-27/aga';
const targetDir = '/Users/marrod/hacecuentas/src/components/generated';
const entries = [
  ['consumo-auto-mockup.html', 'ConsumoAutoExperience', 'consumo-auto'],
  ['mantenimiento-auto-mockup.html', 'MantenimientoAutoExperience', 'mantenimiento-auto'],
  ['patente-auto-mockup.html', 'PatenteAutoExperience', 'patente-auto'],
  ['quimica-soluciones-mockup.html', 'QuimicaSolucionesExperience', 'quimica-soluciones'],
  ['chile-home-mockup.html', 'ChileHomeExperience', 'chile-home'],
  ['cuentas-casa-chile-mockup.html', 'CuentasCasaChileExperience', 'cuentas-casa-chile'],
  ['impuestos-negocio-colombia-mockup.html', 'ImpuestosNegocioColombiaExperience', 'impuestos-negocio-colombia'],
  ['horas-extras-colombia-mockup.html', 'HorasExtrasColombiaExperience', 'horas-extras-colombia'],
  ['sueldo-neto-colombia-mockup.html', 'SueldoNetoColombiaExperience', 'sueldo-neto-colombia'],
  ['hormigon-mockup.html', 'HormigonExperience', 'hormigon'],
  ['madera-mockup.html', 'MaderaExperience', 'madera'],
  ['dominicana-home-mockup.html', 'DominicanaHomeExperience', 'dominicana-home'],
];

const prefixCss = (css, scope) => {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map((selector) => {
      const cleaned = selector.trim();
      if (cleaned === 'body' || cleaned === 'html' || cleaned === ':root') return scope;
      if (cleaned.startsWith('body ')) return `${scope} ${cleaned.slice(5)}`;
      if (cleaned.startsWith('html ')) return `${scope} ${cleaned.slice(5)}`;
      return `${scope} ${cleaned}`;
    });
  });
  return root.toString();
};

const escapeTemplate = (value) => value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

fs.mkdirSync(targetDir, { recursive: true });

for (const [file, component, slug] of entries) {
  const html = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const replacements = [...html.matchAll(/document\.querySelector\("main"\)\.innerHTML=`([\s\S]*?)`;/g)];
  const markup = replacements.length
    ? replacements.at(-1)[1]
    : (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '');

  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .filter((script) => {
      if (!replacements.length) return true;
      return script.includes(replacements.at(-1)[0]) || html.indexOf(script) > replacements.at(-1).index;
    })
    .map((script) => script.replace(/document\.querySelector\("main"\)\.innerHTML=`[\s\S]*?`;/, ''))
    .filter((script) => script.trim())
    .map((script) => script
      .replaceAll('document.querySelectorAll(', 'root.querySelectorAll(')
      .replaceAll('document.querySelector(', 'root.querySelector(')
      .replaceAll('document.getElementById(', 'root.querySelector("#"+')
    );

  const scope = `.mockup-${slug}`;
  const scopedCss = prefixCss(styles, scope);
  const runtime = `<script is:inline>\n(()=>{const root=document.currentScript.previousElementSibling?.matches('${scope}')?document.currentScript.previousElementSibling:document.querySelector('${scope}');\n${scripts.join('\n')}\n})();\n</script>`;
  const output = `---\ninterface Props { data?: any }\nconst { data } = Astro.props;\n---\n<div class="mockup-${slug}" set:html={\`${escapeTemplate(markup)}\`} />\n${runtime}\n<style is:global>\n${scopedCss}\n${scope} { width:100%; overflow:hidden; }\n${scope} .top, ${scope} header.top { display:none !important; }\n${scope} .foot { display:none !important; }\n${scope} .support-real { width:min(1160px,calc(100% - 40px)); margin:auto; padding:64px 0; }\n${scope} .support-real-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:30px; }\n${scope} .support-real details { border-bottom:1px solid #dfe6ed; padding:14px 0; }\n${scope} .support-real summary { cursor:pointer; font-weight:750; }\n${scope} .support-real p { color:#687a8f; line-height:1.65; }\n@media(max-width:800px){${scope} .support-real-grid{grid-template-columns:1fr}}\n</style>\n{data && <section class="mockup-${slug} support-real"><div class="support-real-grid"><div><h2>Preguntas frecuentes</h2>{data.faq?.map((f:any,i:number)=><details open={i===0}><summary>{f.q}</summary><p set:html={f.a}/></details>)}</div><div><h2>Fuentes</h2>{data.sources?.map((s:any)=><a href={s.url} target="_blank" rel="nofollow noopener">{s.name}</a>)}</div></div></section>}\n`;
  fs.writeFileSync(path.join(targetDir, `${component}.astro`), output);
}

const pages = [
  ['src/pages/auto/consumo.astro', 'ConsumoAutoExperience', '../../components/generated/ConsumoAutoExperience.astro'],
  ['src/pages/auto/mantenimiento.astro', 'MantenimientoAutoExperience', '../../components/generated/MantenimientoAutoExperience.astro'],
  ['src/pages/auto/patente.astro', 'PatenteAutoExperience', '../../components/generated/PatenteAutoExperience.astro'],
  ['src/pages/ciencia/quimica-de-soluciones.astro', 'QuimicaSolucionesExperience', '../../components/generated/QuimicaSolucionesExperience.astro'],
  ['src/pages/cl/hogar/cuentas-de-la-casa.astro', 'CuentasCasaChileExperience', '../../../components/generated/CuentasCasaChileExperience.astro'],
  ['src/pages/co/impuestos/impuestos-de-mi-negocio.astro', 'ImpuestosNegocioColombiaExperience', '../../../components/generated/ImpuestosNegocioColombiaExperience.astro'],
  ['src/pages/co/trabajo/horas-extras-y-recargos.astro', 'HorasExtrasColombiaExperience', '../../../components/generated/HorasExtrasColombiaExperience.astro'],
  ['src/pages/co/trabajo/sueldo-neto.astro', 'SueldoNetoColombiaExperience', '../../../components/generated/SueldoNetoColombiaExperience.astro'],
  ['src/pages/construccion/hormigon.astro', 'HormigonExperience', '../../components/generated/HormigonExperience.astro'],
  ['src/pages/construccion/madera.astro', 'MaderaExperience', '../../components/generated/MaderaExperience.astro'],
];

for (const [page, component, importPath] of pages) {
  const fullPath = path.join('/Users/marrod/hacecuentas', page);
  let source = fs.readFileSync(fullPath, 'utf8');
  source = source.replace(/import DecisionHub from ['"][^'"]+['"];/, `import ${component} from '${importPath}';`);
  source = source.replace(/<DecisionHub\s+data=\{hub\}\s*\/>/, `<${component} data={hub} />`);
  fs.writeFileSync(fullPath, source);
}
