import { CUENTA_DNI_AGO_2026, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Ahorro real con Cuenta DNI (agosto 2026): descuento del rubro con su tope de reintegro.
 * reintegro = min(gasto × %, tope del período). Además: gasto óptimo para agotar el tope.
 */
export function compute(i: Inputs): Outputs {
  const rubroKey = String(i.rubro || 'gastronomia');
  const r = CUENTA_DNI_AGO_2026[rubroKey] || CUENTA_DNI_AGO_2026.gastronomia;
  const gasto = Math.max(0, Number(i.gasto) || 0);

  const descuentoSinTope = gasto * (r.pct / 100);
  const reintegro = r.tope === null ? descuentoSinTope : Math.min(descuentoSinTope, r.tope);
  const gastoOptimo = r.tope === null ? null : r.tope / (r.pct / 100);
  const topeAlcanzado = r.tope !== null && descuentoSinTope >= r.tope;
  const periodoTxt = r.periodo === 'mes' ? 'por mes' : r.periodo === 'finde' ? 'por fin de semana' : 'por semana';
  const ahorroMensual = r.periodo === 'mes' ? reintegro : reintegro * 4.33; // ~4,33 semanas/findes por mes

  const out: Outputs = {
    reintegro: fmtARS(reintegro),
    pagasEfectivamente: fmtARS(Math.max(0, gasto - reintegro)),
    gastoParaAgotarTope: gastoOptimo === null ? 'sin tope de reintegro' : fmtARS(gastoOptimo),
    ahorroMensualEstimado: fmtARS(ahorroMensual),
    condicionesRubro: `${r.pct}% de descuento, ${r.dias}${r.tope !== null ? `, tope ${fmtARS(r.tope)} ${periodoTxt}` : ', sin tope'}`,
  };

  let text: string;
  let tone: 'good' | 'neutral' | 'warn';
  if (gasto === 0) {
    text = `En **${r.label.toLowerCase()}** Cuenta DNI descuenta **${r.pct}%** (${r.dias})${r.tope !== null ? ` con tope de **${fmtARS(r.tope)}** ${periodoTxt}` : ''}. Cargá tu gasto para ver el reintegro.`;
    tone = 'neutral';
  } else if (topeAlcanzado) {
    text = `Con **${fmtARS(gasto)}** en ${r.label.toLowerCase()} llegás al tope: te reintegran **${fmtARS(reintegro)}** ${periodoTxt} y no más. El descuento pleno del ${r.pct}% se aprovecha gastando hasta **${fmtARS(gastoOptimo!)}**; por encima de eso, el excedente va sin descuento.`;
    tone = 'warn';
  } else {
    text = `Por **${fmtARS(gasto)}** en ${r.label.toLowerCase()} (${r.dias}) te reintegran **${fmtARS(reintegro)}**: pagás **${fmtARS(gasto - reintegro)}**.${gastoOptimo !== null ? ` Todavía tenés margen: el tope de ${fmtARS(r.tope!)} ${periodoTxt} se alcanza gastando ${fmtARS(gastoOptimo)}.` : ''}`;
    tone = 'good';
  }

  out._insight = { title: `Te vuelven ${fmtARS(reintegro)} ${periodoTxt}`, text, tone, icon: '💳' };
  return out;
}
