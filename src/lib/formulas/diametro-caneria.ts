/** Diámetro de cañería de agua según caudal necesario */
export interface DiametroCaneriaInputs {
  puntosSanitarios: number;
  pisos: number;
}
export interface DiametroCaneriaOutputs {
  diametroRecomendado: number;
  diametroPulgadas: string;
  caudalEstimado: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const CAUDAL_POR_PUNTO = 0.13; // L/s promedio ponderado

interface DiametroInfo {
  mm: number;
  pulgadas: string;
}

const DIAMETROS: DiametroInfo[] = [
  { mm: 13, pulgadas: '½"' },
  { mm: 19, pulgadas: '¾"' },
  { mm: 25, pulgadas: '1"' },
  { mm: 32, pulgadas: '1¼"' },
  { mm: 38, pulgadas: '1½"' },
  { mm: 50, pulgadas: '2"' },
];

export function diametroCaneria(inputs: DiametroCaneriaInputs): DiametroCaneriaOutputs {
  const puntos = Number(inputs.puntosSanitarios);
  const pisos = Number(inputs.pisos);

  if (!puntos || puntos <= 0) throw new Error('Ingresá la cantidad de puntos sanitarios');
  if (!pisos || pisos <= 0) throw new Error('Ingresá la cantidad de pisos');

  const caudalLs = puntos * CAUDAL_POR_PUNTO;
  const caudalLMin = Number((caudalLs * 60).toFixed(1));

  // Determinar diámetro base según caudal
  let idx: number;
  if (caudalLs <= 0.5) idx = 0;       // ½"
  else if (caudalLs <= 1.0) idx = 1;  // ¾"
  else if (caudalLs <= 2.0) idx = 2;  // 1"
  else if (caudalLs <= 3.5) idx = 3;  // 1¼"
  else if (caudalLs <= 5.0) idx = 4;  // 1½"
  else idx = 5;                        // 2"

  // Subir un diámetro si hay más de 1 piso
  if (pisos >= 2 && idx < DIAMETROS.length - 1) {
    idx += 1;
  }
  if (pisos >= 4 && idx < DIAMETROS.length - 1) {
    idx += 1;
  }

  const d = DIAMETROS[idx];
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  // Gauge: el caudal estimado (L/s) cae en una zona que define el diámetro base.
  // El segmento final se extiende por encima del marker para caudales grandes.
  const ultimoMax = Math.max(6.5, Number((caudalLs + 1).toFixed(2)));
  const _chart = {
    type: 'scale',
    marker: Number(caudalLs.toFixed(2)),
    markerLabel: `${fmt.format(Number(caudalLs.toFixed(2)))} L/s`,
    min: 0,
    segments: [
      { nombre: '½" (13 mm)', max: 0.5, color: '#bae6fd', colorDark: '#0c4a6e' },
      { nombre: '¾" (19 mm)', max: 1.0, color: '#7dd3fc', colorDark: '#075985' },
      { nombre: '1" (25 mm)', max: 2.0, color: '#38bdf8', colorDark: '#0369a1' },
      { nombre: '1¼" (32 mm)', max: 3.5, color: '#0ea5e9', colorDark: '#0284c7' },
      { nombre: '1½" (38 mm)', max: 5.0, color: '#0284c7', colorDark: '#0ea5e9' },
      { nombre: '2" (50 mm)', max: ultimoMax, color: '#0369a1', colorDark: '#38bdf8' },
    ],
    ariaLabel: `Caudal estimado de ${fmt.format(Number(caudalLs.toFixed(2)))} litros por segundo dentro de las zonas de diámetro de cañería; recomendado ${d.mm} mm (${d.pulgadas}).`,
  };

  const bumpFloors = pisos >= 2;
  const _insight = {
    title: `Cañería principal: ${d.pulgadas} (${d.mm} mm)`,
    text: `${puntos} puntos sanitarios mueven un caudal de **${fmt.format(caudalLMin)} L/min** (${fmt.format(Number(caudalLs.toFixed(2)))} L/s). Te conviene un caño principal de **${d.mm} mm (${d.pulgadas})**${bumpFloors ? `, ya subido de medida por los **${pisos} pisos** para sostener la presión en altura` : ''}. Las bajadas a cada artefacto van en 13 mm (½").`,
    tone: 'neutral',
    icon: '🚰',
  };

  return {
    diametroRecomendado: d.mm,
    diametroPulgadas: d.pulgadas,
    caudalEstimado: caudalLMin,
    detalle: `${puntos} puntos sanitarios en ${pisos} piso(s) → caudal estimado ${fmt.format(caudalLMin)} L/min → diámetro principal recomendado: ${d.mm} mm (${d.pulgadas}). Bajadas individuales a artefactos: 13 mm (½").`,
    _insight,
    _chart,
  };
}
