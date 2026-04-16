/** Calculadora de Bitrate para Streaming */
export interface Inputs {
  plataforma: string;
  resolucion: string;
  uploadMbps: number;
}
export interface Outputs {
  bitrateIdeal: number;
  bitrateMax: number;
  uploadNecesario: number;
  preset: string;
}

const PLATFORM_MAX: Record<string, number> = {
  twitch: 6000,
  youtube: 51000,
  kick: 8000,
  facebook: 8000,
};

const BITRATE_RECS: Record<string, number> = {
  '720p30': 2500,
  '720p60': 4500,
  '1080p30': 4500,
  '1080p60': 6000,
  '1440p60': 10000,
  '4k30': 15000,
};

export function streamBitrateCalidad(i: Inputs): Outputs {
  const upload = Number(i.uploadMbps);
  if (!upload || upload <= 0) throw new Error('Ingresá tu velocidad de subida');

  const platformMax = PLATFORM_MAX[i.plataforma];
  if (!platformMax) throw new Error('Seleccioná una plataforma válida');

  const bitrateRec = BITRATE_RECS[i.resolucion];
  if (!bitrateRec) throw new Error('Seleccioná una resolución válida');

  const uploadKbps = upload * 1000;
  const maxByUpload = Math.floor(uploadKbps * 0.67); // Use max 67% of upload

  const bitrateIdeal = Math.min(bitrateRec, platformMax, maxByUpload);
  const uploadNecesario = (bitrateRec * 1.5) / 1000; // 1.5x bitrate recommended

  let preset: string;
  if (bitrateIdeal >= bitrateRec) {
    preset = `Bitrate: ${bitrateIdeal} kbps, Encoder: NVENC (o x264 medium), Keyframe: 2s, CBR. Tu internet soporta la calidad óptima para ${i.resolucion}.`;
  } else if (bitrateIdeal >= bitrateRec * 0.7) {
    preset = `Bitrate: ${bitrateIdeal} kbps, Encoder: NVENC, Keyframe: 2s, CBR. Calidad aceptable, pero considerá bajar a una resolución menor para mejor nitidez.`;
  } else {
    const resRecomendar = bitrateIdeal >= 3000 ? '720p60' : '720p30';
    preset = `Tu upload limita a ${bitrateIdeal} kbps. Recomendación: bajá a ${resRecomendar} para mejor calidad visual. Encoder: NVENC, Keyframe: 2s, CBR.`;
  }

  return {
    bitrateIdeal,
    bitrateMax: platformMax,
    uploadNecesario: Number(uploadNecesario.toFixed(1)),
    preset,
  };
}
