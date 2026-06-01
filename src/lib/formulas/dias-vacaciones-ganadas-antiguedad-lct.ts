export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasVacacionesGanadasAntiguedadLct(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      proporcional: 'proporcional primer año',
      hasta5: 'hasta 5 años',
      de5a10: '5-10 años',
      de10a20: '10-20 años',
      mas20: 'más de 20 años',
      diasCorridos: (d: number) => `${d} días corridos`,
      interpretacion: (anios: number, a: number, d: number, t: string) => `Con ${anios.toFixed(1)} años (${a} meses) de antigüedad: ${d} días (tramo: ${t}).`,
    },
    en: {
      proporcional: 'proportional first year',
      hasta5: 'up to 5 years',
      de5a10: '5-10 years',
      de10a20: '10-20 years',
      mas20: 'more than 20 years',
      diasCorridos: (d: number) => `${d} calendar days`,
      interpretacion: (anios: number, a: number, d: number, t: string) => `With ${anios.toFixed(1)} years (${a} months) of seniority: ${d} days (bracket: ${t}).`,
    },
  } as const)[__lang];
  const a=Number(i.antiguedadMeses)||0; const anios=a/12;
  let d=0, t='';
  if(anios<0.5){d=Math.floor(a);t=T.proporcional}
  else if(anios<=5){d=14;t=T.hasta5}
  else if(anios<=10){d=21;t=T.de5a10}
  else if(anios<=20){d=28;t=T.de10a20}
  else {d=35;t=T.mas20}
  return { dias: T.diasCorridos(d), interpretacion: T.interpretacion(anios, a, d, t) };
}
