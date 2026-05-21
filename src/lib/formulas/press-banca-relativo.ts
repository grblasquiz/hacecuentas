/** Press de banca relativo al peso corporal (ratio) */
export interface Inputs {
  rmKg: number;
  pesoCorporal: number;
  sexo: string; // 'hombre' | 'mujer'
  experiencia?: string; // 'principiante' | 'intermedio' | 'avanzado' | 'elite'
}

export interface Outputs {
  ratio: number;
  categoria: string;
  siguienteCategoria: string;
  kgFaltantes: number;
  rmEsperadoParaTuNivel: number;
  diferencia: number;
  resumen: string;
}

// Estándares relativos (1RM / peso corporal) - Strength Level / Symmetric Strength
const STANDARDS: Record<string, Record<string, number>> = {
  hombre: {
    principiante: 0.75,
    novato: 1.10,
    intermedio: 1.50,
    avanzado: 1.90,
    elite: 2.30,
  },
  mujer: {
    principiante: 0.40,
    novato: 0.65,
    intermedio: 0.90,
    avanzado: 1.20,
    elite: 1.50,
  },
};

// Tiers ordenados de menor a mayor para calcular la próxima categoría
const TIER_ORDER: Array<{ key: string; label: string }> = [
  { key: 'principiante', label: 'Principiante' },
  { key: 'novato', label: 'Novato' },
  { key: 'intermedio', label: 'Intermedio' },
  { key: 'avanzado', label: 'Avanzado' },
  { key: 'elite', label: 'Elite' },
];

export function pressBancaRelativo(i: Inputs): Outputs {
  const rm = Number(i.rmKg);
  const peso = Number(i.pesoCorporal);
  const sexo = String(i.sexo || 'hombre');
  const exp = String(i.experiencia || 'intermedio');

  if (!rm || rm <= 0) throw new Error('Ingresá tu 1RM de press de banca');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal');

  const ratio = rm / peso;
  const standards = STANDARDS[sexo] || STANDARDS.hombre;

  // Categoría actual
  let cat = 'Principiante';
  let currentTierIdx = 0;
  if (ratio >= standards.elite) { cat = 'Elite (atleta competitivo)'; currentTierIdx = 4; }
  else if (ratio >= standards.avanzado) { cat = 'Avanzado'; currentTierIdx = 3; }
  else if (ratio >= standards.intermedio) { cat = 'Intermedio'; currentTierIdx = 2; }
  else if (ratio >= standards.novato) { cat = 'Novato (con algo de experiencia)'; currentTierIdx = 1; }
  else { cat = 'Principiante'; currentTierIdx = 0; }

  // Siguiente categoría y kg faltantes
  let siguienteCategoria = '';
  let kgFaltantes = 0;
  if (currentTierIdx >= TIER_ORDER.length - 1) {
    siguienteCategoria = 'Ya alcanzaste el nivel Elite. Mantenelo o apuntá a competición.';
    kgFaltantes = 0;
  } else {
    const nextTier = TIER_ORDER[currentTierIdx + 1];
    const ratioObjetivo = standards[nextTier.key];
    const rmObjetivo = ratioObjetivo * peso;
    kgFaltantes = Math.max(0, Math.round(rmObjetivo - rm));
    siguienteCategoria = `${nextTier.label} (ratio ${ratioObjetivo.toFixed(2)}x = ${Math.round(rmObjetivo)} kg)`;
  }

  const esperado = standards[exp] || standards.intermedio;
  const rmEsperado = esperado * peso;
  const dif = rm - rmEsperado;

  return {
    ratio: Number(ratio.toFixed(2)),
    categoria: cat,
    siguienteCategoria,
    kgFaltantes,
    rmEsperadoParaTuNivel: Math.round(rmEsperado),
    diferencia: Math.round(dif),
    resumen: `Tu ratio press banca es **${ratio.toFixed(2)}x tu peso corporal** → nivel **${cat}**. ${kgFaltantes > 0 ? `Para subir a ${siguienteCategoria}, sumá ${kgFaltantes} kg.` : 'Ya estás en el tope de los estándares.'}`,
  };
}
