/** Expectativa de vida de un conejo según raza, castración, dieta y alojamiento. */
export interface Inputs {
  raza?: string;
  sexo?: string;
  castrado?: boolean;
  dieta?: string;
  alojamiento?: string;
  edadActual?: number;
}
export interface Outputs {
  expectativaAnios: number;
  aniosRestantes: number;
  gananciaPorCastrar: number;
  perfilRiesgo: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function expectativaVidaConejoRaza(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).castrado = (i as any).castrado === true || (i as any).castrado === 'true';
  const raza = String(i.raza || 'enano');
  const sexo = String(i.sexo || 'hembra');
  const castrado = i.castrado === true;
  const dieta = String(i.dieta || 'correcta');
  const aloj = String(i.alojamiento || 'libre');
  const edad = Math.max(0, Number(i.edadActual ?? 2));

  const base: Record<string, number> = {
    'enano': 11, 'holandes': 10.5, 'belier': 10, 'rex': 9.5,
    'cabeza-leon': 10, 'mediano': 8, 'gigante': 6.5,
  };
  const b = base[raza] ?? 10;

  const fDieta = dieta === 'mala' ? 0.55 : dieta === 'regular' ? 0.85 : 1.0;
  const fAloj = aloj === 'jaula' ? 0.75 : aloj === 'mixto' ? 0.95 : 1.1;

  // Castración: muy relevante en hembras por cáncer de útero
  const fCastrado = castrado
    ? 1.0
    : sexo === 'hembra'
      ? 0.55
      : 0.85;

  const expectativa = Math.round((b * fDieta * fAloj * fCastrado) * 10) / 10;

  // Ganancia por castrar (si no está castrado)
  const expectativaSiCastra = Math.round((b * fDieta * fAloj * 1.0) * 10) / 10;
  const ganancia = castrado ? 0 : Math.max(0, Math.round((expectativaSiCastra - expectativa) * 10) / 10);

  const aniosRestantes = Math.max(0, Math.round((expectativa - edad) * 10) / 10);

  let perfil = '';
  if (fDieta === 1 && fAloj >= 1 && fCastrado === 1) perfil = 'Óptimo — máxima longevidad';
  else if (fDieta >= 0.85 && fCastrado === 1) perfil = 'Bueno';
  else if (fCastrado < 1 && sexo === 'hembra') perfil = 'Alto riesgo (hembra sin castrar — cáncer útero)';
  else if (fDieta < 0.85) perfil = 'Medio (dieta a corregir)';
  else perfil = 'Regular';

  let rec = '';
  if (!castrado && sexo === 'hembra') rec = 'Prioridad 1: castrar. Reduce de 60-80% a <5% el cáncer de útero y suma 3-5 años.';
  else if (dieta === 'mala') rec = 'Cambiá a dieta con heno ilimitado (80%), verduras frescas y pellets limitados. Eliminá pan y frutas en exceso.';
  else if (aloj === 'jaula') rec = 'Sumá al menos 3-4 horas de suelta diaria. La jaula 24 h genera obesidad y estrés crónico.';
  else rec = 'Mantené heno ilimitado, verduras variadas, espacio amplio y controles veterinarios anuales (semestrales si >6 años).';

  // --- Insight dinámico ---
  let toneIns: 'good' | 'warn' | 'neutral';
  let textIns: string;
  if (!castrado && sexo === 'hembra') {
    toneIns = 'warn';
    textIns =
      `Tu coneja sin castrar tiene una expectativa de **${expectativa} años**, frente a **${expectativaSiCastra} años** si la castrás: ` +
      `son **+${ganancia} años** en juego. La castración baja el riesgo de cáncer de útero del 60-80% a menos del 5%.`;
  } else if (perfil.startsWith('Óptimo')) {
    toneIns = 'good';
    textIns =
      `Excelente: con dieta correcta, espacio amplio y castración, tu conejo apunta a **${expectativa} años**, en el techo de su raza. ` +
      `Le quedan unos **${aniosRestantes} años** desde los ${edad} actuales.`;
  } else if (dieta === 'mala') {
    toneIns = 'warn';
    textIns =
      `La dieta inadecuada recorta la expectativa a **${expectativa} años**. Una alimentación correcta (heno ilimitado) puede devolverle varios años de vida.`;
  } else {
    toneIns = 'neutral';
    textIns =
      `Tu conejo tiene una expectativa de **${expectativa} años** (perfil: ${perfil.toLowerCase()}). ` +
      `Desde los ${edad} años actuales, le quedan aproximadamente **${aniosRestantes} años**.`;
  }
  const _insight = {
    title: 'Qué dice esta expectativa',
    text: textIns,
    tone: toneIns,
    icon: '🐇',
  };

  // --- Gauge: zonas de longevidad del conejo ---
  const _chart = {
    type: 'scale',
    marker: expectativa,
    markerLabel: `${expectativa} años`,
    min: 0,
    segments: [
      { nombre: 'Corta', max: 5, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Media', max: 8, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Buena', max: 10, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Óptima', max: 13, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Expectativa de ${expectativa} años en una escala de longevidad del conejo de 0 a 13.`,
  };

  return {
    expectativaAnios: expectativa,
    aniosRestantes,
    gananciaPorCastrar: ganancia,
    perfilRiesgo: perfil,
    recomendacion: rec,
    _insight,
    _chart,
  };
}
