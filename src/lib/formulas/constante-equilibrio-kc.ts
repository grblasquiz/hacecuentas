export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function constanteEquilibrioKc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const prod = Number(i.prod); const coefProd = Number(i.coefProd);
  const reac1 = Number(i.reac1); const coef1 = Number(i.coef1);
  const reac2 = Number(i.reac2); const coef2 = Number(i.coef2);
  if (!prod || !coefProd || !reac1 || !coef1 || !reac2 || !coef2) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const num = Math.pow(prod, coefProd);
  const den = Math.pow(reac1, coef1) * Math.pow(reac2, coef2);
  const kc = num / den;
  const deltaN = coefProd - (coef1 + coef2);
  const haciaProductos = kc > 1;
  const lectura = kc > 1000
    ? (__lang === 'en' ? 'Strongly toward products' : 'Muy desplazado a productos')
    : kc < 0.001
      ? (__lang === 'en' ? 'Strongly toward reactants' : 'Muy desplazado a reactivos')
      : haciaProductos
        ? (__lang === 'en' ? 'Toward products' : 'Hacia los productos')
        : (__lang === 'en' ? 'Toward reactants' : 'Hacia los reactivos');
  const resumen = __lang === 'en'
    ? `Kc = ${kc.toPrecision(4)} (${num.toPrecision(4)} / ${den.toPrecision(4)}). Δn = ${deltaN}${deltaN === 0 ? ', so Kp equals Kc' : ', so Kp = Kc × (RT)^' + deltaN}.`
    : `Kc = ${kc.toPrecision(4)} (${num.toPrecision(4)} / ${den.toPrecision(4)}). Δn = ${deltaN}${deltaN === 0 ? ', así que Kp es igual a Kc' : ', así que Kp = Kc × (RT)^' + deltaN}.`;
  const _insight = {
    title: __lang === 'en' ? 'Equilibrium position' : 'Posición del equilibrio',
    text: __lang === 'en'
      ? `With Kc = **${kc.toPrecision(4)}** the equilibrium sits ${haciaProductos ? 'on the product side' : 'on the reactant side'}. Remember this number changes only with temperature — adding reagent or a catalyst shifts concentrations, never Kc itself.`
      : `Con Kc = **${kc.toPrecision(4)}** el equilibrio está ${haciaProductos ? 'del lado de los productos' : 'del lado de los reactivos'}. Acordate de que este número solo cambia con la temperatura: agregar reactivo o un catalizador mueve las concentraciones, nunca el valor de Kc.`,
    tone: 'neutral',
    icon: '⚖️',
  };
  return { kc: kc.toPrecision(4), deltaN: String(deltaN), lectura, resumen, _insight };
}
