export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function areaTrianguloHeronTresLados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      invalid: 'Los lados no forman triángulo válido.',
      insightTitle: 'Área por la fórmula de Herón',
      insightInvalidTitle: 'Triángulo inválido',
    },
    en: {
      invalid: 'The sides do not form a valid triangle.',
      insightTitle: "Area by Heron's formula",
      insightInvalidTitle: 'Invalid triangle',
    },
    pt: {
      invalid: 'Os lados não formam um triângulo válido.',
      insightTitle: 'Área pela fórmula de Heron',
      insightInvalidTitle: 'Triângulo inválido',
    },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a+b<=c||a+c<=b||b+c<=a) {
    const invalidText = __lang === 'en'
      ? `The sides **${a}, ${b}, ${c}** break the triangle inequality: each side must be smaller than the sum of the other two.`
      : __lang === 'pt'
      ? `Os lados **${a}, ${b}, ${c}** quebram a desigualdade triangular: cada lado deve ser menor que a soma dos outros dois.`
      : `Los lados **${a}, ${b}, ${c}** no cumplen la desigualdad triangular: cada lado tiene que ser menor que la suma de los otros dos.`;
    return { area:'—', perimetro:'—', s:'—', resumen: T.invalid, _insight: { title: T.insightInvalidTitle, text: invalidText, tone: 'warn', icon: '⚠️' } };
  }
  const s=(a+b+c)/2; const A=Math.sqrt(s*(s-a)*(s-b)*(s-c));
  const resumen = __lang === 'en'
    ? `Triangle ${a},${b},${c}: area ${A.toFixed(2)} cm².`
    : __lang === 'pt'
    ? `Triângulo ${a},${b},${c}: área ${A.toFixed(2)} cm².`
    : `Triángulo ${a},${b},${c}: área ${A.toFixed(2)} cm².`;
  const insightText = __lang === 'en'
    ? `With sides **${a}, ${b}, ${c}** the semiperimeter is ${s.toFixed(2)} and the area is **${A.toFixed(2)} cm²** (perimeter ${(a+b+c).toFixed(2)} cm).`
    : __lang === 'pt'
    ? `Com lados **${a}, ${b}, ${c}** o semiperímetro é ${s.toFixed(2)} e a área é **${A.toFixed(2)} cm²** (perímetro ${(a+b+c).toFixed(2)} cm).`
    : `Con lados **${a}, ${b}, ${c}** el semiperímetro es ${s.toFixed(2)} y el área es **${A.toFixed(2)} cm²** (perímetro ${(a+b+c).toFixed(2)} cm).`;
  return { area:`${A.toFixed(2)} cm²`, perimetro:`${(a+b+c).toFixed(2)} cm`, s:s.toFixed(2), resumen, _insight: { title: T.insightTitle, text: insightText, tone: 'neutral', icon: '📐' } };
}
