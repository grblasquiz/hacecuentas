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
  _insight?: any;
  _chart?: any;
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

  const minProteccion = Math.round(tiempoProteccion);
  const pielVulnerable = fototipo === 'I' || fototipo === 'II';
  const tone: 'good' | 'warn' | 'neutral' =
    pielVulnerable || exposicion === 'intensa' || actividad === 'playa' ? 'warn' : 'neutral';
  const _insight = {
    title: `SPF ${spf} para fototipo ${fototipo}`,
    text: pielVulnerable
      ? `Tu piel se quema fácil (fototipo ${fototipo}): usá **SPF ${spf}+** y reaplicá ${reaplicar.toLowerCase()}. Bien aplicado da ~**${minProteccion} min** de protección, pero igual buscá sombra en el pico de sol.`
      : `Con fototipo ${fototipo} te corresponde **SPF ${spf}+**: bien aplicado rinde ~**${minProteccion} min** antes de tener que reaplicar (${reaplicar.toLowerCase()}). Usá ~**${cantidadMl} ml** por aplicación.`,
    tone,
    icon: '🧴',
  };

  const _chart = {
    type: 'scale' as const,
    marker: spf,
    markerLabel: `SPF ${spf}`,
    min: 0,
    segments: [
      { nombre: 'Baja (15)', max: 15, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Media (30)', max: 30, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Alta (50)', max: 50, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Muy alta (50+)', max: 70, color: '#0ea5e9', colorDark: '#0369a1' },
    ],
    ariaLabel: `Nivel de protección recomendado: SPF ${spf} para fototipo ${fototipo}`,
  };

  return {
    spfRecomendado: spf,
    tiempoProteccion: minProteccion,
    reaplicarCada: reaplicar,
    cantidadMl,
    fotoTipoDescripcion: descripciones[fototipo] || descripciones['III'],
    mensaje: `Fototipo ${fototipo}: usá SPF ${spf}+. Reaplicá ${reaplicar.toLowerCase()}. Protección teórica: ~${minProteccion} min.`,
    _insight,
    _chart,
  };
}
