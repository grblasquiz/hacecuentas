export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

// JPEG file-size estimate from megapixels + quality (libjpeg-style 0-100 scale).
// Model: KB = (pixels x 3 bytes RGB) / compressionRatio(Q) / 1024
// compressionRatio(Q) is interpolated from empirically documented anchor points
// for natural-photo content (smooth scenes compress more, complex textures less).
function compressionRatio(q: number): number {
  // [quality, ratio] anchors. Higher quality -> lower ratio -> bigger file.
  const anchors: [number, number][] = [
    [10, 120],
    [20, 80],
    [40, 50],
    [60, 35],
    [75, 22],
    [85, 15],
    [90, 10],
    [95, 5],
    [100, 3],
  ];
  if (q <= anchors[0][0]) return anchors[0][1];
  if (q >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
  for (let k = 0; k < anchors.length - 1; k++) {
    const [q1, r1] = anchors[k];
    const [q2, r2] = anchors[k + 1];
    if (q >= q1 && q <= q2) {
      const t = (q - q1) / (q2 - q1);
      return r1 + t * (r2 - r1);
    }
  }
  return 15;
}

export function jpgCalidadTamanoWebOptimizacion(i: Inputs): Outputs {
  const mp = Number(i.mpx) || 0;
  let q = Number(i.calidad);
  if (!Number.isFinite(q) || q <= 0) q = 85;
  if (q > 100) q = 100;

  const rawBytes = mp * 1_000_000 * 3; // 8-bit RGB
  const ratio = compressionRatio(q);
  const kb = rawBytes / ratio / 1024;
  const kbR = Number(kb.toFixed(0));
  const sizeStr = kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kbR} KB`;

  let rec = 'OK';
  if (q >= 95) rec = 'Excesivo para web';
  else if (q < 70) rec = 'Artefactos visibles';

  const _insight = {
    title: q >= 95 ? 'Calidad excesiva para web' : q < 70 ? 'Riesgo de artefactos' : 'Buen balance peso/calidad',
    text: q >= 95
      ? `Una JPG de **${mp} MP** al **${q}%** pesa ~**${sizeStr}** (ratio ${ratio.toFixed(0)}:1). Para web es **excesivo**: bajando a 80-85% reducís el peso hasta 5x sin diferencia visible en pantalla.`
      : q < 70
        ? `Al **${q}%** una JPG de **${mp} MP** pesa solo ~**${sizeStr}** (ratio ${ratio.toFixed(0)}:1), pero a esa calidad aparecen **artefactos** (bloques, halos). Subí a 75-85% para que se vea limpia.`
        : `Una JPG de **${mp} MP** al **${q}%** pesa ~**${sizeStr}** (ratio ${ratio.toFixed(0)}:1): buen punto para web, peso contenido sin pérdida visible. Considerá WebP/AVIF para bajar otro 25-35%.`,
    tone: q >= 95 || q < 70 ? 'warn' : 'good',
    icon: q >= 95 ? '🐘' : q < 70 ? '🧩' : '🖼️',
  };

  const _chart = {
    type: 'scale',
    marker: q,
    markerLabel: `${q}%`,
    min: 0,
    segments: [
      { nombre: 'Artefactos', max: 69, color: '#fca5a5', colorDark: '#ef4444' },
      { nombre: 'Óptimo web', max: 94, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Excesivo', max: 100, color: '#fdba74', colorDark: '#f97316' },
    ],
    ariaLabel: `Calidad JPG: ${q}%, zona ${rec}`,
  };

  return {
    tamano: sizeStr,
    recomendacion: rec,
    resumen: `${mp}MP a ${q}% ≈ ${sizeStr} (compresión ${ratio.toFixed(0)}:1).`,
    _insight,
    _chart,
  };
}
