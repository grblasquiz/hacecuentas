/** Venecitas y mosaicos: planchas, pastina y adhesivo según los m² a revestir. */
export interface Inputs {
  area_m2?: number | string;
  tamano?: string;
  desperdicio_pct?: number | string;
  __country?: string;
}

export interface Outputs {
  planchas: number;
  pastina_kg: number;
  adhesivo_kg: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function venecitasMosaicoM2(i: Inputs): Outputs {
  const area_m2 = Math.max(0, Number(i.area_m2) || 0);
  const tamano = String(i.tamano || 'malla_30x30');
  const desperdicio_pct = Math.max(0, Number(i.desperdicio_pct) || 0);

  if (area_m2 <= 0) {
    return {
      planchas: 0,
      pastina_kg: 0,
      adhesivo_kg: 0,
      resumen: 'Cargá los metros cuadrados a revestir para calcular.',
    };
  }

  // Una plancha (malla) estándar de 30x30 cm cubre 0,09 m².
  const area_util = area_m2 * (1 + desperdicio_pct / 100);
  const planchas = Math.ceil(area_util / 0.09);
  const pastina_kg = Math.ceil(area_m2 * 0.5 * 10) / 10;
  const adhesivo_kg = Math.ceil(area_m2 * 4);

  const tamanoLabel =
    tamano === 'mm20' ? 'venecita 2x2 cm' : tamano === 'mm25' ? 'venecita 2,5x2,5 cm' : 'mosaico en malla 30x30';

  const resumen = `Para ${area_m2} m² de ${tamanoLabel} (con ${desperdicio_pct}% de desperdicio): ${planchas} planchas de 30x30, ${pastina_kg} kg de pastina y ${adhesivo_kg} kg de adhesivo.`;

  const out: Outputs = { planchas, pastina_kg, adhesivo_kg, resumen };

  out._insight = {
    title: 'Cuántas planchas comprar',
    text: `Para revestir **${area_m2} m²** necesitás **${planchas} planchas** de 30x30 cm (ya sumado el **${desperdicio_pct}%** de desperdicio por cortes y roturas). Sumá **${pastina_kg} kg** de pastina para las juntas y **${adhesivo_kg} kg** de adhesivo o pegamento.`,
    tone: 'neutral',
    icon: '🔷',
  };

  return out;
}
