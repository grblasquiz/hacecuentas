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

  return {
    aguaRecomendada,
    aguaPorHora,
    detalle: `Para ${fmt.format(duracion)} min de ejercicio (${intensidad}) a ${fmt.format(temp)}°C, tomá aproximadamente ${fmt.format(aguaRecomendada)} ml (${fmt.format(aguaPorHora)} ml/h).`,
  };
}
