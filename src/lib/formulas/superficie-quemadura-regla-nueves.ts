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
  _chart?: any;
  _insight?: any;
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

  const chart = {
    type: 'scale' as const,
    marker: scq,
    markerLabel: 'Tu %SCQ: ' + scq + '%',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Leve', max: 10, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderada', max: 20, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Gran quemado', max: Math.max(40, Math.ceil(scq) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de superficie corporal quemada: leve <10%, moderada 10-20%, gran quemado >20%.',
  };

  // Insight clínico dinámico según gravedad
  const volumen24h = peso > 0 ? Math.round(4 * peso * scq) : 0;
  let insightText: string;
  let insightTone: string;
  if (scq < 10) {
    insightText = `**${scq}% de SCQ** entra en quemadura leve. Si es superficial, suele manejarse de forma ambulatoria con cura local; vigilá signos de infección en las próximas 48-72 hs.`;
    insightTone = 'neutral';
  } else if (scq <= 20) {
    insightText = `**${scq}% de SCQ** es una quemadura moderada que requiere internación.${volumen24h > 0 ? ` Según Parkland, necesita **${volumen24h.toLocaleString('es-AR')} ml** de Ringer lactato en 24 hs.` : ' Ingresá el peso para calcular la reposición de fluidos (Parkland).'}`;
    insightTone = 'warn';
  } else {
    insightText = `**${scq}% de SCQ** clasifica como gran quemado: derivación urgente a centro de quemados.${volumen24h > 0 ? ` Parkland indica **${volumen24h.toLocaleString('es-AR')} ml** de Ringer lactato en 24 hs, la mitad en las primeras 8.` : ' Ingresá el peso para estimar la reposición de fluidos.'}`;
    insightTone = 'warn';
  }
  const insight = {
    title: scq > 20 ? 'Emergencia: gran quemado' : (scq >= 10 ? 'Requiere internación' : 'Quemadura leve'),
    text: insightText,
    tone: insightTone,
    icon: '🔥',
  };

  return {
    scq,
    gravedad,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
