/**
 * Calculadora de watts necesarios en fuente de PC
 */

export interface Inputs {
  gpu: number; cpu: number; ramGb: number; ssds: number; refrig: number;
}

export interface Outputs {
  wattsEstimados: string; wattsRecomendados: string; certificacion: string; consejo: string;
}

export function wattsFuenteAlimentacionPc(inputs: Inputs): Outputs {
  const g = Math.round(Number(inputs.gpu));
  const c = Math.round(Number(inputs.cpu));
  const ram = Number(inputs.ramGb);
  const ssd = Math.round(Number(inputs.ssds));
  const r = Math.round(Number(inputs.refrig));
  if (!g || !c || !ram || !ssd || !r) throw new Error('Completá los campos');
  const gpuW: Record<number, number> = { 1: 15, 2: 130, 3: 170, 4: 200, 5: 320, 6: 450, 7: 355 };
  const cpuW: Record<number, number> = { 1: 65, 2: 125, 3: 180, 4: 253 };
  const refrigW: Record<number, number> = { 1: 5, 2: 8, 3: 15, 4: 22 };
  const w = (gpuW[g] || 0) + (cpuW[c] || 0) + (ram * 0.6) + (ssd * 5) + (refrigW[r] || 5) + 40; // 40 W placa+fans+USB
  const psu = Math.ceil(w * 1.35 / 50) * 50; // Redondear 50W
  let cert = '';
  if (w < 350) cert = '80+ White o Bronze';
  else if (w < 700) cert = '80+ Gold ✅';
  else cert = '80+ Gold o Platinum (ATX 3.0 para RTX 40+)';
  let tip = '';
  if (psu >= 1000) tip = 'PC top gaming. Verificá 12VHPWR cable nativo.';
  else if (psu >= 750) tip = 'Gaming sólido. Comprá marca reconocida (Seasonic/Corsair).';
  else if (psu >= 550) tip = 'PC mainstream. 550W Gold cubre bien con margen de upgrade.';
  else tip = 'PC office / low spec. 450W Bronze suficiente.';
  return {
    wattsEstimados: `${Math.round(w)} W reales`,
    wattsRecomendados: `${psu} W PSU`,
    certificacion: cert,
    consejo: tip,
  };
}
