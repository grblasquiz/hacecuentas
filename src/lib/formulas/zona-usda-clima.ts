export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function zonaUsdaClima(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { zona: 'Zona ', resumen: (t: number, z: string) => `Con mínima ${t}°C estás en zona USDA ${z}.` },
    en: { zona: 'Zone ', resumen: (t: number, z: string) => `With a minimum of ${t}°C you are in USDA zone ${z}.` },
  } as const)[__lang];
  const t = Number(i.tMin);
  let z: string;
  if (t <= -40) z = '1-2'; else if (t <= -30) z = '3'; else if (t <= -20) z = '4-5';
  else if (t <= -10) z = '6'; else if (t <= -5) z = '7'; else if (t <= 0) z = '8';
  else if (t <= 5) z = '9'; else if (t <= 10) z = '10'; else z = '11+';
  // Tono dinámico: muy frío = warn (poco margen para plantas), templado/cálido = good
  const tone = t <= -20 ? 'warn' : t >= 5 ? 'good' : 'neutral';
  const insight = __lang === 'en'
    ? { title: 'Your hardiness zone', text: `An average annual low of **${t}°C** places you in **USDA zone ${z}**. ${t <= -20 ? 'Harsh winters: pick frost-hardy species or grow tender plants in pots you can shelter.' : t >= 5 ? 'A mild zone: most perennials and many subtropicals will overwinter outdoors.' : 'A temperate zone: choose plants rated for zone ' + z + ' or colder to be safe.'}`, tone: tone as any, icon: '🌱' }
    : { title: 'Tu zona de rusticidad', text: `Una mínima anual promedio de **${t}°C** te ubica en la **zona USDA ${z}**. ${t <= -20 ? 'Inviernos duros: elegí especies resistentes a heladas o cultivá las delicadas en macetas que puedas resguardar.' : t >= 5 ? 'Zona templada-cálida: la mayoría de las perennes y muchas subtropicales pasan el invierno a la intemperie.' : 'Zona templada: elegí plantas aptas para zona ' + z + ' o más fría para ir a lo seguro.'}`, tone: tone as any, icon: '🌱' };
  const chart = {
    type: 'scale' as const,
    marker: t,
    markerLabel: (__lang === 'en' ? 'Min ' : 'Mín ') + t + '°C',
    unit: '°C',
    min: -50,
    segments: [
      { nombre: __lang === 'en' ? 'Zone 1-2 (coldest)' : 'Zona 1-2 (más fría)', max: -40, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: 'Zona 3', max: -30, color: '#a5f3fc', colorDark: '#155e75' },
      { nombre: 'Zona 4-5', max: -20, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Zona 6', max: -10, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Zona 7', max: -5, color: '#fef08a', colorDark: '#854d0e' },
      { nombre: 'Zona 8', max: 0, color: '#fde68a', colorDark: '#92400e' },
      { nombre: 'Zona 9', max: 5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Zona 10', max: 10, color: '#fecaca', colorDark: '#991b1b' },
      { nombre: __lang === 'en' ? 'Zone 11+ (warmest)' : 'Zona 11+ (más cálida)', max: Math.max(15, t + 1), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: __lang === 'en'
      ? `A minimum of ${t}°C falls in USDA zone ${z} on the cold-to-warm scale.`
      : `Una mínima de ${t}°C cae en la zona USDA ${z} de la escala de frío a cálido.`,
  };
  return { zona: T.zona + z, resumen: T.resumen(t, z), _insight: insight, _chart: chart };
}
