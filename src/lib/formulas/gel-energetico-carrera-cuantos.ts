export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gelEnergeticoCarreraCuantos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0;
  // ACSM: 60 g CHO/h for races > 75 min; each standard gel = 30 g CHO
  // For races < 1.25 h glycogen stores are typically sufficient (0 gels)
  const geles = h < 1.25 ? 0 : Math.ceil(h * 60 / 30);
  const carbsTotal = geles * 30;
  const resumen = __lang === 'en'
    ? `${geles} gel${geles !== 1 ? 's' : ''} of 30g CHO for ${h}h race.`
    : `${geles} ${geles === 1 ? 'gel' : 'geles'} de 30g CHO para ${h}h de carrera.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Your fueling plan',
        text: geles > 0
          ? `For ${h}h of racing, carry **${geles} gels** (${carbsTotal}g of carbs). Take one roughly every 25–30 min starting at min 40, always with 150–200 ml of water.`
          : `For ${h}h you don't need gels: under ~75 min your glycogen stores are sufficient (ACSM).`,
        tone: 'neutral',
        icon: '🏃',
      }
    : {
        title: 'Tu plan de carga',
        text: geles > 0
          ? `Para ${h}h de carrera llevá **${geles} geles** (${carbsTotal}g de carbohidratos). Tomá uno cada 25-30 min a partir del minuto 40, siempre con 150-200 ml de agua.`
          : `Para ${h}h no necesitás geles: por debajo de ~75 min el glucógeno propio es suficiente (ACSM).`,
        tone: 'neutral',
        icon: '🏃',
      };
  return { geles: geles.toString(), resumen, _insight };
}
