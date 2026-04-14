/** Percentil de peso/altura pediátrico — aproximación simplificada OMS */
export interface Inputs {
  edadMeses: number;
  sexo: 'm' | 'f' | string;
  peso: number; // kg
  altura: number; // cm
}
export interface Outputs {
  percentilPeso: number;
  percentilAltura: number;
  imc: number;
  mensajePeso: string;
  mensajeAltura: string;
}

// Tablas aproximadas OMS (percentil 50) — para mayor precisión usar tablas reales
// Peso medio en kg por mes hasta 60 meses
const PESO_MEDIO: Record<string, number[]> = {
  m: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 10.3, 11.0, 11.5, 12.0, 12.7, 13.3, 13.9, 14.5, 15.0, 15.5, 16.0],
  f: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9, 9.6, 10.2, 10.8, 11.4, 12.0, 12.6, 13.2, 13.7, 14.2, 14.7, 15.2],
};
// Altura media cm
const ALT_MEDIA: Record<string, number[]> = {
  m: [50, 55, 58, 61, 63, 65, 67, 68, 70, 71, 73, 74, 76, 81, 86, 90, 95, 99, 103, 106, 110, 113, 116, 119],
  f: [49, 54, 57, 59, 62, 64, 65, 67, 68, 70, 71, 73, 74, 80, 85, 89, 93, 98, 102, 105, 108, 112, 115, 118],
};

function percentilAprox(valor: number, medio: number, desvio: number): number {
  const z = (valor - medio) / desvio;
  // Aproximación CDF normal (error función Abramowitz-Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return Math.round(p * 100);
}

export function percentilPediatrico(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadMeses));
  const sexo = String(i.sexo || 'm');
  const peso = Number(i.peso);
  const alt = Number(i.altura);
  if (edad < 0 || edad > 60) throw new Error('Edad en meses debe ser 0-60 (0-5 años)');
  if (!peso || peso <= 0) throw new Error('Ingresá peso');
  if (!alt || alt <= 0) throw new Error('Ingresá altura');

  const tablaPeso = PESO_MEDIO[sexo] ?? PESO_MEDIO.m;
  const tablaAlt = ALT_MEDIA[sexo] ?? ALT_MEDIA.m;
  // Índice: meses 0-12 (cada 1), luego cada 6 meses
  let idx = 0;
  if (edad <= 12) idx = edad;
  else idx = 12 + Math.floor((edad - 12) / 6);
  idx = Math.min(idx, tablaPeso.length - 1);

  const pMedio = tablaPeso[idx];
  const aMedio = tablaAlt[idx];

  // Desvíos típicos aproximados OMS
  const desvPeso = pMedio * 0.11;
  const desvAlt = aMedio * 0.04;

  const pctPeso = percentilAprox(peso, pMedio, desvPeso);
  const pctAlt = percentilAprox(alt, aMedio, desvAlt);

  const alturaM = alt / 100;
  const imc = peso / (alturaM * alturaM);

  const catMsg = (pct: number, que: string) => {
    if (pct < 3) return `Por debajo del P3 de ${que} — consultar pediatra.`;
    if (pct < 15) return `Percentil bajo de ${que}, dentro del rango.`;
    if (pct < 85) return `${que} normal (dentro del rango habitual).`;
    if (pct < 97) return `Percentil alto de ${que}, dentro del rango.`;
    return `Por encima del P97 de ${que} — consultar pediatra.`;
  };

  return {
    percentilPeso: pctPeso,
    percentilAltura: pctAlt,
    imc: Number(imc.toFixed(1)),
    mensajePeso: catMsg(pctPeso, 'peso'),
    mensajeAltura: catMsg(pctAlt, 'altura'),
  };
}
