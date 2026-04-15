/** Adaptador de enchufe y voltaje por país */
export interface AdaptadorEnchufeInputs {
  destino?: string;
  dispositivos?: string;
}
export interface AdaptadorEnchufeOutputs {
  tipoEnchufe: string;
  voltaje: string;
  necesitaAdaptador: string;
  necesitaTransformador: string;
  detalle: string;
}

interface InfoEnchufe {
  tipo: string;
  voltaje: string;
  frecuencia: string;
  adaptador: string;
  notas: string;
}

const PAISES: Record<string, InfoEnchufe> = {
  eeuu: { tipo: 'A / B (2 patas planas)', voltaje: '120V', frecuencia: '60 Hz', adaptador: 'Tipo I (AR) → Tipo A/B', notas: 'Voltaje bajo (120V). Cargadores modernos funcionan sin transformador.' },
  europa: { tipo: 'C / F (2 patas redondas)', voltaje: '220-230V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Tipo C/F', notas: 'Voltaje similar a Argentina. Solo necesitás adaptador de ficha.' },
  reinoUnido: { tipo: 'G (3 patas rectangulares)', voltaje: '230V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Tipo G', notas: 'Enchufe único británico. Voltaje compatible con Argentina.' },
  brasil: { tipo: 'N (3 patas redondas)', voltaje: '127V o 220V', frecuencia: '60 Hz', adaptador: 'Tipo I (AR) → Tipo N', notas: 'Voltaje varía por ciudad (Río 127V, Brasilia 220V). Muchos tomas aceptan tipo C.' },
  chile: { tipo: 'C / L (2 redondas / 3 redondas)', voltaje: '220V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Tipo C/L', notas: 'Voltaje igual a Argentina. Algunos enchufes argentinos entran en tomas chilenos.' },
  australia: { tipo: 'I (2 o 3 inclinadas)', voltaje: '230V', frecuencia: '50 Hz', adaptador: 'Puede funcionar directo (tipo I similar)', notas: 'Tipo I como Argentina pero patas más finas. Puede que entre o no — llevá adaptador.' },
  japon: { tipo: 'A (2 planas)', voltaje: '100V', frecuencia: '50/60 Hz', adaptador: 'Tipo I (AR) → Tipo A', notas: 'Voltaje más bajo del mundo (100V). Cargadores modernos funcionan. Secadores NO.' },
  china: { tipo: 'A / C / I (varía)', voltaje: '220V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Adaptador universal', notas: 'China usa múltiples tipos de enchufe. Adaptador universal recomendado.' },
  india: { tipo: 'C / D / M (varios)', voltaje: '230V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Adaptador universal', notas: 'India tiene varios tipos. El adaptador universal es obligatorio.' },
  sudafrica: { tipo: 'M / N (3 redondas grandes)', voltaje: '230V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Tipo M/N', notas: 'Enchufe sudafricano muy particular. Necesitás adaptador específico o universal.' },
  israel: { tipo: 'H / C (3 patas / 2 redondas)', voltaje: '230V', frecuencia: '50 Hz', adaptador: 'Tipo I (AR) → Tipo H', notas: 'Muchos tomas aceptan tipo C europeo además del H israelí.' },
};

export function adaptadorEnchufeVoltajePais(inputs: AdaptadorEnchufeInputs): AdaptadorEnchufeOutputs {
  const destino = String(inputs.destino || 'eeuu');
  const dispositivos = String(inputs.dispositivos || 'modernos');

  if (!PAISES[destino]) throw new Error('Destino no disponible');

  const info = PAISES[destino];
  const voltajeNum = parseInt(info.voltaje);
  const esBiVoltaje = dispositivos === 'modernos';
  const necesitaTransformador = !esBiVoltaje && voltajeNum < 200;

  let textoAdaptador = 'SÍ — ' + info.adaptador;
  if (destino === 'australia') {
    textoAdaptador = 'POSIBLEMENTE — el tipo I australiano es similar al argentino pero no siempre compatible';
  }

  let textoTransformador: string;
  if (esBiVoltaje) {
    textoTransformador = 'NO — tus dispositivos son bi-voltaje (100-240V)';
  } else if (necesitaTransformador) {
    textoTransformador = `SÍ — el destino usa ${info.voltaje} y tus aparatos argentinos son 220V`;
  } else {
    textoTransformador = 'NO — voltaje compatible';
  }

  return {
    tipoEnchufe: info.tipo,
    voltaje: `${info.voltaje} / ${info.frecuencia}`,
    necesitaAdaptador: textoAdaptador,
    necesitaTransformador: textoTransformador,
    detalle: `${info.notas} Recomendación: comprá un adaptador universal con puertos USB que sirve para todos los países.`,
  };
}
