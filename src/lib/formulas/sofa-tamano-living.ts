export interface Inputs { largoLiving: number; anchoLiving: number; personas: number; }
export interface Outputs { largoSofa: number; cuerpos: string; profundidad: number; consejo: string; _insight?: any; _chart?: any; }
export function sofaTamanoLiving(i: Inputs): Outputs {
  const largo = Number(i.largoLiving); const ancho = Number(i.anchoLiving); const pers = Number(i.personas);
  if (!largo || !ancho) throw new Error('Ingresá las medidas del living');
  const paredSofa = Math.max(largo, ancho);
  const maxSofa = (paredSofa * 100) * 0.65;
  const sofaPorPersonas = pers * 60;
  const largoFinal = Math.round(Math.min(maxSofa, Math.max(sofaPorPersonas, 160)));
  let cuerpos = '';
  if (largoFinal <= 160) cuerpos = '2 cuerpos';
  else if (largoFinal <= 220) cuerpos = '3 cuerpos';
  else if (largoFinal <= 280) cuerpos = '3 cuerpos + chaise o esquinero';
  else cuerpos = 'Esquinero en L';
  const prof = largo * ancho < 12 ? 85 : 95;
  const consejo = largo * ancho < 15 ? 'Living chico: priorizá sofá con patas altas que den ligereza visual. Evitá chaise si no hay espacio de circulación.' :
    'Living amplio: podés optar por esquinero o sofá + sillones laterales. Dejá 45 cm entre sofá y mesa ratona.';
  const _insight = {
    title: 'Tu sofá ideal',
    text: `Para tu living de ${largo.toFixed(2)}×${ancho.toFixed(2)} m, el sofá recomendado mide **${largoFinal} cm** (**${cuerpos}**) con **${prof} cm** de profundidad. Ese largo aprovecha la pared más larga sin tapar la circulación.`,
    tone: 'neutral' as const,
    icon: '🛋️',
  };
  const _chart = {
    type: 'scale' as const,
    marker: largoFinal,
    markerLabel: largoFinal + ' cm',
    min: 140,
    segments: [
      { nombre: '2 cuerpos', max: 160, color: '#93c5fd', colorDark: '#3b82f6' },
      { nombre: '3 cuerpos', max: 220, color: '#86efac', colorDark: '#22c55e' },
      { nombre: '3 cuerpos + chaise', max: 280, color: '#fcd34d', colorDark: '#f59e0b' },
      { nombre: 'Esquinero en L', max: Math.max(340, largoFinal + 20), color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: `Largo de sofá recomendado de ${largoFinal} cm sobre la escala de cuerpos`,
  };
  return { largoSofa: largoFinal, cuerpos, profundidad: prof, consejo, _insight, _chart };
}