/**
 * Conversor de UMA (Unidad de Medida y Actualización) a pesos mexicanos
 * Valores proyectados 2026, validar contra fuente oficial INEGI
 */

export interface Inputs {
  cantidadUma: number;
  tipo: 'diaria' | 'mensual' | 'anual';
}

export interface Outputs {
  valorPesos: number;
  valorUmaUnidad: number;
  detalle: string;
  mensaje: string;
}

// Valores proyectados 2026, validar contra fuente oficial
const UMA_2026 = {
  diaria: 120.00,
  mensual: 3650.00,
  anual: 43800.00,
};

export function umaConversion(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadUma);
  const tipo = i.tipo;

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de UMA');
  if (!['diaria', 'mensual', 'anual'].includes(tipo)) {
    throw new Error('Tipo debe ser diaria, mensual o anual');
  }

  const valorUmaUnidad = UMA_2026[tipo];
  const valorPesos = cantidad * valorUmaUnidad;

  return {
    valorPesos: Number(valorPesos.toFixed(2)),
    valorUmaUnidad,
    detalle: `${cantidad} UMA ${tipo} × $${valorUmaUnidad} = $${valorPesos.toFixed(2)}`,
    mensaje: `${cantidad} UMA ${tipo} equivalen a $${valorPesos.toFixed(2)} pesos (valor 2026).`,
  };
}
