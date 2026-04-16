export interface Inputs { largoLiving: number; anchoLiving: number; personas: number; }
export interface Outputs { largoSofa: number; cuerpos: string; profundidad: number; consejo: string; }
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
  return { largoSofa: largoFinal, cuerpos, profundidad: prof, consejo };
}