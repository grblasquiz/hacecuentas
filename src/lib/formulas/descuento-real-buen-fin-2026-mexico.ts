/**
 * Buen Fin 2026 — descuento REAL vs precio inflado.
 * Compara el descuento anunciado (vs el precio "tachado") contra el descuento
 * real (vs el precio al que el producto se vendía semanas antes, el que Profeco
 * publica en "Quién es Quién en los Precios"). Incluye el pago mensual si lo
 * difieres a MSI como referencia simple — el análisis financiero completo de
 * contado vs MSI vive en la calc de Meses Sin Intereses (no se duplica acá).
 * Fórmula pura, sin constantes fiscales.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  precioBuenFin: number;        // precio de la "oferta"
  precioTachado: number;        // precio de lista/anunciado como "antes"
  precioSemanasAntes?: number;  // precio real observado antes del evento (opcional)
  mesesMsi?: number;            // opcional: a cuántos MSI lo pagarías
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const oferta = num(i.precioBuenFin, 0);
  if (!(oferta > 0)) throw new Error('Ingresa el precio de la oferta del Buen Fin');
  const tachado = num(i.precioTachado, 0);
  if (!(tachado > 0)) throw new Error('Ingresa el precio "anterior" que anuncia la tienda (el tachado)');
  const historico = num(i.precioSemanasAntes, 0);
  const meses = Math.max(0, Math.round(num(i.mesesMsi, 0)));

  const descAnunciado = round2((1 - oferta / tachado) * 100);
  const tieneHistorico = historico > 0;
  const descReal = tieneHistorico ? round2((1 - oferta / historico) * 100) : descAnunciado;
  const ahorroReal = tieneHistorico ? round2(historico - oferta) : round2(tachado - oferta);
  const inflado = tieneHistorico && historico < tachado * 0.999;
  const infladoPct = inflado ? round2(((tachado - historico) / historico) * 100) : 0;
  const pagoMsi = meses > 0 ? round2(oferta / meses) : 0;

  let veredicto: string;
  let tone: string;
  if (!tieneHistorico) {
    veredicto = `Descuento anunciado: ${descAnunciado.toFixed(1)}% — sin precio histórico no se puede validar si es real`;
    tone = 'neutral';
  } else if (descReal <= 0) {
    veredicto = 'Oferta FALSA: pagas igual o más que semanas antes';
    tone = 'warn';
  } else if (descReal < descAnunciado / 2) {
    veredicto = `Oferta inflada: el descuento real es ${descReal.toFixed(1)}%, no ${descAnunciado.toFixed(1)}%`;
    tone = 'warn';
  } else {
    veredicto = `Descuento genuino: ${descReal.toFixed(1)}% real vs el precio de semanas antes`;
    tone = 'good';
  }

  const detalle = `Oferta ${fmtMXN(oferta)} vs tachado ${fmtMXN(tachado)} = ${descAnunciado.toFixed(1)}% anunciado.${tieneHistorico ? ` Vs el precio real de semanas antes (${fmtMXN(historico)}) el descuento real es ${descReal.toFixed(1)}% (ahorras ${fmtMXN(ahorroReal)}).` : ''}${inflado ? ` El "precio anterior" está inflado ${infladoPct.toFixed(1)}% sobre el histórico.` : ''}${pagoMsi > 0 ? ` A ${meses} MSI: ${fmtMXN(pagoMsi)}/mes.` : ''}`;

  const insightText = tieneHistorico
    ? (descReal <= 0
        ? `La tienda anuncia **${descAnunciado.toFixed(1)}% de descuento**, pero contra el precio real de semanas antes (**${fmtMXN(historico)}**) no ahorras nada${descReal < 0 ? ' — de hecho pagas MÁS' : ''}. Es el truco clásico que Profeco detecta cada Buen Fin: **inflar el precio "anterior" para simular la rebaja**. Denúnciala en el canal de quejas de Profeco y compara en "Quién es Quién en los Precios".`
        : inflado
          ? `El descuento **real es ${descReal.toFixed(1)}%** (ahorras ${fmtMXN(ahorroReal)}), no el ${descAnunciado.toFixed(1)}% que anuncia la etiqueta: el precio "tachado" está inflado **${infladoPct.toFixed(1)}%** sobre lo que el producto costaba semanas antes. ${descReal >= descAnunciado / 2 ? 'Aun así hay rebaja genuina — decide sabiendo el número real.' : 'La mayor parte de la "oferta" es maquillaje de precio.'}${pagoMsi > 0 ? ` Si lo difieres a **${meses} MSI**, el pago sale en **${fmtMXN(pagoMsi)}/mes** — pero antes revisa si te conviene más el descuento por pago de contado.` : ''}`
          : `Buena noticia: el descuento es **genuino** — pagas ${fmtMXN(oferta)} por algo que semanas antes costaba ${fmtMXN(historico)}, un **${descReal.toFixed(1)}% real** de ahorro (${fmtMXN(ahorroReal)}).${pagoMsi > 0 ? ` A **${meses} MSI** son **${fmtMXN(pagoMsi)}/mes** sin intereses.` : ''} Guarda captura del precio por si el cargo llega distinto.`)
    : `Contra el precio tachado, la rebaja anunciada es de **${descAnunciado.toFixed(1)}%** (${fmtMXN(round2(tachado - oferta))}). Para saber si es real, agrega el **precio de semanas antes**: apúntalo desde octubre o búscalo en "Quién es Quién en los Precios" de Profeco — inflar el precio previo es la queja #1 de cada Buen Fin.`;

  const _insight = { title: veredicto, text: insightText, tone, icon: '🛍️' };

  const _chart = {
    type: 'bar' as const,
    labels: tieneHistorico ? ['Precio tachado', 'Precio semanas antes', 'Oferta Buen Fin'] : ['Precio tachado', 'Oferta Buen Fin'],
    values: tieneHistorico ? [Math.round(tachado), Math.round(historico), Math.round(oferta)] : [Math.round(tachado), Math.round(oferta)],
    prefix: '$',
    ariaLabel: tieneHistorico
      ? `Precio tachado ${fmtMXN(tachado)}, precio de semanas antes ${fmtMXN(historico)}, oferta ${fmtMXN(oferta)}.`
      : `Precio tachado ${fmtMXN(tachado)} y oferta ${fmtMXN(oferta)}.`,
  };

  return {
    descuentoAnunciado: `${descAnunciado.toFixed(1)}% (vs precio tachado)`,
    descuentoReal: tieneHistorico ? `${descReal.toFixed(1)}% (vs precio de semanas antes)` : 'Agrega el precio de semanas antes para calcularlo',
    ahorroRealPesos: fmtMXN(Math.max(0, ahorroReal)),
    pagoMensualMsi: pagoMsi > 0 ? `${fmtMXN(pagoMsi)} × ${meses} meses` : 'Sin MSI (o agrega los meses)',
    veredicto,
    detalle,
    _insight,
    _chart,
  };
}
