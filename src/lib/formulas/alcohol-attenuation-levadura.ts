/** Atenuación levadura */
export interface Inputs { og: number; fg: number; atenuacionEsperada?: number; }
export interface Outputs { atenuacionAparente: number; atenuacionReal: number; estado: string; diagnostico: string; _insight?: any; _chart?: any; }

export function alcoholAttenuationLevadura(i: Inputs): Outputs {
  const og = Number(i.og);
  const fg = Number(i.fg);
  const esperada = Number(i.atenuacionEsperada) || 0;
  if (!og || og < 1) throw new Error('Ingresá OG');
  if (!fg || fg < 0.98) throw new Error('Ingresá FG');
  if (fg >= og) throw new Error('FG debe ser menor que OG');

  const aparente = ((og - fg) / (og - 1)) * 100;
  const real = aparente * 0.81;

  let estado = '';
  if (aparente < 60) estado = 'Fermentación muy incompleta';
  else if (aparente < 70) estado = 'Baja atenuación (cuerpo fuerte o stuck)';
  else if (aparente < 80) estado = 'Atenuación normal ale';
  else if (aparente < 88) estado = 'Alta (lager, saison seco)';
  else estado = 'Muy alta (Brett, enzimas agregadas)';

  let diag = '';
  if (esperada > 0) {
    if (aparente < esperada - 5) diag = `Por debajo del rango de la cepa (${esperada}%). Revisá temperatura y pitch rate.`;
    else if (aparente > esperada + 5) diag = `Por encima del rango esperado (${esperada}%). Posible contaminación o mash muy bajo.`;
    else diag = `Dentro del rango esperado (${esperada}%). Fermentación sana.`;
  } else {
    diag = 'Resultado sin comparación contra datasheet. Buscá atenuación típica de tu cepa.';
  }

  const ap = Number(aparente.toFixed(1));
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (esperada > 0) {
    tone = (ap < esperada - 5 || ap > esperada + 5) ? 'warn' : 'good';
  } else {
    tone = (aparente < 70 || aparente >= 88) ? 'warn' : 'good';
  }
  const insightText = esperada > 0
    ? (ap < esperada - 5
        ? `Atenuó **${ap}%** (real ${real.toFixed(1)}%), por debajo del ${esperada}% típico de la cepa: **${estado.toLowerCase()}**. Revisá temperatura y pitch rate antes de embotellar.`
        : ap > esperada + 5
          ? `Atenuó **${ap}%** (real ${real.toFixed(1)}%), por encima del ${esperada}% esperado: **${estado.toLowerCase()}**. Sospechá contaminación o un mash demasiado bajo.`
          : `Atenuó **${ap}%** (real ${real.toFixed(1)}%), dentro del rango esperado (${esperada}%): fermentación sana, **${estado.toLowerCase()}**.`)
    : `Atenuación aparente **${ap}%** (real ${real.toFixed(1)}%): **${estado.toLowerCase()}**. Compará contra el datasheet de tu cepa para confirmar.`;

  return {
    atenuacionAparente: ap,
    atenuacionReal: Number(real.toFixed(1)),
    estado,
    diagnostico: diag,
    _insight: {
      title: 'Tu atenuación',
      text: insightText,
      tone,
      icon: '🍺',
    },
    _chart: {
      type: 'scale',
      marker: ap,
      markerLabel: `${ap}%`,
      min: 40,
      segments: [
        { nombre: 'Muy incompleta', max: 60, color: '#fecaca', colorDark: '#7f1d1d' },
        { nombre: 'Baja / stuck', max: 70, color: '#fed7aa', colorDark: '#7c2d12' },
        { nombre: 'Normal ale', max: 80, color: '#bbf7d0', colorDark: '#14532d' },
        { nombre: 'Alta (lager/saison)', max: 88, color: '#bae6fd', colorDark: '#075985' },
        { nombre: 'Muy alta (Brett)', max: Math.max(100, ap + 1), color: '#ddd6fe', colorDark: '#4c1d95' },
      ],
      ariaLabel: `Atenuación aparente ${ap}% sobre la escala de fermentación`,
    },
  };
}
