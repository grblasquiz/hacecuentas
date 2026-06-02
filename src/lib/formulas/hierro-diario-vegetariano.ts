/**
 * Hierro RDA con ajuste vegetariano +80%.
 */

export interface HierroDiarioVegetarianoInputs {
  sexo: string;
  dieta: string;
}

export interface HierroDiarioVegetarianoOutputs {
  hierroMg: number;
  tipHem: string;
  alimentosSugeridos: string;
  resumen: string;
  _insight?: any;
}

export function hierroDiarioVegetariano(inputs: HierroDiarioVegetarianoInputs): HierroDiarioVegetarianoOutputs {
  const sexo = inputs.sexo || 'mujer';
  const dieta = inputs.dieta || 'omnivoro';
  let base: number;
  if (sexo === 'mujer') base = 18;
  else if (sexo === 'post') base = 8;
  else base = 8;
  const fe = dieta === 'vegetariano' ? base * 1.8 : base;
  const feMg = Number(fe.toFixed(0));
  const esVeg = dieta === 'vegetariano';
  const sexoTxt = sexo === 'mujer' ? 'mujer en edad fértil' : sexo === 'post' ? 'mujer posmenopáusica' : 'hombre adulto';
  const _insight = esVeg
    ? {
        title: 'Tu objetivo de hierro vegetariano',
        text: `Como **${sexoTxt}** con dieta vegetariana, tu meta es **${feMg} mg/día** (un **+80%** sobre los ${base} mg de referencia, porque el hierro no-hem se absorbe peor). Acompañá cada comida con vitamina C (cítrico, pimiento, tomate) para multiplicar la absorción hasta **+300%** y evitá el té o café junto a las comidas.`,
        tone: 'warn' as const,
        icon: '🌱',
      }
    : {
        title: 'Tu objetivo de hierro diario',
        text: `Como **${sexoTxt}** con dieta omnívora, tu meta es **${feMg} mg/día**. La mitad del hierro proviene de fuentes hem (carnes), que se absorben mucho mejor que el vegetal; aun así, sumar vitamina C ayuda a aprovechar el no-hem.`,
        tone: 'good' as const,
        icon: '🥩',
      };
  return {
    hierroMg: feMg,
    tipHem: esVeg ? 'No-hem, absorción 2-20%. +300% con vitamina C.' : 'Mix hem + no-hem.',
    alimentosSugeridos: 'Lentejas + tomate, semillas calabaza, tofu + limón, espinaca + pimiento rojo',
    resumen: `Tu RDA: ${feMg} mg hierro/día (${dieta}).`,
    _insight,
  };
}
