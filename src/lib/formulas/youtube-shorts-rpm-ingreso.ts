/** YouTube Shorts RPM 2026: views × RPM/1000 → ingreso estimado */
export interface Inputs {
  views: number;
  rpm: number; // USD por 1000 views
  nicho: string; // informativo
  participacionCreador: number; // %, default 45%. Ya lo aplica YT antes de mostrar RPM real
}

export interface Outputs {
  viewsFormat: string;
  rpmUsado: string;
  ingresoEstimadoUSD: string;
  ingresoNetoPostIvaUSD: string;
  viewsPara1000USD: number;
  viewsPara10000USD: number;
  ingresoEstimado: number;
  _insight?: any;
  _chart?: any;
}

function fmtUSD(n: number): string {
  return 'USD ' + n.toFixed(2);
}

export function youtubeShortsRpmIngreso(i: Inputs): Outputs {
  const views = Number(i.views) || 0;
  const rpm = Number(i.rpm) || 0.05;
  const share = Number(i.participacionCreador) || 45;

  if (views < 0 || rpm < 0) throw new Error('Valores inválidos');

  // Asumimos que RPM ingresado ya es el creator-side (post split 45%)
  // Si se quiere modelar advertiser-side, usar share
  const ingreso = (views / 1000) * rpm;
  // Si YouTube reporta tax withholding ~24% para creadores fuera USA sin W-8BEN, dejamos neto igual
  // Mostramos ingreso net-of-tax estimado asumiendo 30% IIGG para creadores AR tax inscripto
  const netPostIva = ingreso * 0.7;

  const viewsPara1k = rpm > 0 ? Math.ceil((1000 / rpm) * 1000) : 0;
  const viewsPara10k = rpm > 0 ? Math.ceil((10000 / rpm) * 1000) : 0;

  const impuesto = ingreso - netPostIva;
  return {
    viewsFormat: views.toLocaleString('es-AR') + ' views',
    rpmUsado: 'USD ' + rpm.toFixed(3) + ' por 1.000 views',
    ingresoEstimadoUSD: fmtUSD(ingreso),
    ingresoNetoPostIvaUSD: fmtUSD(netPostIva),
    viewsPara1000USD: viewsPara1k,
    viewsPara10000USD: viewsPara10k,
    ingresoEstimado: Number(ingreso.toFixed(2)),
    _insight: {
      title: 'Tu ingreso por Shorts',
      text: `Con **${views.toLocaleString('es-AR')}** views y un RPM de **USD ${rpm.toFixed(3)}**, generás **${fmtUSD(ingreso)}** brutos. Tras el ~30% de impuesto a las ganancias quedan **${fmtUSD(netPostIva)}** netos. Para llegar a USD 1.000 brutos necesitás **${viewsPara1k.toLocaleString('es-AR')}** views.`,
      tone: 'neutral',
      icon: '📱',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Neto en mano', value: Number(netPostIva.toFixed(2)) },
        { label: 'Impuesto (~30%)', value: Number(impuesto.toFixed(2)) },
      ],
      prefix: 'USD ',
      centerValue: fmtUSD(ingreso),
      centerLabel: 'Bruto',
      ariaLabel: `Ingreso bruto de ${fmtUSD(ingreso)} dividido en neto e impuesto`,
    },
  };
}
