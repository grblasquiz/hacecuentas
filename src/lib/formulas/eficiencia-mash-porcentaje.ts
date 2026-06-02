/** Eficiencia mash */
export interface Inputs { kgGrano: number; ppgPromedio: number; ogReal: number; volumenPostHervor: number; }
export interface Outputs { eficiencia: number; ogEsperadaIdeal: number; clasificacion: string; diagnostico: string; _insight?: any; _chart?: any; }

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

  const eff = Number(eficiencia.toFixed(1));
  // Tono dinámico: muy baja o sospechosa = warn; rango estándar/bueno/pro = good; intermedio = neutral.
  const tone = eficiencia < 65 || eficiencia > 92 ? 'warn' : eficiencia >= 75 ? 'good' : 'neutral';
  const insight = {
    title: 'Tu rendimiento de macerado',
    text: `Extrajiste el **${eff}%** del azúcar potencial del grano (**${clasif.split(' —')[0].split(' (')[0]}**), llegando a una OG de **${(og).toFixed(3)}** frente a la ideal de **${Number(ogIdeal.toFixed(3))}**.`,
    tone,
    icon: '🍺',
  };
  // Gauge: eficiencia de macerado con las mismas zonas que la clasificación.
  const chart = {
    type: 'scale',
    marker: eff,
    markerLabel: eff + '%',
    min: 50,
    segments: [
      { nombre: 'Muy baja', max: 60, color: '#fca5a5', colorDark: '#f87171' },
      { nombre: 'Baja', max: 70, color: '#fdba74', colorDark: '#fb923c' },
      { nombre: 'Estándar', max: 80, color: '#fde68a', colorDark: '#fbbf24' },
      { nombre: 'Buena', max: 85, color: '#bef264', colorDark: '#a3e635' },
      { nombre: 'Profesional', max: 92, color: '#86efac', colorDark: '#4ade80' },
      { nombre: 'Sospechosa', max: Math.max(100, Math.ceil(eff) + 2), color: '#fca5a5', colorDark: '#f87171' },
    ],
    ariaLabel: `Eficiencia de macerado de ${eff}% sobre una escala de muy baja a profesional`,
  };
  return {
    eficiencia: eff,
    ogEsperadaIdeal: Number(ogIdeal.toFixed(3)),
    clasificacion: clasif,
    diagnostico: diag,
    _insight: insight,
    _chart: chart,
  };
}
