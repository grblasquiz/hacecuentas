import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
for (const locale of ['pt', 'pt-pt', 'en']) {
  const dir = path.join(root, 'src/lib/hubs', locale);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const file = path.join(dir, name);
    let text = fs.readFileSync(file, 'utf8');
    if (!text.includes('Fórmulas originales reutilizadas')) continue;
    if (locale === 'en') {
      text = text
        .replace(/Hub de decisión con (\d+) cálculos:/g, 'Decision hub with $1 calculations:')
        .replace(/Elige tu caso y completa sólo sus campos\. Este hub conserva las (\d+) fórmulas originales y reúne la decisión en una sola página\./g, 'Choose your case and fill in only its fields. This hub keeps all $1 original formulas and brings the decision into one page.')
        .replace(/'(\d+) calculadoras adentro'/g, "'$1 calculators included'")
        .replace("'Fórmulas originales reutilizadas'", "'Original formulas reused'")
        .replace("'Revisado el 28/07/2026'", "'Reviewed July 28, 2026'")
        .replaceAll('Resultado orientativo: verifica los datos de entrada y la fuente aplicable.', 'Informational result: verify the inputs and the applicable source.')
        .replace(/Datos revisados el ([0-9-]+)\./g, 'Data reviewed $1.');
    } else {
      text = text
        .replace(/Hub de decisión con (\d+) cálculos:/g, 'Hub de decisão com $1 cálculos:')
        .replace(/Elige tu caso y completa sólo sus campos\. Este hub conserva las (\d+) fórmulas originales y reúne la decisión en una sola página\./g, 'Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as $1 fórmulas originais e reúne a decisão numa só página.')
        .replace(/'(\d+) calculadoras adentro'/g, "'$1 calculadoras incluídas'")
        .replace("'Fórmulas originales reutilizadas'", "'Fórmulas originais reutilizadas'")
        .replace("'Revisado el 28/07/2026'", "'Revisto em 28/07/2026'")
        .replaceAll('Resultado orientativo: verifica los datos de entrada y la fuente aplicable.', 'Resultado informativo: confira os dados de entrada e a fonte aplicável.')
        .replace(/Datos revisados el ([0-9-]+)\./g, 'Dados revistos em $1.');
    }
    fs.writeFileSync(file, text);
  }
}
