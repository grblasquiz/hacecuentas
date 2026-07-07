export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// USDA Plant Hardiness Zone Map — official boundaries in °F converted to °C
// Source: https://planthardiness.ars.usda.gov/
// Each zone spans 10°F (5.6°C); a/b sub-zones span 5°F (2.8°C)
// Zone 1a: below -51.1°C | Zone 13b: above 18.3°C
const ZONES: { max: number; zone: string; subzones: string }[] = [
  { max: -45.6, zone: '1',  subzones: '1a/1b' },  // below -50°F / -45.6°C
  { max: -40.0, zone: '2',  subzones: '2a/2b' },  // -50°F to -40°F
  { max: -34.4, zone: '3',  subzones: '3a/3b' },  // -40°F to -30°F
  { max: -28.9, zone: '4',  subzones: '4a/4b' },  // -30°F to -20°F
  { max: -23.3, zone: '5',  subzones: '5a/5b' },  // -20°F to -10°F
  { max: -17.8, zone: '6',  subzones: '6a/6b' },  // -10°F to 0°F
  { max: -12.2, zone: '7',  subzones: '7a/7b' },  // 0°F to 10°F
  { max: -6.7,  zone: '8',  subzones: '8a/8b' },  // 10°F to 20°F
  { max: -1.1,  zone: '9',  subzones: '9a/9b' },  // 20°F to 30°F
  { max:  4.4,  zone: '10', subzones: '10a/10b' }, // 30°F to 40°F
  { max: 10.0,  zone: '11', subzones: '11a/11b' }, // 40°F to 50°F
  { max: 15.6,  zone: '12', subzones: '12a/12b' }, // 50°F to 60°F
];

export function zonaUsdaClima(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { zona: 'Zona ', resumen: (t: number, z: string) => `Con mínima ${t}°C estás en zona USDA ${z}.` },
    en: { zona: 'Zone ', resumen: (t: number, z: string) => `With a minimum of ${t}°C you are in USDA zone ${z}.` },
  } as const)[__lang];

  const t = Number(i.tMin);

  // Find the zone by minimum temperature
  let zoneNum = '13'; // default: zone 13 (warmest)
  for (const entry of ZONES) {
    if (t <= entry.max) {
      zoneNum = entry.zone;
      break;
    }
  }

  // Sub-zone: 'a' = lower half of zone range (colder), 'b' = upper half (warmer)
  // Each zone spans 5.6°C; sub-zones each span 2.8°C
  // Zone n 'a': temp <= lower bound + 2.8°C; 'b': above that
  const zoneEntry = ZONES.find(e => e.zone === zoneNum);
  let subzone = 'b';
  if (zoneEntry) {
    const midpoint = zoneEntry.max - 2.8;
    subzone = t <= midpoint ? 'a' : 'b';
  } else if (zoneNum === '13') {
    subzone = t <= 12.8 ? 'a' : 'b';
  } else {
    // Zone 1 — coldest
    subzone = t <= -48.3 ? 'a' : 'b';
  }

  const z = zoneNum + subzone;

  const tone = Number(zoneNum) <= 4 ? 'warn' : Number(zoneNum) >= 10 ? 'good' : 'neutral';
  const tF = Math.round(t * 9 / 5 + 32); // °C to °F for reference

  const insight = __lang === 'en'
    ? {
        title: 'Your Hardiness Zone',
        text: `A minimum winter temperature of **${t}°C (${tF}°F)** places you in **USDA Zone ${z}**. ${Number(zoneNum) <= 4 ? 'Very cold winters: choose only frost-hardy species or grow tender plants in sheltered pots.' : Number(zoneNum) >= 10 ? 'Mild zone: most perennials and many subtropicals will overwinter outdoors.' : `Temperate zone: choose plants labeled for Zone ${z} or colder to be safe.`}`,
        tone: tone as any,
        icon: '🌱',
      }
    : {
        title: 'Tu zona de rusticidad',
        text: `Una mínima de **${t}°C (${tF}°F)** te ubica en la **zona USDA ${z}**. ${Number(zoneNum) <= 4 ? 'Inviernos muy fríos: elegí especies resistentes a heladas o cultivá las delicadas en macetas resguardadas.' : Number(zoneNum) >= 10 ? 'Zona cálida: la mayoría de perennes y muchas subtropicales pasan el invierno al aire libre.' : `Zona templada: elegí plantas aptas para zona ${z} o más fría para ir a lo seguro.`}`,
        tone: tone as any,
        icon: '🌱',
      };

  const chart = {
    type: 'scale' as const,
    marker: t,
    markerLabel: (__lang === 'en' ? 'Min ' : 'Mín ') + t + '°C',
    unit: '°C',
    min: -50,
    segments: [
      { nombre: __lang === 'en' ? 'Zone 1-2 (arctic)' : 'Zona 1-2 (ártica)',      max: -40.0, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: __lang === 'en' ? 'Zone 3-4 (very cold)' : 'Zona 3-4 (muy fría)', max: -28.9, color: '#a5f3fc', colorDark: '#155e75' },
      { nombre: __lang === 'en' ? 'Zone 5-6 (cold)' : 'Zona 5-6 (fría)',          max: -17.8, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: __lang === 'en' ? 'Zone 7-8 (temperate)' : 'Zona 7-8 (templada)', max: -6.7,  color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: __lang === 'en' ? 'Zone 9-10 (mild)' : 'Zona 9-10 (suave)',       max:  4.4,  color: '#fde68a', colorDark: '#92400e' },
      { nombre: __lang === 'en' ? 'Zone 11+ (tropical)' : 'Zona 11+ (tropical)',  max: Math.max(20, t + 1), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: __lang === 'en'
      ? `A minimum of ${t}°C (${tF}°F) falls in USDA zone ${z} on the cold-to-warm scale.`
      : `Una mínima de ${t}°C (${tF}°F) cae en la zona USDA ${z} de la escala de frío a cálido.`,
  };

  return { zona: T.zona + z, resumen: T.resumen(t, z), _insight: insight, _chart: chart };
}
