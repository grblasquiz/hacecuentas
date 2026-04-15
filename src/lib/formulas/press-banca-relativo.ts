/** Press de banca relativo al peso corporal (ratio) */
export interface Inputs {
  rmKg: number;
  pesoCorporal: number;
  sexo: string; // 'hombre' | 'mujer'
  experiencia: string; // 'principiante' | 'intermedio' | 'avanzado' | 'elite'
}

export interface Outputs {
  ratio: number;
  categoria: string;
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

export function pressBancaRelativo(i: Inputs): Outputs {
  const rm = Number(i.rmKg);
  const peso = Number(i.pesoCorporal);
  const sexo = String(i.sexo || 'hombre');
  const exp = String(i.experiencia || 'intermedio');

  if (!rm || rm <= 0) throw new Error('Ingresá tu 1RM de press de banca');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal');

  const ratio = rm / peso;
  const standards = STANDARDS[sexo] || STANDARDS.hombre;

  let cat = 'Principiante';
  if (ratio >= standards.elite) cat = 'Elite (atleta competitivo)';
  else if (ratio >= standards.avanzado) cat = 'Avanzado';
  else if (ratio >= standards.intermedio) cat = 'Intermedio';
  else if (ratio >= standards.novato) cat = 'Novato (con algo de experiencia)';
  else cat = 'Principiante';

  const esperado = standards[exp] || standards.intermedio;
  const rmEsperado = esperado * peso;
  const dif = rm - rmEsperado;

  return {
    ratio: Number(ratio.toFixed(2)),
    categoria: cat,
    rmEsperadoParaTuNivel: Math.round(rmEsperado),
    diferencia: Math.round(dif),
    resumen: `Tu ratio press banca es **${ratio.toFixed(2)}x tu peso corporal** → nivel **${cat}**. Esperado para ${exp}: ${Math.round(rmEsperado)} kg (${dif >= 0 ? '+' : ''}${Math.round(dif)} kg).`,
  };
}
