/** Eficiencia mash */
export interface Inputs { kgGrano: number; ppgPromedio: number; ogReal: number; volumenPostHervor: number; }
export interface Outputs { eficiencia: number; ogEsperadaIdeal: number; clasificacion: string; diagnostico: string; }

export function eficienciaMashPorcentaje(i: Inputs): Outputs {
  const kg = Number(i.kgGrano);
  const ppg = Number(i.ppgPromedio);
  const og = Number(i.ogReal);
  const v = Number(i.volumenPostHervor);
  if (!kg || kg <= 0) throw new Error('Ingresá kg de grano');
  if (!ppg || ppg <= 0) throw new Error('Ingresá PPG');
  if (!og || og < 1) throw new Error('Ingresá OG real');
  if (!v || v <= 0) throw new Error('Ingresá volumen');

  const galones = v * 0.264172;
  const puntosIdeales = kg * 2.20462 * ppg;
  const puntosReales = (og - 1) * 1000 * galones;
  const eficiencia = (puntosReales / puntosIdeales) * 100;
  const ogIdeal = 1 + puntosIdeales / galones / 1000;

  let clasif = '';
  if (eficiencia < 60) clasif = 'Muy baja — revisá molido y sparge';
  else if (eficiencia < 70) clasif = 'Baja (BIAB sin squeeze típico)';
  else if (eficiencia < 80) clasif = 'Estándar homebrewer (batch sparge)';
  else if (eficiencia < 85) clasif = 'Buena (fly sparge)';
  else if (eficiencia < 92) clasif = 'Profesional';
  else clasif = 'Sospechosa — verificá medidas';

  let diag = '';
  if (eficiencia < 65) diag = 'Molé más fino, sparge más lento y con agua a 78°C.';
  else if (eficiencia < 75) diag = 'Normal. Podrías ganar 5% ajustando pH a 5.3.';
  else if (eficiencia > 90) diag = 'Verificá hidrómetro y volumen real.';
  else diag = 'Rango esperado — consistencia es lo importante.';

  return {
    eficiencia: Number(eficiencia.toFixed(1)),
    ogEsperadaIdeal: Number(ogIdeal.toFixed(3)),
    clasificacion: clasif,
    diagnostico: diag,
  };
}
