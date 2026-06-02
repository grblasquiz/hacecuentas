/** Edad equivalente humana de un hámster */
export interface Inputs {
  edadMeses: number;
}
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  esperanzaVidaRestante: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function edadHamster(i: Inputs): Outputs {
  const meses = Number(i.edadMeses);

  if (!meses || meses <= 0) throw new Error('Ingresá la edad en meses');

  // Conversión: primeros 6 meses crecen rápido (~5 años humanos/mes)
  // Después ~4.4 años humanos/mes
  let edadHumana = 0;
  if (meses <= 6) {
    edadHumana = meses * 5;
  } else {
    edadHumana = 30 + (meses - 6) * 4.4;
  }

  // Etapa de vida
  let etapa = '';
  if (meses < 2) etapa = 'Cachorro/bebé';
  else if (meses < 4) etapa = 'Adolescente';
  else if (meses < 6) etapa = 'Adulto joven';
  else if (meses < 12) etapa = 'Adulto pleno';
  else if (meses < 18) etapa = 'Adulto maduro';
  else if (meses < 24) etapa = 'Senior';
  else etapa = 'Senior avanzado (geriátrico)';

  // Esperanza de vida restante (promedio 24-30 meses total)
  const esperanzaTotal = 27; // meses promedio
  const restante = Math.max(0, esperanzaTotal - meses);

  let esperanzaTexto = '';
  if (restante <= 0) {
    esperanzaTexto = 'Ya superó el promedio de vida — cada día es un regalo. Cuidalo mucho.';
  } else if (restante <= 6) {
    esperanzaTexto = `~${restante} meses. Etapa final — priorizá su confort y tranquilidad.`;
  } else {
    esperanzaTexto = `~${restante} meses (~${(restante / 12).toFixed(1)} años). Disfrutá cada momento.`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const edadHumanaR = Math.round(edadHumana);

  const insightTone = meses < 18 ? 'good' : meses < 24 ? 'neutral' : 'warn';
  const insightText = meses < 18
    ? `Tu hámster de **${meses} mes${meses !== 1 ? 'es' : ''}** equivale a **${edadHumanaR} años humanos** (**${etapa}**). Está en buena etapa: ${esperanzaTexto.toLowerCase()}`
    : meses < 24
      ? `Con **${meses} meses** ronda los **${edadHumanaR} años humanos** (**${etapa}**). Entra en la recta final: ${esperanzaTexto.toLowerCase()}`
      : `A los **${meses} meses** ya es **${edadHumanaR} años humanos** (**${etapa}**). ${esperanzaTexto}`;

  return {
    edadHumana: edadHumanaR,
    etapaVida: etapa,
    esperanzaVidaRestante: esperanzaTexto,
    detalle: `Tu hámster de ${meses} meses equivale a ~${fmt.format(edadHumana)} años humanos. Etapa: ${etapa}. ${esperanzaTexto}`,
    _insight: {
      title: 'Tu hámster en edad humana',
      text: insightText,
      tone: insightTone,
      icon: '🐹',
    },
    _chart: {
      type: 'scale',
      marker: meses,
      markerLabel: `${meses} mes${meses !== 1 ? 'es' : ''} · ${etapa}`,
      min: 0,
      segments: [
        { nombre: 'Bebé', max: 2, color: '#bfdbfe', colorDark: '#1e3a5f' },
        { nombre: 'Adolescente', max: 4, color: '#86efac', colorDark: '#14532d' },
        { nombre: 'Adulto joven', max: 6, color: '#4ade80', colorDark: '#166534' },
        { nombre: 'Adulto pleno', max: 12, color: '#a3e635', colorDark: '#3f6212' },
        { nombre: 'Maduro', max: 18, color: '#fde047', colorDark: '#713f12' },
        { nombre: 'Senior', max: 24, color: '#fb923c', colorDark: '#7c2d12' },
        { nombre: 'Geriátrico', max: Math.max(30, meses + 1), color: '#f87171', colorDark: '#7f1d1d' },
      ],
      ariaLabel: `Etapa de vida del hámster a los ${meses} meses: ${etapa}`,
    },
  };
}
