export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function numeroCuidadoresFiestaInfantilEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=Number(i.edad)||0; const n=Number(i.numNinos)||0;
  let ratio:number;
  if (e<=2) ratio=4; else if (e<=3) ratio=5; else if (e<=5) ratio=8; else ratio=10;
  const ad=Math.ceil(n/ratio);
  const adultos = __lang === 'en' ? `${ad} adults` : `${ad} adultos`;
  const resumen = __lang === 'en'
    ? `${n} kids aged ${e}: ${ad} adults (1:${ratio}).`
    : `${n} niños de ${e}a: ${ad} adultos (1:${ratio}).`;
  const exigente = e <= 3;
  const _insight = {
    title: __lang === 'en' ? 'Supervision plan' : 'Plan de supervisión',
    text: __lang === 'en'
      ? `For **${n} kids** aged **${e}** you need at least **${ad} adult${ad === 1 ? '' : 's'}** (1 per ${ratio}).${exigente ? ' Under 4s wander and need close eyes — keep the ratio tight near water, stairs and the entrance.' : ' For school-age kids, station adults at the riskier spots (food, games, exits) rather than spreading them evenly.'}`
      : `Para **${n} niños** de **${e}** año${e === 1 ? '' : 's'} necesitás al menos **${ad} adulto${ad === 1 ? '' : 's'}** (1 cada ${ratio}).${exigente ? ' Los menores de 4 se dispersan y requieren ojos encima: reforzá el ratio cerca del agua, escaleras y la puerta.' : ' Con chicos más grandes, ubicá a los adultos en los puntos de riesgo (comida, juegos, salidas) en vez de repartirlos parejo.'}`,
    tone: exigente ? 'warn' : 'neutral',
    icon: exigente ? '👶' : '🧒',
  };
  return { ratio:`1:${ratio}`, adultos, resumen, _insight };
}
