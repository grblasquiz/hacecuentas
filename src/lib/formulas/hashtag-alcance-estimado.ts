/** Calculadora de Alcance Estimado por Hashtags */
export interface Inputs { seguidores: number; hashtagsGrandes: number; hashtagsMedianps: number; hashtagsPequenos: number; }
export interface Outputs { alcanceEstimado: number; alcanceOrganico: number; alcanceHashtags: number; recomendacion: string; _insight?: any; _chart?: any; }

export function hashtagAlcanceEstimado(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const grandes = Number(i.hashtagsGrandes) || 0;
  const medianos = Number(i.hashtagsMedianps) || 0;
  const peqs = Number(i.hashtagsPequenos) || 0;
  if (!seg || seg <= 0) throw new Error('Ingresá tus seguidores');

  const totalHashtags = grandes + medianos + peqs;
  if (totalHashtags > 30) throw new Error('Instagram permite máximo 30 hashtags');

  // Base organic reach: ~10-20% of followers (Instagram 2026 avg)
  const alcanceOrganico = Math.round(seg * 0.15);

  // Hashtag reach estimation (very approximate)
  // Large hashtags: high competition, ~0.5-2% reach bonus per hashtag
  // Medium: ~2-5% reach bonus per hashtag
  // Small/niche: ~5-15% reach bonus per hashtag (higher chance of being seen)
  const reachGrandes = grandes * seg * 0.01;
  const reachMedianos = medianos * seg * 0.03;
  const reachPeqs = peqs * seg * 0.08;
  const alcanceHashtags = Math.round(reachGrandes + reachMedianos + reachPeqs);
  const alcanceEstimado = alcanceOrganico + alcanceHashtags;

  let recomendacion: string;
  if (peqs > grandes && medianos >= grandes) {
    recomendacion = 'Buena estrategia — priorizás hashtags de nicho que dan más visibilidad relativa. Mantené el mix.';
  } else if (grandes > peqs) {
    recomendacion = 'Demasiados hashtags grandes — tu post se pierde en la competencia. Usá más hashtags de nicho (<100K posts) para mejor visibilidad.';
  } else {
    recomendacion = `Con ${totalHashtags} hashtags, tu alcance estimado es ${alcanceEstimado.toLocaleString()}. Mix ideal: 2-3 grandes, 5-7 medianos, 8-10 nicho.`;
  }

  // Aporte de los hashtags sobre el alcance total
  const pctHashtags = alcanceEstimado > 0 ? Math.round((alcanceHashtags / alcanceEstimado) * 100) : 0;
  let toneIns: 'good' | 'warn' | 'neutral';
  let txtIns: string;
  if (grandes > peqs) {
    toneIns = 'warn';
    txtIns = `Tu alcance estimado es **${alcanceEstimado.toLocaleString()}**, pero priorizás hashtags grandes y de alta competencia: tu post se diluye rápido. Cambiá a más etiquetas de nicho (<100K posts) para subir la fracción que hoy aportan los hashtags (**${pctHashtags}%**).`;
  } else if (peqs > grandes && medianos >= grandes) {
    toneIns = 'good';
    txtIns = `Alcance estimado **${alcanceEstimado.toLocaleString()}**: **${alcanceOrganico.toLocaleString()}** orgánico de tus seguidores + **${alcanceHashtags.toLocaleString()}** sumado por los hashtags (**${pctHashtags}%** del total). Buen mix de nicho — son los que más visibilidad relativa dan.`;
  } else {
    toneIns = 'neutral';
    txtIns = `Con **${totalHashtags} hashtags** llegás a un alcance estimado de **${alcanceEstimado.toLocaleString()}**: los hashtags aportan **${pctHashtags}%** sobre tu base orgánica. Mix ideal: 2-3 grandes, 5-7 medianos y 8-10 de nicho.`;
  }
  const _insight = { title: 'De dónde sale tu alcance', text: txtIns, tone: toneIns, icon: '📣' };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Alcance orgánico', value: alcanceOrganico },
      { label: 'Sumado por hashtags', value: alcanceHashtags },
    ],
    prefix: '',
    centerValue: alcanceEstimado.toLocaleString(),
    centerLabel: 'Alcance total',
    ariaLabel: `Alcance estimado de ${alcanceEstimado.toLocaleString()} cuentas: ${alcanceOrganico.toLocaleString()} orgánico y ${alcanceHashtags.toLocaleString()} aportado por hashtags`,
  };

  return { alcanceEstimado, alcanceOrganico, alcanceHashtags, recomendacion, _insight, _chart };
}
