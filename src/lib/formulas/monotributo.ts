/**
 * Calculadora Monotributo Argentina
 * Categorías y aportes aprox 2026 (a validar con AFIP periódicamente)
 *
 * Cada categoría tiene:
 *   - Límite anual de facturación
 *   - Cuota mensual (componente impositivo + jubilación + obra social)
 */

export interface MonotributoInputs {
  facturacionAnual: number;
  tipoActividad: string; // servicios | bienes
}

interface Categoria {
  letra: string;
  limiteAnual: number;
  cuota: number; // aproximado
}

// Datos aproximados 2026 — actualizar con AFIP
const categoriasServicios: Categoria[] = [
  { letra: 'A', limiteAnual: 8500000, cuota: 52000 },
  { letra: 'B', limiteAnual: 12500000, cuota: 62000 },
  { letra: 'C', limiteAnual: 17500000, cuota: 74000 },
  { letra: 'D', limiteAnual: 22000000, cuota: 92000 },
  { letra: 'E', limiteAnual: 26000000, cuota: 130000 },
  { letra: 'F', limiteAnual: 32500000, cuota: 165000 },
  { letra: 'G', limiteAnual: 39000000, cuota: 215000 },
  { letra: 'H', limiteAnual: 53000000, cuota: 320000 },
];

const categoriasBienes: Categoria[] = [
  { letra: 'A', limiteAnual: 8500000, cuota: 52000 },
  { letra: 'B', limiteAnual: 12500000, cuota: 62000 },
  { letra: 'C', limiteAnual: 17500000, cuota: 74000 },
  { letra: 'D', limiteAnual: 22000000, cuota: 92000 },
  { letra: 'E', limiteAnual: 26000000, cuota: 130000 },
  { letra: 'F', limiteAnual: 32500000, cuota: 165000 },
  { letra: 'G', limiteAnual: 39000000, cuota: 215000 },
  { letra: 'H', limiteAnual: 53000000, cuota: 290000 },
  { letra: 'I', limiteAnual: 59000000, cuota: 360000 },
  { letra: 'J', limiteAnual: 68000000, cuota: 430000 },
  { letra: 'K', limiteAnual: 82000000, cuota: 530000 },
];

export interface MonotributoOutputs {
  categoria: string;
  cuotaMensual: number;
  cuotaAnual: number;
  limiteCategoria: number;
  margenHastaLimite: number;
  alerta: string;
}

export function monotributo(inputs: MonotributoInputs): MonotributoOutputs {
  const facturacionAnual = Number(inputs.facturacionAnual);
  const tipo = inputs.tipoActividad || 'servicios';

  if (!facturacionAnual || facturacionAnual < 0) {
    throw new Error('Ingresá tu facturación anual estimada');
  }

  const tabla = tipo === 'bienes' ? categoriasBienes : categoriasServicios;
  const categoria = tabla.find((c) => facturacionAnual <= c.limiteAnual);

  if (!categoria) {
    throw new Error('Facturación supera el límite del monotributo. Debés pasar a Responsable Inscripto.');
  }

  const cuotaMensual = categoria.cuota;
  const cuotaAnual = cuotaMensual * 12;
  const margenHastaLimite = categoria.limiteAnual - facturacionAnual;

  let alerta = '';
  const porcentajeUso = (facturacionAnual / categoria.limiteAnual) * 100;
  if (porcentajeUso > 90) {
    alerta = '⚠️ Estás cerca del límite. Si superás, recategorizá o pasá a Responsable Inscripto.';
  } else if (porcentajeUso > 75) {
    alerta = '⚡ Estás en el 75%+ del límite. Monitoreá tu facturación.';
  } else {
    alerta = '✅ Estás holgado en esta categoría.';
  }

  return {
    categoria: `Categoría ${categoria.letra}`,
    cuotaMensual,
    cuotaAnual,
    limiteCategoria: categoria.limiteAnual,
    margenHastaLimite,
    alerta,
  };
}
