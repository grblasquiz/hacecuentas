/** Mundial 2026: probabilidades de clasificación y avance por seed FIFA */
export interface Inputs {
  seleccion: string;
}

export interface Outputs {
  bombo: string;
  probPasaGrupo: string;
  probOctavos: string;
  probCuartos: string;
  probSemi: string;
  probFinal: string;
  probCampeon: string;
  resumen: string;
}

// Probabilidades estimadas basadas en ranking FIFA abril 2026 + histórico Mundiales
// Formato: [bombo, probFaseGrupos, probOctavos, probCuartos, probSemi, probFinal, probCampeon]
const DATA: Record<string, { bombo: number; probs: [number, number, number, number, number, number]; nombre: string }> = {
  argentina: { bombo: 1, probs: [92, 88, 65, 35, 18, 11], nombre: 'Argentina' },
  francia: { bombo: 1, probs: [91, 86, 62, 33, 17, 10], nombre: 'Francia' },
  brasil: { bombo: 1, probs: [90, 84, 60, 32, 16, 9], nombre: 'Brasil' },
  inglaterra: { bombo: 1, probs: [88, 82, 55, 28, 12, 7], nombre: 'Inglaterra' },
  portugal: { bombo: 1, probs: [87, 80, 48, 22, 9, 5], nombre: 'Portugal' },
  belgica: { bombo: 1, probs: [85, 76, 42, 18, 7, 3], nombre: 'Bélgica' },
  espana: { bombo: 1, probs: [86, 78, 48, 22, 10, 5], nombre: 'España' },
  uruguay: { bombo: 1, probs: [82, 72, 38, 15, 5, 2], nombre: 'Uruguay' },
  'paises-bajos': { bombo: 1, probs: [84, 74, 42, 18, 7, 3], nombre: 'Países Bajos' },
  croacia: { bombo: 1, probs: [80, 70, 38, 20, 8, 3], nombre: 'Croacia' },
  alemania: { bombo: 2, probs: [78, 65, 32, 12, 4, 1.5], nombre: 'Alemania' },
  italia: { bombo: 2, probs: [72, 58, 25, 10, 3, 1], nombre: 'Italia' },
  colombia: { bombo: 2, probs: [70, 55, 22, 8, 2, 0.8], nombre: 'Colombia' },
  mexico: { bombo: 1, probs: [85, 72, 32, 10, 2, 0.5], nombre: 'México (anfitrión)' },
  usa: { bombo: 1, probs: [82, 68, 25, 8, 1.5, 0.4], nombre: 'USA (anfitrión)' },
  canada: { bombo: 1, probs: [75, 58, 18, 5, 1, 0.2], nombre: 'Canadá (anfitrión)' },
  marruecos: { bombo: 2, probs: [65, 50, 22, 12, 4, 1], nombre: 'Marruecos' },
  japon: { bombo: 2, probs: [65, 48, 15, 4, 1, 0.3], nombre: 'Japón' },
  ecuador: { bombo: 2, probs: [60, 42, 12, 3, 0.8, 0.2], nombre: 'Ecuador' },
  'corea-sur': { bombo: 2, probs: [58, 40, 12, 4, 1, 0.2], nombre: 'Corea del Sur' },
  senegal: { bombo: 2, probs: [62, 45, 15, 5, 1.2, 0.3], nombre: 'Senegal' },
  suiza: { bombo: 2, probs: [68, 52, 18, 5, 1.2, 0.3], nombre: 'Suiza' },
  serbia: { bombo: 3, probs: [52, 35, 8, 2, 0.5, 0.1], nombre: 'Serbia' },
  nigeria: { bombo: 3, probs: [48, 30, 8, 2, 0.4, 0.1], nombre: 'Nigeria' },
  'costa-rica': { bombo: 3, probs: [42, 25, 5, 1, 0.2, 0.05], nombre: 'Costa Rica' },
  'otro-bombo3': { bombo: 3, probs: [50, 32, 8, 2, 0.5, 0.1], nombre: 'Selección Bombo 3' },
  'otro-bombo4': { bombo: 4, probs: [30, 15, 3, 0.8, 0.2, 0.03], nombre: 'Selección Bombo 4' },
};

export function mundial2026ProbabilidadSeed(i: Inputs): Outputs {
  const sel = String(i.seleccion || 'argentina').toLowerCase();
  const data = DATA[sel];
  if (!data) throw new Error('Selección no encontrada.');

  const [pg, po, pc, ps, pf, pcamp] = data.probs;
  const fmt = (n: number) => (n >= 1 ? `${n.toFixed(1)}%` : `${n.toFixed(2)}%`);

  return {
    bombo: `Bombo ${data.bombo}`,
    probPasaGrupo: fmt(pg),
    probOctavos: fmt(po),
    probCuartos: fmt(pc),
    probSemi: fmt(ps),
    probFinal: fmt(pf),
    probCampeon: fmt(pcamp),
    resumen: `**${data.nombre}** (Bombo ${data.bombo}): ${fmt(pg)} pasa fase de grupos, ${fmt(po)} llega a octavos, ${fmt(pc)} a cuartos, ${fmt(ps)} a semis, ${fmt(pf)} a final, ${fmt(pcamp)} es campeón.`,
  };
}
