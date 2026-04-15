/** Dosis orientativa de ibuprofeno según peso — NO reemplaza consulta médica */
export interface Inputs {
  peso: number;
  edad?: string;
}
export interface Outputs {
  dosisPorToma: string;
  dosisMaximaDiaria: string;
  intervaloHoras: string;
  advertencia: string;
}

export function dosisIbuprofeno(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const edad = String(i.edad || 'adulto');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  if (edad === 'nino') {
    const dosisMin = peso * 5;
    const dosisMax = peso * 10;
    const maxDiario = peso * 40;

    return {
      dosisPorToma: `${fmt.format(dosisMin)} – ${fmt.format(dosisMax)} mg`,
      dosisMaximaDiaria: `${fmt.format(maxDiario)} mg/día (${fmt.format(Math.min(maxDiario, 1200))} mg máx absoluto)`,
      intervaloHoras: 'Cada 6 a 8 horas',
      advertencia: '⚠️ ORIENTATIVO — Consultá siempre con el pediatra. No dar a menores de 6 meses. Tomar con comida.',
    };
  }

  // Adultos
  const dosisHabitual = Math.min(400, Math.max(200, Math.round(peso * 5)));
  const maxDiario = 1200;

  return {
    dosisPorToma: `${fmt.format(dosisHabitual)} mg (rango: 200–400 mg)`,
    dosisMaximaDiaria: `${fmt.format(maxDiario)} mg/día (sin receta)`,
    intervaloHoras: 'Cada 6 a 8 horas',
    advertencia: '⚠️ ORIENTATIVO — No reemplaza la consulta médica. No usar más de 3-5 días sin control médico. Tomar con comida.',
  };
}
