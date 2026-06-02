/** Calculadora watts/kg y zonas de potencia ciclismo */
export interface Inputs {
  ftp: number;
  peso: number;
}
export interface Outputs {
  wattsKg: number;
  nivel: string;
  z1: string;
  z2: string;
  z3: string;
  z4: string;
  z5: string;
  z6: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function potenciaCiclismoWattsKg(i: Inputs): Outputs {
  const ftp = Number(i.ftp);
  const peso = Number(i.peso);
  if (!ftp || ftp <= 0) throw new Error('Ingresá tu FTP');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  const wattsKg = Number((ftp / peso).toFixed(2));

  let nivel: string;
  if (wattsKg < 2.0) nivel = 'Principiante';
  else if (wattsKg < 2.5) nivel = 'Recreativo';
  else if (wattsKg < 3.0) nivel = 'Intermedio';
  else if (wattsKg < 3.7) nivel = 'Avanzado recreativo';
  else if (wattsKg < 4.5) nivel = 'Competitivo amateur';
  else if (wattsKg < 5.5) nivel = 'Élite / Cat 1-2';
  else nivel = 'Profesional / World Tour';

  // Coggan power zones (% of FTP)
  const z1 = `<${Math.round(ftp * 0.55)} W (<55% FTP) — Recuperación activa`;
  const z2 = `${Math.round(ftp * 0.56)}-${Math.round(ftp * 0.75)} W (56-75%) — Resistencia`;
  const z3 = `${Math.round(ftp * 0.76)}-${Math.round(ftp * 0.90)} W (76-90%) — Tempo`;
  const z4 = `${Math.round(ftp * 0.91)}-${Math.round(ftp * 1.05)} W (91-105%) — Umbral`;
  const z5 = `${Math.round(ftp * 1.06)}-${Math.round(ftp * 1.20)} W (106-120%) — VO2max`;
  const z6 = `${Math.round(ftp * 1.21)}-${Math.round(ftp * 1.50)} W (121-150%) — Anaeróbica`;

  const chart = {
    type: 'scale' as const,
    marker: wattsKg,
    markerLabel: 'Tu W/kg: ' + wattsKg,
    min: 0,
    unit: ' W/kg',
    segments: [
      { nombre: 'Principiante', max: 2.0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Recreativo', max: 2.5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Intermedio', max: 3.0, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Avanzado', max: 3.7, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Competitivo', max: 4.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Élite', max: 5.5, color: '#a7f3d0', colorDark: '#047857' },
      { nombre: 'Profesional', max: Math.max(6.5, Math.ceil(wattsKg) + 1), color: '#99f6e4', colorDark: '#0f766e' },
    ],
    ariaLabel: 'Escala de potencia relativa (W/kg) según niveles de Coggan',
  };

  const insTone = wattsKg >= 3.7 ? 'good' : 'neutral';
  return {
    wattsKg,
    nivel,
    z1, z2, z3, z4, z5, z6,
    mensaje: `FTP: ${ftp}W / ${peso}kg = ${wattsKg} W/kg. Nivel: ${nivel}.`,
    _chart: chart,
    _insight: {
      title: 'Tu relación potencia-peso',
      text: `Con **${ftp} W** de FTP y **${peso} kg** rendís **${wattsKg} W/kg**, nivel **${nivel}**. Para subir, podés ganar vatios (más FTP) o bajar peso: cada kilo menos te sube el ratio sin entrenar más.`,
      tone: insTone,
      icon: '🚴',
    },
  };
}