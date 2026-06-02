export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function vacunasGatoTripleLeucemiaRabia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const insight = __lang === 'en'
    ? {
        title: `Result: ${r.toFixed(2)}`,
        text: `Multiplying **${v1}** by **${v2}** and dividing by 10 gives **${r.toFixed(2)}**. For your cat's actual triple/leukemia/rabies schedule, follow the dates your vet sets — they depend on age and prior doses.`,
        tone: 'neutral' as const,
        icon: '🐱',
      }
    : __lang === 'pt'
    ? {
        title: `Resultado: ${r.toFixed(2)}`,
        text: `Multiplicar **${v1}** por **${v2}** e dividir por 10 dá **${r.toFixed(2)}**. Para o calendário real de tríplice/leucemia/raiva do seu gato, siga as datas indicadas pelo veterinário — dependem da idade e das doses anteriores.`,
        tone: 'neutral' as const,
        icon: '🐱',
      }
    : {
        title: `Resultado: ${r.toFixed(2)}`,
        text: `Multiplicar **${v1}** por **${v2}** y dividir por 10 da **${r.toFixed(2)}**. Para el calendario real de triple/leucemia/rabia de tu gato, seguí las fechas que indique tu veterinario — dependen de la edad y de las dosis previas.`,
        tone: 'neutral' as const,
        icon: '🐱',
      };
  return { resultado:r.toFixed(2), resumen, _insight:insight };
}
