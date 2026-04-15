/** Escala de Coma de Glasgow (GCS) — Nivel de conciencia */
export interface Inputs {
  ocular: string;
  verbal: string;
  motor: string;
}
export interface Outputs {
  gcs: number;
  clasificacion: string;
  detalle: string;
}

export function escalaGlasgowNivelConciencia(i: Inputs): Outputs {
  const o = Number(i.ocular || 4);
  const v = Number(i.verbal || 5);
  const m = Number(i.motor || 6);

  if (o < 1 || o > 4) throw new Error('Respuesta ocular debe ser 1-4');
  if (v < 1 || v > 5) throw new Error('Respuesta verbal debe ser 1-5');
  if (m < 1 || m > 6) throw new Error('Respuesta motora debe ser 1-6');

  const gcs = o + v + m;

  let clasificacion: string;
  let conducta: string;

  if (gcs >= 14) {
    clasificacion = 'Leve (GCS 14-15)';
    conducta = 'Observación. TAC si hay factores de riesgo.';
  } else if (gcs >= 9) {
    clasificacion = 'Moderado (GCS 9-13)';
    conducta = 'TAC urgente + internación + monitoreo neurológico.';
  } else {
    clasificacion = 'Grave (GCS 3-8)';
    conducta = 'Intubación orotraqueal + TAC urgente + UTI.';
  }

  const detalle =
    `GCS: ${gcs}/15 (O${o}V${v}M${m}) | ` +
    `Clasificación: ${clasificacion} | ` +
    `Conducta sugerida: ${conducta}` +
    (gcs <= 8 ? ' | ⚠️ GCS ≤8: proteger vía aérea, considerar IOT.' : '');

  return {
    gcs,
    clasificacion: `${clasificacion} — ${conducta}`,
    detalle,
  };
}
