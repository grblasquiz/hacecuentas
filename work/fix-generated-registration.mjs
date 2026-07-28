import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
for (const rel of fs.readdirSync(path.join(root, 'src/pages'), { recursive: true })) {
  if (!String(rel).endsWith('.astro')) continue;
  const file = path.join(root, 'src/pages', String(rel));
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes('hub-formulas-generated/')) continue;
  text = text.replace(
    "  const H = (window as any).HC_HUB;\n  const numeric",
    "  const numeric",
  );
  text = text.replace(
    "  H.onCompute((all:any, selected:any) => {",
    "  function register() {\n    const H = (window as any).HC_HUB;\n    if (!H) return;\n    H.onCompute((all:any, selected:any) => {",
  );
  text = text.replace(
    /^  \}\);\n<\/script>$/m,
    "    });\n  }\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', register, { once: true });\n  else register();\n</script>",
  );
  fs.writeFileSync(file, text);
}
