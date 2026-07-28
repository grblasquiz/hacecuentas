/** Rotación de inventario y días de stock */
export interface Inputs { costoMercaderiaVendida: number; inventarioPromedio: number; }
export interface Outputs {
  rotacion: number;
  diasEnStock: number;
  clasificacion: string;
  _insight?: any;
  _chart?: any;
}

export function rotacionInventario(i: Inputs): Outputs {
  const cmv = Number(i.costoMercaderiaVendida);
  const inv = Number(i.inventarioPromedio);
  if (!Number.isFinite(cmv) || cmv < 0) throw new Error('Ingresá el costo de la mercadería vendida');
  if (!Number.isFinite(inv) || inv <= 0) throw new Error('Ingresá el inventario promedio');

  const rotacion = cmv / inv;
  // Sin ventas en el período (CMV 0) la rotación es 0 y el stock no rota: tope 365 días.
  const dias = rotacion > 0 ? 365 / rotacion : 365;

  let clasif = '';
  if (rotacion > 12) clasif = 'Muy alta — buen flujo, riesgo de quiebres.';
  else if (rotacion > 6) clasif = 'Saludable — retail típico.';
  else if (rotacion > 3) clasif = 'Lenta — revisá productos sin venta.';
  else clasif = 'Muy lenta — capital parado en inventario.';

  const rotRound = Number(rotacion.toFixed(2));
  const diasRound = Math.round(dias);

  const tone = rotacion <= 3 ? 'warn' : rotacion > 12 ? 'warn' : 'good';
  const insight = {
    title:
      rotacion > 12 ? 'Rotación muy alta' :
      rotacion > 6 ? 'Rotación saludable' :
      rotacion > 3 ? 'Rotación lenta' : 'Rotación muy lenta',
    text:
      rotacion > 12
        ? `Renovás el inventario **${rotRound} veces al año** y vendés el stock cada **${diasRound} días**: excelente flujo, pero vigilá los quiebres de stock para no perder ventas.`
        : rotacion > 6
        ? `Renovás el inventario **${rotRound} veces al año**, vendiendo el stock cada **${diasRound} días**. Estás en el rango típico del retail sano.`
        : rotacion > 3
        ? `Solo renovás **${rotRound} veces al año** y el stock tarda **${diasRound} días** en venderse. Revisá productos sin salida y depurá el surtido.`
        : `Con apenas **${rotRound} renovaciones al año** y **${diasRound} días** de stock, tenés mucho capital inmovilizado. Liquidá lo que no rota.`,
    tone,
    icon: '📦',
  };

  // Gauge: rotación anual ubicada en zonas de salud del inventario
  const chart = {
    type: 'scale' as const,
    marker: rotRound,
    markerLabel: `${rotRound}× al año`,
    min: 0,
    unit: '×',
    segments: [
      { nombre: 'Muy lenta', max: 3, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Lenta', max: 6, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Saludable', max: 12, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Muy alta', max: Math.max(15, Math.ceil(rotacion) + 1), color: '#fde68a', colorDark: '#92400e' },
    ],
    ariaLabel: 'Escala de rotación de inventario anual: muy lenta, lenta, saludable, muy alta.',
  };

  return {
    rotacion: rotRound,
    diasEnStock: diasRound,
    clasificacion: clasif,
    _insight: insight,
    _chart: chart,
  };
}
