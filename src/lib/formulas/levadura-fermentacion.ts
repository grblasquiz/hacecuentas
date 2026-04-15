/** Tiempo y cantidad de levadura según temperatura ambiente para pizza/pan */
export interface Inputs {
  harinaG: number;
  temperaturaAmbiente: number; // °C
  tipoMasa?: string; // pizza | pan | masa_madre_sucedaneo
  tipoLevadura?: string; // seca | fresca | masa_madre
  tiempoDeseadoHoras?: number; // si lo quieren fijar
}
export interface Outputs {
  levaduraGramos: number;
  tiempoHoras: number;
  tiempoHumano: string;
  porcentajeLevadura: number;
  temperaturaAmbiente: number;
  consejo: string;
  resumen: string;
}

export function levaduraFermentacion(i: Inputs): Outputs {
  const harina = Number(i.harinaG);
  const temp = Number(i.temperaturaAmbiente);
  const masa = String(i.tipoMasa || 'pizza');
  const tipoLev = String(i.tipoLevadura || 'fresca');
  const tiempoFijo = Number(i.tiempoDeseadoHoras) || 0;

  if (!harina || harina <= 0) throw new Error('Ingresá los gramos de harina');
  if (!temp || temp < 5 || temp > 40) throw new Error('Temperatura entre 5 y 40 °C');

  // Porcentaje base por tipo de masa (sobre peso de harina)
  // Pizza napoletana: 0.1-0.3% fresca / 0.05-0.1% seca (fermentación 8-24 h)
  // Pan estándar: 1-2% fresca / 0.5-1% seca (fermentación 2-4 h)
  let pctBase = 0;
  let tiempoBase = 0; // horas a 22°C
  if (masa === 'pizza') { pctBase = 0.3; tiempoBase = 12; }
  else if (masa === 'pan') { pctBase = 1.5; tiempoBase = 3; }
  else if (masa === 'masa_madre_sucedaneo') { pctBase = 0.1; tiempoBase = 20; }
  else throw new Error('Tipo de masa no válido');

  // Ajuste por temperatura (regla Q10: cada 10°C duplica velocidad fermentación)
  // A mayor temperatura, menos levadura o menos tiempo
  const factorTemp = Math.pow(2, (temp - 22) / 10);

  let levPct = 0;
  let tiempoHoras = 0;

  if (tiempoFijo > 0) {
    // Fijamos tiempo, ajustamos cantidad de levadura
    tiempoHoras = tiempoFijo;
    const ratioTiempo = tiempoBase / tiempoFijo;
    levPct = (pctBase * ratioTiempo) / factorTemp;
  } else {
    // Mantenemos cantidad base, ajustamos tiempo
    levPct = pctBase;
    tiempoHoras = tiempoBase / factorTemp;
  }

  // Ajuste seca (levadura seca ≈ 1/3 de fresca)
  let gramosFinal = (harina * levPct) / 100;
  if (tipoLev === 'seca') gramosFinal = gramosFinal / 3;
  else if (tipoLev === 'masa_madre') gramosFinal = harina * 0.20; // 20% starter activo

  // Humanizar tiempo
  let tiempoHumano = '';
  if (tiempoHoras < 1) tiempoHumano = `${Math.round(tiempoHoras * 60)} minutos`;
  else if (tiempoHoras < 24) tiempoHumano = `${tiempoHoras.toFixed(1)} horas`;
  else tiempoHumano = `${(tiempoHoras / 24).toFixed(1)} días (en heladera)`;

  let consejo = '';
  if (tiempoHoras > 24) consejo = 'Fermentación larga: usá heladera (4°C) para controlar. Mejora sabor.';
  else if (temp > 28) consejo = 'Fermentación rápida por calor: vigilá para que no se pase.';
  else if (temp < 15) consejo = 'Fermentación muy lenta. Buscá lugar más cálido (ej. horno apagado con luz encendida).';
  else consejo = 'Fermentación en rango ideal (22-26°C): dejá a temperatura ambiente.';

  return {
    levaduraGramos: Number(gramosFinal.toFixed(2)),
    tiempoHoras: Number(tiempoHoras.toFixed(2)),
    tiempoHumano,
    porcentajeLevadura: Number(levPct.toFixed(3)),
    temperaturaAmbiente: temp,
    consejo,
    resumen: `Para ${harina} g de harina a ${temp}°C (${masa}): ${gramosFinal.toFixed(2)} g de levadura ${tipoLev}, fermentación de ~${tiempoHumano}.`,
  };
}
