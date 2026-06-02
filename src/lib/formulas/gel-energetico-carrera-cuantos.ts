export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gelEnergeticoCarreraCuantos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0;
  const geles = Math.max(0, Math.ceil((h - 1) * 60 / 30));
  const resumen = __lang === 'en'
    ? `${geles} gels of 30g CHO for ${h}h (first hour no gel needed).`
    : `${geles} geles de 30g CHO para ${h}h (primera hora sin gel).`;
  const carbsTotal = geles * 30;
  const _insight = __lang === 'en'
    ? {
        title: 'Your fueling plan',
        text: geles > 0
          ? `For ${h}h of racing, carry **${geles} gels** (${carbsTotal}g of carbs). Take one roughly every 30 min after the first hour, with water.`
          : `For ${h}h you don't need gels: under ~1 hour your glycogen stores are enough.`,
        tone: 'neutral',
        icon: '🏃',
      }
    : {
        title: 'Tu plan de carga',
        text: geles > 0
          ? `Para ${h}h de carrera llevá **${geles} geles** (${carbsTotal}g de carbohidratos). Tomá uno cada ~30 min a partir de la primera hora, con agua.`
          : `Para ${h}h no necesitás geles: con menos de ~1 hora te alcanza el glucógeno que ya tenés.`,
        tone: 'neutral',
        icon: '🏃',
      };
  return { geles: geles.toString(), resumen, _insight };
}
