/**
 * Generador de Número Aleatorio / Tirar Dado
 */
export interface AleatorioNumeroDadoInputs { minimo: number; maximo: number; cantidad: number; tipo: string; }
export interface AleatorioNumeroDadoOutputs { resultado: string; numeros: string; total: number; promedio: string; }

export function aleatorioNumeroDado(inputs: AleatorioNumeroDadoInputs): AleatorioNumeroDadoOutputs {
  const tipo = (inputs.tipo || 'rango').toLowerCase();

  let min: number, max: number, cantidad: number;

  switch (tipo) {
    case 'dado6':
      min = 1; max = 6;
      cantidad = Math.min(20, Math.max(1, Number(inputs.cantidad) || 1));
      break;
    case 'dado12':
      min = 1; max = 12;
      cantidad = Math.min(20, Math.max(1, Number(inputs.cantidad) || 1));
      break;
    case 'dado20':
      min = 1; max = 20;
      cantidad = Math.min(20, Math.max(1, Number(inputs.cantidad) || 1));
      break;
    case 'moneda':
      min = 0; max = 1;
      cantidad = Math.min(20, Math.max(1, Number(inputs.cantidad) || 1));
      break;
    default: // rango personalizado
      min = Number(inputs.minimo);
      max = Number(inputs.maximo);
      cantidad = Math.min(20, Math.max(1, Number(inputs.cantidad) || 1));
      if (isNaN(min) || isNaN(max)) throw new Error('Ingresá un mínimo y máximo válidos');
      if (min >= max) throw new Error('El mínimo debe ser menor que el máximo');
      if (max - min > 1000000) throw new Error('El rango máximo es de 1.000.000');
  }

  const resultados: number[] = [];
  for (let i = 0; i < cantidad; i++) {
    resultados.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  const total = resultados.reduce((a, b) => a + b, 0);
  const promedio = total / resultados.length;

  let resultado: string;
  let numeros: string;

  if (tipo === 'moneda') {
    const caras = resultados.map(n => n === 0 ? 'Cara' : 'Cruz');
    numeros = caras.join(', ');
    const carasCount = resultados.filter(n => n === 0).length;
    const cruzCount = resultados.filter(n => n === 1).length;
    resultado = cantidad === 1
      ? `Resultado: ${caras[0]}`
      : `${cantidad} lanzamientos: ${carasCount} Cara, ${cruzCount} Cruz`;
  } else {
    numeros = resultados.join(', ');
    const tipoLabel = tipo === 'dado6' ? 'dado de 6' : tipo === 'dado12' ? 'dado de 12' : tipo === 'dado20' ? 'dado de 20' : `rango ${min}-${max}`;
    resultado = cantidad === 1
      ? `Resultado: ${resultados[0]} (${tipoLabel})`
      : `${cantidad} resultados (${tipoLabel}): ${numeros}`;
  }

  return {
    resultado,
    numeros,
    total,
    promedio: promedio.toLocaleString('es-AR', { maximumFractionDigits: 2 }),
  };
}
