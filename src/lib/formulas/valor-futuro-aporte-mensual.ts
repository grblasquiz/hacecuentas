/** Valor futuro de una anualidad: aporte mensual + rendimiento compuesto */
export interface Inputs {
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
  capitalInicial?: number;
}
export interface Outputs {
  valorFuturo: number;
  totalAportado: number;
  interesGanado: number;
  rendimientoPorcentual: number;
  aporteAnual: number;
  resumen: string;
  _chart?: any;
}

export function valorFuturoAporteMensual(i: Inputs): Outputs {
  const aporte = Number(i.aporteMensual);
  const tasa = Number(i.tasaAnual);
  const anios = Number(i.plazoAnios);
  const capital = Number(i.capitalInicial) || 0;

  if (!aporte || aporte <= 0) throw new Error('Ingresá el aporte mensual');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual esperada');
  if (!anios || anios <= 0) throw new Error('Ingresá el plazo en años');
  if (capital < 0) throw new Error('El capital inicial no puede ser negativo');

  const r = tasa / 100 / 12;
  const n = anios * 12;
  const factor = Math.pow(1 + r, n);

  // VF de capital inicial + VF de anualidad de aportes
  const vfCapital = capital * factor;
  const vfAportes = aporte * ((factor - 1) / r);
  const valorFuturo = vfCapital + vfAportes;

  const totalAportado = capital + aporte * n;
  const interesGanado = valorFuturo - totalAportado;
  const rendimientoPorcentual = (interesGanado / totalAportado) * 100;
  const aporteAnual = aporte * 12;

  const resumen = `Aportando ${aporte.toLocaleString()}/mes durante ${anios} años a ${tasa}% anual, terminás con ${Math.round(valorFuturo).toLocaleString()} (${Math.round(interesGanado).toLocaleString()} son intereses).`;

  // Serie mensual acumulada: muestrear 1 punto por mes si ≤120 meses, sino cada 3 meses
  const totalMeses = anios * 12;
  const step = totalMeses > 120 ? 3 : 1;
  const labels: string[] = [];
  const serieValor: number[] = [];
  const serieAportado: number[] = [];
  for (let m = 0; m <= totalMeses; m += step) {
    const factorM = Math.pow(1 + r, m);
    const vfM = capital * factorM + (r === 0 ? aporte * m : aporte * ((factorM - 1) / r));
    labels.push(`Mes ${m}`);
    serieValor.push(Math.round(vfM));
    serieAportado.push(Math.round(capital + aporte * m));
  }
  // asegurar último punto
  if ((totalMeses % step) !== 0) {
    const factorF = Math.pow(1 + r, totalMeses);
    labels.push(`Mes ${totalMeses}`);
    serieValor.push(Math.round(valorFuturo));
    serieAportado.push(Math.round(capital + aporte * totalMeses));
  }

  const chart = {
    type: 'line' as const,
    ariaLabel: `Acumulado mensual durante ${anios} años: de ${capital.toLocaleString('es-AR')} iniciales hasta ${Math.round(valorFuturo).toLocaleString('es-AR')} de valor futuro.`,
    data: {
      labels,
      datasets: [
        {
          label: 'Valor acumulado',
          data: serieValor,
          fill: true,
          tension: 0.25,
        },
        {
          label: 'Total aportado',
          data: serieAportado,
          fill: false,
          dashed: true,
          tension: 0.15,
        },
      ],
    },
  };

  return {
    valorFuturo: Math.round(valorFuturo),
    totalAportado: Math.round(totalAportado),
    interesGanado: Math.round(interesGanado),
    rendimientoPorcentual: Number(rendimientoPorcentual.toFixed(2)),
    aporteAnual: Math.round(aporteAnual),
    resumen,
    _chart: chart,
  };
}
