export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function cantidadHamburguesasParrillaCumpleanos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const adultos = Math.max(0, Number(i.adultos) || 0);
  const ninos   = Math.max(0, Number(i.ninos)   || 0);
  const pesoG   = Number(i.peso_medallon) || 120; // grams per raw patty

  // rol: principal = burgers are main (no other mains)
  //       compartido = burgers + other proteins (asado, chorizo, hot dogs)
  //       solo = burgers only, no side dishes / long event
  const rol = String(i.rol || 'principal');

  // Rates per person (burgers), based on catering standards:
  // Adults 2 when main, 1.5 when shared, 2.5 when solo event
  // Children (<12) 1.5 when main, 1 when shared, 2 when solo
  let rateAdulto: number;
  let rateNino: number;
  if (rol === 'compartido') {
    rateAdulto = 1.5;
    rateNino   = 1.0;
  } else if (rol === 'solo') {
    rateAdulto = 2.5;
    rateNino   = 2.0;
  } else {
    // principal (default)
    rateAdulto = 2.0;
    rateNino   = 1.5;
  }

  const totalBruto   = adultos * rateAdulto + ninos * rateNino;
  const totalConMargen = Math.ceil(totalBruto * 1.15);   // +15% safety margin
  const kgCarne = ((totalConMargen * pesoG) / 1000).toFixed(2);

  // Formatted output
  const resultado = totalConMargen;

  // Summaries per language
  let rolLabel: string;
  if (__lang === 'en') {
    rolLabel = rol === 'compartido' ? 'shared menu' : rol === 'solo' ? 'burgers only event' : 'main dish';
  } else if (__lang === 'pt') {
    rolLabel = rol === 'compartido' ? 'cardápio compartilhado' : rol === 'solo' ? 'prato único' : 'prato principal';
  } else {
    rolLabel = rol === 'compartido' ? 'menú compartido' : rol === 'solo' ? 'plato único' : 'plato principal';
  }

  let resumen: string;
  if (__lang === 'en') {
    resumen = `${adultos} adults × ${rateAdulto} + ${ninos} children × ${rateNino} = ${totalBruto.toFixed(1)} burgers. With +15% safety margin → **${totalConMargen} burgers** (${kgCarne} kg of raw ground beef at ${pesoG} g/patty, ${rolLabel}).`;
  } else if (__lang === 'pt') {
    resumen = `${adultos} adultos × ${rateAdulto} + ${ninos} crianças × ${rateNino} = ${totalBruto.toFixed(1)} hambúrgueres. Com +15% de margem → **${totalConMargen} hambúrgueres** (${kgCarne} kg de carne moída crua a ${pesoG} g/disco, ${rolLabel}).`;
  } else {
    resumen = `${adultos} adultos × ${rateAdulto} + ${ninos} niños × ${rateNino} = ${totalBruto.toFixed(1)} hamburguesas. Con +15% de margen → **${totalConMargen} hamburguesas** (${kgCarne} kg de carne picada cruda a ${pesoG} g/medallón, ${rolLabel}).`;
  }

  // Insight
  let insight: any;
  if (__lang === 'en') {
    insight = {
      title: 'Your burger count',
      text: `Buy **${totalConMargen} burgers** (${kgCarne} kg of ground beef at ${pesoG} g/patty raw). Base: adults ${rateAdulto}/person + children ${rateNino}/person, then +15% buffer. The buffer covers surprise guests, a second serving, and patties lost to the grill.`,
      tone: 'positive',
      icon: '🍔'
    };
  } else if (__lang === 'pt') {
    insight = {
      title: 'Sua conta de hambúrgueres',
      text: `Compre **${totalConMargen} hambúrgueres** (${kgCarne} kg de carne moída a ${pesoG} g/disco cru). Base: adultos ${rateAdulto}/pessoa + crianças ${rateNino}/pessoa, mais +15% de margem. A margem cobre convidados de surpresa, repetição e perdas na grelha.`,
      tone: 'positive',
      icon: '🍔'
    };
  } else {
    insight = {
      title: 'Tu cuenta de hamburguesas',
      text: `Comprá **${totalConMargen} hamburguesas** (${kgCarne} kg de carne picada a ${pesoG} g/medallón crudo). Base: adultos ${rateAdulto}/persona + niños ${rateNino}/persona, más +15% de margen. El margen cubre invitados de último momento, quien pide la tercera y medallones que se queman.`,
      tone: 'positive',
      icon: '🍔'
    };
  }

  return { resultado, resumen, _insight: insight };
}
