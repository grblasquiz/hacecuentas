export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function ritmoLlamadasMensajesAmorDistancia(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');

  // Inputs
  const llamadas = Math.max(0, Number(i.llamadas) || 0);   // calls per week
  const duracion  = Math.max(0, Number(i.duracion)  || 0); // avg minutes per call
  const mensajes  = Math.max(0, Number(i.mensajes)  || 0); // messages per week

  // ICS = (N_llamadas × D_promedio) + (N_mensajes ÷ 10)
  // Factor 10: 10 text messages ≈ 1 minute of voice call in emotional impact
  // Based on relationship maintenance research (Stafford & Canary 1991;
  // Holtzman et al. 2021, Journal of Social and Personal Relationships)
  const minutos_llamadas = llamadas * duracion;
  const peso_mensajes    = mensajes / 10;
  const ics = minutos_llamadas + peso_mensajes;

  // Classify into satisfaction zones
  let zona: string;
  let emoji: string;
  let recomendacion: string;

  if (__lang === 'en') {
    if (ics < 15) {
      zona = 'Very low';
      emoji = '🔴';
      recomendacion = 'Communication is critically low. High risk of emotional disconnection. Try to add at least one short call per week.';
    } else if (ics < 30) {
      zona = 'Low';
      emoji = '🟠';
      recomendacion = 'Below the recommended threshold. Frequent misunderstandings are likely. Review your schedule to find shared time slots.';
    } else if (ics < 60) {
      zona = 'Moderate';
      emoji = '🟡';
      recomendacion = 'The relationship is stable but may have emotional distance at times. Try to replace some texts with a longer video call.';
    } else if (ics < 100) {
      zona = 'High';
      emoji = '🟢';
      recomendacion = 'Excellent! Your contact level is similar to couples in the same city. Keep this rhythm.';
    } else {
      zona = 'Very high';
      emoji = '🔵';
      recomendacion = 'Very high volume. Check that both partners are comfortable — over-communication can create anxiety. Prioritize quality over quantity.';
    }

    const resumen = `Weekly call minutes: ${minutos_llamadas.toFixed(0)} min · Message weight: ${peso_mensajes.toFixed(1)} · Zone: ${zona} ${emoji}`;
    const resultado = ics.toFixed(1);

    const _insight = {
      title: `Contact Index (ICS): ${resultado}`,
      text: `Your ICS is **${resultado}** — **${zona}** zone ${emoji}. ${recomendacion}`,
      tone: ics < 15 ? 'negative' : ics < 30 ? 'warning' : ics >= 60 ? 'positive' : 'neutral',
      icon: '📞',
      chart: {
        type: 'gauge',
        value: Math.min(ics, 120),
        min: 0,
        max: 120,
        zones: [
          { from: 0,   to: 15,  color: '#ef4444', label: 'Very low' },
          { from: 15,  to: 30,  color: '#f97316', label: 'Low' },
          { from: 30,  to: 60,  color: '#eab308', label: 'Moderate' },
          { from: 60,  to: 100, color: '#22c55e', label: 'High' },
          { from: 100, to: 120, color: '#3b82f6', label: 'Very high' },
        ],
        label: 'ICS',
      },
    };

    return { resultado, resumen, _insight };

  } else {
    // Spanish (default)
    if (ics < 15) {
      zona = 'Muy bajo';
      emoji = '🔴';
      recomendacion = 'Comunicación críticamente baja. Alto riesgo de desconexión emocional. Tratá de agregar al menos una llamada corta por semana.';
    } else if (ics < 30) {
      zona = 'Bajo';
      emoji = '🟠';
      recomendacion = 'Por debajo del umbral recomendado. Son frecuentes los malentendidos. Revisá los horarios para encontrar ventanas compatibles.';
    } else if (ics < 60) {
      zona = 'Medio';
      emoji = '🟡';
      recomendacion = 'La relación es estable, pero puede haber momentos de distancia emocional. Intentá reemplazar algunos mensajes con una videollamada más larga.';
    } else if (ics < 100) {
      zona = 'Alto';
      emoji = '🟢';
      recomendacion = '¡Excelente! Tu nivel de contacto es similar al de parejas que viven en la misma ciudad. Mantené este ritmo.';
    } else {
      zona = 'Muy alto';
      emoji = '🔵';
      recomendacion = 'Volumen muy alto. Verificá que ambas personas estén cómodas — la hiperconexión puede generar ansiedad. Priorizá calidad sobre cantidad.';
    }

    const resumen = `Minutos de llamada/semana: ${minutos_llamadas.toFixed(0)} min · Peso mensajes: ${peso_mensajes.toFixed(1)} · Zona: ${zona} ${emoji}`;
    const resultado = ics.toFixed(1);

    const _insight = {
      title: `Índice de Contacto (ICS): ${resultado}`,
      text: `Tu ICS es **${resultado}** — zona **${zona}** ${emoji}. ${recomendacion}`,
      tone: ics < 15 ? 'negative' : ics < 30 ? 'warning' : ics >= 60 ? 'positive' : 'neutral',
      icon: '📞',
      chart: {
        type: 'gauge',
        value: Math.min(ics, 120),
        min: 0,
        max: 120,
        zones: [
          { from: 0,   to: 15,  color: '#ef4444', label: 'Muy bajo' },
          { from: 15,  to: 30,  color: '#f97316', label: 'Bajo' },
          { from: 30,  to: 60,  color: '#eab308', label: 'Medio' },
          { from: 60,  to: 100, color: '#22c55e', label: 'Alto' },
          { from: 100, to: 120, color: '#3b82f6', label: 'Muy alto' },
        ],
        label: 'ICS',
      },
    };

    return { resultado, resumen, _insight };
  }
}
