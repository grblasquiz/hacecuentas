/** ROI Meta ads */
export interface Inputs { adSpend: number; impresiones: number; clicks: number; conversiones: number; ingresoTotal: number; }
export interface Outputs { roas: number; cpa: number; cpm: number; ctr: number; conversionRate: number; _insight?: any; _chart?: any; }
export function roiAdSpendFacebookMeta(i: Inputs): Outputs {
  const spend = Number(i.adSpend);
  const imp = Number(i.impresiones);
  const cl = Number(i.clicks);
  const conv = Number(i.conversiones);
  const ing = Number(i.ingresoTotal);
  if (spend < 0) throw new Error('Spend inválido');

  const roas = spend > 0 ? Number((ing / spend).toFixed(2)) : 0;
  const cpa = conv > 0 ? Number((spend / conv).toFixed(2)) : 0;
  const ctr = imp > 0 ? Number(((cl / imp) * 100).toFixed(2)) : 0;
  const convRate = cl > 0 ? Number(((conv / cl) * 100).toFixed(2)) : 0;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  // Insight: el ROAS define si la campaña de Meta devuelve más de lo que cuesta
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  if (spend <= 0) {
    insTone = 'neutral';
    insText = 'Ingresá la inversión en anuncios para calcular el ROAS y saber cuántos pesos volvieron por cada peso gastado.';
  } else if (roas >= 4) {
    insTone = 'good';
    insText = `Un ROAS de **${fmt.format(roas)}×** es muy fuerte: cada $1 invertido devolvió **$${fmt.format(roas)}** en ingresos. La campaña está lista para escalar manteniendo el costo por adquisición (**$${fmt.format(cpa)}**) bajo control.`;
  } else if (roas >= 2) {
    insTone = 'good';
    insText = `Con un ROAS de **${fmt.format(roas)}×**, cada $1 en ads genera **$${fmt.format(roas)}** de ingreso: la campaña es rentable. Vigilá que el margen del producto cubra ese costo antes de invertir más.`;
  } else if (roas >= 1) {
    insTone = 'warn';
    insText = `El ROAS de **${fmt.format(roas)}×** apenas recupera lo invertido: facturás pero casi sin ganancia tras el costo del producto. Mejorá el CTR (**${fmt.format(ctr)}%**) o la conversión (**${fmt.format(convRate)}%**) antes de escalar.`;
  } else {
    insTone = 'warn';
    insText = `Un ROAS de **${fmt.format(roas)}×** está por debajo de 1: los anuncios devuelven menos de lo que cuestan. Revisá segmentación, creativos y el costo por adquisición de **$${fmt.format(cpa)}**.`;
  }

  // Gauge: ROAS contra zonas estándar de rentabilidad
  let _chart: any = undefined;
  if (spend > 0) {
    const segMax = Math.max(4, Number((roas * 1.1).toFixed(2)));
    _chart = {
      type: 'scale',
      marker: roas,
      markerLabel: `ROAS ${fmt.format(roas)}×`,
      min: 0,
      segments: [
        { nombre: 'Pérdida', max: 1, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Ajuste', max: 2, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Rentable', max: segMax, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `ROAS de ${fmt.format(roas)} veces la inversión.`,
    };
  }

  return {
    roas,
    cpa,
    cpm: imp > 0 ? Number(((spend / imp) * 1000).toFixed(2)) : 0,
    ctr,
    conversionRate: convRate,
    _insight: {
      title: 'Retorno de tu inversión en Meta',
      text: insText,
      tone: insTone,
      icon: '📈',
    },
    _chart,
  };
}
