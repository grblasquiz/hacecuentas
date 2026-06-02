/** APY validador Ethereum: solo (32 ETH) vs pool (Rocket Pool, Lido) vs LST */
export interface Inputs { ethStakeado: number; apyConsensoPct: number; apyEjecucionPct: number; comisionPoolPct: number; costoHardwareMensualUsd: number; precioEthUsd: number; }
export interface Outputs { rendimientoAnualEth: number; rendimientoAnualUsd: number; apyNetoPct: number; costoHardwareAnualUsd: number; explicacion: string; _insight?: any; _chart?: any; }
export function nodeValidadorEthereum32EthRendimiento(i: Inputs): Outputs {
  const eth = Number(i.ethStakeado);
  const apyCons = Number(i.apyConsensoPct) / 100;
  const apyEjec = Number(i.apyEjecucionPct) / 100;
  const comision = Number(i.comisionPoolPct) / 100;
  const hwMes = Number(i.costoHardwareMensualUsd);
  const precio = Number(i.precioEthUsd);
  if (!eth || eth <= 0) throw new Error('Ingresá ETH stakeado');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del ETH');
  const apyBruto = apyCons + apyEjec;
  const rendimientoBrutoEth = eth * apyBruto;
  const comisionEth = rendimientoBrutoEth * comision;
  const rendimientoNetoEth = rendimientoBrutoEth - comisionEth;
  const rendimientoUsd = rendimientoNetoEth * precio;
  const hwAnual = hwMes * 12;
  const apyNeto = ((rendimientoUsd - hwAnual) / (eth * precio)) * 100;
  // Desglose en USD del rendimiento bruto: lo que te queda + comisión pool + hardware
  const comisionUsd = comisionEth * precio;
  const brutoUsd = rendimientoBrutoEth * precio;
  const netoFinalUsd = rendimientoUsd - hwAnual;
  const fmtUsd = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const apyTone = apyNeto < 0 ? 'warn' : apyNeto < (apyBruto * 100 * 0.7) ? 'warn' : 'good';
  let insightText: string;
  if (apyNeto < 0) {
    insightText = `Tu APY neto es **${apyNeto.toFixed(2)}%**: el costo de hardware (**${fmtUsd(hwAnual)}/año**) te come todo el rendimiento. A este precio del ETH, validar en solitario te da pérdida.`;
  } else {
    const merma = brutoUsd > 0 ? ((1 - netoFinalUsd / brutoUsd) * 100) : 0;
    insightText = `De un bruto de **${fmtUsd(brutoUsd)}/año**, entre comisión del pool y hardware se va el **${merma.toFixed(0)}%**: te queda un APY neto de **${apyNeto.toFixed(2)}%** (${fmtUsd(netoFinalUsd)}).`;
  }
  const out: Outputs = {
    rendimientoAnualEth: Number(rendimientoNetoEth.toFixed(4)),
    rendimientoAnualUsd: Number(rendimientoUsd.toFixed(2)),
    apyNetoPct: Number(apyNeto.toFixed(3)),
    costoHardwareAnualUsd: Number(hwAnual.toFixed(2)),
    explicacion: `Stakeás ${eth} ETH a APY bruto ${(apyBruto * 100).toFixed(2)}%. Neto ${rendimientoNetoEth.toFixed(4)} ETH/año (USD ${rendimientoUsd.toFixed(0)}). APY neto post hardware: ${apyNeto.toFixed(2)}%.`,
    _insight: {
      title: 'Tu APY neto real',
      text: insightText,
      tone: apyTone,
      icon: '⟠',
    },
  };
  // Donut sólo si el rendimiento bruto se reparte en partes positivas (neto post-hardware ≥ 0)
  if (brutoUsd > 0 && netoFinalUsd >= 0 && (comisionUsd > 0 || hwAnual > 0)) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Lo que te queda', value: Number(netoFinalUsd.toFixed(2)) },
        { label: 'Comisión del pool', value: Number(comisionUsd.toFixed(2)) },
        { label: 'Costo de hardware', value: Number(hwAnual.toFixed(2)) },
      ].filter(s => s.value > 0),
      prefix: '$',
      centerValue: fmtUsd(brutoUsd),
      centerLabel: 'Rendimiento bruto/año',
      ariaLabel: `Reparto del rendimiento bruto anual de ${fmtUsd(brutoUsd)}: te quedan ${fmtUsd(netoFinalUsd)}, comisión ${fmtUsd(comisionUsd)}, hardware ${fmtUsd(hwAnual)}`,
    };
  }
  return out;
}
