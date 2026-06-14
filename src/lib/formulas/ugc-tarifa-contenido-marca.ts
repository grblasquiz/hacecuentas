/**
 * Calculadora de tarifa UGC (User Generated Content) para marcas.
 * Precio orientativo por pieza de contenido producido para una marca,
 * con upgrades por derechos de uso en ads pagos y exclusividad.
 *
 * Base por tipo (USD/pieza, orientativo mercado UGC 2026):
 *   foto ~50 · video-corto ~120 · reel-completo ~250
 * Derechos uso-en-ads-paid: +75% (×1.75) sobre subtotal.
 * Exclusividad si-3-meses: +40% (×1.4) sobre subtotal.
 *
 * IMPORTANTE: tarifas ORIENTATIVAS. El UGC no se paga por seguidores
 * (el creador no necesita audiencia) sino por producción, guion, ediciones,
 * derechos y exclusividad. Varía fuerte por país, experiencia y marca.
 */

export interface UgcTarifaContenidoMarcaInputs {
  tipo: string; // foto | video-corto | reel-completo
  cantidad_piezas: number | string | null;
  derechos_uso: string; // solo-organico | uso-en-ads-paid
  exclusividad: string; // no | si-3-meses
}

export interface UgcTarifaContenidoMarcaOutputs {
  precioPorPieza: number;
  precioBasePieza: number;
  cantidad: number;
  total: number;
  upliftDerechos: number; // monto extra total por derechos ads
  upliftExclusividad: number; // monto extra total por exclusividad
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const BASE_TIPO: Record<string, number> = {
  'foto': 50,
  'video-corto': 120,
  'reel-completo': 250,
};

const TIPO_LABEL: Record<string, string> = {
  'foto': 'Foto',
  'video-corto': 'Video corto',
  'reel-completo': 'Reel completo',
};

export function ugcTarifaContenidoMarca(
  i: UgcTarifaContenidoMarcaInputs
): UgcTarifaContenidoMarcaOutputs {
  const tipo = i.tipo === '' || i.tipo == null ? 'reel-completo' : String(i.tipo);
  const cantidad =
    i.cantidad_piezas === '' || i.cantidad_piezas == null
      ? 1
      : Number(i.cantidad_piezas);
  const derechos =
    i.derechos_uso === '' || i.derechos_uso == null
      ? 'solo-organico'
      : String(i.derechos_uso);
  const exclusividad =
    i.exclusividad === '' || i.exclusividad == null
      ? 'no'
      : String(i.exclusividad);

  if (!cantidad || cantidad <= 0)
    throw new Error('Ingresá cuántas piezas vas a entregar');

  const base = BASE_TIPO[tipo] ?? 250;

  // Multiplicadores
  const factorDerechos = derechos === 'uso-en-ads-paid' ? 1.75 : 1;
  const factorExclusividad = exclusividad === 'si-3-meses' ? 1.4 : 1;

  // Precio por pieza con upgrades
  const precioPorPieza = base * factorDerechos * factorExclusividad;
  const total = precioPorPieza * cantidad;

  // Desglose de uplift (monto extra total)
  const conDerechos = base * factorDerechos; // tras derechos
  const upliftDerechos = (conDerechos - base) * cantidad;
  const upliftExclusividad = (precioPorPieza - conDerechos) * cantidad;

  const r = (n: number) => Math.round(n);
  const fmt = (n: number) => `$${r(n).toLocaleString('en-US')} USD`;

  const tipoLbl = TIPO_LABEL[tipo] ?? tipo;

  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (derechos === 'uso-en-ads-paid' && exclusividad === 'si-3-meses') {
    tone = 'good';
    insightText = `Estás entregando lo más valioso: **derechos para ads pagos** (+75%) **y exclusividad 3 meses** (+40%). Eso casi duplica el rate: cada ${tipoLbl.toLowerCase()} pasa de **${fmt(
      base
    )}** a **${fmt(
      precioPorPieza
    )}**. Nunca regales los derechos de uso en paid: si la marca lo va a poner en su Ads Manager, cobralo aparte.`;
  } else if (derechos === 'solo-organico' && exclusividad === 'no') {
    tone = 'neutral';
    insightText = `Tarifa base **solo orgánico, sin exclusividad**: cada ${tipoLbl.toLowerCase()} sale **${fmt(
      base
    )}**, total **${fmt(
      total
    )}** por ${cantidad} pieza${
      cantidad > 1 ? 's' : ''
    }. Si la marca después quiere usarlo en ads o pedirte exclusividad, eso se cotiza extra (no está incluido).`;
  } else {
    tone = 'neutral';
    const extras: string[] = [];
    if (derechos === 'uso-en-ads-paid') extras.push('derechos para ads pagos (+75%)');
    if (exclusividad === 'si-3-meses') extras.push('exclusividad 3 meses (+40%)');
    insightText = `Sumaste ${extras.join(
      ' y '
    )}: cada ${tipoLbl.toLowerCase()} pasa de **${fmt(base)}** a **${fmt(
      precioPorPieza
    )}**, total **${fmt(
      total
    )}**. Estos upgrades no son opcionales para la marca: son lo que justifica cobrar por encima del rate base.`;
  }

  const detalle = `${tipoLbl} ×${cantidad} · base ${fmt(base)}/pieza · derechos ×${factorDerechos} · exclusividad ×${factorExclusividad}. Precio final ${fmt(
    precioPorPieza
  )}/pieza · total ${fmt(total)}.`;

  return {
    precioPorPieza: r(precioPorPieza),
    precioBasePieza: r(base),
    cantidad,
    total: r(total),
    upliftDerechos: r(upliftDerechos),
    upliftExclusividad: r(upliftExclusividad),
    detalle,
    _insight: {
      title: 'Tu cotización UGC',
      text: insightText,
      tone,
      icon: '🎬',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Producción base', value: r(base * cantidad) },
        { label: 'Derechos ads', value: r(upliftDerechos) },
        { label: 'Exclusividad', value: r(upliftExclusividad) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total cotización',
      ariaLabel: `Cotización UGC total ${fmt(
        total
      )}: producción base ${fmt(base * cantidad)}, derechos ${fmt(
        upliftDerechos
      )}, exclusividad ${fmt(upliftExclusividad)}.`,
    },
  };
}
