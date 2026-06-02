export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function phSueloCorreccionCalcio(i: Inputs): Outputs {
  const pa = Number(i.phActual) || 7; const pi = Number(i.phIdeal) || 6.5; const m = Number(i.m2) || 0;
  const dif = pi - pa;
  const kg = dif * 0.5 * m;

  const kgFmt = kg.toFixed(1);
  const _insight = kg > 0
    ? {
        title: 'Plan de encalado',
        text: `Tu suelo está en pH **${pa}** y querés llevarlo a **${pi}**: necesitás aplicar **${kgFmt} kg de cal** sobre **${m} m²** para subir esos ${dif.toFixed(1)} puntos. Distribuila pareja e incorporala a los primeros centímetros.`,
        tone: 'neutral',
        icon: '🌱',
      }
    : {
        title: 'Suelo en rango',
        text: `Con pH **${pa}** tu suelo ya alcanza o supera el ideal de **${pi}**: no hace falta agregar cal. Encalar de más subiría el pH por encima del objetivo y bloquearía nutrientes.`,
        tone: 'good',
        icon: '✅',
      };

  return { kgCal: kg.toFixed(1) + ' kg', resumen: kg > 0 ? `Agregar ${kg.toFixed(1)} kg cal en ${m} m² para subir pH.` : 'pH ya alcanza o supera ideal.', _insight };
}
