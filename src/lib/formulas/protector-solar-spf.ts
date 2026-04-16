/** Cuánto SPF necesitás según tu fototipo */
export interface Inputs {
  fototipo: string;
  exposicion: string;
  actividad: string;
}
export interface Outputs {
  spfRecomendado: number;
  tiempoProteccion: number;
  reaplicarCada: string;
  cantidadMl: number;
  fotoTipoDescripcion: string;
  mensaje: string;
}

export function protectorSolarSpf(i: Inputs): Outputs {
  const fototipo = String(i.fototipo || 'III');
  const exposicion = String(i.exposicion || 'moderada');
  const actividad = String(i.actividad || 'urbana');

  // Tiempo de autoprotección por fototipo (minutos sin quemarse)
  const autoProteccion: Record<string, number> = {
    I: 5,    // Piel muy clara, pecas, pelo rojizo
    II: 10,   // Piel clara, pelo rubio
    III: 15,  // Piel intermedia, pelo castaño
    IV: 20,   // Piel morena clara
    V: 30,    // Piel morena oscura
    VI: 45,   // Piel negra
  };

  const descripciones: Record<string, string> = {
    I: 'Piel muy clara, siempre se quema, nunca se broncea. Pecas, pelo rojizo/rubio muy claro.',
    II: 'Piel clara, se quema fácilmente, se broncea poco. Pelo rubio/castaño claro.',
    III: 'Piel intermedia, se quema moderadamente, se broncea. Pelo castaño.',
    IV: 'Piel morena clara, se quema poco, se broncea fácilmente. Pelo oscuro.',
    V: 'Piel morena oscura, rara vez se quema. Pelo muy oscuro.',
    VI: 'Piel negra, nunca se quema. Pelo negro.',
  };

  const tAutoProteccion = autoProteccion[fototipo] || 15;

  // SPF recomendado según fototipo y exposición
  let spf: number;
  if (fototipo === 'I' || fototipo === 'II') {
    spf = exposicion === 'intensa' ? 50 : 30;
  } else if (fototipo === 'III' || fototipo === 'IV') {
    spf = exposicion === 'intensa' ? 50 : exposicion === 'moderada' ? 30 : 15;
  } else {
    spf = exposicion === 'intensa' ? 30 : 15;
  }

  // Si actividad acuática o deportiva, siempre mayor
  if (actividad === 'playa' || actividad === 'deporte') {
    spf = Math.max(spf, 50);
  }

  const tiempoProteccion = tAutoProteccion * spf * 0.6; // Factor 0.6 por aplicación imperfecta

  // Reaplicar cada
  let reaplicar: string;
  if (actividad === 'playa' || actividad === 'deporte') {
    reaplicar = 'Cada 1 hora (y después de cada vez que te mojás o transpirás)';
  } else {
    reaplicar = 'Cada 2 horas de exposición solar';
  }

  // Cantidad recomendada: 2mg/cm² ≈ 30-35 ml para cuerpo adulto
  const cantidadMl = actividad === 'playa' ? 35 : 5; // cuerpo vs cara

  return {
    spfRecomendado: spf,
    tiempoProteccion: Math.round(tiempoProteccion),
    reaplicarCada: reaplicar,
    cantidadMl,
    fotoTipoDescripcion: descripciones[fototipo] || descripciones['III'],
    mensaje: `Fototipo ${fototipo}: usá SPF ${spf}+. Reaplicá ${reaplicar.toLowerCase()}. Protección teórica: ~${Math.round(tiempoProteccion)} min.`,
  };
}
