/**
 * Propina legal del 10% + ITBIS en restaurantes — República Dominicana.
 *
 * La cuenta de un restaurante que sirve en el local lleva dos adicionales sobre
 * el consumo (comida y bebida):
 *   - Propina legal 10% (Art. 228, Código de Trabajo Ley 16-92): es un beneficio
 *     laboral obligatorio para el personal de servicio, NO un impuesto. Se calcula
 *     sobre el consumo, sin ITBIS. La Suprema Corte fijó que sólo aplica al consumo
 *     DENTRO del establecimiento (no a delivery ni para llevar).
 *   - ITBIS 18% (Ley 253-12): se calcula sobre el consumo (base SIN propina); la
 *     propina no forma parte de la base del ITBIS.
 *   total = consumo + 10% del consumo + 18% del consumo  (= consumo × 1,28)
 * Además la calc admite una propina VOLUNTARIA opcional (sobre el consumo) y el
 * reparto por persona.
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

const PROPINA_LEGAL = 0.10; // 10% Art. 228 Código de Trabajo

export interface Inputs {
  consumo: number;            // consumo (comida + bebida), RD$
  propinaVoluntaria?: number; // % de propina voluntaria adicional (opcional)
  personas?: number;          // dividir el total entre N personas (opcional)
  delivery?: string;          // 'si' => no aplica el 10% legal (SCJ)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const consumo = num(i.consumo, 0);
  if (!(consumo > 0)) throw new Error('Ingresá el consumo (comida y bebida) en RD$');
  const itbisTasa = REPUBLICA_DOMINICANA_2026.itbis; // 0,18
  const voluntariaPct = Math.max(0, num(i.propinaVoluntaria, 0));
  const personas = Math.max(1, Math.floor(num(i.personas, 1)));
  const esDelivery = String(i.delivery || 'no') === 'si';

  const propinaLegal = esDelivery ? 0 : consumo * PROPINA_LEGAL;
  const itbis = consumo * itbisTasa; // ITBIS sobre el consumo, base SIN propina
  const propinaVoluntaria = consumo * (voluntariaPct / 100);
  const total = consumo + propinaLegal + itbis + propinaVoluntaria;
  const porPersona = total / personas;

  const detalle =
    `Consumo ${fmtDOP(consumo)}` +
    (esDelivery
      ? ` (delivery: sin 10% legal)`
      : ` + 10% de ley ${fmtDOP(propinaLegal)}`) +
    ` + ITBIS 18% ${fmtDOP(itbis)}` +
    (propinaVoluntaria > 0 ? ` + propina voluntaria ${voluntariaPct}% ${fmtDOP(propinaVoluntaria)}` : '') +
    ` = ${fmtDOP(total)}` +
    (personas > 1 ? ` (${fmtDOP(porPersona)} por persona, entre ${personas})` : '') + '.';

  const _insight = {
    title: `Total de la cuenta: ${fmtDOP(total)}`,
    text: esDelivery
      ? `En pedidos por **delivery o para llevar** no corresponde el 10% de ley (criterio de la Suprema Corte): pagás el consumo de **${fmtDOP(consumo)}** más el **ITBIS 18%** (${fmtDOP(itbis)})${propinaVoluntaria > 0 ? ` y tu propina voluntaria de ${fmtDOP(propinaVoluntaria)}` : ''}. Total **${fmtDOP(total)}**.`
      : `Sobre un consumo de **${fmtDOP(consumo)}** se suman el **10% de propina legal** (${fmtDOP(propinaLegal)}, va al personal por el Art. 228) y el **ITBIS 18%** (${fmtDOP(itbis)}, calculado sin la propina). Total **${fmtDOP(total)}** — el consumo se multiplica por **1,28**${propinaVoluntaria > 0 ? ` antes de tu propina voluntaria` : ''}.`,
    tone: 'neutral' as const,
    icon: '🍽️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Consumo', value: Math.round(consumo) },
      ...(propinaLegal > 0 ? [{ label: 'Propina legal 10%', value: Math.round(propinaLegal) }] : []),
      { label: 'ITBIS 18%', value: Math.round(itbis) },
      ...(propinaVoluntaria > 0 ? [{ label: 'Propina voluntaria', value: Math.round(propinaVoluntaria) }] : []),
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(total),
    centerLabel: 'Total',
    ariaLabel: 'Composición de la cuenta: consumo, propina legal, ITBIS y propina voluntaria',
  };

  return {
    total: fmtDOP(total),
    propinaLegal: fmtDOP(propinaLegal),
    itbis: fmtDOP(itbis),
    propinaVoluntaria: fmtDOP(propinaVoluntaria),
    porPersona: fmtDOP(porPersona),
    detalle,
    _insight,
    _chart,
  };
}
