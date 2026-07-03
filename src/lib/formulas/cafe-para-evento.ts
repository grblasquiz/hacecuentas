/** Café para un evento: café molido, tazas, agua y leche según cantidad de personas. */
export interface Inputs {
  personas?: number | string;
  consumo?: string;
  con_leche?: string;
  __country?: string;
}

export interface Outputs {
  cafe_molido_g: number;
  tazas: number;
  agua_litros: number;
  leche_litros: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function cafeParaEvento(i: Inputs): Outputs {
  const p = Math.max(0, Math.floor(Number(i.personas) || 0));
  const consumo = String(i.consumo || 'normal');
  const conLeche = String(i.con_leche || 'si') === 'si';

  const tazasPPMap: Record<string, number> = { liviano: 1, normal: 2, alto: 3 };
  const tazasPP = tazasPPMap[consumo] ?? 2;

  const tazas = p > 0 ? p * tazasPP : 0;
  const cafe_molido_g = tazas > 0 ? Math.round(tazas * 10) : 0;
  const agua_litros = tazas > 0 ? Math.ceil(tazas * 0.2 * 2) / 2 : 0;
  const leche_litros = tazas > 0 && conLeche ? Math.ceil(tazas * 0.1 * 2) / 2 : 0;

  const resumen = p > 0
    ? `Para ${p} personas: ${cafe_molido_g} g de café molido (${tazas} tazas), ${agua_litros} L de agua${conLeche ? ` y ${leche_litros} L de leche` : ''}. Calculá 10 g de café por taza.`
    : 'Cargá la cantidad de personas para calcular el café.';

  const out: Outputs = { cafe_molido_g, tazas, agua_litros, leche_litros, resumen };

  if (p > 0) {
    out._insight = {
      title: 'Cuánto café preparar',
      text: `Para **${p}** personas comprá **${cafe_molido_g} g** de café molido (rinde **${tazas}** tazas). Regla base: 10 g de café y 200 ml de agua por taza${conLeche ? `, más 100 ml de leche` : ''}. Un consumo normal son 2 tazas por persona.`,
      tone: 'neutral',
      icon: '☕',
    };
    if (conLeche && leche_litros > 0) {
      out._chart = {
        type: 'doughnut',
        slices: [
          { label: 'Agua', value: agua_litros },
          { label: 'Leche', value: leche_litros },
        ],
        centerValue: `${(agua_litros + leche_litros).toFixed(1)} L`,
        centerLabel: 'Líquidos',
        ariaLabel: `${agua_litros} L de agua y ${leche_litros} L de leche.`,
      };
    }
  }

  return out;
}
