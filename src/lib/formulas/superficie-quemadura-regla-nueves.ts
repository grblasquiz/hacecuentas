/** Superficie corporal quemada — Regla de los Nueves de Wallace + Parkland */
export interface Inputs {
  cabeza?: string;
  brazoDer?: string;
  brazoIzq?: string;
  toraxAnterior?: string;
  espalda?: string;
  piernaDer?: string;
  piernaIzq?: string;
  perine?: string;
  pesoKg?: number;
}
export interface Outputs {
  scq: number;
  gravedad: string;
  detalle: string;
}

export function superficieQuemaduraReglaNueves(i: Inputs): Outputs {
  const scq =
    Number(i.cabeza || 0) +
    Number(i.brazoDer || 0) +
    Number(i.brazoIzq || 0) +
    Number(i.toraxAnterior || 0) +
    Number(i.espalda || 0) +
    Number(i.piernaDer || 0) +
    Number(i.piernaIzq || 0) +
    Number(i.perine || 0);

  if (scq === 0) throw new Error('Seleccioná al menos una zona afectada');

  let gravedad: string;
  if (scq < 10) gravedad = 'Quemadura leve (<10% SCQ) — Manejo ambulatorio si es superficial';
  else if (scq <= 20) gravedad = 'Quemadura moderada (10-20% SCQ) — Requiere internación';
  else gravedad = 'Gran quemado (>20% SCQ) — Derivar a centro de quemados';

  const peso = Number(i.pesoKg) || 0;
  let parkland = '';
  if (peso > 0 && scq > 0) {
    const volumen = 4 * peso * scq;
    const primeras8h = Math.round(volumen / 2);
    parkland =
      ` | Parkland: ${Math.round(volumen)} ml RL en 24 hs ` +
      `(${primeras8h} ml en primeras 8 hs, ${Math.round(volumen) - primeras8h} ml en siguientes 16 hs)`;
  }

  const detalle =
    `%SCQ: ${scq}% | ${gravedad}${parkland}. ` +
    `Solo contar quemaduras de 2do y 3er grado.`;

  return {
    scq,
    gravedad,
    detalle,
  };
}
