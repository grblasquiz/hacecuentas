/**
 * Calorías de hamburguesa casera vs comercial.
 * Compara las kcal por unidad y el total según el tipo de hamburguesa y la cantidad.
 * Tabla de referencia (kcal por hamburguesa entera, tal como se sirve / receta típica):
 *   - Caseras: estimadas con USDA FoodData Central (carne molida 80/20, pan, queso, aceite de cocción).
 *   - Comerciales: datos nutricionales oficiales de McDonald's y Burger King (2026).
 */
export interface Inputs { tipo?: string; cantidad?: number | string; __lang?: string; [k: string]: number | string | undefined; }
export interface Outputs { caloriasTotal: number; caloriasPorUnidad: number; resumen: string; _chart?: any; _insight?: any; [k: string]: any; }

const KCAL: Record<string, number> = {
  'casera-simple': 350,   // medallón ~110 g + pan, sin queso
  'casera-queso': 450,    // + feta de queso
  'casera-doble': 620,    // doble medallón + queso
  'mcdonalds-simple': 250,// hamburguesa simple McDonald's
  'cuarto-libra': 520,    // Cuarto de Libra con queso
  'big-mac': 540,         // Big Mac
  'whopper': 660,         // Whopper
  'whopper-doble': 900,   // Whopper doble
};

const NOMBRE: Record<string, Record<string, string>> = {
  es: { 'casera-simple': 'Casera simple', 'casera-queso': 'Casera con queso', 'casera-doble': 'Casera doble', 'mcdonalds-simple': "McDonald's simple", 'cuarto-libra': 'Cuarto de Libra', 'big-mac': 'Big Mac', 'whopper': 'Whopper', 'whopper-doble': 'Whopper doble' },
  en: { 'casera-simple': 'Homemade single', 'casera-queso': 'Homemade cheeseburger', 'casera-doble': 'Homemade double', 'mcdonalds-simple': "McDonald's plain", 'cuarto-libra': 'Quarter Pounder', 'big-mac': 'Big Mac', 'whopper': 'Whopper', 'whopper-doble': 'Double Whopper' },
  pt: { 'casera-simple': 'Caseiro simples', 'casera-queso': 'Caseiro com queijo', 'casera-doble': 'Caseiro duplo', 'mcdonalds-simple': "McDonald's simples", 'cuarto-libra': 'Quarterão', 'big-mac': 'Big Mac', 'whopper': 'Whopper', 'whopper-doble': 'Whopper duplo' },
};

export function caloriasHamburguesaCaseraComercial(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const pick = (es: string, en: string, pt: string) => (lang === 'en' ? en : lang === 'pt' ? pt : es);
  const loc = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-AR';
  const fmt = (n: number) => n.toLocaleString(loc);

  let tipo = String(i.tipo || 'casera-simple');
  if (!(tipo in KCAL)) tipo = 'casera-simple';
  const kcalUnidad = KCAL[tipo];

  // El form manda '' para un número vacío; tratarlo como 1.
  const raw = i.cantidad;
  let cantidad = raw === '' || raw === null || raw === undefined ? 1 : Number(raw);
  if (!Number.isFinite(cantidad) || cantidad <= 0) cantidad = 1;
  cantidad = Math.round(cantidad);

  const total = kcalUnidad * cantidad;
  const baseCasera = KCAL['casera-simple']; // 350 kcal de referencia
  const extra = kcalUnidad - baseCasera;    // diferencia por unidad vs casera simple
  const pctDiario = Math.round((total / 2000) * 100);
  const nombre = NOMBRE[lang][tipo] || NOMBRE.es[tipo];
  const esCasera = tipo.startsWith('casera');

  // Gráfico comparativo (barras horizontales): casera vs comerciales icónicas + la elegida.
  const baseSet = ['casera-simple', 'big-mac', 'whopper'];
  const chartKeys = Array.from(new Set([...baseSet, tipo])).sort((a, b) => KCAL[a] - KCAL[b]);
  const chart = {
    type: 'bar' as const,
    indexAxis: 'y' as const,
    ariaLabel: pick(
      `Calorías por hamburguesa: ${chartKeys.map((k) => `${NOMBRE.es[k]} ${KCAL[k]} kcal`).join(', ')}.`,
      `Calories per burger: ${chartKeys.map((k) => `${NOMBRE.en[k]} ${KCAL[k]} kcal`).join(', ')}.`,
      `Calorias por hambúrguer: ${chartKeys.map((k) => `${NOMBRE.pt[k]} ${KCAL[k]} kcal`).join(', ')}.`,
    ),
    data: {
      labels: chartKeys.map((k) => NOMBRE[lang][k] || NOMBRE.es[k]),
      datasets: [{ label: pick('Calorías por hamburguesa', 'Calories per burger', 'Calorias por hambúrguer'), data: chartKeys.map((k) => KCAL[k]), suffix: ' kcal' }],
    },
  };

  const unidadW = pick(cantidad === 1 ? 'hamburguesa' : 'hamburguesas', cantidad === 1 ? 'burger' : 'burgers', cantidad === 1 ? 'hambúrguer' : 'hambúrgueres');
  const resumen = pick(
    `${cantidad} ${unidadW} «${nombre}» = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal c/u), el ${pctDiario}% de una dieta de 2000 kcal.`,
    `${cantidad} «${nombre}» ${unidadW} = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal each), ${pctDiario}% of a 2000 kcal diet.`,
    `${cantidad} ${unidadW} «${nombre}» = ${fmt(total)} kcal (${fmt(kcalUnidad)} kcal cada), ${pctDiario}% de uma dieta de 2000 kcal.`,
  );

  let insight: any;
  if (esCasera) {
    insight = {
      title: pick('Hecha en casa controlás las calorías', 'Homemade: you control the calories', 'Em casa você controla as calorias'),
      text: pick(
        `Una ${nombre.toLowerCase()} ronda **${fmt(kcalUnidad)} kcal**. Lo bueno de cocinarla en casa es que controlás todo: el tamaño del medallón, el pan y la grasa de cocción. Una casera simple (350 kcal) queda muy por debajo de una Big Mac (540) o una Whopper (660); con queso y doble carne, en cambio, trepás rápido.`,
        `A ${nombre.toLowerCase()} is about **${fmt(kcalUnidad)} kcal**. The good thing about cooking it at home is that you control everything: patty size, bun and cooking fat. A simple homemade burger (350 kcal) sits well below a Big Mac (540) or a Whopper (660); add cheese and a double patty, though, and it climbs fast.`,
        `Um ${nombre.toLowerCase()} tem cerca de **${fmt(kcalUnidad)} kcal**. O bom de fazer em casa é que você controla tudo: o tamanho do hambúrguer, o pão e a gordura. Um caseiro simples (350 kcal) fica bem abaixo de um Big Mac (540) ou um Whopper (660); com queijo e carne dupla, porém, sobe rápido.`,
      ),
      tone: 'good',
      icon: '🍔',
    };
  } else if (extra > 0) {
    insight = {
      title: pick('Más pesada que la casera', 'Heavier than homemade', 'Mais pesado que o caseiro'),
      text: pick(
        `Una ${nombre} tiene **${fmt(kcalUnidad)} kcal**, unas **${fmt(extra)} kcal más** que una hamburguesa casera simple (350). ${cantidad > 1 ? `Comer ${cantidad} suma **${fmt(total)} kcal**. ` : ''}Equivale al **${pctDiario}%** de una dieta de 2000 kcal: la misma hamburguesa hecha en casa te ahorraría buena parte de esas calorías.`,
        `A ${nombre} has **${fmt(kcalUnidad)} kcal**, about **${fmt(extra)} kcal more** than a simple homemade burger (350). ${cantidad > 1 ? `Eating ${cantidad} adds up to **${fmt(total)} kcal**. ` : ''}That's **${pctDiario}%** of a 2000 kcal diet — making the same burger at home would save much of that.`,
        `Um ${nombre} tem **${fmt(kcalUnidad)} kcal**, cerca de **${fmt(extra)} kcal a mais** que um hambúrguer caseiro simples (350). ${cantidad > 1 ? `Comer ${cantidad} soma **${fmt(total)} kcal**. ` : ''}É **${pctDiario}%** de uma dieta de 2000 kcal — fazer o mesmo em casa pouparia boa parte disso.`,
      ),
      tone: pctDiario >= 30 ? 'warn' : 'neutral',
      icon: '🍔',
    };
  } else {
    // Comercial igual o más liviana que la casera simple (ej. McDonald's simple, 250 kcal).
    const menos = Math.abs(extra);
    insight = {
      title: pick('De las más livianas', 'One of the lighter ones', 'Um dos mais leves'),
      text: pick(
        `Una ${nombre} tiene **${fmt(kcalUnidad)} kcal**, ${menos > 0 ? `unas **${fmt(menos)} kcal menos** que` : 'lo mismo que'} una hamburguesa casera simple (350): es de las opciones más chicas del menú. ${cantidad > 1 ? `Comer ${cantidad} suma **${fmt(total)} kcal**. ` : ''}Equivale al **${pctDiario}%** de una dieta de 2000 kcal.`,
        `A ${nombre} has **${fmt(kcalUnidad)} kcal**, ${menos > 0 ? `about **${fmt(menos)} kcal less** than` : 'the same as'} a simple homemade burger (350) — one of the smallest options on the menu. ${cantidad > 1 ? `Eating ${cantidad} adds up to **${fmt(total)} kcal**. ` : ''}That's **${pctDiario}%** of a 2000 kcal diet.`,
        `Um ${nombre} tem **${fmt(kcalUnidad)} kcal**, ${menos > 0 ? `cerca de **${fmt(menos)} kcal a menos** que` : 'o mesmo que'} um hambúrguer caseiro simples (350) — uma das menores opções do menu. ${cantidad > 1 ? `Comer ${cantidad} soma **${fmt(total)} kcal**. ` : ''}É **${pctDiario}%** de uma dieta de 2000 kcal.`,
      ),
      tone: 'good',
      icon: '🍔',
    };
  }

  return {
    caloriasTotal: total,
    caloriasPorUnidad: kcalUnidad,
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
