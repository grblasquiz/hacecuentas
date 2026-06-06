export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

const FPS_LABELS: Record<string, string> = {
  '60_1080p': '60 FPS em 1080p',
  '144_1080p': '144 FPS em 1080p',
  '60_4k': '60 FPS em 4K',
  '144_1440p': '144 FPS em 1440p',
  '240_competitive': '240 FPS competitivo (1080p)',
};

// Orçamento total ≈ (preço GPU + preço CPU) / 0,65 — GPU+CPU ~65% da build.
// Valores em USD baseados no MSRP NVIDIA/AMD (jan/2026). Brasil ≈ USD × 3 (câmbio + impostos).
const DATA: Record<string, { pr: number; gpu: string; cpu: string }> = {
  '60_1080p':       { pr: 650,  gpu: 'RTX 4060 / RX 7600',         cpu: 'Ryzen 5 7600' },
  '144_1080p':      { pr: 960,  gpu: 'RTX 4060 Ti / RX 7700 XT',   cpu: 'Ryzen 5 7600' },
  '240_competitive':{ pr: 1200, gpu: 'RTX 4070 Super',             cpu: 'Ryzen 5 7600X / i5-14600K' },
  '144_1440p':      { pr: 1540, gpu: 'RTX 4070 Ti Super',          cpu: 'Ryzen 7 7700X' },
  '60_4k':          { pr: 2150, gpu: 'RTX 4080 Super',             cpu: 'Ryzen 7 9700X / i7-14700K' },
};

export function gamingFpsComponentesPcArmarPresupuesto(i: Inputs): Outputs {
  const f = String(i.objetivoFps || '144_1080p');
  const data = DATA[f] || DATA['144_1080p'];
  const objetivo = FPS_LABELS[f] || f;
  const brl = Math.round(data.pr * 3 / 50) * 50; // estimativa Brasil ≈ USD × 3 (câmbio + impostos)
  const _insight = {
    title: `Build para ${objetivo}`,
    text: `Para mirar **${objetivo}** o orçamento estimado é de **USD ${data.pr.toLocaleString('en-US')}** (≈ R$ ${brl.toLocaleString('pt-BR')} no Brasil), com uma **${data.gpu}** como GPU e uma **${data.cpu}**. A GPU é quem manda nos FPS; não economize nela.`,
    tone: 'neutral',
    icon: '🎮',
  };
  return {
    presupuestoTotal: `USD ${data.pr.toLocaleString('en-US')}`,
    gpuSugerida: data.gpu,
    cpuSugerido: data.cpu,
    _insight,
  };
}
