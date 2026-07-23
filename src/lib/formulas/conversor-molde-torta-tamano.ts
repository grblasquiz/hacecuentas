/** Conversor de molde de torta: factor de escala por área (o volumen) */
export interface Inputs {
  diamReceta?: number;
  forma?: string;
  diamMolde?: number;
  lado1?: number;
  lado2?: number;
  alturaReceta?: number;
  alturaMolde?: number;
  __lang?: string;
}
export interface Outputs {
  factor: number;
  areaReceta: number;
  areaMolde: number;
  diamEquivalente: number;
  ajusteHorno: string;
  formula: string;
  _insight?: any;
}

export function conversorMoldeTortaTamano(i: Inputs): Outputs {
  const diamReceta = Number(i.diamReceta) || 0;
  const forma = String(i.forma || 'redondo');
  const diamMolde = Number(i.diamMolde) || 0;
  const lado1 = Number(i.lado1) || 0;
  const lado2 = Number(i.lado2) || 0;
  const alturaReceta = Number(i.alturaReceta) || 0;
  const alturaMolde = Number(i.alturaMolde) || 0;

  if (diamReceta <= 0) throw new Error('Ingresá el diámetro del molde de la receta (mayor a 0)');
  if (alturaReceta < 0 || alturaMolde < 0) throw new Error('Las alturas no pueden ser negativas');

  const areaReceta = Math.PI * Math.pow(diamReceta / 2, 2);

  let areaMolde = 0;
  let descMolde = '';
  if (forma === 'redondo') {
    if (diamMolde <= 0) throw new Error('Ingresá el diámetro de tu molde (mayor a 0)');
    areaMolde = Math.PI * Math.pow(diamMolde / 2, 2);
    descMolde = `redondo de ${diamMolde} cm`;
  } else if (forma === 'cuadrado') {
    if (lado1 <= 0) throw new Error('Ingresá el lado de tu molde cuadrado (mayor a 0)');
    areaMolde = lado1 * lado1;
    descMolde = `cuadrado de ${lado1}×${lado1} cm`;
  } else {
    // rectangular
    if (lado1 <= 0 || lado2 <= 0) throw new Error('Ingresá los dos lados de tu molde rectangular (mayores a 0)');
    areaMolde = lado1 * lado2;
    descMolde = `rectangular de ${lado1}×${lado2} cm`;
  }

  let factor = areaMolde / areaReceta;
  let porVolumen = false;
  if (alturaReceta > 0 && alturaMolde > 0) {
    factor = factor * (alturaMolde / alturaReceta);
    porVolumen = true;
  }

  // Diámetro redondo equivalente del molde destino (misma área)
  const diamEquivalente = Math.sqrt((4 * areaMolde) / Math.PI);

  let ajusteHorno = '';
  if (factor >= 1.5) {
    ajusteHorno = 'Molde bastante más grande: bajá el horno 10-15 °C y sumá 5-15 minutos. La capa queda más finita si no escalás los ingredientes; si los escalás, revisá con palillo 10 min antes del tiempo original.';
  } else if (factor > 1.1) {
    ajusteHorno = 'Molde algo más grande: misma temperatura, tiempo parecido o apenas menor si no escalás (masa más finita). Revisá con palillo 5-10 min antes.';
  } else if (factor >= 0.9) {
    ajusteHorno = 'Moldes casi equivalentes: misma temperatura y mismo tiempo. Revisá con palillo sobre el final igual.';
  } else if (factor > 0.67) {
    ajusteHorno = 'Molde algo más chico: misma temperatura; si escalás los ingredientes hacia abajo, el tiempo baja un poco. Revisá 5-10 min antes.';
  } else {
    ajusteHorno = 'Molde mucho más chico: si no escalás la receta, la masa queda alta — bajá 10 °C y sumá 10-20 min para que cocine el centro sin quemar arriba. Mejor escalá los ingredientes con el factor.';
  }

  const factorR = Number(factor.toFixed(2));
  const base = porVolumen ? 'volúmenes' : 'áreas';
  const formula = porVolumen
    ? `factor = (${areaMolde.toFixed(1)} × ${alturaMolde}) / (${areaReceta.toFixed(1)} × ${alturaReceta}) = ${factorR}`
    : `factor = ${areaMolde.toFixed(1)} / ${areaReceta.toFixed(1)} = ${factorR}`;

  return {
    factor: factorR,
    areaReceta: Number(areaReceta.toFixed(1)),
    areaMolde: Number(areaMolde.toFixed(1)),
    diamEquivalente: Number(diamEquivalente.toFixed(1)),
    ajusteHorno,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Tu molde ${descMolde} necesita **×${factorR.toLocaleString('es-AR')}** de cada ingrediente de la receta pensada para ${diamReceta} cm (cociente de ${base}). Ejemplo: si la receta lleva 200 g de harina, usá ${Number((200 * factorR).toFixed(0))} g.`,
      tone: 'neutral',
      icon: '🎂',
    },
  };
}
