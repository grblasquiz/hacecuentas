/**
 * Calculadora Monotributo Argentina
 * Categorías y aportes aprox 2026 (a validar con AFIP periódicamente)
 *
 * Cada categoría tiene:
 *   - Límite anual de facturación
 *   - Cuota mensual (componente impositivo + jubilación + obra social)
 */
import { TOPES, CATEGORIAS, cuota as cuotaMono, type Actividad } from '../data/monotributo-2026';

export interface MonotributoInputs {
  facturacionAnual: number;
  tipoActividad: string; // servicios | bienes
}

export interface MonotributoOutputs {
  categoria: string;
  cuotaMensual: number;
  cuotaAnual: number;
  limiteCategoria: number;
  margenHastaLimite: number;
  alerta: string;
  _insight?: any;
  _chart?: any;
}

export function monotributo(inputs: MonotributoInputs): MonotributoOutputs {
  const facturacionAnual = Number(inputs.facturacionAnual);
  const tipo = inputs.tipoActividad || 'servicios';

  if (!facturacionAnual || facturacionAnual < 0) {
    throw new Error('Ingresá tu facturación anual estimada');
  }

  // Escala ARCA 2026 desde la fuente única (servicios y bienes alcanzan A-K).
  const act: Actividad = tipo === 'bienes' ? 'bienes' : 'servicios';
  const tabla = CATEGORIAS.map((c) => ({ letra: c, limiteAnual: TOPES[c], cuota: Math.round(cuotaMono(c, act)) }));
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

  const fmtArs = (n: number) => '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
  const usoPct = Math.round(porcentajeUso);

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightTitle: string;
  let insightText: string;
  if (porcentajeUso > 90) {
    insightTone = 'warn';
    insightTitle = 'Al borde del tope';
    insightText = `Usás el **${usoPct}%** del tope de la Categoría ${categoria.letra} (${fmtArs(categoria.limiteAnual)}). Te quedan apenas **${fmtArs(margenHastaLimite)}** de margen: si facturás más, recategorizá o pasá a Responsable Inscripto para no quedar excluido.`;
  } else if (porcentajeUso > 75) {
    insightTone = 'warn';
    insightTitle = 'Vigilá tu facturación';
    insightText = `Estás en el **${usoPct}%** del tope de la Categoría ${categoria.letra}. La cuota es **${fmtArs(cuotaMensual)}/mes** (${fmtArs(cuotaAnual)}/año) y te restan **${fmtArs(margenHastaLimite)}** antes de tener que recategorizar.`;
  } else {
    insightTone = 'good';
    insightTitle = 'Categoría holgada';
    insightText = `Quedás en Categoría ${categoria.letra} usando el **${usoPct}%** del tope: pagás **${fmtArs(cuotaMensual)}/mes** (${fmtArs(cuotaAnual)}/año) y tenés **${fmtArs(margenHastaLimite)}** de margen hasta el límite.`;
  }

  return {
    categoria: `Categoría ${categoria.letra}`,
    cuotaMensual,
    cuotaAnual,
    limiteCategoria: categoria.limiteAnual,
    margenHastaLimite,
    alerta,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '🧾',
    },
    _chart: {
      type: 'scale',
      marker: usoPct,
      markerLabel: `${usoPct}% del tope`,
      min: 0,
      segments: [
        { nombre: 'Holgado', max: 75, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Vigilar', max: 90, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Al límite', max: 105, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Uso de la categoría: ${usoPct}% del tope de facturación`,
    },
  };
}
