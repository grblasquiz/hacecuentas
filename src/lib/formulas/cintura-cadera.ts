/** Índice cintura-cadera (RCC) y riesgo según cintura abdominal */
export interface Inputs {
  cintura: number;
  cadera: number;
  sexo?: string;
}
export interface Outputs {
  rcc: number;
  categoriaRcc: string;
  riesgoCintura: string;
  cinturaSaludable: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function cinturaCadera(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const cadera = Number(i.cadera);
  const sexo = String(i.sexo || 'mujer');

  if (!cintura || cintura < 30 || cintura > 250) throw new Error('Cintura entre 30 y 250 cm');
  if (!cadera || cadera < 40 || cadera > 250) throw new Error('Cadera entre 40 y 250 cm');

  const rcc = cintura / cadera;

  // Categorías OMS de RCC
  let categoriaRcc = '';
  if (sexo === 'hombre') {
    if (rcc < 0.90) categoriaRcc = 'Bajo riesgo (RCC < 0.90)';
    else if (rcc < 1.0) categoriaRcc = 'Riesgo moderado (0.90 – 0.99)';
    else categoriaRcc = 'Riesgo alto (RCC ≥ 1.0)';
  } else {
    if (rcc < 0.80) categoriaRcc = 'Bajo riesgo (RCC < 0.80)';
    else if (rcc < 0.85) categoriaRcc = 'Riesgo moderado (0.80 – 0.84)';
    else categoriaRcc = 'Riesgo alto (RCC ≥ 0.85)';
  }

  // Cintura abdominal sola (criterio OMS / IDF)
  let riesgoCintura = '';
  let cinturaSaludable = '';
  if (sexo === 'hombre') {
    cinturaSaludable = '< 94 cm (saludable), 94–101 cm (riesgo aumentado), ≥ 102 cm (riesgo muy alto)';
    if (cintura < 94) riesgoCintura = 'Bajo riesgo (< 94 cm)';
    else if (cintura < 102) riesgoCintura = 'Riesgo aumentado (94–101 cm)';
    else riesgoCintura = 'Riesgo muy alto (≥ 102 cm)';
  } else {
    cinturaSaludable = '< 80 cm (saludable), 80–87 cm (riesgo aumentado), ≥ 88 cm (riesgo muy alto)';
    if (cintura < 80) riesgoCintura = 'Bajo riesgo (< 80 cm)';
    else if (cintura < 88) riesgoCintura = 'Riesgo aumentado (80–87 cm)';
    else riesgoCintura = 'Riesgo muy alto (≥ 88 cm)';
  }

  // Tono dinámico según nivel de riesgo
  const esAlto = categoriaRcc.startsWith('Riesgo alto');
  const esModerado = categoriaRcc.startsWith('Riesgo moderado');
  const tone = esAlto ? 'warn' : esModerado ? 'neutral' : 'good';
  const icon = esAlto ? '⚠️' : esModerado ? '📏' : '✅';
  const lecturaRiesgo = esAlto
    ? 'indica acumulación de grasa abdominal asociada a mayor riesgo cardiometabólico'
    : esModerado
    ? 'está en zona intermedia: conviene vigilar el contorno de cintura'
    : 'refleja una distribución de grasa favorable para tu salud cardiovascular';

  // Umbrales OMS por sexo para el gauge
  const segments = sexo === 'hombre'
    ? [
        { nombre: 'Bajo', max: 0.90, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Moderado', max: 1.0, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Alto', max: Math.max(1.15, rcc + 0.05), color: '#ef4444', colorDark: '#dc2626' },
      ]
    : [
        { nombre: 'Bajo', max: 0.80, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Moderado', max: 0.85, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Alto', max: Math.max(1.05, rcc + 0.05), color: '#ef4444', colorDark: '#dc2626' },
      ];

  return {
    rcc: Number(rcc.toFixed(3)),
    categoriaRcc,
    riesgoCintura,
    cinturaSaludable,
    resumen: `Tu RCC es ${rcc.toFixed(2)} (${categoriaRcc}). Tu cintura abdominal: ${riesgoCintura}.`,
    _insight: {
      title: 'Qué significa tu RCC',
      text: `Con cintura **${Math.round(cintura)} cm** y cadera **${Math.round(cadera)} cm**, tu relación cintura-cadera es **${rcc.toFixed(2)}**, que ${lecturaRiesgo}.`,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: Number(rcc.toFixed(2)),
      markerLabel: `RCC ${rcc.toFixed(2)}`,
      min: sexo === 'hombre' ? 0.7 : 0.6,
      segments,
      ariaLabel: `Relación cintura-cadera ${rcc.toFixed(2)} ubicada en la zona de ${esAlto ? 'riesgo alto' : esModerado ? 'riesgo moderado' : 'bajo riesgo'} según los umbrales OMS para ${sexo === 'hombre' ? 'hombres' : 'mujeres'}.`,
    },
  };
}
