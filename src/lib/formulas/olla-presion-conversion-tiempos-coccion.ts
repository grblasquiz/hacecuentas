/** Conversión de tiempos de cocción: olla convencional → olla a presión */
export interface Inputs {
  tiempoNormal?: number;
  alimento?: string;
  __lang?: string;
}
export interface Outputs {
  tiempoMinimo: number;
  tiempoMaximo: number;
  tiempoEstimado: number;
  ahorro: number;
  porcentajeAhorro: number;
  formula: string;
  _insight?: any;
}

const FACTORES: Record<string, { min: number; max: number; label: string }> = {
  legumbres: { min: 0.12, max: 0.18, label: 'legumbres remojadas' },
  carnes: { min: 0.18, max: 0.22, label: 'carnes duras / cortes de estofado' },
  verduras: { min: 0.28, max: 0.33, label: 'verduras y tubérculos' },
  arroz: { min: 0.3, max: 0.35, label: 'arroz y cereales' },
  guisos: { min: 0.25, max: 0.33, label: 'guisos y preparaciones mixtas' },
};

export function ollaPresionConversionTiemposCoccion(i: Inputs): Outputs {
  const tiempoNormal = Number(i.tiempoNormal) || 0;
  const alimento = String(i.alimento || 'legumbres');

  if (tiempoNormal <= 0) throw new Error('Ingresá un tiempo de cocción normal mayor a cero');
  if (tiempoNormal > 1440) throw new Error('Ingresá un tiempo menor a 24 horas (1440 minutos)');

  const f = FACTORES[alimento];
  if (!f) throw new Error('Elegí un tipo de alimento válido');

  const tiempoMinimo = Math.round(tiempoNormal * f.min);
  const tiempoMaximo = Math.round(tiempoNormal * f.max);
  const factorMedio = (f.min + f.max) / 2;
  const tiempoEstimado = Math.round(tiempoNormal * factorMedio);
  const ahorro = tiempoNormal - tiempoEstimado;
  const porcentajeAhorro = Math.round((ahorro / tiempoNormal) * 100);

  const formula = `t presión ≈ ${tiempoNormal} min × (${f.min}–${f.max}) = ${tiempoMinimo}–${tiempoMaximo} min (${f.label})`;

  return {
    tiempoMinimo,
    tiempoMaximo,
    tiempoEstimado,
    ahorro,
    porcentajeAhorro,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Para ${f.label}, lo que en olla común tarda **${tiempoNormal} minutos** en olla a presión sale en **${tiempoMinimo} a ${tiempoMaximo} minutos** (estimado central: ${tiempoEstimado} min). Ahorrás unos **${ahorro} minutos (${porcentajeAhorro}%)** de cocción. Empezá a contar el tiempo cuando la olla alcanza presión plena, no cuando la ponés al fuego.`,
      tone: 'neutral',
      icon: '🍲',
    },
  };
}
