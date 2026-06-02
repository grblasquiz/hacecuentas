export interface Inputs { m2: number; nivelAcumulacion?: string; personas: number; }
export interface Outputs { horasTotal: number; diasRecomendados: number; primeraCategoria: string; orden: string; _insight?: any; }
const FACTOR: Record<string, number> = { poco: 0.5, medio: 1, mucho: 1.8 };
export function ordenKondoTiempoEstimado(i: Inputs): Outputs {
  const m2 = Number(i.m2); const pers = Number(i.personas);
  if (!m2) throw new Error('Ingresá los m²');
  const nivel = String(i.nivelAcumulacion || 'medio');
  const hBase = (m2 * 0.3 + pers * 4) * (FACTOR[nivel] || 1);
  const dias = Math.ceil(hBase / 4);
  const horas = Math.round(hBase);
  const nivelTxt = nivel === 'poco' ? 'pocas cosas' : nivel === 'mucho' ? 'mucha acumulación' : 'acumulación media';
  const finde = Math.ceil(dias / 2);
  return {
    horasTotal: horas,
    diasRecomendados: dias,
    primeraCategoria: 'Ropa — es la categoría más fácil para entrenar el "¿esto me da alegría?"',
    orden: '1. Ropa → 2. Libros → 3. Papeles → 4. Komono (misceláneos) → 5. Recuerdos sentimentales',
    _insight: {
      title: 'Tu maratón KonMari',
      text: `Para **${m2} m²** con ${nivelTxt} y ${pers} persona${pers === 1 ? '' : 's'}, calculá unas **${horas} horas** de orden. En sesiones de 4 hs son **${dias} jornadas** (≈${finde} fin${finde === 1 ? '' : 'es'} de semana). El método pide hacerlo por categoría y de un tirón, no habitación por habitación.`,
      tone: 'neutral',
      icon: '🧹',
    },
  };
}