export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function areaPerimetroCirculoRadio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.r)||0;
  const a=Math.PI*r*r; const p=2*Math.PI*r;
  const resumen = __lang === 'en'
    ? `Circle with radius ${r}: area ${a.toFixed(1)}, perimeter ${p.toFixed(1)}.`
    : `Círculo de radio ${r}: área ${a.toFixed(1)}, perímetro ${p.toFixed(1)}.`;
  const _insight = {
    title: __lang==='en' ? 'Circle measurements' : 'Medidas del círculo',
    text: __lang==='en'
      ? `With radius **${r} cm** (diameter ${(2*r).toFixed(2)} cm) the area is **${a.toFixed(2)} cm²** and the perimeter is **${p.toFixed(2)} cm**. Doubling the radius would quadruple the area.`
      : `Con radio **${r} cm** (diámetro ${(2*r).toFixed(2)} cm) el área es **${a.toFixed(2)} cm²** y el perímetro **${p.toFixed(2)} cm**. Si duplicás el radio, el área se multiplica por 4.`,
    tone: 'neutral',
    icon: '⭕',
  };
  return { area:`${a.toFixed(2)} cm²`, perimetro:`${p.toFixed(2)} cm`, diametro:`${(2*r).toFixed(2)} cm`, resumen, _insight };
}
