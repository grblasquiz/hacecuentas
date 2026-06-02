/**
 * Calculadora de Edad del Perro en Años Humanos
 * Fórmula logarítmica UC San Diego (2019): 16 × ln(edad) + 31
 * Ajustada por tamaño
 */

export interface EdadPerroHumanoInputs {
  edadPerro: number;
  tamano: string;
}

export interface EdadPerroHumanoOutputs {
  edadHumana: number;
  etapaVida: string;
  comparacionX7: string;
  _insight?: any;
  _chart?: any;
}

export function edadPerroHumano(inputs: EdadPerroHumanoInputs): EdadPerroHumanoOutputs {
  const edadPerro = Number(inputs.edadPerro);
  const tamano = inputs.tamano || 'mediano';

  if (!edadPerro || edadPerro <= 0) {
    throw new Error('Ingresá la edad de tu perro');
  }
  if (edadPerro > 25) {
    throw new Error('La edad máxima razonable para un perro es 25 años');
  }

  // Fórmula base: 16 × ln(edad) + 31
  let edadHumana = 16 * Math.log(edadPerro) + 31;

  // Ajuste por tamaño (perros grandes envejecen más rápido)
  const ajusteTamano: Record<string, number> = {
    pequeno: -3,
    mediano: 0,
    grande: 4,
    gigante: 8,
  };
  edadHumana += (ajusteTamano[tamano] || 0);

  // Para cachorros muy jóvenes, ajuste mínimo
  if (edadPerro < 0.5) {
    edadHumana = Math.max(1, edadPerro * 30);
  }

  edadHumana = Math.round(edadHumana);

  // Etapa de vida
  let etapaVida: string;
  if (edadHumana < 18) etapaVida = 'Cachorro (infancia)';
  else if (edadHumana < 30) etapaVida = 'Cachorro (adolescencia)';
  else if (edadHumana < 45) etapaVida = 'Adulto joven';
  else if (edadHumana < 60) etapaVida = 'Adulto maduro';
  else if (edadHumana < 75) etapaVida = 'Senior';
  else etapaVida = 'Geriátrico';

  const regla7 = Math.round(edadPerro * 7);
  const diff = edadHumana - regla7;
  const comparacion = diff > 0
    ? `Regla ×7 = ${regla7} años (${Math.abs(diff)} años menos que la fórmula científica)`
    : `Regla ×7 = ${regla7} años (${Math.abs(diff)} años más que la fórmula científica)`;

  const toneStage: 'good' | 'warn' | 'neutral' =
    edadHumana >= 75 ? 'warn' :
    (edadHumana >= 60 ? 'neutral' :
    (edadHumana >= 30 ? 'good' : 'neutral'));
  const _insight = {
    title: 'La edad real de tu perro',
    text: `Con la fórmula científica (UCSD 2019, ajustada por tamaño), tu perro de **${edadPerro} ${edadPerro === 1 ? 'año' : 'años'}** equivale a **${edadHumana} años humanos** y está en etapa **${etapaVida.toLowerCase()}**. La vieja regla de "×7" daría **${regla7}**, ${regla7 === edadHumana ? 'igual que la fórmula' : (regla7 > edadHumana ? 'sobrestimando su edad' : 'subestimando su edad')}.`,
    tone: toneStage,
    icon: '🐶',
  };

  const _chart = {
    type: 'scale' as const,
    marker: edadHumana,
    markerLabel: etapaVida,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Infancia', max: 18, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Adolescencia', max: 30, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Adulto joven', max: 45, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Adulto maduro', max: 60, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'Senior', max: 75, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Geriátrico', max: Math.max(95, edadHumana + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Escala de etapa de vida del perro: ${edadHumana} años humanos (${etapaVida}).`,
  };

  return {
    edadHumana,
    etapaVida,
    comparacionX7: comparacion,
    _insight,
    _chart,
  };
}
