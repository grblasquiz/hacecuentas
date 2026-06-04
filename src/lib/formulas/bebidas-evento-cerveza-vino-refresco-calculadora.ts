export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }

/**
 * Party Beverage Calculator — Drinks Per Person Per Hour (DPPH) Model
 *
 * Core formula (industry standard, used by professional event caterers):
 *   First hour: 2 drinks/person (peak social consumption)
 *   Each subsequent hour: 1 drink/person (stabilised rate)
 *   Total base = Guests × (2 + 1 × (Hours − 1))
 *   With 15% safety buffer = base × 1.15
 *
 * Sources:
 *   - Gotham Catering NYC hospitality guidelines
 *   - Haskell's event planning guide
 *   - NIAAA standard drink definitions (14g pure alcohol)
 */
export function bebidasEventoCervezaVinoRefrescoCalculadora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const invitados = Math.max(1, Math.round(Number(i.invitados) || 0));
  const horas = Math.max(1, Number(i.horas) || 1);
  // beverage mix percentages (0–100); default 50/30/20
  const pctCerveza = Math.min(100, Math.max(0, Number(i.pct_cerveza) || 50));
  const pctVino    = Math.min(100, Math.max(0, Number(i.pct_vino)    || 30));
  const pctGaseosa = Math.min(100, Math.max(0, Number(i.pct_gaseosa) || 20));

  // Normalise splits to 100% if they don't add up
  const totalPct = pctCerveza + pctVino + pctGaseosa;
  const normCerveza = totalPct > 0 ? pctCerveza / totalPct : 0.5;
  const normVino    = totalPct > 0 ? pctVino    / totalPct : 0.3;
  const normGaseosa = totalPct > 0 ? pctGaseosa / totalPct : 0.2;

  // Core DPPH formula: 2 drinks first hour + 1 drink each subsequent hour
  const bebidasBase = invitados * (2 + Math.max(0, horas - 1));
  // 15% safety buffer (industry standard)
  const bebidasTotal = Math.ceil(bebidasBase * 1.15);

  // Split by type
  const cantCerveza = Math.ceil(bebidasTotal * normCerveza);
  const cantVino    = Math.ceil(bebidasTotal * normVino);
  const cantGaseosa = Math.ceil(bebidasTotal * normGaseosa);

  // Practical conversions
  const cajonesCerveza = Math.ceil(cantCerveza / 24); // 24 porrones/botellas por cajón
  const botellasVino   = Math.ceil(cantVino / 5);     // 1 botella 750 ml = 5 copas
  const botellas15     = Math.ceil(cantGaseosa / 4);  // 1 botella 1.5L ≈ 4 porciones útiles (con hielo)

  if (__lang === 'en') {
    // Wine bottle = 5 glasses (US standard 5 oz pour, per USDA DGA 2020-2025)
    // Beer case = 24 units
    const casesOfBeer  = Math.ceil(cantCerveza / 24);
    const wineBottles  = Math.ceil(cantVino / 5);
    const sodaPacksEn  = Math.ceil(cantGaseosa / 12); // 12-pack of cans

    const resumen =
      `Total drinks: **${bebidasTotal}** (incl. 15% buffer). ` +
      `Beer: ${cantCerveza} cans → **${casesOfBeer} case${casesOfBeer !== 1 ? 's' : ''}** (24-ct). ` +
      `Wine: ${cantVino} glasses → **${wineBottles} bottle${wineBottles !== 1 ? 's' : ''}** (750 mL). ` +
      `Soda: ${cantGaseosa} servings → **${sodaPacksEn} 12-pack${sodaPacksEn !== 1 ? 's' : ''}**.`;

    const resultado = `${bebidasTotal} drinks`;

    const tone =
      bebidasTotal < 30 ? 'positive' :
      bebidasTotal < 100 ? 'neutral' : 'informative';

    const _insight = {
      title: 'Your beverage estimate',
      text:
        `For **${invitados} guest${invitados !== 1 ? 's' : ''}** over **${horas} hour${horas !== 1 ? 's' : ''}**, ` +
        `you need **${bebidasTotal} total drinks** (with safety buffer). ` +
        `That's **${casesOfBeer} case${casesOfBeer !== 1 ? 's' : ''} of beer**, **${wineBottles} bottle${wineBottles !== 1 ? 's' : ''} of wine**, ` +
        `and **${sodaPacksEn} 12-pack${sodaPacksEn !== 1 ? 's' : ''} of soda**.`,
      tone,
      icon: '🍻'
    };

    return { resultado, resumen, _insight };
  }

  // Spanish output
  const resumen =
    `Total: **${bebidasTotal} bebidas** (con 15% de margen). ` +
    `Cerveza: ${cantCerveza} unidades → **${cajonesCerveza} cajón${cajonesCerveza !== 1 ? 'es' : ''}** (24 u). ` +
    `Vino: ${cantVino} copas → **${botellasVino} botella${botellasVino !== 1 ? 's' : ''}** (750 ml). ` +
    `Gaseosa/agua: ${cantGaseosa} porciones → **${botellas15} botella${botellas15 !== 1 ? 's' : ''}** de 1,5 L.`;

  const resultado = `${bebidasTotal} bebidas`;

  const tone =
    bebidasTotal < 30 ? 'positive' :
    bebidasTotal < 100 ? 'neutral' : 'informative';

  const _insight = {
    title: 'Tu estimación de bebidas',
    text:
      `Para **${invitados} invitado${invitados !== 1 ? 's' : ''}** durante **${horas} hora${horas !== 1 ? 's' : ''}**, ` +
      `necesitás **${bebidasTotal} bebidas** (con margen). ` +
      `Eso es **${cajonesCerveza} cajón${cajonesCerveza !== 1 ? 'es' : ''} de cerveza**, **${botellasVino} botella${botellasVino !== 1 ? 's' : ''} de vino** ` +
      `y **${botellas15} botella${botellas15 !== 1 ? 's' : ''} de gaseosa/agua de 1,5 L**.`,
    tone,
    icon: '🍻'
  };

  return { resultado, resumen, _insight };
}
