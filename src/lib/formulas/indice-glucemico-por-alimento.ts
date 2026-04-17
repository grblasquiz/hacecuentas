/**
 * Calculadora de índice glucémico por alimento.
 * Fuente: Universidad de Sidney GI Database.
 */

const IG_TABLE: Record<string, { ig: number; nombre: string }> = {
  arroz_blanco: { ig: 73, nombre: 'Arroz blanco' },
  arroz_integral: { ig: 68, nombre: 'Arroz integral' },
  pan_blanco: { ig: 75, nombre: 'Pan blanco' },
  pan_integral: { ig: 51, nombre: 'Pan integral' },
  papa_hervida: { ig: 78, nombre: 'Papa hervida' },
  batata: { ig: 63, nombre: 'Batata' },
  zanahoria: { ig: 39, nombre: 'Zanahoria' },
  manzana: { ig: 36, nombre: 'Manzana' },
  banana: { ig: 51, nombre: 'Banana' },
  sandia: { ig: 76, nombre: 'Sandía' },
  naranja: { ig: 43, nombre: 'Naranja' },
  uva: { ig: 53, nombre: 'Uva' },
  leche: { ig: 31, nombre: 'Leche' },
  yogur_natural: { ig: 35, nombre: 'Yogur natural' },
  avena: { ig: 55, nombre: 'Avena' },
  quinoa: { ig: 53, nombre: 'Quinoa' },
  lenteja: { ig: 32, nombre: 'Lenteja' },
  garbanzo: { ig: 28, nombre: 'Garbanzo' },
  pasta: { ig: 49, nombre: 'Pasta al dente' },
  miel: { ig: 61, nombre: 'Miel' },
  azucar: { ig: 65, nombre: 'Azúcar' },
  chocolate_negro: { ig: 40, nombre: 'Chocolate 70%' },
};

export interface IndiceGlucemicoPorAlimentoInputs {
  alimento: string;
}

export interface IndiceGlucemicoPorAlimentoOutputs {
  ig: number;
  clasificacion: string;
  recomendacion: string;
}

export function indiceGlucemicoPorAlimento(inputs: IndiceGlucemicoPorAlimentoInputs): IndiceGlucemicoPorAlimentoOutputs {
  const data = IG_TABLE[inputs.alimento];
  if (!data) throw new Error('Seleccioná un alimento válido');
  let clasif = '', rec = '';
  if (data.ig < 55) { clasif = 'Bajo'; rec = 'IG bajo: libera glucosa lentamente, ideal para diabéticos y saciedad.'; }
  else if (data.ig < 70) { clasif = 'Medio'; rec = 'IG medio: consumir con moderación; combiná con proteína o grasa.'; }
  else { clasif = 'Alto'; rec = 'IG alto: eleva glucemia rápido. Limitar porciones y evitar en ayuno.'; }
  return { ig: data.ig, clasificacion: clasif, recomendacion: rec };
}
