/** Tiempo añadido promedio (descuento) por tiempo — tendencia post Qatar 2022 */
export interface Inputs {
  competencia: string;
  cantGoles: number;
  cantCambios: number;
  incidentesVar: number;
  atencionMedica: number;
}
export interface Outputs {
  tiempoAnadidoEstimadoT1: string;
  tiempoAnadidoEstimadoT2: string;
  tiempoTotalPartido: string;
  referenciaHistorica: string;
  mensaje: string;
}

export function tiempoAnadidoPromedio(i: Inputs): Outputs {
  const comp = String(i.competencia || 'mundial-fifa');
  const goles = Number(i.cantGoles) || 0;
  const cambios = Number(i.cantCambios) || 0;
  const var_ = Number(i.incidentesVar) || 0;
  const medica = Number(i.atencionMedica) || 0;

  // Promedios por competencia (tendencia 2024-2026 post instrucción FIFA Qatar 2022)
  const promedios: Record<string, { t1: number; t2: number; base: string }> = {
    'mundial-fifa': { t1: 8, t2: 10, base: 'Mundial Qatar 2022 promedio histórico: 7.5-10 min/tiempo añadido.' },
    'copa-america': { t1: 6, t2: 8, base: 'Copa América 2024: 5.5-7 min/tiempo.' },
    'libertadores': { t1: 5, t2: 7, base: 'Conmebol Libertadores 2024: 5-7 min/tiempo.' },
    'champions-league': { t1: 5, t2: 7, base: 'UEFA Champions 2023-24: 5-7 min/tiempo.' },
    'premier-league': { t1: 8, t2: 10, base: 'Premier League 2023-24 (post Qatar): ~8-10 min/tiempo.' },
    'laliga': { t1: 5, t2: 7, base: 'LaLiga 2023-24: 5-7 min/tiempo.' },
    'serie-a': { t1: 5, t2: 7, base: 'Serie A 2023-24: 5-6 min/tiempo.' },
    'liga-argentina': { t1: 4, t2: 6, base: 'Liga Profesional Argentina: 4-6 min/tiempo.' }
  };

  const p = promedios[comp] || promedios['mundial-fifa'];

  // Modelo lineal simple: gol=60s, cambio=30s, VAR=75s, atención médica=60s. Distribuimos mitad en cada tiempo.
  const segExtra = goles * 60 + cambios * 30 + var_ * 75 + medica * 60;
  const minExtra = segExtra / 60;

  // Añadimos al baseline por tiempo (mitad al primero, mitad al segundo)
  const t1Est = Math.max(p.t1, Math.round((p.t1 * 0.6 + minExtra * 0.3) * 10) / 10);
  const t2Est = Math.max(p.t2, Math.round((p.t2 * 0.7 + minExtra * 0.7) * 10) / 10);

  const total = 90 + t1Est + t2Est;

  return {
    tiempoAnadidoEstimadoT1: `${t1Est} minutos aprox en el primer tiempo.`,
    tiempoAnadidoEstimadoT2: `${t2Est} minutos aprox en el segundo tiempo.`,
    tiempoTotalPartido: `${Math.round(total * 10) / 10} minutos de duración total estimada (sin prórroga).`,
    referenciaHistorica: p.base,
    mensaje: `${comp}: ${t1Est}' + ${t2Est}' añadidos. Instrucción FIFA post-Qatar 2022 = descuento estricto por todos los incidentes.`
  };
}
