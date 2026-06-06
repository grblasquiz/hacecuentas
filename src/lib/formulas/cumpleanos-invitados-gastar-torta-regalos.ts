export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora de presupuesto de cumpleaños
 * Fórmula: Presupuesto total = Salón + (Catering × invitados) + Torta + Decoración + Animación + (Souvenir × invitados) + Regalos
 * Referencia: estructura estándar de presupuestación de eventos (CAME, experiencia de mercado AR 2026)
 */
export function cumpleanosInvitadosGastarTortaRegalos(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const invitados = Math.max(0, Number(i.invitados) || 0);
  const costoSalon = Math.max(0, Number(i.costo_salon) || 0);
  const cateringPorPersona = Math.max(0, Number(i.catering_por_persona) || 0);
  const costoTorta = Math.max(0, Number(i.costo_torta) || 0);
  const decoracion = Math.max(0, Number(i.decoracion) || 0);
  const animacion = Math.max(0, Number(i.animacion) || 0);
  const souvenirPorPersona = Math.max(0, Number(i.souvenir_por_persona) || 0);
  const presupuestoRegalos = Math.max(0, Number(i.presupuesto_regalos) || 0);

  if (invitados === 0) {
    if (__lang === 'en') {
      return {
        total_presupuesto: '0',
        costo_por_invitado: '0',
        resumen_rubros: 'Enter the number of guests to estimate the budget.',
        _insight: {
          title: 'Birthday Budget',
          text: 'Enter guests and costs to get your estimate.',
          tone: 'neutral',
          icon: '🎂',
        },
      };
    }
    return {
      total_presupuesto: '0',
      costo_por_invitado: '0',
      resumen_rubros: 'Ingresá la cantidad de invitados para estimar el presupuesto.',
      _insight: {
        title: 'Presupuesto Cumpleaños',
        text: 'Ingresá invitados y costos para obtener tu estimado.',
        tone: 'neutral',
        icon: '🎂',
      },
    };
  }

  const cateringTotal = cateringPorPersona * invitados;
  const souvenirTotal = souvenirPorPersona * invitados;

  const totalPresupuesto =
    costoSalon +
    cateringTotal +
    costoTorta +
    decoracion +
    animacion +
    souvenirTotal +
    presupuestoRegalos;

  const costoPorInvitado = invitados > 0 ? totalPresupuesto / invitados : 0;

  // Breakdown de rubros
  const rubros: string[] = [];
  if (__lang === 'en') {
    if (costoSalon > 0) rubros.push(`Venue: $${costoSalon.toLocaleString('en-US')}`);
    if (cateringTotal > 0) rubros.push(`Catering (${invitados} guests × $${cateringPorPersona.toLocaleString('en-US')}): $${cateringTotal.toLocaleString('en-US')}`);
    if (costoTorta > 0) rubros.push(`Cake: $${costoTorta.toLocaleString('en-US')}`);
    if (decoracion > 0) rubros.push(`Decoration: $${decoracion.toLocaleString('en-US')}`);
    if (animacion > 0) rubros.push(`Entertainment: $${animacion.toLocaleString('en-US')}`);
    if (souvenirTotal > 0) rubros.push(`Souvenirs (${invitados} × $${souvenirPorPersona.toLocaleString('en-US')}): $${souvenirTotal.toLocaleString('en-US')}`);
    if (presupuestoRegalos > 0) rubros.push(`Gifts budget: $${presupuestoRegalos.toLocaleString('en-US')}`);
  } else {
    if (costoSalon > 0) rubros.push(`Salón: $${costoSalon.toLocaleString('es-AR')}`);
    if (cateringTotal > 0) rubros.push(`Catering (${invitados} inv × $${cateringPorPersona.toLocaleString('es-AR')}): $${cateringTotal.toLocaleString('es-AR')}`);
    if (costoTorta > 0) rubros.push(`Torta: $${costoTorta.toLocaleString('es-AR')}`);
    if (decoracion > 0) rubros.push(`Decoración: $${decoracion.toLocaleString('es-AR')}`);
    if (animacion > 0) rubros.push(`Animación: $${animacion.toLocaleString('es-AR')}`);
    if (souvenirTotal > 0) rubros.push(`Souvenirs (${invitados} × $${souvenirPorPersona.toLocaleString('es-AR')}): $${souvenirTotal.toLocaleString('es-AR')}`);
    if (presupuestoRegalos > 0) rubros.push(`Regalos (presupuesto): $${presupuestoRegalos.toLocaleString('es-AR')}`);
  }

  const resumenRubros = rubros.length > 0 ? rubros.join(' | ') : (
    __lang === 'en' ? 'No costs entered.' : 'No se ingresaron costos.'
  );

  // Clasificación del festejo
  let nivelFestejo: string;
  if (__lang === 'en') {
    if (costoPorInvitado < 20) nivelFestejo = 'Home / DIY party';
    else if (costoPorInvitado < 50) nivelFestejo = 'Mid-range party';
    else if (costoPorInvitado < 100) nivelFestejo = 'Premium party';
    else nivelFestejo = 'Luxury event';
  } else {
    if (costoPorInvitado < 20000) nivelFestejo = 'Cumple casero / DIY';
    else if (costoPorInvitado < 50000) nivelFestejo = 'Cumple de nivel medio';
    else if (costoPorInvitado < 100000) nivelFestejo = 'Cumple premium';
    else nivelFestejo = 'Evento de lujo';
  }

  // Insight
  let insightText: string;
  let insightTone: string;
  if (__lang === 'en') {
    insightText = `Total budget: **$${totalPresupuesto.toLocaleString('en-US')}** for ${invitados} guests ($${Math.round(costoPorInvitado).toLocaleString('en-US')}/guest). Category: **${nivelFestejo}**.`;
    insightTone = costoPorInvitado < 50 ? 'positive' : costoPorInvitado < 100 ? 'neutral' : 'warning';
  } else {
    insightText = `Presupuesto total: **$${totalPresupuesto.toLocaleString('es-AR')}** para ${invitados} invitados ($${Math.round(costoPorInvitado).toLocaleString('es-AR')}/invitado). Nivel: **${nivelFestejo}**.`;
    insightTone = costoPorInvitado < 50000 ? 'positive' : costoPorInvitado < 100000 ? 'neutral' : 'warning';
  }

  const _insight = {
    title: __lang === 'en' ? 'Party Budget' : 'Presupuesto del Cumple',
    text: insightText,
    tone: insightTone,
    icon: '🎂',
  };

  return {
    total_presupuesto: totalPresupuesto.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
    costo_por_invitado: Math.round(costoPorInvitado).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
    resumen_rubros: resumenRubros,
    _insight,
  };
}
