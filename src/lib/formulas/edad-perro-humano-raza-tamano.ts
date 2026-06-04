export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Convierte la edad de un perro a años humanos equivalentes según su tamaño.
 * Método: AAHA / AKC size-adjusted conversion
 *   - Año 1: 15 años humanos
 *   - Año 2: +9 años humanos (total 24)
 *   - Años siguientes (por año adicional según tamaño):
 *       pequeño / toy (<10 kg):  +4 años humanos
 *       mediano (10–25 kg):       +5 años humanos
 *       grande (25–45 kg):        +6 años humanos
 *       gigante (>45 kg):         +7 años humanos
 *
 * Fuente: AAHA 2019 Canine Life Stage Guidelines + AKC
 * https://www.aaha.org/resources/life-stage-canine-2019/
 * https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/
 */
export function edadPerroHumanoRazaTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // v1 = edad del perro en años (number)
  // v2 = tamaño del perro (string: "pequeno" | "mediano" | "grande" | "gigante")
  const dogAge = Math.max(0, Number(i.v1) || 0);
  const tamano = String(i.v2 || 'mediano');

  // Años humanos adicionales por año de perro (a partir del año 3)
  const yearlyRate: Record<string, number> = {
    pequeno: 4,
    mediano: 5,
    grande: 6,
    gigante: 7,
  };
  const rate = yearlyRate[tamano] ?? 5;

  let humanAge: number;
  if (dogAge <= 0) {
    humanAge = 0;
  } else if (dogAge <= 1) {
    // Interpolación lineal: 0 años → 0, 1 año → 15
    humanAge = dogAge * 15;
  } else if (dogAge <= 2) {
    // Interpolación lineal: 1 año → 15, 2 años → 24
    humanAge = 15 + (dogAge - 1) * 9;
  } else {
    // A partir del año 2: 24 + años adicionales × tasa por tamaño
    humanAge = 24 + (dogAge - 2) * rate;
  }

  humanAge = Math.round(humanAge * 10) / 10;

  // Etapa de vida
  const getLifeStage = (ha: number, size: string): { es: string; en: string } => {
    // Umbrales aproximados de etapa senior por tamaño (en años perro)
    const seniorThreshold: Record<string, number> = {
      pequeno: 11,
      mediano: 9,
      grande: 8,
      gigante: 6,
    };
    const threshold = seniorThreshold[size] ?? 9;
    if (dogAge < 1) return { es: 'Cachorro', en: 'Puppy' };
    if (dogAge < 3) return { es: 'Adulto joven', en: 'Young adult' };
    if (dogAge < threshold) return { es: 'Adulto maduro', en: 'Mature adult' };
    return { es: 'Senior', en: 'Senior' };
  };

  const stage = getLifeStage(humanAge, tamano);

  const tamanoLabel: Record<string, { es: string; en: string }> = {
    pequeno: { es: 'pequeño (< 10 kg)', en: 'small (< 10 kg)' },
    mediano: { es: 'mediano (10–25 kg)', en: 'medium (10–25 kg)' },
    grande: { es: 'grande (25–45 kg)', en: 'large (25–45 kg)' },
    gigante: { es: 'gigante (> 45 kg)', en: 'giant (> 45 kg)' },
  };
  const tamanoLbl = tamanoLabel[tamano] ?? tamanoLabel['mediano'];

  const resultado = `${humanAge} años humanos`;
  const resultadoEn = `${humanAge} human years`;

  const resumen = __lang === 'en'
    ? `A ${dogAge}-year-old ${tamanoLbl.en} dog is approximately ${humanAge} human years old. Life stage: **${stage.en}**.`
    : `Un perro de ${dogAge} años de tamaño ${tamanoLbl.es} equivale a aproximadamente ${humanAge} años humanos. Etapa de vida: **${stage.es}**.`;

  const _insight = {
    title: __lang === 'en' ? 'Human age equivalent' : 'Equivalente en años humanos',
    text: __lang === 'en'
      ? `Your **${dogAge}-year-old ${tamanoLbl.en}** dog is the equivalent of a **${humanAge}-year-old human** (life stage: ${stage.en}). Based on AAHA/AKC size-adjusted method: year 1 = 15 human years, year 2 adds 9, then +${rate}/year for ${tamanoLbl.en} dogs.`
      : `Tu perro de **${dogAge} años** y tamaño **${tamanoLbl.es}** equivale a un humano de **${humanAge} años** (etapa: ${stage.es}). Según el método AAHA/AKC ajustado por tamaño: año 1 = 15 años humanos, año 2 suma 9, luego +${rate} por año para perros ${tamanoLbl.es}.`,
    tone: dogAge >= (tamano === 'gigante' ? 6 : tamano === 'grande' ? 8 : tamano === 'mediano' ? 9 : 11)
      ? 'warning' as const
      : 'positive' as const,
    icon: '🐶',
  };

  return {
    resultado: __lang === 'en' ? resultadoEn : resultado,
    resumen,
    _insight,
  };
}
