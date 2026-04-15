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
  { letra: 'A', limiteAnual: 10277988, cuota: 42387 },
  { letra: 'B', limiteAnual: 15058448, cuota: 48251 },
  { letra: 'C', limiteAnual: 21113697, cuota: 56502 },
  { letra: 'D', limiteAnual: 26212853, cuota: 72414 },
  { letra: 'E', limiteAnual: 30833964, cuota: 102538 },
  { letra: 'F', limiteAnual: 38642048, cuota: 129045 },
  { letra: 'G', limiteAnual: 46211109, cuota: 197108 },
  { letra: 'H', limiteAnual: 70113407, cuota: 447347 },
];

const categoriasBienes: Categoria[] = [
  { letra: 'A', limiteAnual: 10277988, cuota: 42387 },
  { letra: 'B', limiteAnual: 15058448, cuota: 48251 },
  { letra: 'C', limiteAnual: 21113697, cuota: 55227 },
  { letra: 'D', limiteAnual: 26212853, cuota: 70661 },
  { letra: 'E', limiteAnual: 30833964, cuota: 92658 },
  { letra: 'F', limiteAnual: 38642048, cuota: 111198 },
  { letra: 'G', limiteAnual: 46211109, cuota: 135918 },
  { letra: 'H', limiteAnual: 70113407, cuota: 272063 },
  { letra: 'I', limiteAnual: 78479212, cuota: 406512 },
  { letra: 'J', limiteAnual: 89872640, cuota: 497059 },
  { letra: 'K', limiteAnual: 108357084, cuota: 1381688 },
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
