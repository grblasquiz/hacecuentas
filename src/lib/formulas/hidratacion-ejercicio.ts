/** Agua necesaria durante actividad física según duración, intensidad y peso */
export interface Inputs {
  peso: number;
  duracion: number;
  intensidad?: string;
  temperaturaAmbiente: number;
}
export interface Outputs {
  aguaRecomendada: number;
  aguaPorHora: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function hidratacionEjercicio(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const duracion = Number(i.duracion);
  const intensidad = String(i.intensidad || 'moderada');
  const temp = Number(i.temperaturaAmbiente);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!duracion || duracion <= 0) throw new Error('Ingresá la duración del ejercicio');
  if (isNaN(temp)) throw new Error('Ingresá la temperatura ambiente');

  // Base: 7 ml por kg por hora
  const basePorHora = peso * 7;

  // Factor intensidad
  let factorInt = 1.0;
  if (intensidad === 'baja') factorInt = 0.7;
  else if (intensidad === 'alta') factorInt = 1.4;

  // Factor temperatura
  let factorTemp = 1.0;
  if (temp < 20) factorTemp = 0.85;
  else if (temp > 30) factorTemp = 1.5;
  else if (temp > 25) factorTemp = 1.2;

  const aguaPorHora = Math.round(basePorHora * factorInt * factorTemp);
  const horas = duracion / 60;
  const aguaRecomendada = Math.round(aguaPorHora * horas);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (aguaPorHora > 700) {
    insightText = `Demanda alta (calor y/o intensidad): necesitás **${fmt.format(aguaPorHora)} ml/h**, unos **${fmt.format(aguaRecomendada)} ml** en total. Tomá de a sorbos seguido y no esperes a tener sed.`;
    insightTone = 'warn';
  } else if (aguaPorHora >= 400) {
    insightText = `Para esta sesión necesitás **${fmt.format(aguaPorHora)} ml/h**, unos **${fmt.format(aguaRecomendada)} ml** en total. Repartilo en tragos cortos cada 15-20 min.`;
    insightTone = 'neutral';
  } else {
    insightText = `Demanda moderada: con **${fmt.format(aguaPorHora)} ml/h** (${fmt.format(aguaRecomendada)} ml en total) cubrís el ejercicio sin sobrecargarte.`;
    insightTone = 'good';
  }

  const ultimoMax = Math.max(1000, Math.ceil((aguaPorHora + 100) / 100) * 100);

  return {
    aguaRecomendada,
    aguaPorHora,
    detalle: `Para ${fmt.format(duracion)} min de ejercicio (${intensidad}) a ${fmt.format(temp)}°C, tomá aproximadamente ${fmt.format(aguaRecomendada)} ml (${fmt.format(aguaPorHora)} ml/h).`,
    _insight: {
      title: 'Tu hidratación recomendada',
      text: insightText,
      tone: insightTone,
      icon: '💧',
    },
    _chart: {
      type: 'scale',
      marker: aguaPorHora,
      markerLabel: `${fmt.format(aguaPorHora)} ml/h`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 400, color: '#7dd3fc', colorDark: '#0369a1' },
        { nombre: 'Moderada', max: 700, color: '#38bdf8', colorDark: '#0284c7' },
        { nombre: 'Alta', max: ultimoMax, color: '#0ea5e9', colorDark: '#075985' },
      ],
      ariaLabel: 'Ritmo de hidratación por hora según la demanda del ejercicio',
    },
  };
}
