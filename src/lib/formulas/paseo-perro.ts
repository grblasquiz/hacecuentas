/** Minutos de paseo diario recomendados para un perro */
export interface Inputs {
  tamano?: string;
  edad?: string;
  energia?: string;
}
export interface Outputs {
  minutosDiarios: number;
  paseosPorDia: number;
  kmAproximados: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function paseoPerro(i: Inputs): Outputs {
  const tamano = String(i.tamano || 'mediano');
  const edad = String(i.edad || 'adulto');
  const energia = String(i.energia || 'media');

  // Minutos base por tamaño
  let base = 60;
  if (tamano === 'mini') base = 30;
  else if (tamano === 'pequeno') base = 45;
  else if (tamano === 'grande') base = 75;
  else if (tamano === 'gigante') base = 45;

  // Factor edad
  let factorEdad = 1.0;
  if (edad === 'cachorro') factorEdad = 0.5;
  else if (edad === 'senior') factorEdad = 0.6;

  // Factor energía
  let factorEnergia = 1.0;
  if (energia === 'baja') factorEnergia = 0.7;
  else if (energia === 'alta') factorEnergia = 1.5;

  let minutos = Math.round(base * factorEdad * factorEnergia);
  // Mínimo 15 min, máximo 150 min
  minutos = Math.max(15, Math.min(150, minutos));

  // Paseos por día
  let paseos = 2;
  if (edad === 'cachorro') paseos = 3;
  else if (minutos > 90) paseos = 3;
  else if (minutos <= 30) paseos = 2;

  // Km aproximados (velocidad promedio paseo: 4 km/h)
  const km = Number(((minutos / 60) * 4).toFixed(1));

  const nivel = minutos <= 30 ? 'bajo' : minutos <= 60 ? 'moderado' : minutos <= 90 ? 'alto' : 'muy alto';
  const insight = {
    title: 'Cuánto paseo necesita tu perro',
    text: `Tu perro **${tamano} ${edad}** con energía **${energia}** necesita unos **${minutos} min/día** de paseo (~${km} km), repartidos en **${paseos} salidas**. Es un nivel de actividad **${nivel}**.${edad === 'cachorro' ? ' En cachorros, mejor salidas cortas y frecuentes sin forzar.' : edad === 'senior' ? ' En seniors, acortá las salidas y atendé señales de cansancio.' : ''}`,
    tone: 'neutral',
    icon: '🐕',
  };

  const chart = {
    type: 'scale',
    marker: minutos,
    markerLabel: `${minutos} min/día`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 30, color: '#93c5fd', colorDark: '#2563eb' },
      { nombre: 'Moderado', max: 60, color: '#86efac', colorDark: '#16a34a' },
      { nombre: 'Alto', max: 90, color: '#fcd34d', colorDark: '#d97706' },
      { nombre: 'Muy alto', max: 160, color: '#fca5a5', colorDark: '#dc2626' },
    ],
    ariaLabel: `Necesidad de paseo de ${minutos} minutos diarios, en nivel de actividad ${nivel}.`,
  };

  return {
    minutosDiarios: minutos,
    paseosPorDia: paseos,
    kmAproximados: km,
    detalle: `Perro ${tamano} ${edad} con energía ${energia}: ~${minutos} min/día divididos en ${paseos} paseos (~${km} km). ${edad === 'cachorro' ? 'Para cachorros: paseos cortos y frecuentes, no forzar.' : ''}${edad === 'senior' ? 'Para seniors: paseos más cortos, prestar atención a señales de cansancio.' : ''}`,
    _insight: insight,
    _chart: chart,
  };
}
