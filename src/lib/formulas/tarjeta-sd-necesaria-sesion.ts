/**
 * Calculadora de tarjeta SD necesaria para una sesión
 */

export interface Inputs {
  fotosRaw: number; fotosJpg: number; min4k: number; min8k: number; megapixeles: number;
}

export interface Outputs {
  gbTotal: string; recomendacion: string; detalle: string;
}

export function tarjetaSdNecesariaSesion(inputs: Inputs): Outputs {
  const fr = Number(inputs.fotosRaw);
  const fj = Number(inputs.fotosJpg);
  const m4 = Number(inputs.min4k);
  const m8 = Number(inputs.min8k);
  const mp = Number(inputs.megapixeles);
  if (mp === null || mp === undefined) throw new Error('Completá los campos');
  const rawMb = 1.25 * mp; // aprox 1.25 MB por MP
  const jpgMb = 0.35 * mp;
  const mb4k = 400;
  const mb8k = 1200;
  const totalMb = fr * rawMb + fj * jpgMb + m4 * mb4k + m8 * mb8k;
  const totalGb = totalMb / 1000;
  let rec = '';
  if (totalGb < 32) rec = '32 GB o 64 GB con holgura';
  else if (totalGb < 64) rec = '64 GB justa o 128 GB holgada';
  else if (totalGb < 128) rec = '128 GB o 2× 64 GB por seguridad';
  else if (totalGb < 256) rec = '256 GB o 2× 128 GB dual slot';
  else if (totalGb < 512) rec = '512 GB o 2× 256 GB + SSD backup';
  else rec = '1 TB CFexpress o múltiples tarjetas + SSD diario';
  const det = `RAW ${(fr*rawMb/1000).toFixed(1)} GB · JPG ${(fj*jpgMb/1000).toFixed(1)} GB · 4K ${(m4*mb4k/1000).toFixed(1)} GB · 8K ${(m8*mb8k/1000).toFixed(1)} GB`;
  return {
    gbTotal: `${totalGb.toFixed(1)} GB`,
    recomendacion: rec,
    detalle: det,
  };
}
