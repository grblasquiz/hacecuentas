/** Mundial 2026 - Cupos por Confederación */
export interface Inputs { confederacion: string; }
export interface Outputs { cuposDirectos: string; repechaje: string; totalPotencial: string; resumen: string; }

const DATA: Record<string, { directos: number; rep: number; nota: string }> = {
  'UEFA': { directos: 16, rep: 0, nota: 'UEFA no va al repechaje intercontinental; tiene su propio repechaje interno.' },
  'CONMEBOL': { directos: 6, rep: 1, nota: 'Seis primeros clasifican directo. El 7° juega repechaje intercontinental.' },
  'CONCACAF': { directos: 6, rep: 1, nota: 'USA, Canadá y México ya clasificados como anfitriones (no cuentan en los 6).' },
  'AFC': { directos: 8, rep: 1, nota: 'Asia pasó de 4+1 en 2022 a 8+1 en 2026.' },
  'CAF': { directos: 9, rep: 1, nota: 'África tiene ahora 9 directos + 1 repechaje, récord histórico.' },
  'OFC': { directos: 1, rep: 1, nota: 'Oceanía obtiene su primer cupo directo (antes siempre repechaje).' },
};

export function mundial2026CuposConfederacion(i: Inputs): Outputs {
  const c = String(i.confederacion || '');
  const key = c.split(' ')[0].toUpperCase();
  const d = DATA[key];
  if (!d) throw new Error('Confederación inválida');
  return {
    cuposDirectos: `${d.directos} cupos directos`,
    repechaje: d.rep > 0 ? `${d.rep} plaza(s) a repechaje intercontinental` : 'Sin plazas a repechaje intercontinental',
    totalPotencial: `Hasta ${d.directos + d.rep} selecciones de ${key}`,
    resumen: `${key} Mundial 2026: ${d.directos} directos + ${d.rep} repechaje. ${d.nota}`,
  };
}
