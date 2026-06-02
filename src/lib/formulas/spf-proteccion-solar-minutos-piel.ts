export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
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
  const horas = Math.round(min/60);
  const minutosProteccion = __lang === 'en'
    ? `${min} theoretical min (${horas} h)`
    : `${min} min teóricos (${horas} h)`;
  const _insight = {
    title: __lang === 'en' ? 'How long it protects (in theory)' : 'Cuánto protege (en teoría)',
    text: __lang === 'en'
      ? `With skin type **${p}** and **SPF ${spf}**, the theoretical limit is **${min} min** (~${horas} h). In practice it's shorter — reapply **every 2 hours**.`
      : `Con piel tipo **${p}** y **SPF ${spf}**, el límite teórico es de **${min} min** (~${horas} h). En la práctica dura menos: reaplicá **cada 2 horas**.`,
    tone: 'warn' as const,
    icon: '☀️',
  };
  return { minutosProteccion, reaplicar: T.reaplicar, advertencia: T.advertencia, _insight };
}
