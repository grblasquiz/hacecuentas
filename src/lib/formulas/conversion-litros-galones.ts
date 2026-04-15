/** Conversión de volumen: litros, galones US/UK, mililitros, onzas líquidas */
export interface Inputs {
  valor: number;
  unidadOrigen: string;
}
export interface Outputs {
  litros: number;
  mililitros: number;
  galonesUS: number;
  galonesUK: number;
  onzasUS: number;
  onzasUK: number;
  resumen: string;
}

export function conversionLitrosGalones(i: Inputs): Outputs {
  const valor = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'litros');
  if (!valor || valor < 0) throw new Error('Ingresá un valor válido mayor a cero');

  // Convertir a litros base
  let litros = 0;
  if (unidad === 'litros') litros = valor;
  else if (unidad === 'mililitros') litros = valor / 1000;
  else if (unidad === 'galones-us') litros = valor * 3.785411784;
  else if (unidad === 'galones-uk') litros = valor * 4.54609;
  else if (unidad === 'onzas-us') litros = valor * 0.0295735296;
  else if (unidad === 'onzas-uk') litros = valor * 0.0284130625;
  else throw new Error('Unidad de origen no reconocida');

  const mililitros = litros * 1000;
  const galonesUS = litros / 3.785411784;
  const galonesUK = litros / 4.54609;
  const onzasUS = litros / 0.0295735296;
  const onzasUK = litros / 0.0284130625;

  return {
    litros: Number(litros.toFixed(4)),
    mililitros: Number(mililitros.toFixed(2)),
    galonesUS: Number(galonesUS.toFixed(4)),
    galonesUK: Number(galonesUK.toFixed(4)),
    onzasUS: Number(onzasUS.toFixed(2)),
    onzasUK: Number(onzasUK.toFixed(2)),
    resumen: `${valor} ${unidad.replace('-', ' ')} equivalen a ${litros.toFixed(3)} litros o ${galonesUS.toFixed(3)} galones US.`,
  };
}
