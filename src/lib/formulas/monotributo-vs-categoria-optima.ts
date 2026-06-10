/**
 * Calculadora "Tu Monotributo vs categoría óptima 2026".
 *
 * Compara la facturación últimos 12 meses contra la tabla oficial ARCA
 * vigente desde febrero 2026 y devuelve:
 *   - La categoría que CORRESPONDE según facturación
 *   - La cuota mensual de esa categoría
 *   - Diferencia con la cuota actual del usuario
 *   - Si excede cat K → debe pasar a RI
 *
 * Fuente: ARCA, escala monotributo vigente desde 2026-02-01.
 * Próxima actualización esperada: julio-agosto 2026 (recate cuatrimestral).
 */

// Tabla oficial Monotributo 2026 — fuente única src/lib/data/monotributo-2026.ts
// (ARCA, vigente desde 1-feb-2026). Al rotar la escala (jul-ago 2026) se actualiza
// el data file y todas las calcs quedan sincronizadas; bump lastReviewed en
// monotributo-vs-categoria-optima.json para que el sitemap lo detecte.
import {
  CATEGORIAS as CATS_MONO,
  TOPES,
  CUOTA_SERVICIOS,
  CUOTA_BIENES,
  DATA_AS_OF,
} from '../data/monotributo-2026';

interface CategoriaMonotributo {
  letra: string;
  topeFacturacionAnual: number;
  cuotaServicios: number;
  cuotaBienes: number;
}

const TABLA_2026: CategoriaMonotributo[] = CATS_MONO.map((letra) => ({
  letra,
  topeFacturacionAnual: TOPES[letra],
  // Cuota redondeada al peso: la calc compara categorías y muestra montos
  // mensuales (los centavos del data file no aportan y ensucian el display).
  cuotaServicios: Math.round(CUOTA_SERVICIOS[letra]),
  cuotaBienes: Math.round(CUOTA_BIENES[letra]),
}));

const FECHA_VIGENCIA = DATA_AS_OF;

export interface MonotributoCategoriaOptimaInputs {
  facturacion12meses: number;
  tipoActividad: 'servicios' | 'bienes';
  categoriaActualLetra?: string; // opcional — si la pasa, calculamos delta
}

export interface MonotributoCategoriaOptimaOutputs {
  categoriaCorrecta: string;
  topeCategoria: number;
  cuotaMensualCorrecta: number;
  cuotaAnualCorrecta: number;
  diagnostico: string;
  ahorroAnualSiCambias: number;
  margenHastaSiguienteCat: number;
  vigenciaTabla: string;
  _chart?: any;
  _insight?: any;
}

export function monotributoVsCategoriaOptima(
  inputs: MonotributoCategoriaOptimaInputs
): MonotributoCategoriaOptimaOutputs {
  const facturacion = Number(inputs.facturacion12meses);
  const tipo = inputs.tipoActividad === 'bienes' ? 'bienes' : 'servicios';
  const categoriaActualLetra = (inputs.categoriaActualLetra || '').toUpperCase().trim();

  if (!facturacion || facturacion < 0) {
    throw new Error('Ingresá tu facturación de los últimos 12 meses');
  }

  // Casos extremos
  if (facturacion === 0) {
    return {
      categoriaCorrecta: 'A',
      topeCategoria: TABLA_2026[0].topeFacturacionAnual,
      cuotaMensualCorrecta: TABLA_2026[0].cuotaServicios,
      cuotaAnualCorrecta: TABLA_2026[0].cuotaServicios * 12,
      diagnostico: 'Categoría A',
      ahorroAnualSiCambias: 0,
      margenHastaSiguienteCat: TABLA_2026[0].topeFacturacionAnual,
      vigenciaTabla: FECHA_VIGENCIA,
      _insight: {
        title: 'Te corresponde la categoría A',
        text: `Sin facturación registrada te ubicás en la categoría más baja, **A** ($${TABLA_2026[0].cuotaServicios.toLocaleString('es-AR')}/mes), con todo el margen disponible hasta el tope.`,
        tone: 'neutral',
        icon: '🧾',
      },
    };
  }

  // Si supera tope K → RI obligatorio
  const topeMaximo = TABLA_2026[TABLA_2026.length - 1].topeFacturacionAnual;
  if (facturacion > topeMaximo) {
    return {
      categoriaCorrecta: 'RI',
      topeCategoria: topeMaximo,
      cuotaMensualCorrecta: 0,
      cuotaAnualCorrecta: 0,
      diagnostico: 'Pasá a Régimen General',
      ahorroAnualSiCambias: 0,
      margenHastaSiguienteCat: 0,
      vigenciaTabla: FECHA_VIGENCIA,
      _insight: {
        title: 'Superás el monotributo',
        text: `Con **$${Math.round(facturacion).toLocaleString('es-AR')}** de facturación anual superás el tope de la categoría K ($${topeMaximo.toLocaleString('es-AR')}). Tenés que pasar al **Régimen General** (Responsable Inscripto).`,
        tone: 'warn',
        icon: '⚠️',
      },
    };
  }

  // Encontrar la categoría correcta (la primera cuyo tope >= facturación)
  let correcta: CategoriaMonotributo | null = null;
  let siguiente: CategoriaMonotributo | null = null;
  for (let i = 0; i < TABLA_2026.length; i++) {
    if (facturacion <= TABLA_2026[i].topeFacturacionAnual) {
      correcta = TABLA_2026[i];
      siguiente = TABLA_2026[i + 1] || null;
      break;
    }
  }
  if (!correcta) correcta = TABLA_2026[TABLA_2026.length - 1];

  const cuotaCorrecta = tipo === 'bienes' ? correcta.cuotaBienes : correcta.cuotaServicios;

  let ahorroAnual: number | null = null;
  if (categoriaActualLetra && categoriaActualLetra !== correcta.letra) {
    const actual = TABLA_2026.find((c) => c.letra === categoriaActualLetra);
    if (actual) {
      const cuotaActual = tipo === 'bienes' ? actual.cuotaBienes : actual.cuotaServicios;
      ahorroAnual = (cuotaActual - cuotaCorrecta) * 12;
    }
  }

  let diagnostico: string;
  if (categoriaActualLetra && categoriaActualLetra === correcta.letra) {
    diagnostico = 'Categoría correcta';
  } else if (categoriaActualLetra && ahorroAnual !== null) {
    if (ahorroAnual > 0) {
      diagnostico = `Pagás de más — sería ${correcta.letra}`;
    } else if (ahorroAnual < 0) {
      diagnostico = `Subcategorizado — pasá a ${correcta.letra}`;
    } else {
      diagnostico = `Categoría ${correcta.letra}`;
    }
  } else {
    diagnostico = `Categoría ${correcta.letra}`;
  }

  const margen = correcta.topeFacturacionAnual - facturacion;
  const usoPct = (facturacion / correcta.topeFacturacionAnual) * 100;

  const _chart = {
    type: 'scale' as const,
    marker: Math.round(usoPct * 10) / 10,
    markerLabel: usoPct.toFixed(0) + '% del tope',
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 70, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Atención', max: 90, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Al límite', max: 105, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: 'Porcentaje del tope de facturación usado dentro de la categoría que corresponde',
  };

  let _insight;
  if (ahorroAnual !== null && ahorroAnual > 0) {
    _insight = {
      title: 'Estás pagando de más',
      text: `Por tu facturación te corresponde la categoría **${correcta.letra}** ($${cuotaCorrecta.toLocaleString('es-AR')}/mes), más baja que tu categoría actual. Recategorizando ahorrarías **$${Math.round(ahorroAnual).toLocaleString('es-AR')}** al año.`,
      tone: 'good',
      icon: '💸',
    };
  } else if (ahorroAnual !== null && ahorroAnual < 0) {
    _insight = {
      title: 'Estás subcategorizado',
      text: `Te corresponde la categoría **${correcta.letra}** ($${cuotaCorrecta.toLocaleString('es-AR')}/mes), más alta que la que tenés. Recategorizá para evitar la exclusión: te costará **$${Math.round(-ahorroAnual).toLocaleString('es-AR')}** más al año.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (usoPct >= 90) {
    _insight = {
      title: 'Estás al límite de la categoría',
      text: `Te corresponde la categoría **${correcta.letra}** ($${cuotaCorrecta.toLocaleString('es-AR')}/mes), pero usás el **${usoPct.toFixed(0)}%** del tope: te quedan apenas **$${Math.round(margen).toLocaleString('es-AR')}** antes de saltar de categoría.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: `Te corresponde la categoría ${correcta.letra}`,
      text: `Con **$${Math.round(facturacion).toLocaleString('es-AR')}** facturados en 12 meses, la categoría correcta es **${correcta.letra}** ($${cuotaCorrecta.toLocaleString('es-AR')}/mes). Usás el **${usoPct.toFixed(0)}%** del tope, con **$${Math.round(margen).toLocaleString('es-AR')}** de margen.`,
      tone: 'good',
      icon: '✅',
    };
  }

  return {
    categoriaCorrecta: correcta.letra,
    topeCategoria: correcta.topeFacturacionAnual,
    cuotaMensualCorrecta: cuotaCorrecta,
    cuotaAnualCorrecta: cuotaCorrecta * 12,
    diagnostico,
    ahorroAnualSiCambias: ahorroAnual,
    margenHastaSiguienteCat: margen,
    vigenciaTabla: FECHA_VIGENCIA,
    _chart,
    _insight,
  };
}
