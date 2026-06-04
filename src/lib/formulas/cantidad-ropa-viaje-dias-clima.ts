export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora de ropa para viaje según días y clima.
 *
 * Método: "Pack-by-numbers" adaptado a clima, basado en las guías de
 * Rick Steves (ricksteves.com/travel-tips/packing-light) y OneBag.com.
 *
 * Principio central: packs for max 7 days regardless of trip length.
 * For trips >7 days, plan one laundry session every 5-7 days.
 *
 * Ajustes por clima:
 *  - tropical (>25°C): más remeras (+50% por transpiración), shorts, ojotas
 *  - templado (10-25°C): base estándar
 *  - frío (<10°C): sistema de capas, menos tops pero más abrigos
 */
export function cantidadRopaViajeDiasClima(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';
  const dias = Math.max(1, Math.round(Number(i.dias) || 1));
  const clima = String(i.clima || 'templado').toLowerCase();

  // Días efectivos a empacar: nunca más de 7 (el resto se lava en destino)
  const diasPack = Math.min(dias, 7);

  // --- Tops (remeras/camisas) ---
  // Tropical: 1 por día + 2 extra (transpiración alta)
  // Templado: 1 cada 1.5 días + 1 extra → ceil(diasPack/1.5) + 1
  // Frío: 1 cada 2 días + 1 extra (capas, menos sudor)
  let tops: number;
  let pantalones: number;
  let shorts: number;
  let interior: number; // ropa interior / underwear
  let medias: number;
  let abrigos: string;
  let zapatos: number;
  let notaLavado: string;

  if (clima === 'tropical') {
    tops = diasPack + 2;
    pantalones = Math.max(1, Math.ceil(diasPack / 4));
    shorts = Math.max(2, Math.ceil(diasPack / 3));
    interior = diasPack + 1;
    medias = Math.max(2, Math.ceil(diasPack / 2));
    abrigos = lang === 'es'
      ? '1 campera liviana/impermeable (para lluvia y A/C)'
      : '1 light jacket/rain layer (for showers and A/C)';
    zapatos = 2; // zapatillas + ojotas/sandalias
  } else if (clima === 'frio') {
    tops = Math.max(3, Math.ceil(diasPack / 2) + 1);
    pantalones = Math.max(2, Math.ceil(diasPack / 3));
    shorts = 0;
    interior = diasPack + 1;
    medias = diasPack + 1; // frío = una por día + extra
    abrigos = lang === 'es'
      ? '1 campera impermeable + 1 polar/sweater + 2 prendas térmicas'
      : '1 waterproof jacket + 1 fleece/sweater + 2 thermal base layers';
    zapatos = 2; // botas/borcegos + zapatillas
  } else {
    // templado (default)
    tops = Math.max(3, Math.ceil(diasPack / 1.5) + 1);
    pantalones = Math.max(2, Math.ceil(diasPack / 3));
    shorts = 0;
    interior = diasPack + 1;
    medias = diasPack + 1;
    abrigos = lang === 'es'
      ? '1 polar/sweater + 1 campera liviana'
      : '1 sweater/fleece + 1 light jacket';
    zapatos = 2;
  }

  // Lavados recomendados
  const lavados = dias > 7 ? Math.ceil((dias - 7) / 7) : 0;

  // Peso estimado (kg) — valores medios por prenda
  const pesoTop = 0.18;        // remera cotton/merino
  const pesoPantalon = 0.45;   // pantalón/jean
  const pesoShort = 0.22;
  const pesoInterior = 0.06;   // par ropa interior
  const pesoMedias = 0.08;     // par medias
  const pesoAbrigo = clima === 'frio' ? 1.6 : 0.5;  // campera liviana vs abrigo grueso
  const pesoZapatos = 0.7;     // par zapatillas
  const pesoExtras = 0.5;      // neceser, cargadores, etc.

  const pesoTotal =
    tops * pesoTop +
    pantalones * pesoPantalon +
    shorts * pesoShort +
    interior * pesoInterior +
    medias * pesoMedias +
    pesoAbrigo +
    zapatos * pesoZapatos +
    pesoExtras;

  const pesoRedondeado = Math.round(pesoTotal * 10) / 10;
  const totalPrendas = tops + pantalones + shorts + interior + medias;

  // Nota de lavado
  if (lavados === 0) {
    notaLavado = lang === 'es'
      ? `Viaje corto — no necesitás lavar en destino.`
      : `Short trip — no laundry needed at destination.`;
  } else if (lavados === 1) {
    notaLavado = lang === 'es'
      ? `Planificá 1 lavado a mitad del viaje (laundromat ≈ USD 3–6 en la mayoría de ciudades turísticas).`
      : `Plan 1 laundry session mid-trip (laundromat ≈ USD 3–6 in most tourist cities).`;
  } else {
    notaLavado = lang === 'es'
      ? `Planificá ${lavados} lavados durante el viaje, aproximadamente cada 7 días.`
      : `Plan ${lavados} laundry sessions during the trip, approximately every 7 days.`;
  }

  // Formato de salida
  if (lang === 'en') {
    const listado = [
      `Tops / t-shirts: ${tops}`,
      `Pants / trousers: ${pantalones}`,
      shorts > 0 ? `Shorts: ${shorts}` : null,
      `Underwear sets: ${interior}`,
      `Socks (pairs): ${medias}`,
      `Outerwear: ${abrigos}`,
      `Shoes (pairs): ${zapatos}`,
    ].filter(Boolean).join('\n');

    const resumen = [
      `Total clothing pieces: ${totalPrendas}`,
      `Estimated weight: ${pesoRedondeado} kg`,
      notaLavado,
    ].join(' | ');

    const _insight = {
      title: 'Pack for 7 days max, wash the rest',
      text: `For **${dias} days** (${clima === 'tropical' ? 'tropical' : clima === 'frio' ? 'cold' : 'temperate'} climate): **${tops} tops, ${pantalones} pants${shorts > 0 ? ', ' + shorts + ' shorts' : ''}, ${interior} underwear, ${medias} pairs of socks**. Estimated weight: **${pesoRedondeado} kg**. ${lavados > 0 ? `Plan ${lavados} laundry session${lavados > 1 ? 's' : ''} during the trip.` : 'No laundry needed.'}`,
      tone: 'neutral',
      icon: '🧳',
    };

    return { resultado: listado, resumen, _insight };
  }

  // ES (default)
  const listado = [
    `Remeras / tops: ${tops}`,
    `Pantalones: ${pantalones}`,
    shorts > 0 ? `Shorts: ${shorts}` : null,
    `Ropa interior (mudas): ${interior}`,
    `Medias (pares): ${medias}`,
    `Abrigo: ${abrigos}`,
    `Zapatos (pares): ${zapatos}`,
  ].filter(Boolean).join('\n');

  const resumen = [
    `Total prendas: ${totalPrendas}`,
    `Peso estimado: ${pesoRedondeado} kg`,
    notaLavado,
  ].join(' | ');

  const _insight = {
    title: 'Empacá para 7 días y lavá el resto',
    text: `Para **${dias} días** (clima ${clima}): **${tops} remeras, ${pantalones} pantalones${shorts > 0 ? ', ' + shorts + ' shorts' : ''}, ${interior} mudas de ropa interior, ${medias} pares de medias**. Peso estimado: **${pesoRedondeado} kg**. ${lavados > 0 ? `Planificá ${lavados} lavado${lavados > 1 ? 's' : ''} durante el viaje.` : 'No necesitás lavar en destino.'}`,
    tone: 'neutral',
    icon: '🧳',
  };

  return { resultado: listado, resumen, _insight };
}
