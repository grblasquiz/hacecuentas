/** Edad del gato en años humanos */
export interface Inputs { anos: number; }
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  expectativa: number;
  _insight?: any;
  _chart?: any;
}

export function edadGato(i: Inputs): Outputs {
  const a = Number(i.anos);
  if (!a || a < 0) throw new Error('Ingresá la edad');

  // Tabla Cornell Feline Health Center
  // Año 1 = 15 humanos; año 2 = +9 (24 total); cada año siguiente = +4
  let edad = 0;
  if (a <= 1) edad = a * 15;
  else if (a <= 2) edad = 15 + (a - 1) * 9;
  else edad = 24 + (a - 2) * 4;

  let etapa = '';
  if (a < 0.5) etapa = 'Gatito';
  else if (a < 2) etapa = 'Junior';
  else if (a < 7) etapa = 'Adulto';
  else if (a < 11) etapa = 'Maduro';
  else if (a < 15) etapa = 'Senior';
  else etapa = 'Geriátrico';

  const edadHumana = Math.round(edad);

  const insightTone = a < 7 ? 'good' : a < 11 ? 'neutral' : 'warn';
  const insightText = a < 7
    ? `Tu gato de **${a} año${a !== 1 ? 's' : ''}** equivale a **${edadHumana} años humanos**: etapa **${etapa}**, en plena forma. Controles veterinarios anuales alcanzan.`
    : a < 11
      ? `Con **${a} años** equivale a **${edadHumana} años humanos** (**${etapa}**). Pasá a chequeos cada 6 meses y vigilá peso y dentadura.`
      : `A los **${a} años** ya son **${edadHumana} años humanos** (**${etapa}**). Etapa delicada: controles semestrales, análisis de sangre y dieta senior.`;

  return {
    edadHumana,
    etapaVida: etapa,
    expectativa: 15, // 12-18 años típico
    _insight: {
      title: 'Tu gato en edad humana',
      text: insightText,
      tone: insightTone,
      icon: '🐱',
    },
    _chart: {
      type: 'scale',
      marker: a,
      markerLabel: `${a} año${a !== 1 ? 's' : ''} · ${etapa}`,
      min: 0,
      segments: [
        { nombre: 'Gatito', max: 0.5, color: '#bfdbfe', colorDark: '#1e3a5f' },
        { nombre: 'Junior', max: 2, color: '#86efac', colorDark: '#14532d' },
        { nombre: 'Adulto', max: 7, color: '#4ade80', colorDark: '#166534' },
        { nombre: 'Maduro', max: 11, color: '#fde047', colorDark: '#713f12' },
        { nombre: 'Senior', max: 15, color: '#fb923c', colorDark: '#7c2d12' },
        { nombre: 'Geriátrico', max: Math.max(20, a + 1), color: '#f87171', colorDark: '#7f1d1d' },
      ],
      ariaLabel: `Etapa de vida del gato a los ${a} años: ${etapa}`,
    },
  };
}
