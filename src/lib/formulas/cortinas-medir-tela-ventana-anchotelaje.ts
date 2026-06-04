export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Real curtain fabric calculator.
 * Inputs:
 *   anchoVentana   – window width in cm (measured at rod/track)
 *   largoCaida     – drop/length in cm (from rod bottom to desired finish)
 *   telaje         – fullness multiplier: 1.5 | 2 | 2.5 | 3
 *   tipoCabecilla  – heading type: "estandar" | "fruncidora" | "ojalillos" | "pliegues"
 *
 * Formula (professional standard):
 *   Ancho tela = anchoVentana × telaje + 20 (10 cm lateral seam allowance each side)
 *   Largo tela = largoCaida + topAllowance + 20 (double 10 cm bottom hem)
 *
 *   topAllowance by heading:
 *     estandar   (rod pocket / standard): 8 cm
 *     fruncidora (pencil-pleat tape):     10 cm
 *     ojalillos  (eyelet / grommet):       5 cm (fold-over only)
 *     pliegues   (pinch-pleat hooks):     12 cm (return + heading)
 *
 * Sources:
 *   Cotswold Sewing School – Calculating Fabric (2022)
 *   Textile Calculator – Curtain Fabric Calculator
 *   Trapitos.com.ar – Cómo calcular la tela para cortinas
 */
export function cortinasMedirTelaVentanaAnchotelaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const anchoVentana = Number(i.anchoVentana) || 0;
  const largoCaida   = Number(i.largoCaida)   || 0;
  const telaje       = Number(i.telaje)        || 2;
  const tipoCabecilla = String(i.tipoCabecilla || 'estandar');

  // Top heading allowance by type (cm)
  const headingAllowance: Record<string, number> = {
    estandar:   8,
    fruncidora: 10,
    ojalillos:  5,
    pliegues:   12,
  };
  const topAllowance = headingAllowance[tipoCabecilla] ?? 8;

  // Side seam allowances: 10 cm each side = 20 cm total
  const SIDE_SEAM = 20;
  // Bottom hem: double fold of 10 cm = 20 cm
  const BOTTOM_HEM = 20;

  // Core calculations
  const anchoTela  = anchoVentana * telaje + SIDE_SEAM; // cm of fabric width needed
  const largoTela  = largoCaida + topAllowance + BOTTOM_HEM; // cm of fabric length (drop)

  // Total linear meters if buying from a roll whose width equals the curtain drop
  // (common: tela vendida "a la caída" — roll width = curtain length)
  // Linear meters needed = anchoTela (since we cut strips of largoTela from a roll that is largoTela wide)
  const metrosLineales = anchoTela / 100; // convert cm → meters

  // Number of panels needed if fabric roll width < anchoTela
  // Standard roll widths: 140 cm or 280 cm. We compute for 140 cm roll.
  const ROLL_WIDTH = 140; // cm — standard fabric roll
  const paneles140 = Math.ceil(anchoTela / ROLL_WIDTH);
  const metrosPaneles140 = (paneles140 * largoTela) / 100; // linear meters from 140 cm roll

  // Format helpers
  const fmt = (n: number, dec = 0) => n.toFixed(dec);

  // Heading label for display
  const headingLabel: Record<string, { es: string; en: string }> = {
    estandar:   { es: 'Bolsillo estándar',    en: 'Rod pocket (standard)' },
    fruncidora: { es: 'Cinta fruncidora',     en: 'Pencil-pleat tape' },
    ojalillos:  { es: 'Ojalillos / grommets', en: 'Eyelet / grommets' },
    pliegues:   { es: 'Pliegues / ganchos',   en: 'Pinch-pleat hooks' },
  };
  const headLabel = headingLabel[tipoCabecilla] ?? headingLabel['estandar'];

  const resumen = __lang === 'en'
    ? `Window ${fmt(anchoVentana)} cm × ${telaje}× fullness → **${fmt(anchoTela)} cm** wide fabric needed. Drop: ${fmt(largoCaida)} cm + ${topAllowance} cm header + 20 cm hem = **${fmt(largoTela)} cm** total length. ` +
      `If buying from a 140 cm roll: **${paneles140} panel${paneles140 > 1 ? 's' : ''} × ${fmt(largoTela)} cm = ${fmt(metrosPaneles140, 1)} linear meters**.`
    : `Ventana ${fmt(anchoVentana)} cm × telaje ${telaje}× → **${fmt(anchoTela)} cm** de ancho de tela. Caída: ${fmt(largoCaida)} cm + ${topAllowance} cm cabecilla + 20 cm dobladillo = **${fmt(largoTela)} cm** de largo. ` +
      `Con tela de 140 cm de ancho: **${paneles140} paño${paneles140 > 1 ? 's' : ''} × ${fmt(largoTela)} cm = ${fmt(metrosPaneles140, 1)} metros lineales**.`;

  const _insight = {
    title: __lang === 'en' ? 'Fabric needed' : 'Tela necesaria',
    text: __lang === 'en'
      ? `For a **${fmt(anchoVentana)} cm** wide window with **${telaje}× fullness** (${headLabel.en}) and a **${fmt(largoCaida)} cm** drop:\n\n` +
        `• **Fabric width required:** ${fmt(anchoTela)} cm\n` +
        `• **Fabric length (drop + allowances):** ${fmt(largoTela)} cm\n` +
        `• **From a 140 cm roll:** ${paneles140} panel${paneles140 > 1 ? 's' : ''} → **${fmt(metrosPaneles140, 1)} m** to buy\n` +
        `• **From a 280 cm roll:** ${Math.ceil(anchoTela / 280)} panel${Math.ceil(anchoTela / 280) > 1 ? 's' : ''} → **${fmt((Math.ceil(anchoTela / 280) * largoTela) / 100, 1)} m** to buy`
      : `Para una ventana de **${fmt(anchoVentana)} cm** de ancho con telaje **${telaje}×** (${headLabel.es}) y caída de **${fmt(largoCaida)} cm**:\n\n` +
        `• **Ancho de tela necesario:** ${fmt(anchoTela)} cm\n` +
        `• **Largo de tela (caída + márgenes):** ${fmt(largoTela)} cm\n` +
        `• **Con tela de 140 cm de ancho:** ${paneles140} paño${paneles140 > 1 ? 's' : ''} → **${fmt(metrosPaneles140, 1)} m** a comprar\n` +
        `• **Con tela de 280 cm de ancho:** ${Math.ceil(anchoTela / 280)} paño${Math.ceil(anchoTela / 280) > 1 ? 's' : ''} → **${fmt((Math.ceil(anchoTela / 280) * largoTela) / 100, 1)} m** a comprar`,
    tone: 'neutral',
    icon: '🪟',
  };

  return {
    anchoTela: fmt(anchoTela),
    largoTela: fmt(largoTela),
    metrosLineales140: fmt(metrosPaneles140, 1),
    resumen,
    _insight,
  };
}
