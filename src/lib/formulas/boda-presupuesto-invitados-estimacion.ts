export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; _insight?: any; }

export function bodaPresupuestoInvitadosEstimacion(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const guests = Math.round(Math.max(0, Number(i.guests) || 0));
  const costoPorCubierto = Math.max(0, Number(i.costoPorCubierto) || 0);
  // porcentajeCatering: 40-70 range, default 50
  const pctRaw = Number(i.porcentajeCatering);
  const porcentajeCatering = (pctRaw >= 30 && pctRaw <= 80) ? pctRaw : 50;
  const fraction = porcentajeCatering / 100;

  if (guests === 0 || costoPorCubierto === 0) {
    const noData = __lang === 'en' ? 'Enter guests and cover cost' : 'Ingresá invitados y costo por cubierto';
    return {
      presupuestoTotal: 0,
      costoTotalCatering: 0,
      desglose: noData,
      _insight: {
        title: __lang === 'en' ? 'Wedding Budget Estimator' : 'Estimación de presupuesto de boda',
        text: noData,
        tone: 'neutral',
        icon: '💒',
      },
    };
  }

  // Core formula: total catering cost / catering fraction = total budget
  const costoTotalCatering = guests * costoPorCubierto;
  const presupuestoTotal = costoTotalCatering / fraction;

  // Standard breakdown percentages (based on Argentine & international wedding industry data)
  const fotografia = presupuestoTotal * 0.10;
  const musica = presupuestoTotal * 0.09;
  const vestimenta = presupuestoTotal * 0.09;
  const flores = presupuestoTotal * 0.07;
  const papeleria = presupuestoTotal * 0.03;
  const contingencia = presupuestoTotal * 0.09;
  const otros = presupuestoTotal - costoTotalCatering - fotografia - musica - vestimenta - flores - papeleria - contingencia;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const fmtEn = (n: number) => Math.round(n).toLocaleString('en-US');

  if (__lang === 'en') {
    const desglose = [
      `Catering & venue: $${fmtEn(costoTotalCatering)} (${porcentajeCatering}%)`,
      `Photography & video: ~$${fmtEn(fotografia)} (10%)`,
      `Music / DJ / band: ~$${fmtEn(musica)} (9%)`,
      `Attire & styling: ~$${fmtEn(vestimenta)} (9%)`,
      `Flowers & décor: ~$${fmtEn(flores)} (7%)`,
      `Stationery & extras: ~$${fmtEn(papeleria)} (3%)`,
      `Contingency (10%): ~$${fmtEn(contingencia)}`,
      `Other (transport, officiant…): ~$${fmtEn(Math.max(0, otros))}`,
    ].join('\n');

    return {
      presupuestoTotal: Math.round(presupuestoTotal),
      costoTotalCatering: Math.round(costoTotalCatering),
      desglose,
      _insight: {
        title: 'Estimated total wedding budget',
        text: `For **${guests} guests** at **$${fmtEn(costoPorCubierto)}/person**, the estimated total budget is **$${fmtEn(presupuestoTotal)}**, assuming catering represents ${porcentajeCatering}% of total spend. Catering alone: $${fmtEn(costoTotalCatering)}.`,
        tone: presupuestoTotal > 50000 ? 'warning' : 'positive',
        icon: '💒',
      },
    };
  }

  // Spanish (default)
  const desglose = [
    `Catering + salón: $${fmt(costoTotalCatering)} (${porcentajeCatering}%)`,
    `Fotografía y video: ~$${fmt(fotografia)} (10%)`,
    `Música / DJ / banda: ~$${fmt(musica)} (9%)`,
    `Vestimenta y estilismo: ~$${fmt(vestimenta)} (9%)`,
    `Flores y decoración: ~$${fmt(flores)} (7%)`,
    `Papelería e invitaciones: ~$${fmt(papeleria)} (3%)`,
    `Contingencia (≈9%): ~$${fmt(contingencia)}`,
    `Otros (transporte, celebrante…): ~$${fmt(Math.max(0, otros))}`,
  ].join('\n');

  return {
    presupuestoTotal: Math.round(presupuestoTotal),
    costoTotalCatering: Math.round(costoTotalCatering),
    desglose,
    _insight: {
      title: 'Presupuesto total estimado de la boda',
      text: `Para **${guests} invitados** a **$${fmt(costoPorCubierto)}/cubierto**, el presupuesto total estimado es **$${fmt(presupuestoTotal)}**, asumiendo que el catering representa el ${porcentajeCatering}% del gasto total. Solo el catering: $${fmt(costoTotalCatering)}.`,
      tone: presupuestoTotal > 50_000_000 ? 'warning' : 'positive',
      icon: '💒',
    },
  };
}
