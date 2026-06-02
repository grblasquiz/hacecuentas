export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function imcAdultosMayoresEdadTabla(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const insight = {
    title: __lang === 'en' ? 'BMI in older adults' : 'IMC en adultos mayores',
    text: __lang === 'en'
      ? `Your result is **${r.toFixed(2)}**. Heads up: after age 65 the healthy BMI range shifts **upward** (roughly **23–28**), since some extra reserve protects against illness and falls.`
      : `Tu resultado es **${r.toFixed(2)}**. Ojo: a partir de los **65 años** el rango de IMC saludable se corre **hacia arriba** (aprox. **23–28**), porque una reserva extra protege ante enfermedades y caídas.`,
    tone: 'neutral',
    icon: '🧓',
  };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
