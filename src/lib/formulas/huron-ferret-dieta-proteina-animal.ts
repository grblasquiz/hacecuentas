export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huronFerretDietaProteinaAnimal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const insight = {
    title: __lang === 'en' ? 'Result' : __lang === 'pt' ? 'Resultado' : 'Resultado',
    text: __lang === 'en'
      ? `Ferrets are obligate carnivores: their diet must be **high in animal protein** and **fat**, with almost no carbohydrates or fiber. With your inputs the result is **${r.toFixed(2)}**.`
      : __lang === 'pt'
      ? `O furão é um carnívoro obrigatório: a dieta deve ser **rica em proteína animal** e **gordura**, com quase nada de carboidratos ou fibra. Com seus dados o resultado é **${r.toFixed(2)}**.`
      : `El hurón es un carnívoro estricto: su dieta debe ser **alta en proteína animal** y **grasa**, con casi nada de carbohidratos ni fibra. Con tus datos el resultado es **${r.toFixed(2)}**.`,
    tone: 'neutral',
    icon: '🦦',
  };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
