export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function spfProteccionSolarMinutosPiel(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      reaplicar: 'Cada 2 horas (independiente SPF)',
      advertencia: 'Tiempo teórico. Real es menor por sudor, agua, fricción.',
    },
    en: {
      reaplicar: 'Every 2 hours (regardless of SPF)',
      advertencia: 'Theoretical time. Real protection is shorter due to sweat, water, and friction.',
    },
  } as const)[__lang];
  const p=String(i.tipoPiel||'III'); const spf=Number(i.spf)||30;
  const baseMin={'I':7,'II':10,'III':15,'IV':20,'V':30,'VI':60}[p];
  const min=baseMin*spf;
  const minutosProteccion = __lang === 'en'
    ? `${min} theoretical min (${Math.round(min/60)} h)`
    : `${min} min teóricos (${Math.round(min/60)} h)`;
  return { minutosProteccion, reaplicar: T.reaplicar, advertencia: T.advertencia };
}
