export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function lluviaCaptacionTechoM3Anual(i: Inputs): Outputs {
  const mm = Number(i.mmAnual) || 0; const m2 = Number(i.m2Techo) || 0;
  const eff = (Number(i.eficiencia) || 80) / 100;
  const m3 = mm * m2 * 0.001 * eff;
  const pers = m3 / 60;
  const litrosDia = m3 * 1000 / 365;
  const _insight = {
    title: 'Tu cosecha de lluvia',
    text: `Con **${m2.toLocaleString('es-AR')} m²** de techo y **${mm.toLocaleString('es-AR')} mm** anuales captás **${m3.toFixed(0)} m³/año** (~**${litrosDia.toFixed(0)} litros/día**), suficiente para abastecer a ~**${pers.toFixed(1)} personas** en consumo doméstico básico.`,
    tone: 'good',
    icon: '🌧️',
  };
  return { m3Año: m3.toFixed(1) + ' m³', personasAbastecidas: pers.toFixed(1), resumen: `Captable ${m3.toFixed(0)} m³/año. Abastece ~${pers.toFixed(1)} personas.`, _insight };
}
