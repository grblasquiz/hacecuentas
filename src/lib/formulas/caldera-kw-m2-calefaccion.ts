export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calderaKwM2Calefaccion(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const factores: Record<string, number> = { bueno: 0.07, normal: 0.09, malo: 0.12 };
  const ais = String(i.aislamiento);
  const f = factores[ais] || 0.09;
  const kw = m * f;
  const aisTxt = ais === 'bueno' ? 'buena' : ais === 'malo' ? 'mala' : 'normal';
  return {
    kw: kw.toFixed(1) + ' kW',
    resumen: `Caldera ${kw.toFixed(0)} kW para ${m} m² con aislamiento ${i.aislamiento}.`,
    _insight: {
      title: 'Potencia de caldera estimada',
      text: ais === 'malo'
        ? `Para ${m} m² con aislamiento **malo** necesitás **${kw.toFixed(1)} kW** (${f*1000} W/m²). Mejorar la aislación bajaría el factor a 0,07 kW/m² (~${(m*0.07).toFixed(1)} kW), achicando la caldera y el consumo.`
        : `Para ${m} m² con aislamiento ${aisTxt} necesitás **${kw.toFixed(1)} kW** a razón de ${f*1000} W/m². Elegí una caldera con potencia igual o levemente superior, sin sobredimensionar.`,
      tone: ais === 'malo' ? 'warn' : 'neutral',
      icon: '🔥',
    },
  };
}
