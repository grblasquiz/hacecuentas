/** Evaporation rate boil */
export interface Inputs { volumenPreHervor: number; volumenPostHervor: number; duracionHervor: number; }
export interface Outputs { tasaEvaporacion: number; litrosHora: number; clasificacion: string; proyeccion90min: number; _insight?: any; _chart?: any; }

export function evaporationRateBoil(i: Inputs): Outputs {
  const vPre = Number(i.volumenPreHervor);
  const vPost = Number(i.volumenPostHervor);
  const mins = Number(i.duracionHervor);
  if (!vPre || vPre <= 0) throw new Error('Ingresá volumen pre-hervor');
  if (!vPost || vPost <= 0) throw new Error('Ingresá volumen post-hervor');
  if (vPost >= vPre) throw new Error('Post debe ser menor que pre');
  if (!mins || mins <= 0) throw new Error('Ingresá duración');

  const perdida = vPre - vPost;
  const litrosHora = perdida * (60 / mins);
  const tasa = (perdida / vPre) * (60 / mins) * 100;
  const proy90 = litrosHora * 1.5;

  let clasif = '';
  if (tasa < 6) clasif = 'Muy baja — hervor débil';
  else if (tasa < 8) clasif = 'Baja — típico de olla eléctrica';
  else if (tasa < 12) clasif = 'Normal homebrew';
  else if (tasa < 15) clasif = 'Alta — buena para Pilsner';
  else clasif = 'Excesiva — bajá el fuego';

  let _insight: any;
  if (tasa < 6) {
    _insight = {
      title: 'Hervor débil',
      text: `Tu tasa de evaporación es **${tasa.toFixed(1)}%/h** (${litrosHora.toFixed(2)} L/h): muy baja. Subí el fuego para favorecer el DMS off-flavor y un buen hot break.`,
      tone: 'warn',
      icon: '🍺',
    };
  } else if (tasa < 12) {
    _insight = {
      title: 'Tasa en rango ideal',
      text: `Tu tasa de evaporación es **${tasa.toFixed(1)}%/h** (${litrosHora.toFixed(2)} L/h): dentro del rango recomendado para homebrew. En 90 min perderías ~**${proy90.toFixed(2)} L**.`,
      tone: 'good',
      icon: '🍺',
    };
  } else if (tasa < 15) {
    _insight = {
      title: 'Evaporación alta',
      text: `Tu tasa es **${tasa.toFixed(1)}%/h** (${litrosHora.toFixed(2)} L/h): alta, buena para una Pilsner pero vigilá el volumen final. En 90 min perderías ~**${proy90.toFixed(2)} L**.`,
      tone: 'neutral',
      icon: '🍺',
    };
  } else {
    _insight = {
      title: 'Evaporación excesiva',
      text: `Tu tasa es **${tasa.toFixed(1)}%/h** (${litrosHora.toFixed(2)} L/h): demasiado. Bajá el fuego o perderás mucho mosto (~**${proy90.toFixed(2)} L** en 90 min) y concentrarás de más.`,
      tone: 'warn',
      icon: '🍺',
    };
  }

  const _chart = {
    type: 'scale',
    marker: Number(tasa.toFixed(1)),
    markerLabel: `${tasa.toFixed(1)}%/h`,
    min: 0,
    segments: [
      { nombre: 'Muy baja', max: 6, color: '#3b82f6', colorDark: '#2563eb' },
      { nombre: 'Baja', max: 8, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Normal', max: 12, color: '#16a34a', colorDark: '#15803d' },
      { nombre: 'Alta', max: 15, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Excesiva', max: Math.max(20, Number(tasa.toFixed(1)) + 2), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Tasa de evaporación de ${tasa.toFixed(1)}% por hora sobre una escala de muy baja a excesiva para hervor de cerveza.`,
  };

  return {
    tasaEvaporacion: Number(tasa.toFixed(1)),
    litrosHora: Number(litrosHora.toFixed(2)),
    clasificacion: clasif,
    proyeccion90min: Number(proy90.toFixed(2)),
    _insight,
    _chart,
  };
}
