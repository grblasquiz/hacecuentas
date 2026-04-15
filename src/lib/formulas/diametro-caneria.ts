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

  return {
    diametroRecomendado: d.mm,
    diametroPulgadas: d.pulgadas,
    caudalEstimado: caudalLMin,
    detalle: `${puntos} puntos sanitarios en ${pisos} piso(s) → caudal estimado ${fmt.format(caudalLMin)} L/min → diámetro principal recomendado: ${d.mm} mm (${d.pulgadas}). Bajadas individuales a artefactos: 13 mm (½").`,
  };
}
