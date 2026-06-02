export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vitaminaDDosisSolDiariaEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Multiplying **${v1}** by **${v2}** and dividing by 100 gives **${r.toFixed(2)}**.`
      : `Multiplicar **${v1}** por **${v2}** y dividir por 100 da **${r.toFixed(2)}**.`,
    tone: 'neutral' as const,
    icon: '🧮',
  };
  return {
    resultado:r.toFixed(2),
    resumen: __lang === 'en'
      ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
      : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`,
    _insight,
  };
}
