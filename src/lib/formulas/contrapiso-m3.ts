/** Contrapiso: volumen de mezcla y materiales (cemento, arena, cascote) según superficie y espesor. */
export interface Inputs {
  area_m2?: number | string;
  espesor_cm?: number | string;
  __country?: string;
}

export interface Outputs {
  contrapiso_m3: number;
  bolsas_cemento: number;
  arena_m3: number;
  cascote_m3: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function contrapisoM3(i: Inputs): Outputs {
  const area = Math.max(0, Number(i.area_m2) || 0);
  const espesor = Math.max(0, Number(i.espesor_cm) || 0);

  const vol_m3 = Math.round(area * (espesor / 100) * 100) / 100;
  const bolsas_cemento = vol_m3 > 0 ? Math.ceil(vol_m3 * 3) : 0; // ~3 bolsas de 50 kg por m³
  const arena_m3 = vol_m3 > 0 ? Math.round(vol_m3 * 0.9 * 100) / 100 : 0;
  const cascote_m3 = vol_m3 > 0 ? Math.round(vol_m3 * 0.9 * 100) / 100 : 0;

  const resumen = vol_m3 > 0
    ? `Un contrapiso de ${area} m² con ${espesor} cm de espesor son ${vol_m3} m³ de mezcla: ${bolsas_cemento} bolsas de cemento de 50 kg, ${arena_m3} m³ de arena y ${cascote_m3} m³ de cascote.`
    : 'Cargá la superficie y el espesor para calcular el contrapiso.';

  const out: Outputs = { contrapiso_m3: vol_m3, bolsas_cemento, arena_m3, cascote_m3, resumen };

  if (vol_m3 > 0) {
    out._insight = {
      title: 'Materiales para el contrapiso',
      text: `Para **${area} m²** con **${espesor} cm** de espesor necesitás **${vol_m3} m³** de mezcla: **${bolsas_cemento} bolsas** de cemento de 50 kg, **${arena_m3} m³** de arena y **${cascote_m3} m³** de cascote. Regla práctica: ~3 bolsas de cemento por m³ de contrapiso.`,
      tone: 'neutral',
      icon: '🏗️',
    };
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Arena', value: arena_m3 },
        { label: 'Cascote', value: cascote_m3 },
      ],
      centerValue: `${vol_m3} m³`,
      centerLabel: 'Contrapiso',
      ariaLabel: `${arena_m3} m³ de arena y ${cascote_m3} m³ de cascote para ${vol_m3} m³ de contrapiso.`,
    };
  }

  return out;
}
