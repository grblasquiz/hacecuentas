export interface Inputs {
  ingredient: string;
  quantity: number;
  from_unit: string;
  to_unit: string;
}

export interface Outputs {
  result: number;
  result_label: string;
  grams_per_cup: string;
  reference_table: string;
}

// Densidades en gramos por taza (240 ml) — fuente: USDA & King Arthur Baking 2024-2025
const GRAMS_PER_CUP: Record<string, number> = {
  all_purpose_flour: 120,
  whole_wheat_flour: 130,
  white_sugar: 200,
  brown_sugar: 220,
  powdered_sugar: 120,
  butter: 227,
  vegetable_oil: 218,
  milk: 245,
  water: 240,
  honey: 340,
  cocoa_powder: 85,
  cornstarch: 120,
  rolled_oats: 90,
  rice_white: 185,
  salt: 288,
  baking_powder: 192,
  baking_soda: 230,
};

const INGREDIENT_NAMES: Record<string, string> = {
  all_purpose_flour: "Harina de trigo (todo uso)",
  whole_wheat_flour: "Harina integral",
  white_sugar: "Azúcar blanca",
  brown_sugar: "Azúcar morena (compacta)",
  powdered_sugar: "Azúcar glass (impalpable)",
  butter: "Mantequilla",
  vegetable_oil: "Aceite vegetal",
  milk: "Leche",
  water: "Agua",
  honey: "Miel",
  cocoa_powder: "Cacao en polvo",
  cornstarch: "Maicena (fécula de maíz)",
  rolled_oats: "Avena en hojuelas",
  rice_white: "Arroz blanco (crudo)",
  salt: "Sal",
  baking_powder: "Polvo para hornear",
  baking_soda: "Bicarbonato de sodio",
};

const UNIT_NAMES: Record<string, string> = {
  cup: "taza(s)",
  tablespoon: "cucharada(s)",
  teaspoon: "cucharadita(s)",
  gram: "g",
  ounce: "oz",
  pound: "lb",
};

// Factor de volumen: fracción de taza que representa cada unidad volumétrica
// 1 taza = 16 cucharadas = 48 cucharaditas
const VOLUME_FRACTION_OF_CUP: Record<string, number> = {
  cup: 1.0,
  tablespoon: 1 / 16,       // 0.0625
  teaspoon: 1 / 48,         // ~0.020833
};

// Conversión de unidades de masa a gramos
const MASS_TO_GRAMS: Record<string, number> = {
  gram: 1.0,
  ounce: 28.3495,
  pound: 453.592,
};

const VOLUME_UNITS = new Set(["cup", "tablespoon", "teaspoon"]);
const MASS_UNITS = new Set(["gram", "ounce", "pound"]);

function toGrams(quantity: number, unit: string, gramsPerCup: number): number {
  if (VOLUME_UNITS.has(unit)) {
    return quantity * gramsPerCup * VOLUME_FRACTION_OF_CUP[unit];
  }
  if (MASS_UNITS.has(unit)) {
    return quantity * MASS_TO_GRAMS[unit];
  }
  return 0;
}

function fromGrams(grams: number, unit: string, gramsPerCup: number): number {
  if (VOLUME_UNITS.has(unit)) {
    return grams / (gramsPerCup * VOLUME_FRACTION_OF_CUP[unit]);
  }
  if (MASS_UNITS.has(unit)) {
    return grams / MASS_TO_GRAMS[unit];
  }
  return 0;
}

function formatNumber(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 0.01) return value.toFixed(4);
  if (Math.abs(value) < 1) return value.toFixed(3);
  if (Math.abs(value) < 100) return value.toFixed(2);
  return value.toFixed(1);
}

function buildReferenceTable(ingredientKey: string, gramsPerCup: number): string {
  const name = INGREDIENT_NAMES[ingredientKey] || ingredientKey;
  const tbsp = gramsPerCup / 16;
  const tsp = gramsPerCup / 48;
  const halfCup = gramsPerCup / 2;
  const quarterCup = gramsPerCup / 4;
  const oz = gramsPerCup / 28.3495;
  return (
    `Tabla de referencia — ${name}:\n` +
    `• 1 taza         = ${gramsPerCup.toFixed(0)} g\n` +
    `• ½ taza         = ${halfCup.toFixed(0)} g\n` +
    `• ¼ taza         = ${quarterCup.toFixed(0)} g\n` +
    `• 1 cucharada    = ${tbsp.toFixed(1)} g\n` +
    `• 1 cucharadita  = ${tsp.toFixed(1)} g\n` +
    `• 1 onza (oz)    = ${formatNumber(1 / oz)} tazas`
  );
}

export function compute(i: Inputs): Outputs {
  const quantity = Number(i.quantity) || 0;
  const ingredient = i.ingredient || "all_purpose_flour";
  const from_unit = i.from_unit || "cup";
  const to_unit = i.to_unit || "gram";

  const gramsPerCup = GRAMS_PER_CUP[ingredient] ?? 120;
  const ingredientName = INGREDIENT_NAMES[ingredient] || ingredient;

  if (quantity <= 0) {
    return {
      result: 0,
      result_label: "Ingresa una cantidad mayor a 0",
      grams_per_cup: `${ingredientName}: ${gramsPerCup} g por taza`,
      reference_table: buildReferenceTable(ingredient, gramsPerCup),
    };
  }

  if (from_unit === to_unit) {
    return {
      result: quantity,
      result_label: `${formatNumber(quantity)} ${UNIT_NAMES[from_unit] || from_unit} = ${formatNumber(quantity)} ${UNIT_NAMES[to_unit] || to_unit}`,
      grams_per_cup: `${ingredientName}: ${gramsPerCup} g por taza`,
      reference_table: buildReferenceTable(ingredient, gramsPerCup),
    };
  }

  const grams = toGrams(quantity, from_unit, gramsPerCup);

  if (grams <= 0) {
    return {
      result: 0,
      result_label: "No se pudo calcular la conversión",
      grams_per_cup: `${ingredientName}: ${gramsPerCup} g por taza`,
      reference_table: buildReferenceTable(ingredient, gramsPerCup),
    };
  }

  const result = fromGrams(grams, to_unit, gramsPerCup);

  const fromUnitLabel = UNIT_NAMES[from_unit] || from_unit;
  const toUnitLabel = UNIT_NAMES[to_unit] || to_unit;

  const result_label =
    `${formatNumber(quantity)} ${fromUnitLabel} de ${ingredientName} = ${formatNumber(result)} ${toUnitLabel}`;

  const grams_per_cup_str = `${ingredientName}: ${gramsPerCup} g por taza (240 ml)`;

  return {
    result: Math.round(result * 1000) / 1000,
    result_label,
    grams_per_cup: grams_per_cup_str,
    reference_table: buildReferenceTable(ingredient, gramsPerCup),
  };
}
