/**
 * Calculadora de presupuesto de pauta por objetivo
 * Según el objetivo, el costo_unitario significa algo distinto:
 *   - alcance-impresiones: costo_unitario = CPM (costo por mil) → presupuesto = meta/1000 × CPM
 *   - clics:               costo_unitario = CPC                 → presupuesto = meta × CPC
 *   - conversiones:        costo_unitario = CPA                 → presupuesto = meta × CPA
 */

export interface PresupuestoPautaInputs {
  objetivo: string; // 'alcance-impresiones' | 'clics' | 'conversiones'
  meta_cantidad: number;
  costo_unitario: number; // CPM / CPC / CPA según objetivo
}

export interface PresupuestoPautaOutputs {
  presupuesto: number;
  objetivoLabel: string;
  unidadCosto: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function presupuestoPautaPorObjetivo(
  inputs: PresupuestoPautaInputs
): PresupuestoPautaOutputs {
  const objetivo = (inputs.objetivo || 'conversiones').toString();
  const meta = Number(inputs.meta_cantidad);
  const costo = Number(inputs.costo_unitario);

  if (!meta || meta <= 0) throw new Error('Ingresá la cantidad meta');
  if (!costo || costo <= 0) throw new Error('Ingresá el costo unitario');

  let presupuesto = 0;
  let objetivoLabel = '';
  let unidadCosto = '';
  let detalle = '';

  if (objetivo === 'alcance-impresiones') {
    // CPM = costo por MIL impresiones
    presupuesto = (meta / 1000) * costo;
    objetivoLabel = 'Alcance / impresiones';
    unidadCosto = 'CPM (costo por mil)';
    detalle = `${meta.toLocaleString('es-AR')} impresiones × ($${costo.toLocaleString('es-AR')} CPM ÷ 1000)`;
  } else if (objetivo === 'clics') {
    presupuesto = meta * costo;
    objetivoLabel = 'Clics';
    unidadCosto = 'CPC (costo por clic)';
    detalle = `${meta.toLocaleString('es-AR')} clics × $${costo.toLocaleString('es-AR')} CPC`;
  } else {
    // conversiones (default)
    presupuesto = meta * costo;
    objetivoLabel = 'Conversiones';
    unidadCosto = 'CPA (costo por adquisición)';
    detalle = `${meta.toLocaleString('es-AR')} conversiones × $${costo.toLocaleString('es-AR')} CPA`;
  }

  const presR = Math.round(presupuesto);
  const insightText = `Para conseguir **${meta.toLocaleString('es-AR')} ${objetivoLabel.toLowerCase()}** a un costo de **$${costo.toLocaleString('es-AR')}** por ${unidadCosto.split(' ')[0]}, necesitás un presupuesto de **$${presR.toLocaleString('es-AR')}**. Repartilo según los días de campaña para fijar tu presupuesto diario.`;

  return {
    presupuesto: presR,
    objetivoLabel,
    unidadCosto,
    detalle,
    _insight: {
      title: 'Presupuesto requerido',
      text: insightText,
      tone: 'good',
      icon: '📊',
    },
    _chart: {
      type: 'bars',
      bars: [
        {
          nombre: 'Diario (30 días)',
          valor: Math.round(presR / 30),
          color: '#60a5fa',
          colorDark: '#3b82f6',
        },
        {
          nombre: 'Semanal',
          valor: Math.round(presR / 4.3),
          color: '#34d399',
          colorDark: '#10b981',
        },
        {
          nombre: 'Total',
          valor: presR,
          color: '#a78bfa',
          colorDark: '#8b5cf6',
        },
      ],
      ariaLabel: `Presupuesto total de $${presR} repartido en diario y semanal`,
    },
  };
}
