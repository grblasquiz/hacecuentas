/**
 * Fibra diaria según IOM.
 */

export interface FibraDiariaEdadSexoInputs {
  sexo: string;
  edad: number;
}

export interface FibraDiariaEdadSexoOutputs {
  fibraGramos: number;
  rangoEdad: string;
  alimentosSugeridos: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function fibraDiariaEdadSexo(inputs: FibraDiariaEdadSexoInputs): FibraDiariaEdadSexoOutputs {
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let fibra: number;
  let rango: string;
  if (edad < 9) {
    fibra = edad + 5;
    rango = 'Niños (regla edad+5)';
  } else if (edad <= 13) {
    fibra = sexo === 'hombre' ? 31 : 26;
    rango = '9-13 años';
  } else if (edad <= 18) {
    fibra = sexo === 'hombre' ? 38 : 26;
    rango = '14-18 años';
  } else if (edad <= 50) {
    fibra = sexo === 'hombre' ? 38 : 25;
    rango = '19-50 años';
  } else {
    fibra = sexo === 'hombre' ? 30 : 21;
    rango = '51+ años';
  }
  const _insight = {
    title: `Tu meta: ${fibra}g de fibra al día`,
    text: `Para tu perfil (**${rango}**, ${sexo}) la recomendación es **${fibra}g diarios**. El consumo promedio ronda los 15g, así que la mayoría queda corta: un combo de avena, fruta, legumbres y verdura ya te acerca (~28g).`,
    tone: 'neutral',
    icon: '🥦',
  };

  const _chart = {
    type: 'scale',
    marker: fibra,
    markerLabel: `Tu meta: ${fibra}g`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 15, color: '#f87171', colorDark: '#ef4444' },
      { nombre: 'Medio', max: 25, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Recomendado', max: 40, color: '#34d399', colorDark: '#10b981' },
    ],
    ariaLabel: `Tu meta de ${fibra}g de fibra ubicada en una escala de ingesta diaria (bajo, medio, recomendado).`,
  };

  return {
    fibraGramos: fibra,
    rangoEdad: rango,
    alimentosSugeridos: '1 taza avena + 1 manzana + 1 taza lentejas + 1 taza brócoli ≈ 28g',
    resumen: `Necesitás ${fibra}g de fibra/día (${rango}, ${sexo}).`,
    _insight,
    _chart,
  };
}
