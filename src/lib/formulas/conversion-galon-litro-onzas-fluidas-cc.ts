export interface Inputs {
  value: number;
  input_unit: string;
}

export interface Outputs {
  gal_us: number;
  gal_uk: number;
  liters: number;
  fl_oz: number;
  milliliters: number;
  table_ref: string;
}

export function compute(i: Inputs): Outputs {
  const value = Number(i.value) || 0;
  if (value < 0) {
    return {
      gal_us: 0,
      gal_uk: 0,
      liters: 0,
      fl_oz: 0,
      milliliters: 0,
      table_ref: "Ingresa un valor válido (mayor a cero)"
    };
  }

  // Factores de conversión a litros (unidad base)
  const GAL_US_TO_LITERS = 3.785411784;
  const GAL_UK_TO_LITERS = 4.54609;
  const FL_OZ_US_TO_ML = 29.5735;
  const ML_TO_LITERS = 0.001;

  let liters = 0;

  // Convertir entrada a litros
  switch (i.input_unit) {
    case "gal_us":
      liters = value * GAL_US_TO_LITERS;
      break;
    case "gal_uk":
      liters = value * GAL_UK_TO_LITERS;
      break;
    case "liter":
      liters = value;
      break;
    case "fl_oz":
      liters = (value * FL_OZ_US_TO_ML) / 1000;
      break;
    case "ml":
      liters = value * ML_TO_LITERS;
      break;
    default:
      liters = 0;
  }

  // Calcular todas las conversiones
  const gal_us = liters / GAL_US_TO_LITERS;
  const gal_uk = liters / GAL_UK_TO_LITERS;
  const fl_oz = (liters * 1000) / FL_OZ_US_TO_ML;
  const milliliters = liters * 1000;

  // Tabla de referencias
  let table_ref = "";
  if (liters >= 0.001) {
    table_ref = `Equivalencias comunes:\n\n`;
    
    if (liters >= 0.75 && liters <= 0.75 + 0.5) {
      table_ref += `≈ Botella de vino estándar (750 ml)\n`;
    }
    if (liters >= 2 && liters <= 2 + 0.5) {
      table_ref += `≈ Botella de gaseosa grande (2 L)\n`;
    }
    if (gal_us >= 0.9 && gal_us <= 1.1) {
      table_ref += `≈ Galón de leche estándar (US)\n`;
    }
    if (liters >= 20 && liters <= 70) {
      table_ref += `≈ Tanque de combustible de auto (20-70 L típico)\n`;
    }
    if (liters >= 100 && liters <= 1000) {
      table_ref += `≈ Depósito de agua residencial (100-1000 L)\n`;
    }
    if (liters >= 10000) {
      table_ref += `≈ Volumen para piscina o cisterna grande\n`;
    }
    
    table_ref += `\nConversión directa:\n`;
    table_ref += `${gal_us.toFixed(3)} gal US | ${gal_uk.toFixed(3)} gal UK | ${liters.toFixed(3)} L | ${fl_oz.toFixed(1)} fl oz | ${milliliters.toFixed(0)} ml`;
  } else {
    table_ref = "Valor muy pequeño. Ingresa una cantidad mayor para ver referencias.";
  }

  return {
    gal_us: Math.round(gal_us * 1000000) / 1000000,
    gal_uk: Math.round(gal_uk * 1000000) / 1000000,
    liters: Math.round(liters * 1000000) / 1000000,
    fl_oz: Math.round(fl_oz * 100) / 100,
    milliliters: Math.round(milliliters),
    table_ref: table_ref
  };
}
