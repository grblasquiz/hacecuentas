/** Temperatura basal para detectar ovulación */
export interface Inputs { temperaturaHoy: number; diaCicloTemp: number; duracionCicloTemp?: number; }
export interface Outputs { fase: string; interpretacion: string; ovulacionProbable: string; recomendacion: string; }

export function temperaturaBasal(i: Inputs): Outputs {
  const temp = Number(i.temperaturaHoy);
  const dia = Number(i.diaCicloTemp);
  const ciclo = Number(i.duracionCicloTemp) || 28;
  if (temp < 35.5 || temp > 38) throw new Error('Ingresá una temperatura entre 35.5 y 38°C');
  if (dia < 1 || dia > 45) throw new Error('Ingresá un día del ciclo válido');

  const diaOvulacion = ciclo - 14;
  let fase = '', interpretacion = '', ovulacion = '', recomendacion = '';

  if (dia <= 5) {
    fase = 'Fase menstrual';
    interpretacion = temp < 36.5 ? 'Temperatura baja, consistente con fase menstrual.' : 'Temperatura algo alta para fase menstrual. ¿Fiebre o poco sueño?';
    ovulacion = `Ovulación estimada: ~día ${diaOvulacion} del ciclo`;
    recomendacion = 'Seguí registrando la temperatura cada mañana.';
  } else if (dia < diaOvulacion - 2) {
    fase = 'Fase folicular (pre-ovulación)';
    interpretacion = temp < 36.5 ? 'Temperatura baja, normal para fase folicular.' : 'Temperatura algo elevada. Puede ser variación normal, alcohol o poco sueño.';
    ovulacion = `Ovulación estimada: ~día ${diaOvulacion} (faltan ~${diaOvulacion - dia} días)`;
    recomendacion = 'Ventana fértil próxima. Si buscás embarazo, prepará para tener relaciones en los próximos días.';
  } else if (dia <= diaOvulacion + 1) {
    fase = 'Ventana ovulatoria';
    interpretacion = temp < 36.5 ? 'Temperatura todavía baja — la ovulación puede estar por ocurrir.' : 'Temperatura elevándose — la ovulación puede haber ocurrido.';
    ovulacion = 'Posible ovulación hoy o en las últimas 24-48 horas';
    recomendacion = 'Momento más fértil. Si buscás embarazo, es ideal tener relaciones hoy.';
  } else {
    fase = 'Fase lútea (post-ovulación)';
    interpretacion = temp >= 36.4 ? 'Temperatura elevada, consistente con fase lútea (post-ovulación). La progesterona está actuando.' : 'Temperatura algo baja para fase lútea. Puede ser variación normal o fase lútea corta.';
    ovulacion = `Ovulación probable: ~día ${diaOvulacion} del ciclo`;
    const diasPost = dia - diaOvulacion;
    if (diasPost > 16) {
      recomendacion = '¡Fase lútea > 16 días! Esto puede indicar embarazo. Hacé un test.';
    } else {
      recomendacion = `Estás en ~${diasPost} DPO. La menstruación se espera alrededor del día ${ciclo}.`;
    }
  }

  return { fase, interpretacion, ovulacionProbable: ovulacion, recomendacion };
}
