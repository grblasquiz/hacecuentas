/** Tierra / sustrato para un cantero, huerta o césped nuevo según sus dimensiones. */
export interface Inputs {
  largo_m?: number | string;
  ancho_m?: number | string;
  profundidad_cm?: number | string;
  tipo?: string;
  __country?: string;
}

export interface Outputs {
  tierra_m3: number;
  litros: number;
  bolsas_40l: number;
  resumen: string;
  _insight?: any;
}

export function tierraJardinCanteroM3(i: Inputs): Outputs {
  const largo = Math.max(0, Number(i.largo_m) || 0);
  const ancho = Math.max(0, Number(i.ancho_m) || 0);
  const prof = Math.max(0, Number(i.profundidad_cm) || 0);
  const tipo = String(i.tipo || 'cantero');

  const vol_m3 = Math.round(largo * ancho * (prof / 100) * 100) / 100;
  const litros = Math.round(vol_m3 * 1000);
  const bolsas_40l = litros > 0 ? Math.ceil(litros / 40) : 0;

  const tipoTxt =
    tipo === 'cesped_nuevo' ? 'césped nuevo' : tipo === 'huerta' ? 'huerta' : 'cantero';

  const resumen = vol_m3 > 0
    ? `Para un ${tipoTxt} de ${largo} × ${ancho} m con ${prof} cm de profundidad necesitás ${vol_m3} m³ de tierra (${litros} L, ${bolsas_40l} bolsas de 40 L).`
    : 'Cargá el largo, el ancho y la profundidad para calcular la tierra.';

  const out: Outputs = { tierra_m3: vol_m3, litros, bolsas_40l, resumen };

  if (vol_m3 > 0) {
    out._insight = {
      title: 'Cuánta tierra comprar',
      text: `Necesitás **${vol_m3} m³** de tierra o sustrato, equivalentes a **${litros} L** o **${bolsas_40l} bolsas** de 40 L. Regla práctica: 1 m³ de tierra = 1.000 litros = 25 bolsas de 40 L.`,
      tone: 'neutral',
      icon: '🪴',
    };
  }

  return out;
}
