/** Litros de acuario necesarios según cantidad y tamaño de peces */
export interface Inputs {
  cantidadPeces: number;
  tamanoPez?: string;
  tipoAgua?: string;
}
export interface Outputs {
  litrosMinimos: number;
  tamanoRecomendado: string;
  detalle: string;
}

export function tamanoPecera(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadPeces);
  const tamano = String(i.tamanoPez || 'pequeno');
  const tipoAgua = String(i.tipoAgua || 'tropical');

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de peces');

  // Cm promedio adulto por categoría
  let cmPromedio = 4;
  let nombreTamano = 'pequeños';
  if (tamano === 'mediano') { cmPromedio = 8; nombreTamano = 'medianos'; }
  else if (tamano === 'grande') { cmPromedio = 18; nombreTamano = 'grandes'; }

  // Base: 1 litro por cm de pez adulto
  let litros = cantidad * cmPromedio * 1;

  // Factor tipo de agua
  if (tipoAgua === 'tropical') litros *= 1.2;

  litros = Math.ceil(litros);

  // Tamaño recomendado (redondear al estándar comercial más cercano)
  const estandares = [10, 20, 30, 40, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];
  let recomendado = estandares.find(s => s >= litros) || litros;
  // Recomendar un tamaño mayor para dar holgura
  const indice = estandares.indexOf(recomendado);
  const ideal = indice < estandares.length - 1 ? estandares[indice + 1] : recomendado;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    litrosMinimos: litros,
    tamanoRecomendado: `Mínimo ${fmt.format(recomendado)} L, ideal ${fmt.format(ideal)} L`,
    detalle: `${fmt.format(cantidad)} peces ${nombreTamano} (~${cmPromedio} cm c/u) en agua ${tipoAgua === 'tropical' ? 'tropical' : 'fría'}: mínimo ${fmt.format(litros)} L. Recomendado: acuario de ${fmt.format(recomendado)}-${fmt.format(ideal)} L.`,
  };
}
