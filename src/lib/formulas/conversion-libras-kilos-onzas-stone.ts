export interface Inputs {
  amount: number;
  unit: string;
}

export interface Outputs {
  result_kg: number;
  result_lb: number;
  result_oz: number;
  result_st: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const amount = Number(i.amount) || 0;
  const unit = String(i.unit || 'lb').toLowerCase();

  // Factores de conversión internacionales (BIPM, 1959)
  const LB_TO_KG = 0.45359237;
  const KG_TO_LB = 1 / LB_TO_KG;
  const OZ_TO_G = 28.349523125;
  const STONE_TO_KG = 6.35029318;

  let kg = 0;

  // Convertir a kilogramos como unidad base
  if (unit === 'lb') {
    kg = amount * LB_TO_KG;
  } else if (unit === 'kg') {
    kg = amount;
  } else if (unit === 'oz') {
    kg = (amount * OZ_TO_G) / 1000;
  } else if (unit === 'st') {
    kg = amount * STONE_TO_KG;
  } else {
    // Unidad no reconocida, retornar ceros
    return {
      result_kg: 0, result_lb: 0, result_oz: 0, result_st: 0,
      _insight: {
        title: 'Revisá los datos',
        text: `No pude convertir: ingresá una **cantidad positiva** y elegí una unidad válida (kg, lb, oz o stone).`,
        tone: 'warn',
        icon: '⚠️'
      }
    };
  }

  // Validar cantidad no negativa
  if (kg < 0) {
    return {
      result_kg: 0, result_lb: 0, result_oz: 0, result_st: 0,
      _insight: {
        title: 'Revisá los datos',
        text: `No pude convertir: ingresá una **cantidad positiva** y elegí una unidad válida (kg, lb, oz o stone).`,
        tone: 'warn',
        icon: '⚠️'
      }
    };
  }

  // Convertir desde kilogramos a todas las unidades
  const result_kg = Math.round(kg * 100) / 100;
  const result_lb = Math.round(kg * KG_TO_LB * 100) / 100;
  const result_oz = Math.round((kg * 1000) / OZ_TO_G * 100) / 100;
  const result_st = Math.round((kg / STONE_TO_KG) * 100) / 100;

  // Referencia tangible según el peso en kg
  let ref: string;
  if (kg < 0.5) ref = 'algo liviano, como una fruta o un celular';
  else if (kg < 5) ref = 'un objeto de mano, como un libro grande o una notebook';
  else if (kg < 30) ref = 'equipaje de mano o una valija mediana';
  else if (kg < 120) ref = 'el rango del peso corporal de una persona';
  else ref = 'una carga pesada (varias personas o mobiliario)';

  return {
    result_kg,
    result_lb,
    result_oz,
    result_st,
    _insight: {
      title: 'Cuánto pesa, en perspectiva',
      text: `**${result_kg} kg** = **${result_lb} lb** = **${result_oz} oz** = **${result_st} stone**. Es ${ref}. El stone (14 lb) se usa sobre todo en el Reino Unido para el peso de personas.`,
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
