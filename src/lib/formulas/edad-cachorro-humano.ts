/**
 * Calculadora de Edad del Cachorro en Años Humanos (primer año)
 */
export interface EdadCachorroInputs { edadMeses: number; tamano: string; }
export interface EdadCachorroOutputs { edadHumana: string; etapaDesarrollo: string; consejo: string; _insight?: any; }

const EQUIVALENCIAS: Record<number, { edad: number; etapa: string; consejo: string }> = {
  1: { edad: 1, etapa: 'Neonato', consejo: 'Aún depende de la madre. No separar antes de las 8 semanas.' },
  2: { edad: 3, etapa: 'Bebé (destete)', consejo: 'Inicio del destete. Primera desparasitación. Socialización temprana.' },
  3: { edad: 5, etapa: 'Infancia', consejo: 'Período clave de socialización. Primeras vacunas. Exposición a estímulos.' },
  4: { edad: 7, etapa: 'Niñez', consejo: 'Cambio de dientes. Muerde mucho. Proporcioná juguetes para masticar.' },
  5: { edad: 8, etapa: 'Niñez activa', consejo: 'Mucha energía. Entrenamiento de obediencia básica. Paseos cortos.' },
  6: { edad: 10, etapa: 'Pre-adolescencia', consejo: 'Ideal para entrenamiento. Puede empezar a desafiar límites.' },
  7: { edad: 11, etapa: 'Adolescencia', consejo: 'Testeo de límites. Constancia en el entrenamiento. Más ejercicio.' },
  8: { edad: 12, etapa: 'Adolescencia', consejo: 'Posible primer celo en hembras pequeñas. Considerar castración.' },
  9: { edad: 13, etapa: 'Adolescencia', consejo: 'Puede "olvidar" lo aprendido. Reforzar entrenamiento.' },
  10: { edad: 14, etapa: 'Adolescencia tardía', consejo: 'Se acerca a la madurez. Continuar socialización y ejercicio.' },
  11: { edad: 14.5, etapa: 'Casi adulto', consejo: 'Madurez casi completa en razas pequeñas. Grandes siguen creciendo.' },
  12: { edad: 15, etapa: 'Adulto joven', consejo: 'Adulto en razas pequeñas/medianas. Transición a alimento adulto.' },
};

export function edadCachorroHumano(inputs: EdadCachorroInputs): EdadCachorroOutputs {
  const meses = Math.min(12, Math.max(1, Number(inputs.edadMeses) || 6));
  const tamano = inputs.tamano || 'mediano';

  const data = EQUIVALENCIAS[meses] || EQUIVALENCIAS[6];

  // Ajuste por tamaño: grandes maduran más lento
  let edadAjustada = data.edad;
  if (tamano === 'grande') edadAjustada = Math.round(data.edad * 0.85);
  else if (tamano === 'pequeno') edadAjustada = Math.round(data.edad * 1.1);

  const tamanoTxt = tamano === 'grande' ? 'grande' : tamano === 'pequeno' ? 'pequeño' : 'mediano';
  const _insight = {
    title: 'Tu cachorro en años humanos',
    text: `A los **${meses} ${meses === 1 ? 'mes' : 'meses'}**, un cachorro de tamaño **${tamanoTxt}** equivale a unos **${edadAjustada} años humanos** y está en etapa **${data.etapa}**. ${tamano === 'grande' ? 'Las razas grandes maduran más lento, así que va algo "más atrás" que una pequeña.' : tamano === 'pequeno' ? 'Las razas pequeñas maduran más rápido, así que va algo "más adelante".' : 'Disfrutá esta etapa: cada mes trae un cambio enorme.'}`,
    tone: 'neutral',
    icon: '🐶',
  };

  return {
    edadHumana: `~${edadAjustada} años humanos`,
    etapaDesarrollo: data.etapa,
    consejo: data.consejo,
    _insight,
  };
}
