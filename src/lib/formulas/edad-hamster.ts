/** Edad equivalente humana de un hámster */
export interface Inputs {
  edadMeses: number;
}
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  esperanzaVidaRestante: string;
  detalle: string;
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

  return {
    edadHumana: Math.round(edadHumana),
    etapaVida: etapa,
    esperanzaVidaRestante: esperanzaTexto,
    detalle: `Tu hámster de ${meses} meses equivale a ~${fmt.format(edadHumana)} años humanos. Etapa: ${etapa}. ${esperanzaTexto}`,
  };
}
