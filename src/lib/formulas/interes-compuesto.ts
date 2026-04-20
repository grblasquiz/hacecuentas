/**
 * Calculadora de interés compuesto
 * Fórmula: VF = VP × (1 + i)^n
 * Con aportes periódicos: VF = VP(1+i)^n + PMT × ((1+i)^n - 1)/i
 */

export interface InteresInputs {
  capitalInicial: number;
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
}

export interface InteresOutputs {
  valorFinal: number;
  totalAportado: number;
  gananciaIntereses: number;
  rendimiento: string;
  tasaMensual: string;
  _chart?: any;
}

export function interesCompuesto(inputs: InteresInputs): InteresOutputs {
  const capital = Number(inputs.capitalInicial) || 0;
  const aporte = Number(inputs.aporteMensual) || 0;
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);

  if (capital < 0) throw new Error('El capital inicial no puede ser negativo');
  if (capital === 0 && aporte === 0) throw new Error('Ingresá un capital inicial o un aporte mensual');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá una tasa anual positiva');
  if (!anios || anios <= 0) throw new Error('Ingresá un plazo en años');

  const i = tasaAnual / 100 / 12;
  const n = anios * 12;
  const factor = Math.pow(1 + i, n);

  const vfCapital = capital * factor;
  const vfAportes = i === 0 ? aporte * n : aporte * ((factor - 1) / i);
  const valorFinal = vfCapital + vfAportes;

  const totalAportado = capital + aporte * n;
  const gananciaIntereses = valorFinal - totalAportado;
  // Formato amigable: para rendimientos grandes, expresar como multiplicador ×N
  // en vez de porcentaje con miles de dígitos ("x346" es más intuitivo que "34485%").
  const rendimientoPct = (gananciaIntereses / totalAportado) * 100;
  const multiplicador = valorFinal / totalAportado;
  let rendimientoLabel: string;
  if (rendimientoPct >= 1000) {
    rendimientoLabel = `×${multiplicador.toFixed(1)} tu capital (${Math.round(rendimientoPct).toLocaleString('es-AR')}%)`;
  } else if (rendimientoPct >= 100) {
    rendimientoLabel = `${Math.round(rendimientoPct)}% (×${multiplicador.toFixed(2)})`;
  } else {
    rendimientoLabel = `${rendimientoPct.toFixed(2)}%`;
  }

  // Serie anual: capital acumulado y aportes acumulados (sin rendimiento)
  const labels = Array.from({ length: anios + 1 }, (_, k) => `Año ${k}`);
  const serieValor: number[] = [];
  const serieAportado: number[] = [];
  for (let k = 0; k <= anios; k++) {
    const nK = k * 12;
    const factorK = Math.pow(1 + i, nK);
    const vfK = capital * factorK + (i === 0 ? aporte * nK : aporte * ((factorK - 1) / i));
    serieValor.push(Math.round(vfK));
    serieAportado.push(Math.round(capital + aporte * nK));
  }

  const chart = {
    type: 'line' as const,
    ariaLabel: `Evolución del capital durante ${anios} años: valor final de ${Math.round(valorFinal).toLocaleString('es-AR')} vs total aportado de ${Math.round(totalAportado).toLocaleString('es-AR')}.`,
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
    valorFinal: Math.round(valorFinal),
    totalAportado: Math.round(totalAportado),
    gananciaIntereses: Math.round(gananciaIntereses),
    rendimiento: rendimientoLabel,
    tasaMensual: `${(i * 100).toFixed(2)}%`,
    _chart: chart,
  };
}
