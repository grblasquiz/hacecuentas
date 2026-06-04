export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function gasolinaViajeCarreteraDistanciaAuto(i: Inputs, __lang = 'es'): Outputs {
  const distancia = Number(i.distancia) || 0;    // km
  const consumo   = Number(i.consumo)   || 0;    // L/100km
  const precio    = Number(i.precio)    || 0;    // $/L

  // Core formula (standard metric):
  // Litros = (Distancia / 100) × Consumo (L/100km)
  // Costo  = Litros × Precio por litro
  const litros = distancia > 0 && consumo > 0
    ? (distancia / 100) * consumo
    : 0;
  const costo = litros * precio;

  // Rendimiento equivalente en km/L (inversa)
  const rendimiento = consumo > 0 ? 100 / consumo : 0;

  const isEN = __lang === 'en';

  if (!isEN) {
    // --- Español ---
    const litrosStr  = litros.toFixed(1);
    const costoStr   = costo.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    const rendStr    = rendimiento.toFixed(1);

    let tono: string;
    let insightText: string;

    if (litros === 0) {
      tono = 'neutral';
      insightText = 'Completá la distancia, el consumo y el precio del combustible para ver el resultado.';
    } else if (consumo <= 7) {
      tono = 'positive';
      insightText = `Tu auto es muy eficiente (${rendStr} km/L). Para ${distancia.toLocaleString('es-AR')} km necesitás **${litrosStr} litros** — un gasto de **$${costoStr}**. Consumos bajos en ruta se logran a 90–100 km/h con AC moderado.`;
    } else if (consumo <= 10) {
      tono = 'neutral';
      insightText = `Para ${distancia.toLocaleString('es-AR')} km con un consumo de ${consumo} L/100km (${rendStr} km/L) necesitás **${litrosStr} litros** y el gasto en combustible es de **$${costoStr}**. Mantener velocidad crucero entre 90 y 105 km/h optimiza el consumo.`;
    } else {
      tono = 'caution';
      insightText = `Un consumo de ${consumo} L/100km es elevado para ruta. Para ${distancia.toLocaleString('es-AR')} km necesitás **${litrosStr} litros** ($${costoStr}). Revisá presión de neumáticos, filtro de aire y considerá reducir velocidad a 100 km/h para mejorar el rendimiento.`;
    }

    const _insight = {
      title: 'Resultado del viaje',
      text: insightText,
      tone: tono,
      icon: '⛽',
    };

    return {
      litros:     litrosStr,
      costo_total: `$${costoStr}`,
      resumen:    `${litrosStr} L × $${precio.toLocaleString('es-AR')} = $${costoStr} en combustible para ${distancia.toLocaleString('es-AR')} km`,
      _insight,
    };
  } else {
    // --- English ---
    const litrosStr = litros.toFixed(1);
    const costoStr  = costo.toFixed(2);
    const rendStr   = rendimiento.toFixed(1);

    let tone: string;
    let insightText: string;

    if (litros === 0) {
      tone = 'neutral';
      insightText = 'Enter distance, fuel consumption and price per liter to see the result.';
    } else if (consumo <= 7) {
      tone = 'positive';
      insightText = `Very efficient vehicle (${rendStr} km/L). For ${distancia.toLocaleString()} km you need **${litrosStr} liters** — total fuel cost **$${costoStr}**. Keep speed between 90–100 km/h for best economy.`;
    } else if (consumo <= 10) {
      tone = 'neutral';
      insightText = `For ${distancia.toLocaleString()} km at ${consumo} L/100km (${rendStr} km/L) you need **${litrosStr} liters** — fuel cost **$${costoStr}**. Steady cruising at 90–105 km/h gives the best economy.`;
    } else {
      tone = 'caution';
      insightText = `${consumo} L/100km is on the high side for highway driving. For ${distancia.toLocaleString()} km you need **${litrosStr} liters** ($${costoStr}). Check tire pressure, air filter and consider reducing speed to 100 km/h.`;
    }

    const _insight = {
      title: 'Trip result',
      text: insightText,
      tone,
      icon: '⛽',
    };

    return {
      litros:     litrosStr,
      costo_total: `$${costoStr}`,
      resumen:    `${litrosStr} L × $${precio.toFixed(2)}/L = $${costoStr} in fuel for ${distancia.toLocaleString()} km`,
      _insight,
    };
  }
}
