/** Alimentación complementaria por edad */
export interface Inputs { edadBebeAC: number; metodoAC?: string; }
export interface Outputs { alimentosPermitidos: string; textura: string; cantidad: string; frecuencia: string; }

export function alimentacionComplementaria(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadBebeAC));
  const metodo = String(i.metodoAC || 'mixto');
  if (edad < 4 || edad > 24) throw new Error('Ingresá una edad entre 4 y 24 meses');

  let alimentos = '', textura = '', cantidad = '', frecuencia = '';

  if (edad < 6) {
    alimentos = 'La OMS recomienda lactancia exclusiva hasta los 6 meses. Si tu pediatra indicó inicio temprano: cereales sin gluten, zapallo, batata.';
    textura = 'Purés muy suaves y líquidos';
    cantidad = '1-2 cucharaditas por vez';
    frecuencia = '1 vez al día, como prueba';
  } else if (edad <= 7) {
    alimentos = 'Zapallo, batata, zanahoria cocida, banana, palta, manzana cocida, pera cocida, pollo desmenuzado, cereales infantiles';
    textura = metodo === 'blw' ? 'Trozos blandos grandes (tamaño dedo adulto)' : 'Purés suaves sin grumos';
    cantidad = '2-3 cucharadas por comida';
    frecuencia = '1-2 comidas al día + leche a demanda';
  } else if (edad <= 9) {
    alimentos = '+ legumbres (lentejas, garbanzos), huevo (bien cocido), yogur natural, carne vacuna, avena, fideos cortos';
    textura = metodo === 'blw' ? 'Trozos medianos blandos, alimentos para agarrar' : 'Purés con grumos, aplastados con tenedor';
    cantidad = '4-6 cucharadas por comida';
    frecuencia = '2-3 comidas al día + 1 snack + leche';
  } else if (edad <= 12) {
    alimentos = '+ pescado, pan, arroz, pasta, queso, casi todas las verduras y frutas. SIN miel, sin frutos secos enteros.';
    textura = metodo === 'blw' ? 'Trozos chicos, comida en pedazos, empieza a usar cubiertos' : 'Comida en trocitos, aplastada o cortada';
    cantidad = 'Medio plato pequeño por comida';
    frecuencia = '3 comidas al día + 1-2 snacks + leche';
  } else {
    alimentos = 'Comida familiar adaptada (sin sal extra, sin azúcar). Se puede miel. Frutos secos molidos o en pasta.';
    textura = 'Comida familiar cortada en trozos seguros';
    cantidad = 'Según apetito del niño (autoregulación)';
    frecuencia = '3 comidas + 2 snacks. Leche complementaria.';
  }

  return { alimentosPermitidos: alimentos, textura, cantidad, frecuencia };
}
