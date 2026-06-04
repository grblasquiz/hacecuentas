export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// USDA FoodData Central reference values (cooked, per 100 g)
const KCAL_PER_100G: Record<string, number> = {
  blanco:        130, // white rice, cooked  — USDA FDC #168878
  integral:      112, // brown rice, cooked  — USDA FDC #168875
  basmati:       121, // basmati cooked      — USDA FDC average
  parboilizado:  123, // parboiled cooked    — USDA FDC average
};

const CARBS_PER_100G: Record<string, number> = {
  blanco: 28.2,
  integral: 23.5,
  basmati: 26.0,
  parboilizado: 25.0,
};

const PROTEIN_PER_100G: Record<string, number> = {
  blanco: 2.7,
  integral: 2.6,
  basmati: 2.7,
  parboilizado: 2.6,
};

const FIBER_PER_100G: Record<string, number> = {
  blanco: 0.4,
  integral: 1.8,
  basmati: 0.5,
  parboilizado: 1.0,
};

const FAT_PER_100G: Record<string, number> = {
  blanco: 0.3,
  integral: 0.8,
  basmati: 0.4,
  parboilizado: 0.4,
};

const LABEL_ES: Record<string, string> = {
  blanco: 'Arroz blanco cocido',
  integral: 'Arroz integral cocido',
  basmati: 'Arroz basmati cocido',
  parboilizado: 'Arroz parboilizado cocido',
};

const LABEL_EN: Record<string, string> = {
  blanco: 'Cooked white rice',
  integral: 'Cooked brown rice',
  basmati: 'Cooked basmati rice',
  parboilizado: 'Cooked parboiled rice',
};

export function caloriasArrozBlancoIntegralCocido(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';
  const isEN = lang === 'en';

  const gramos = Number(i.gramos) || 0;
  const tipo = (i.tipo as string) || 'blanco';

  const kcalPer100 = KCAL_PER_100G[tipo] ?? 130;
  const carbsPer100 = CARBS_PER_100G[tipo] ?? 28.2;
  const proteinPer100 = PROTEIN_PER_100G[tipo] ?? 2.7;
  const fiberPer100 = FIBER_PER_100G[tipo] ?? 0.4;
  const fatPer100 = FAT_PER_100G[tipo] ?? 0.3;

  const kcal = gramos > 0 ? Math.round((gramos * kcalPer100) / 100) : 0;
  const carbs = gramos > 0 ? ((gramos * carbsPer100) / 100).toFixed(1) : '0.0';
  const protein = gramos > 0 ? ((gramos * proteinPer100) / 100).toFixed(1) : '0.0';
  const fiber = gramos > 0 ? ((gramos * fiberPer100) / 100).toFixed(1) : '0.0';
  const fat = gramos > 0 ? ((gramos * fatPer100) / 100).toFixed(1) : '0.0';

  const tipoLabel = isEN ? (LABEL_EN[tipo] ?? 'Cooked white rice') : (LABEL_ES[tipo] ?? 'Arroz blanco cocido');

  const resultado = gramos > 0
    ? `${kcal} kcal`
    : isEN ? '—' : '—';

  const resumen = gramos > 0
    ? (isEN
        ? `${gramos} g of ${tipoLabel}: ${kcal} kcal · ${carbs} g carbs · ${protein} g protein · ${fiber} g fiber · ${fat} g fat`
        : `${gramos} g de ${tipoLabel}: ${kcal} kcal · ${carbs} g carbohidratos · ${protein} g proteína · ${fiber} g fibra · ${fat} g grasas`)
    : (isEN ? 'Enter grams and rice type to calculate.' : 'Ingresá los gramos y el tipo de arroz para calcular.');

  const toneMap: Record<string, string> = {
    neutral: 'neutral',
    ok: 'positive',
    warn: 'warning',
  };

  let tone = 'neutral';
  let insightText = '';

  if (gramos <= 0) {
    insightText = isEN
      ? 'Enter the cooked portion in grams and select the rice type.'
      : 'Ingresá la porción cocida en gramos y elegí el tipo de arroz.';
    tone = 'neutral';
  } else if (tipo === 'integral') {
    insightText = isEN
      ? `**${gramos} g** of cooked brown rice = **${kcal} kcal**. Brown rice has less calories than white rice and 4× more fibre (${fiber} g), which helps moderate blood sugar spikes and increase satiety. USDA FoodData Central data.`
      : `**${gramos} g** de arroz integral cocido = **${kcal} kcal**. El integral tiene menos calorías que el blanco y 4× más fibra (${fiber} g), lo que modera el pico glucémico y aumenta la saciedad. Dato: USDA FoodData Central.`;
    tone = 'positive';
  } else if (tipo === 'blanco') {
    insightText = isEN
      ? `**${gramos} g** of cooked white rice = **${kcal} kcal**. White rice is easily digestible and ideal for post-workout glycogen replenishment. To lower the glycaemic index, combine with protein and vegetables. USDA FoodData Central data.`
      : `**${gramos} g** de arroz blanco cocido = **${kcal} kcal**. El arroz blanco es de fácil digestión, ideal para reponer glucógeno post-entrenamiento. Para bajar el índice glucémico, combinalo con proteína y vegetales. Dato: USDA FoodData Central.`;
    tone = 'neutral';
  } else {
    insightText = isEN
      ? `**${gramos} g** of ${tipoLabel} = **${kcal} kcal** · ${carbs} g carbs · ${protein} g protein. USDA FoodData Central data.`
      : `**${gramos} g** de ${tipoLabel} = **${kcal} kcal** · ${carbs} g carbohidratos · ${protein} g proteína. Dato: USDA FoodData Central.`;
    tone = 'neutral';
  }

  const _insight = {
    title: isEN ? 'Your result' : 'Tu resultado',
    text: insightText,
    tone,
    icon: '🍚',
    _chart: gramos > 0
      ? {
          type: 'donut',
          title: isEN ? 'Macronutrients (g)' : 'Macronutrientes (g)',
          segments: [
            { label: isEN ? 'Carbs' : 'Carbohidratos', value: parseFloat(carbs), color: '#f59e0b' },
            { label: isEN ? 'Protein' : 'Proteína', value: parseFloat(protein), color: '#3b82f6' },
            { label: isEN ? 'Fat' : 'Grasas', value: parseFloat(fat), color: '#10b981' },
            { label: isEN ? 'Fiber' : 'Fibra', value: parseFloat(fiber), color: '#8b5cf6' },
          ],
        }
      : undefined,
  };

  return { resultado, resumen, _insight };
}
