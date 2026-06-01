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
  _chart?: any;
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
  const purinasRedondeado = Number(total.toFixed(0));
  const chart = {
    type: 'scale' as const,
    marker: purinasRedondeado,
    markerLabel: 'Purinas: ' + purinasRedondeado + ' mg',
    min: 0,
    unit: ' mg',
    segments: [
      { nombre: 'Bajo', max: 50, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderado', max: 150, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alto', max: 400, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy alto', max: Math.max(600, Math.ceil(purinasRedondeado) + 50), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de purinas por porción, de bajo a muy alto para personas con gota.',
  };

  return {
    purinasMg: purinasRedondeado,
    categoria: cat,
    recomendacion: rec,
    resumen: `${g}g aportan ${total.toFixed(0)} mg purinas (${cat}).`,
    _chart: chart,
  };
}
