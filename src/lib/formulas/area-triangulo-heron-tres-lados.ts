export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function areaTrianguloHeronTresLados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      invalid: 'Los lados no forman triángulo válido.',
    },
    en: {
      invalid: 'The sides do not form a valid triangle.',
    },
    pt: {
      invalid: 'Os lados não formam um triângulo válido.',
    },
  } as const)[__lang];
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a+b<=c||a+c<=b||b+c<=a) return { area:'—', perimetro:'—', s:'—', resumen: T.invalid };
  const s=(a+b+c)/2; const A=Math.sqrt(s*(s-a)*(s-b)*(s-c));
  const resumen = __lang === 'en'
    ? `Triangle ${a},${b},${c}: area ${A.toFixed(2)} cm².`
    : __lang === 'pt'
    ? `Triângulo ${a},${b},${c}: área ${A.toFixed(2)} cm².`
    : `Triángulo ${a},${b},${c}: área ${A.toFixed(2)} cm².`;
  return { area:`${A.toFixed(2)} cm²`, perimetro:`${(a+b+c).toFixed(2)} cm`, s:s.toFixed(2), resumen };
}
