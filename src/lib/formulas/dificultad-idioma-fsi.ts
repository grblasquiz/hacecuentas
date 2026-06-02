/** Dificultad de Idiomas según FSI */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  categoria: string;
  horasB2: number;
  horasC1: number;
  distancia: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function dificultadIdiomaFsi(i: Inputs): Outputs {
  const idioma = String(i.idioma || 'ingles');
  const DATA: Record<string, { cat: string; b2: number; c1: number; dist: string; rec: string }> = {
    ingles:    { cat: 'Cat II (cercano)', b2: 700,  c1: 900,  dist: 'Media-baja', rec: 'Prioritario por utilidad global.' },
    italiano:  { cat: 'Cat I (muy fácil)', b2: 500,  c1: 650,  dist: 'Muy baja',  rec: 'El más rápido para hispanohablantes.' },
    portugues: { cat: 'Cat I (muy fácil)', b2: 500,  c1: 650,  dist: 'Muy baja',  rec: 'Útil para Brasil y Portugal.' },
    frances:   { cat: 'Cat I (cercano)',   b2: 600,  c1: 750,  dist: 'Baja',      rec: 'Utilidad académica y profesional.' },
    aleman:    { cat: 'Cat II (medio)',    b2: 750,  c1: 900,  dist: 'Media',     rec: 'Laboral fuerte en UE.' },
    holandes:  { cat: 'Cat II (medio)',    b2: 700,  c1: 900,  dist: 'Media',     rec: 'Útil en Países Bajos.' },
    ruso:      { cat: 'Cat III (difícil)', b2: 900,  c1: 1100, dist: 'Alta',      rec: 'Proyecto 2+ años, cirílico.' },
    polaco:    { cat: 'Cat III (difícil)', b2: 900,  c1: 1100, dist: 'Alta',      rec: 'Declinaciones complejas.' },
    turco:     { cat: 'Cat III (difícil)', b2: 900,  c1: 1100, dist: 'Alta',      rec: 'Aglutinante.' },
    hebreo:    { cat: 'Cat III (difícil)', b2: 1100, c1: 1400, dist: 'Muy alta',  rec: 'Alfabeto propio.' },
    arabe:     { cat: 'Cat IV (súper-difícil)', b2: 1600, c1: 2200, dist: 'Máxima', rec: 'Diglosia: MSA + dialecto.' },
    chino:     { cat: 'Cat IV (súper-difícil)', b2: 1500, c1: 2200, dist: 'Máxima', rec: '~3.000 caracteres, 4 tonos.' },
    japones:   { cat: 'Cat IV (súper-difícil)', b2: 1600, c1: 2200, dist: 'Máxima', rec: 'Kanji + hiragana + katakana.' },
    coreano:   { cat: 'Cat IV (súper-difícil)', b2: 1500, c1: 2100, dist: 'Máxima', rec: 'Hangul fácil, gramática SOV.' },
  };
  const d = DATA[idioma] || DATA.ingles;

  const NOMBRES: Record<string, string> = {
    ingles: 'el inglés', italiano: 'el italiano', portugues: 'el portugués', frances: 'el francés',
    aleman: 'el alemán', holandes: 'el neerlandés', ruso: 'el ruso', polaco: 'el polaco',
    turco: 'el turco', hebreo: 'el hebreo', arabe: 'el árabe', chino: 'el chino',
    japones: 'el japonés', coreano: 'el coreano',
  };
  const nombre = NOMBRES[idioma] || 'este idioma';
  const mesesB2 = Math.round(d.b2 / 80); // ~80 h/mes a ritmo intensivo (2-3 h/día)

  let tone: 'good' | 'warn' | 'neutral';
  if (d.b2 <= 600) tone = 'good';
  else if (d.b2 <= 1000) tone = 'neutral';
  else tone = 'warn';

  const insightText = `Para hispanohablantes, llegar a **B2** en ${nombre} pide unas **${d.b2} h** de estudio (≈ **${mesesB2} meses** a ritmo intensivo) y **${d.c1} h** para C1. Distancia lingüística: **${d.dist.toLowerCase()}**.`;

  return {
    categoria: d.cat,
    horasB2: d.b2,
    horasC1: d.c1,
    distancia: d.dist,
    recomendacion: d.rec,
    _insight: { title: 'Cuánto te va a costar', text: insightText, tone, icon: '🗣️' },
    _chart: {
      type: 'scale',
      marker: d.b2,
      markerLabel: `${d.b2} h a B2`,
      min: 0,
      segments: [
        { nombre: 'Fácil', max: 600, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Medio', max: 1000, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Difícil', max: 1300, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Súper-difícil', max: 2400, color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Horas de estudio hasta B2 en ${nombre}: ${d.b2} h, categoría ${d.cat}`,
    },
  };

}
