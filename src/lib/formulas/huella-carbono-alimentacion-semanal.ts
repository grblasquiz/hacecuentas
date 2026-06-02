export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function huellaCarbonoAlimentacionSemanal(i: Inputs): Outputs {
  const res = Number(i.carneRes) || 0; const pol = Number(i.polloPescado) || 0;
  const lac = Number(i.lacteos) || 0; const veg = Number(i.vegetales) || 0;
  const cRes = res * 27; const cPol = pol * 6; const cLac = lac * 3; const cVeg = veg * 2;
  const kgSem = cRes + cPol + cLac + cVeg;
  const kgAño = kgSem * 52;

  // Insight dinámico: qué pesa más en la dieta
  const partes = [
    { label: 'Carne de res', value: cRes },
    { label: 'Pollo/pescado', value: cPol },
    { label: 'Lácteos', value: cLac },
    { label: 'Vegetales', value: cVeg },
  ].filter(p => p.value > 0).sort((a, b) => b.value - a.value);
  const pctRes = kgSem > 0 ? Math.round((cRes / kgSem) * 100) : 0;
  const tonAño = kgAño / 1000;
  let _insight: any;
  if (kgSem <= 0) {
    _insight = { title: 'Sin datos', text: 'Ingresá tus porciones semanales para estimar la huella de tu alimentación.', tone: 'neutral', icon: '🍽️' };
  } else if (pctRes >= 50) {
    _insight = { title: 'La carne domina tu huella', text: `Tu dieta emite **${kgSem.toFixed(1)} kg CO₂/semana** (**${tonAño.toFixed(1)} t/año**), y la **carne de res** sola explica el **${pctRes}%**. Bajar a 2-3 porciones por semana es la palanca más potente para reducir tu impacto.`, tone: 'warn', icon: '🥩' };
  } else {
    const mayor = partes.length ? partes[0].label.toLowerCase() : 'tu consumo';
    _insight = { title: 'Huella alimentaria estimada', text: `Tu alimentación genera **${kgSem.toFixed(1)} kg CO₂/semana** (**${tonAño.toFixed(1)} t/año**). El mayor aporte viene de **${mayor}**.`, tone: 'neutral', icon: '🍽️' };
  }

  const out: Outputs = { kgCo2Semana: kgSem.toFixed(1) + ' kg', kgCo2Año: kgAño.toFixed(0) + ' kg', resumen: `CO2 semanal: ${kgSem.toFixed(1)} kg (anual ${(kgAño/1000).toFixed(1)} t).`, _insight };

  // Donut: las 4 fuentes suman el total semanal
  if (kgSem > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Carne de res', value: Number(cRes.toFixed(1)) },
        { label: 'Pollo/pescado', value: Number(cPol.toFixed(1)) },
        { label: 'Lácteos', value: Number(cLac.toFixed(1)) },
        { label: 'Vegetales', value: Number(cVeg.toFixed(1)) },
      ].filter(s => s.value > 0),
      prefix: '',
      centerValue: kgSem.toFixed(1) + ' kg',
      centerLabel: 'CO₂/semana',
      ariaLabel: `Reparto del CO₂ semanal por tipo de alimento, total ${kgSem.toFixed(1)} kg`,
    };
  }

  return out;
}
