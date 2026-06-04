export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function perfilAluminioMetrosLinealesVentana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const ancho = Number(i.ancho) || 0;    // window width in meters
  const alto = Number(i.alto) || 0;      // window height in meters
  const nhojas = i.nhojas !== undefined && i.nhojas !== '' ? Number(i.nhojas) : 2; // number of sliding panels (0 = fixed pane)
  const contramarco = String(i.contramarco) === 'si' || String(i.contramarco) === 'yes' ? 1 : 0;
  const travesano = String(i.travesano) === 'si' || String(i.travesano) === 'yes' ? 1 : 0;
  const desperdicio = Number(i.desperdicio) || 10; // waste % (10 or 15)

  // Safety: zero dimensions → zero result
  if (ancho <= 0 || alto <= 0) {
    const msgEmpty = __lang === 'en'
      ? 'Enter width and height to get a result.'
      : 'Ingresá ancho y alto para ver el resultado.';
    return { resultado: '0.00', barras: '0', resumen: msgEmpty, _insight: { title: '', text: msgEmpty, tone: 'neutral', icon: '📐' } };
  }

  // 1. Outer frame perimeter (marco exterior)
  const p_marco = 2 * (ancho + alto);

  // 2. Sliding panels: each panel has its own frame perimeter.
  //    Panel width ≈ (total_width / nhojas) + 0.03 m overlap allowance per panel.
  //    For fixed pane (nhojas = 0): no sliding panel perimeters.
  let p_hojas = 0;
  if (nhojas >= 1) {
    const ancho_hoja = (ancho / nhojas) + 0.03; // ~3 cm overlap between panels
    const p_hoja = 2 * (ancho_hoja + alto);
    p_hojas = p_hoja * nhojas;
  }

  // 3. Contramarco (optional): same perimeter as outer frame, set into masonry.
  const p_contramarco = contramarco * 2 * (ancho + alto);

  // 4. Intermediate horizontal transom (optional): one rail equal to window width.
  const p_travesano = travesano * ancho;

  // 5. Net total (meters, no waste)
  const ml_neto = p_marco + p_hojas + p_contramarco + p_travesano;

  // 6. Total with waste factor
  const factor = 1 + desperdicio / 100;
  const ml_total = ml_neto * factor;

  // 7. Commercial bars of 6 m (standard in Argentine and Latin American markets)
  const barras = Math.ceil(ml_total / 6);

  // --- Breakdown text ---
  const fmt = (n: number) => n.toFixed(2);

  let resumen: string;
  if (__lang === 'en') {
    const parts: string[] = [`Frame: ${fmt(p_marco)} m`];
    if (nhojas >= 1) parts.push(`${nhojas} panel(s): ${fmt(p_hojas)} m`);
    if (contramarco) parts.push(`Contraframe: ${fmt(p_contramarco)} m`);
    if (travesano) parts.push(`Transom: ${fmt(p_travesano)} m`);
    parts.push(`Waste (${desperdicio}%): +${fmt(ml_neto * desperdicio / 100)} m`);
    resumen = parts.join(' | ') + `. Net: ${fmt(ml_neto)} m → with waste: ${fmt(ml_total)} m → ${barras} bar(s) of 6 m.`;
  } else {
    const parts: string[] = [`Marco: ${fmt(p_marco)} m`];
    if (nhojas >= 1) parts.push(`${nhojas} hoja(s): ${fmt(p_hojas)} m`);
    if (contramarco) parts.push(`Contramarco: ${fmt(p_contramarco)} m`);
    if (travesano) parts.push(`Travesaño: ${fmt(p_travesano)} m`);
    parts.push(`Desperdicio (${desperdicio}%): +${fmt(ml_neto * desperdicio / 100)} m`);
    resumen = parts.join(' | ') + `. Neto: ${fmt(ml_neto)} m → con desperdicio: ${fmt(ml_total)} m → ${barras} barra(s) de 6 m.`;
  }

  const insightText = __lang === 'en'
    ? `You need **${fmt(ml_total)} linear meters** of aluminum profile (≈ **${barras} bar${barras !== 1 ? 's' : ''} of 6 m**). The frame accounts for ${fmt(p_marco)} m; ${nhojas > 0 ? `the ${nhojas} sliding panel(s) add ${fmt(p_hojas)} m` : 'no sliding panels'}${contramarco ? ` plus ${fmt(p_contramarco)} m of contraframe` : ''}. Always round up when buying — the offcut can cover future repairs.`
    : `Necesitás **${fmt(ml_total)} metros lineales** de perfil de aluminio (≈ **${barras} barra${barras !== 1 ? 's' : ''} de 6 m**). El marco aporta ${fmt(p_marco)} m; ${nhojas > 0 ? `las ${nhojas} hoja(s) deslizante(s) suman ${fmt(p_hojas)} m` : 'sin hojas deslizantes'}${contramarco ? ` más ${fmt(p_contramarco)} m de contramarco` : ''}. Siempre redondeá para arriba al comprar — el recorte sirve para reparaciones futuras.`;

  return {
    resultado: fmt(ml_total),
    barras: String(barras),
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Material estimate' : 'Estimación de material',
      text: insightText,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
