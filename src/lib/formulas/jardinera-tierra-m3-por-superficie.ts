export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function jardineraTierraM3PorSuperficie(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const litros=Math.round(r*1000);
  const bolsas=Math.ceil(r*1000/50); // bolsas de sustrato de 50 L
  const insight = __lang === 'en'
    ? {
        title:'Soil volume needed',
        text:`You need about **${r.toFixed(2)} m³** of soil, which is roughly **${litros.toLocaleString('en')} litres** — around **${bolsas} bags** of 50 L substrate. Buy a little extra to top up after the soil settles.`,
        tone:'neutral' as const,
        icon:'🪴',
      }
    : {
        title:'Tierra que necesitás',
        text:`Vas a necesitar unos **${r.toFixed(2)} m³** de tierra, que equivalen a aprox. **${litros.toLocaleString('es-AR')} litros** — unas **${bolsas} bolsas** de sustrato de 50 L. Comprá un poco de más porque la tierra se compacta al regar.`,
        tone:'neutral' as const,
        icon:'🪴',
      };
  return { resultado:r.toFixed(2), resumen: __lang === 'en' ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.` : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`, _insight: insight };
}
