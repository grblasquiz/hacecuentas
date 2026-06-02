/** Calorías de una porción de pizza de muzzarella según tipo de masa */
export interface Inputs {
  porciones: number;
  tipoMasa?: string; // 'piedra' | 'media_masa' | 'al_molde'
}
export interface Outputs {
  caloriasTotales: number;
  porcionDePizza: string;
  composicion: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

interface DatoMasa {
  nombre: string;
  kcal: number; // por porción (1/8 de pizza)
  proteina: number; // g por porción
  carbs: number;
  grasa: number;
}

// Valores por porción estándar (1/8 de pizza). La muzzarella varía mucho según
// el espesor de la masa y la cantidad de queso.
const MASAS: Record<string, DatoMasa> = {
  piedra: { nombre: 'a la piedra (fina)', kcal: 230, proteina: 11, carbs: 25, grasa: 9 },
  media_masa: { nombre: 'media masa (clásica)', kcal: 280, proteina: 12, carbs: 30, grasa: 12 },
  al_molde: { nombre: 'al molde (gruesa)', kcal: 360, proteina: 16, carbs: 35, grasa: 17 },
};

export function caloriasPizzaMuzzarellaPorcion(i: Inputs): Outputs {
  const porciones = Number(i.porciones);
  const masa = MASAS[String(i.tipoMasa || 'media_masa')] || MASAS['media_masa'];

  if (!porciones || porciones <= 0) throw new Error('Ingresá cuántas porciones comiste');

  const kcalTotal = Math.round(masa.kcal * porciones);
  const prot = Math.round(masa.proteina * porciones);
  const carbs = Math.round(masa.carbs * porciones);
  const grasa = Math.round(masa.grasa * porciones);

  // kcal aportadas por cada macro (Atwater: 4/4/9)
  const kcalProt = prot * 4;
  const kcalCarbs = carbs * 4;
  const kcalGrasa = grasa * 9;
  const kcalMacros = kcalProt + kcalCarbs + kcalGrasa;

  // Una pizza entera = 8 porciones
  const pctPizza = Math.round((porciones / 8) * 100);

  // % de una dieta de referencia de 2000 kcal/día
  const pctDia = Math.round((kcalTotal / 2000) * 100);

  // Para quemarla: minutos caminando (persona ~70 kg, caminata 4 km/h ≈ MET 3,3)
  const minCaminar = Math.round((kcalTotal / (3.3 * 70)) * 60);

  const fmtN = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const plural = porciones === 1 ? 'porción' : 'porciones';
  const tone: 'good' | 'warn' | 'neutral' = pctDia >= 40 ? 'warn' : 'neutral';
  const verbo = porciones === 1 ? (pctDia >= 40 ? 'suma' : 'aporta') : pctDia >= 40 ? 'suman' : 'aportan';

  const insText =
    pctDia >= 40
      ? `${porciones} ${plural} de muzzarella ${masa.nombre} ${verbo} **${fmtN.format(kcalTotal)} kcal**: cerca del **${pctDia}%** de un día de 2000 kcal. Es una comida contundente — para quemarlas necesitarías ~**${minCaminar} min** caminando.`
      : `${porciones} ${plural} de muzzarella ${masa.nombre} ${verbo} **${fmtN.format(kcalTotal)} kcal**, alrededor del **${pctDia}%** de un día de 2000 kcal. Para quemarlas, ~**${minCaminar} min** caminando.`;

  return {
    caloriasTotales: kcalTotal,
    porcionDePizza: `${porciones} de 8 porciones = ${pctPizza}% de una pizza entera (~${fmtN.format(masa.kcal * 8)} kcal la pizza completa).`,
    composicion: `Proteína: ${prot} g | Carbohidratos: ${carbs} g | Grasa: ${grasa} g`,
    detalle: `${porciones} ${plural} de pizza muzzarella ${masa.nombre} (${masa.kcal} kcal c/u): ${fmtN.format(kcalTotal)} kcal. Proteína ${prot} g, carbohidratos ${carbs} g, grasa ${grasa} g. Valores aproximados por porción estándar (1/8 de pizza).`,
    _insight: {
      title: 'Cuánto pesa en tu día',
      text: insText,
      tone,
      icon: '🍕',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Proteína', value: kcalProt },
        { label: 'Carbohidratos', value: kcalCarbs },
        { label: 'Grasa', value: kcalGrasa },
      ],
      prefix: '',
      centerValue: `${fmtN.format(kcalMacros)} kcal`,
      centerLabel: 'según macros',
      ariaLabel: `Calorías de ${porciones} ${plural} de pizza muzzarella por macronutriente: proteína ${kcalProt} kcal, carbohidratos ${kcalCarbs} kcal, grasa ${kcalGrasa} kcal.`,
    },
  };
}
