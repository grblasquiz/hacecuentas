/**
 * Calculadora de primer layer para adherencia perfecta
 */

export interface Inputs {
  material: number; superficie: number; tamanoBase: number; nozzle: number;
}

export interface Outputs {
  altura: string; velocidad: string; bed: string; adherente: string; widthFirst: string;
  _insight?: any;
}

export function primerLayerAdherenciaBed(inputs: Inputs): Outputs {
  const mat = Math.round(Number(inputs.material));
  const sup = Math.round(Number(inputs.superficie));
  const tb = Number(inputs.tamanoBase);
  const nz = Number(inputs.nozzle);
  if (!mat || !sup || !tb || !nz) throw new Error('Completá los campos');
  const tablaMat: Record<number, { alt: number; vel: number; bed: number; name: string }> = {
    1: { alt: 0.20, vel: 25, bed: 60, name: 'PLA' },
    2: { alt: 0.24, vel: 22, bed: 75, name: 'PETG' },
    3: { alt: 0.25, vel: 20, bed: 105, name: 'ABS' },
    4: { alt: 0.20, vel: 20, bed: 45, name: 'TPU' },
    5: { alt: 0.25, vel: 20, bed: 105, name: 'ASA' },
  };
  const m = tablaMat[mat] || tablaMat[1];
  let adherente = 'Skirt 2 loops';
  if (tb > 150 || mat === 3 || mat === 5) adherente = 'Brim 5-8 mm';
  if (tb < 15) adherente = 'Brim 8 mm o Raft';
  const supExtra: Record<number, string> = {
    1: '',
    2: ' + glue stick',
    3: '',
    4: '',
  };
  const width = nz * 1.30;

  // Insight: settings recomendados + advertencia según material/adherente
  const warpProne = mat === 3 || mat === 5; // ABS / ASA
  const _insight = {
    title: `Primera capa para ${m.name}`,
    text: warpProne
      ? `El **${m.name}** es propenso al warping: imprimí la primera capa a **${m.alt.toFixed(2)} mm** y solo **${m.vel} mm/s** sobre cama a **${m.bed} °C**, con **${adherente.toLowerCase()}** y, si podés, cámara cerrada. El ancho de **${width.toFixed(2)} mm** (130% del nozzle de ${nz} mm) aplasta el filamento contra la cama para que pegue mejor.`
      : `Para **${m.name}**, primera capa a **${m.alt.toFixed(2)} mm** y **${m.vel} mm/s** con cama a **${m.bed} °C** y **${adherente.toLowerCase()}**. El ancho extra de **${width.toFixed(2)} mm** (130% del nozzle de ${nz} mm) mejora la adherencia aplastando bien el cordón inicial.`,
    tone: warpProne ? 'warn' : 'neutral',
    icon: '🖨️',
  };

  return {
    altura: `${m.alt.toFixed(2)} mm`,
    velocidad: `${m.vel} mm/s`,
    bed: `${m.bed} °C${supExtra[sup] || ''}`,
    adherente: adherente,
    widthFirst: `${width.toFixed(2)} mm (130% nozzle)`,
    _insight,
  };
}
