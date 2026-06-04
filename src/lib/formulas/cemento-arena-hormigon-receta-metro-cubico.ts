export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Dosificaciones de hormigón por m³ según recetas estándar argentinas (CIRSOC 201)
 * y equivalentes internacionales para la versión EN (ACI 211.1).
 *
 * Fuente ES: ICPA / CIRSOC 201 — Instituto del Cemento Portland Argentino
 * Fuente EN: ACI 211.1 nominal mixes (M-grade equivalents)
 *
 * Columns: cementKgPerM3, sandKgPerM3, gravelKgPerM3, waterLPerM3, wcRatio
 */
const MIXES_ES: Record<string, { label: string; cement: number; sand: number; gravel: number; water: number; wc: number; mpa: number }> = {
  H8:  { label: 'H-8 (contrapiso)',           cement: 200, sand: 760, gravel: 1150, water: 180, wc: 0.90, mpa: 8  },
  H13: { label: 'H-13 (vereda, carpeta)',     cement: 260, sand: 700, gravel: 1100, water: 180, wc: 0.69, mpa: 13 },
  H17: { label: 'H-17 (losa liviana)',        cement: 300, sand: 670, gravel: 1080, water: 185, wc: 0.62, mpa: 17 },
  H21: { label: 'H-21 (vivienda estándar)',   cement: 340, sand: 640, gravel: 1050, water: 190, wc: 0.56, mpa: 21 },
  H25: { label: 'H-25 (estructuras)',         cement: 380, sand: 610, gravel: 1020, water: 190, wc: 0.50, mpa: 25 },
  H30: { label: 'H-30 (edificios/puentes)',   cement: 420, sand: 580, gravel:  990, water: 195, wc: 0.46, mpa: 30 },
};

const MIXES_EN: Record<string, { label: string; cement: number; sand: number; gravel: number; water: number; wc: number; mpa: number }> = {
  M10: { label: 'M10 – 1:3:6 (~1,450 PSI)',   cement: 220, sand: 740, gravel: 1100, water: 185, wc: 0.84, mpa: 10 },
  M15: { label: 'M15 – 1:2:4 (~2,175 PSI)',   cement: 280, sand: 700, gravel: 1080, water: 185, wc: 0.66, mpa: 15 },
  M20: { label: 'M20 – 1:1.5:3 (~2,900 PSI)', cement: 350, sand: 640, gravel: 1050, water: 175, wc: 0.50, mpa: 20 },
  M25: { label: 'M25 – 1:1:2 (~3,625 PSI)',   cement: 400, sand: 600, gravel: 1010, water: 180, wc: 0.45, mpa: 25 },
  M30: { label: 'M30 – design mix (~4,350 PSI)', cement: 450, sand: 565, gravel: 975, water: 180, wc: 0.40, mpa: 30 },
};

export function cementoArenaHormigonRecetaMetroCubico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const mixes = __lang === 'en' ? MIXES_EN : MIXES_ES;

  // Inputs
  const volumen = Math.max(0, Number(i.volumen) || 0);           // m³ de hormigón final
  const grado   = String(i.grado || (__lang === 'en' ? 'M20' : 'H21'));
  const desperdicio = Math.min(50, Math.max(0, Number(i.desperdicio) || 0)); // % extra

  if (volumen <= 0) {
    const err = __lang === 'en'
      ? 'Enter the concrete volume in m³.'
      : 'Ingresá el volumen de hormigón en m³.';
    return {
      resultado: err,
      resumen: err,
      bolsas_cemento: 0, kg_cemento: 0,
      m3_arena: 0, m3_piedra: 0, litros_agua: 0,
      _insight: { title: __lang === 'en' ? 'Enter volume' : 'Ingresá el volumen', text: err, tone: 'neutral', icon: '🪨' },
    };
  }

  const mix = mixes[grado] || mixes[__lang === 'en' ? 'M20' : 'H21'];

  // Volume with waste
  const volConDesperdicio = volumen * (1 + desperdicio / 100);

  // Material quantities (using kg/m³ density-based values from CIRSOC/ACI)
  const kgCemento  = Math.round(mix.cement * volConDesperdicio);
  const kgArena    = Math.round(mix.sand   * volConDesperdicio);
  const kgPiedra   = Math.round(mix.gravel * volConDesperdicio);
  const litrosAgua = Math.round(mix.water  * volConDesperdicio);

  // Convert to volume and bags
  // Densidad arena suelta ≈ 1520 kg/m³, piedra ≈ 1580 kg/m³, cemento ≈ 1440 kg/m³
  const m3Arena  = parseFloat((kgArena  / 1520).toFixed(3));
  const m3Piedra = parseFloat((kgPiedra / 1580).toFixed(3));
  const bolsas50 = Math.ceil(kgCemento / 50);  // bolsas de 50 kg
  const bolsas42 = Math.ceil(kgCemento / 42.5); // bolsas de 42.5 kg

  const labelGrado = mix.label;
  const mpaLabel   = mix.mpa;

  // --- ES outputs ---
  if (__lang === 'es') {
    const resultado = `${kgCemento} kg cemento | ${m3Arena.toFixed(2)} m³ arena | ${m3Piedra.toFixed(2)} m³ piedra | ${litrosAgua} L agua`;

    const resumen =
      `**${labelGrado}** — ${volumen} m³ de hormigón (+${desperdicio}% desperdicio = ${volConDesperdicio.toFixed(2)} m³ efectivos):\n` +
      `- **Cemento:** ${kgCemento} kg → **${bolsas50} bolsas de 50 kg** (o ${bolsas42} de 42.5 kg)\n` +
      `- **Arena:** ${m3Arena.toFixed(2)} m³ sueltos (${kgArena} kg)\n` +
      `- **Piedra:** ${m3Piedra.toFixed(2)} m³ (${kgPiedra} kg)\n` +
      `- **Agua:** ${litrosAgua} L (relación a/c = ${mix.wc})\n` +
      `- Resistencia característica a 28 días: **${mpaLabel} MPa**`;

    const _insight = {
      title: `${labelGrado} — ${volumen} m³`,
      text:
        `Para ${volumen} m³ de **${labelGrado}** (${mpaLabel} MPa): ` +
        `**${bolsas50} bolsas** de cemento 50 kg · ${m3Arena.toFixed(2)} m³ arena · ${m3Piedra.toFixed(2)} m³ piedra · ${litrosAgua} L agua. ` +
        `Relación a/c = ${mix.wc}. Incluido ${desperdicio}% de desperdicio.`,
      tone: 'positive',
      icon: '🪨',
    };

    return {
      resultado,
      resumen,
      bolsas_cemento: bolsas50,
      kg_cemento: kgCemento,
      m3_arena: m3Arena,
      m3_piedra: m3Piedra,
      litros_agua: litrosAgua,
      _insight,
    };
  }

  // --- EN outputs ---
  const resultado = `${kgCemento} kg cement | ${m3Arena.toFixed(2)} m³ sand | ${m3Piedra.toFixed(2)} m³ gravel | ${litrosAgua} L water`;

  const resumen =
    `**${labelGrado}** — ${volumen} m³ of concrete (+${desperdicio}% waste = ${volConDesperdicio.toFixed(2)} m³ adjusted):\n` +
    `- **Cement:** ${kgCemento} kg → **${bolsas50} bags × 50 kg** (or ${bolsas42} × 42.5 kg)\n` +
    `- **Sand:** ${m3Arena.toFixed(2)} m³ loose (${kgArena} kg)\n` +
    `- **Gravel:** ${m3Piedra.toFixed(2)} m³ (${kgPiedra} kg)\n` +
    `- **Water:** ${litrosAgua} L (w/c ratio = ${mix.wc})\n` +
    `- Characteristic 28-day compressive strength: **${mpaLabel} MPa**`;

  const _insight = {
    title: `${labelGrado} — ${volumen} m³`,
    text:
      `For ${volumen} m³ of **${labelGrado}** (${mpaLabel} MPa): ` +
      `**${bolsas50} bags** of 50 kg cement · ${m3Arena.toFixed(2)} m³ sand · ${m3Piedra.toFixed(2)} m³ gravel · ${litrosAgua} L water. ` +
      `w/c = ${mix.wc}. Includes ${desperdicio}% waste.`,
    tone: 'positive',
    icon: '🪨',
  };

  return {
    resultado,
    resumen,
    bolsas_cemento: bolsas50,
    kg_cemento: kgCemento,
    m3_arena: m3Arena,
    m3_piedra: m3Piedra,
    litros_agua: litrosAgua,
    _insight,
  };
}
