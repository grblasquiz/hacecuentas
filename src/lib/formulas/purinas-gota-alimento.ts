/**
 * Purinas por alimento y gramos.
 */

export interface PurinasGotaAlimentoInputs {
  alimento: string;
  gramos: number;
}

export interface PurinasGotaAlimentoOutputs {
  purinasMg: number;
  categoria: string;
  recomendacion: string;
  resumen: string;
}

export function purinasGotaAlimento(inputs: PurinasGotaAlimentoInputs): PurinasGotaAlimentoOutputs {
  const g = Number(inputs.gramos);
  if (!g || g <= 0) throw new Error('Ingresá gramos válidos');
  const tabla: Record<string, number> = {
    'vegetales': 25, 'lacteos': 10, 'carne-blanca': 120,
    'carne-roja': 130, 'legumbres': 80, 'pescado-graso': 440,
    'visceras': 540, 'mariscos': 180, 'cerveza': 100,
  };
  const porCien = tabla[inputs.alimento] ?? 50;
  const total = (g / 100) * porCien;
  let cat: string, rec: string;
  if (total < 50) { cat = 'Bajo ✅'; rec = 'Seguro en gota.'; }
  else if (total < 150) { cat = 'Moderado'; rec = 'Consumo ocasional aceptable.'; }
  else if (total < 400) { cat = 'Alto ⚠️'; rec = 'Evitar si gota activa.'; }
  else { cat = 'Muy alto 🚨'; rec = 'Evitar completamente en gota/úrico alto.'; }
  return {
    purinasMg: Number(total.toFixed(0)),
    categoria: cat,
    recomendacion: rec,
    resumen: `${g}g aportan ${total.toFixed(0)} mg purinas (${cat}).`,
  };
}
