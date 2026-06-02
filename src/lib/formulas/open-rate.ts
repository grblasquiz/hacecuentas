/** Email marketing: open rate, CTR, click to open */
export interface Inputs {
  enviados: number;
  entregados?: number;
  aperturas: number;
  clicks: number;
  bajas?: number;
}
export interface Outputs {
  openRate: number;
  ctr: number;
  clickToOpen: number;
  tasaEntrega: number;
  tasaBaja: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function openRate(i: Inputs): Outputs {
  const env = Number(i.enviados);
  const ent = Number(i.entregados) || env;
  const ap = Number(i.aperturas);
  const cl = Number(i.clicks);
  const bajas = Number(i.bajas) || 0;
  if (!env || env <= 0) throw new Error('Ingresá los enviados');

  const openR = (ap / ent) * 100;
  const ctr = (cl / ent) * 100;
  const cto = ap > 0 ? (cl / ap) * 100 : 0;
  const entrega = (ent / env) * 100;
  const baja = (bajas / ent) * 100;

  let msg = '';
  if (openR > 30) msg = 'Open rate excelente — audiencia muy comprometida.';
  else if (openR > 20) msg = 'Open rate saludable — en línea con el estándar de industria.';
  else if (openR > 10) msg = 'Open rate bajo — revisá asunto y segmentación.';
  else msg = 'Open rate crítico — problemas de entregabilidad o lista fría.';

  const tone = openR > 20 ? 'good' : openR > 10 ? 'warn' : 'warn';
  const insightText = openR > 20
    ? `De **${ent.toLocaleString('es-AR')}** entregados, **${openR.toFixed(1)}%** abrió y **${ctr.toFixed(1)}%** clickeó. El click-to-open de **${cto.toFixed(1)}%** indica qué tan bien el contenido convierte a quien ya abrió.`
    : `Open rate de **${openR.toFixed(1)}%** sobre ${ent.toLocaleString('es-AR')} entregados: por debajo del ~20% saludable de la industria. Revisá asunto, remitente y limpieza de lista. Tu click-to-open es **${cto.toFixed(1)}%**.`;

  // El open rate puede pasar 100% (aperturas > entregados por píxeles múltiples); acotamos el marker
  const markerOR = Math.min(openR, 50);

  return {
    openRate: Number(openR.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    clickToOpen: Number(cto.toFixed(2)),
    tasaEntrega: Number(entrega.toFixed(2)),
    tasaBaja: Number(baja.toFixed(2)),
    mensaje: msg,
    _insight: {
      title: 'Tu open rate en contexto',
      text: insightText,
      tone,
      icon: '📧',
    },
    _chart: {
      type: 'scale',
      marker: Number(markerOR.toFixed(1)),
      markerLabel: `${openR.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Crítico', max: 10, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Bajo', max: 20, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Saludable', max: 30, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Excelente', max: 50, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Open rate de ${openR.toFixed(1)}% sobre una escala: crítico hasta 10%, bajo hasta 20%, saludable hasta 30%, excelente por encima`,
    },
  };
}
