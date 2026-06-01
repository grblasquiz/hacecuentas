/** Temperatura basal para detectar ovulación */
export interface Inputs { temperaturaHoy: number; diaCicloTemp: number; duracionCicloTemp?: number; __lang?: string; }
export interface Outputs { fase: string; interpretacion: string; ovulacionProbable: string; recomendacion: string; }

export function temperaturaBasal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const temp = Number(i.temperaturaHoy);
  const dia = Number(i.diaCicloTemp);
  const ciclo = Number(i.duracionCicloTemp) || 28;
  if (temp < 35.5 || temp > 38) throw new Error(__lang === 'en' ? 'Enter a temperature between 35.5 and 38°C' : 'Ingresá una temperatura entre 35.5 y 38°C');
  if (dia < 1 || dia > 45) throw new Error(__lang === 'en' ? 'Enter a valid cycle day' : 'Ingresá un día del ciclo válido');

  const diaOvulacion = ciclo - 14;
  let fase = '', interpretacion = '', ovulacion = '', recomendacion = '';

  if (dia <= 5) {
    fase = __lang === 'en' ? 'Menstrual phase' : 'Fase menstrual';
    interpretacion = temp < 36.5
      ? (__lang === 'en' ? 'Low temperature, consistent with the menstrual phase.' : 'Temperatura baja, consistente con fase menstrual.')
      : (__lang === 'en' ? 'Slightly high temperature for the menstrual phase. Fever or little sleep?' : 'Temperatura algo alta para fase menstrual. ¿Fiebre o poco sueño?');
    ovulacion = __lang === 'en' ? `Estimated ovulation: ~day ${diaOvulacion} of the cycle` : `Ovulación estimada: ~día ${diaOvulacion} del ciclo`;
    recomendacion = __lang === 'en' ? 'Keep recording your temperature every morning.' : 'Seguí registrando la temperatura cada mañana.';
  } else if (dia < diaOvulacion - 2) {
    fase = __lang === 'en' ? 'Follicular phase (pre-ovulation)' : 'Fase folicular (pre-ovulación)';
    interpretacion = temp < 36.5
      ? (__lang === 'en' ? 'Low temperature, normal for the follicular phase.' : 'Temperatura baja, normal para fase folicular.')
      : (__lang === 'en' ? 'Slightly elevated temperature. Could be normal variation, alcohol, or little sleep.' : 'Temperatura algo elevada. Puede ser variación normal, alcohol o poco sueño.');
    ovulacion = __lang === 'en' ? `Estimated ovulation: ~day ${diaOvulacion} (~${diaOvulacion - dia} days away)` : `Ovulación estimada: ~día ${diaOvulacion} (faltan ~${diaOvulacion - dia} días)`;
    recomendacion = __lang === 'en' ? 'Fertile window coming up. If trying to conceive, prepare to have intercourse in the coming days.' : 'Ventana fértil próxima. Si buscás embarazo, prepará para tener relaciones en los próximos días.';
  } else if (dia <= diaOvulacion + 1) {
    fase = __lang === 'en' ? 'Ovulatory window' : 'Ventana ovulatoria';
    interpretacion = temp < 36.5
      ? (__lang === 'en' ? 'Temperature still low — ovulation may be about to occur.' : 'Temperatura todavía baja — la ovulación puede estar por ocurrir.')
      : (__lang === 'en' ? 'Temperature rising — ovulation may have already occurred.' : 'Temperatura elevándose — la ovulación puede haber ocurrido.');
    ovulacion = __lang === 'en' ? 'Possible ovulation today or in the last 24–48 hours' : 'Posible ovulación hoy o en las últimas 24-48 horas';
    recomendacion = __lang === 'en' ? 'Most fertile time. If trying to conceive, today is ideal for intercourse.' : 'Momento más fértil. Si buscás embarazo, es ideal tener relaciones hoy.';
  } else {
    fase = __lang === 'en' ? 'Luteal phase (post-ovulation)' : 'Fase lútea (post-ovulación)';
    interpretacion = temp >= 36.4
      ? (__lang === 'en' ? 'Elevated temperature, consistent with the luteal phase (post-ovulation). Progesterone is active.' : 'Temperatura elevada, consistente con fase lútea (post-ovulación). La progesterona está actuando.')
      : (__lang === 'en' ? 'Slightly low temperature for the luteal phase. Could be normal variation or a short luteal phase.' : 'Temperatura algo baja para fase lútea. Puede ser variación normal o fase lútea corta.');
    ovulacion = __lang === 'en' ? `Probable ovulation: ~day ${diaOvulacion} of the cycle` : `Ovulación probable: ~día ${diaOvulacion} del ciclo`;
    const diasPost = dia - diaOvulacion;
    if (diasPost > 16) {
      recomendacion = __lang === 'en' ? 'Luteal phase > 16 days! This may indicate pregnancy. Take a test.' : '¡Fase lútea > 16 días! Esto puede indicar embarazo. Hacé un test.';
    } else {
      recomendacion = __lang === 'en' ? `You are ~${diasPost} DPO. Menstruation is expected around day ${ciclo}.` : `Estás en ~${diasPost} DPO. La menstruación se espera alrededor del día ${ciclo}.`;
    }
  }

  return { fase, interpretacion, ovulacionProbable: ovulacion, recomendacion };
}
