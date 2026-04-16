export interface Inputs { material: string; largoCm: number; profundidadCm: number; soportes?: string; }
export interface Outputs { pesoMaxKg: number; equivalente: string; pandeo: string; consejo: string; }
const RESISTENCIA: Record<string, number> = { mdf: 15, pino: 25, roble: 40, vidrio: 12, metal: 50 };
const FACTOR_SOP: Record<string, number> = { mensulas: 1, rieles: 1.2, oculto: 0.6, esquineros: 0.8 };
export function estantePesoMaximo(i: Inputs): Outputs {
  const mat = String(i.material || 'mdf'); const largo = Number(i.largoCm); const prof = Number(i.profundidadCm);
  if (!largo || !prof) throw new Error('Ingresá las medidas');
  const sop = String(i.soportes || 'mensulas');
  const base = RESISTENCIA[mat] || 15; const fSop = FACTOR_SOP[sop] || 1;
  const largoM = largo / 100;
  const pesoMax = Math.round(base * (prof / 25) * fSop / (largoM * 0.8));
  const libros = Math.round(pesoMax / 1.2);
  const pandeo = largo > 90 && mat === 'mdf' ? 'Alto — MDF de más de 90 cm pandea con peso. Agregá soporte central.' :
                 largo > 120 && mat === 'pino' ? 'Medio — Pino de más de 120 cm necesita soporte central.' : 'Bajo — medidas seguras.';
  const consejo = mat === 'mdf' ? 'MDF no debe superar 80 cm sin soporte central. Reforzá con perfil L atrás.' :
                  mat === 'vidrio' ? 'Vidrio SIEMPRE templado para estantes. Nunca vidrio común.' : 'Asegurate de que las ménsulas estén bien fijadas al muro (tarugo + tornillo en ladrillo).';
  return { pesoMaxKg: pesoMax, equivalente: `~${libros} libros estándar`, pandeo, consejo };
}