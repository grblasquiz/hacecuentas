/** Adoquines y cama de arena para pavimentar una superficie según su tipo. */
export interface Inputs {
  area_m2?: number | string;
  tipo_adoquin?: string;
  desperdicio_pct?: number | string;
  __country?: string;
}

export interface Outputs {
  adoquines: number;
  arena_m3: number;
  resumen: string;
  _insight?: any;
}

export function adoquinesM2(i: Inputs): Outputs {
  const area = Math.max(0, Number(i.area_m2) || 0);
  const tipo = String(i.tipo_adoquin || 'rect_10x20');
  const desp = Math.max(0, Number(i.desperdicio_pct) || 0);

  const porM2Map: Record<string, number> = { rect_10x20: 50, cuad_20x20: 25, hueso_6x24: 39 };
  const porM2 = porM2Map[tipo] ?? 50;

  const adoquines = area > 0 ? Math.ceil(area * porM2 * (1 + desp / 100)) : 0;
  const arena_m3 = area > 0 ? Math.round(area * 0.04 * 100) / 100 : 0; // 4 cm de cama de arena

  const tipoTxt =
    tipo === 'cuad_20x20' ? 'cuadrado 20 × 20 cm' : tipo === 'hueso_6x24' ? 'hueso 6 × 24 cm' : 'rectangular 10 × 20 cm';

  const resumen = adoquines > 0
    ? `Para ${area} m² con adoquín ${tipoTxt} y ${desp}% de desperdicio necesitás ${adoquines} adoquines y ${arena_m3} m³ de arena para la cama de asiento (4 cm).`
    : 'Cargá los metros cuadrados a pavimentar para calcular los adoquines.';

  const out: Outputs = { adoquines, arena_m3, resumen };

  if (adoquines > 0) {
    out._insight = {
      title: 'Cuántos adoquines comprar',
      text: `Para **${area} m²** necesitás **${adoquines} adoquines** (${tipoTxt}, incluye ${desp}% de desperdicio) y **${arena_m3} m³** de arena para la cama de asiento de 4 cm. Comprá siempre un pallet completo de más si la obra es grande, para evitar diferencias de tono entre partidas.`,
      tone: 'neutral',
      icon: '🧱',
    };
  }

  return out;
}
