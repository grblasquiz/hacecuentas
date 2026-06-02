export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function vacunasPerroCachorroAdultoCalendario(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const insight = __lang === 'en'
    ? {
        title: `Result: ${r.toFixed(2)}`,
        text: `Multiplying **${v1}** by **${v2}** and dividing by 10 gives **${r.toFixed(2)}**. For your dog's real puppy/adult vaccination calendar, stick to the dates your vet sets — they vary with age and which doses are already done.`,
        tone: 'neutral' as const,
        icon: '🐶',
      }
    : {
        title: `Resultado: ${r.toFixed(2)}`,
        text: `Multiplicar **${v1}** por **${v2}** y dividir por 10 da **${r.toFixed(2)}**. Para el calendario real de vacunas cachorro/adulto de tu perro, seguí las fechas que indique tu veterinario — varían según la edad y las dosis ya aplicadas.`,
        tone: 'neutral' as const,
        icon: '🐶',
      };
  return { resultado:r.toFixed(2), resumen, _insight:insight };
}
