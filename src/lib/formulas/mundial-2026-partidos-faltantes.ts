/** Mundial 2026 - Partidos faltantes según fase */
export interface Inputs { fase: string; }
export interface Outputs { partidosFaltantes: string; camino: string; resumen: string; }

const FASES: Record<string, { faltantes: number; camino: string[] }> = {
  'grupos1': { faltantes: 6, camino: ['Grupos (p2)', 'Grupos (p3)', '16avos', '8vos', '4tos', 'Semi', 'Final'] },
  'grupos2': { faltantes: 5, camino: ['Grupos (p3)', '16avos', '8vos', '4tos', 'Semi', 'Final'] },
  'grupos3': { faltantes: 4, camino: ['16avos', '8vos', '4tos', 'Semi', 'Final'] },
  '16avos': { faltantes: 5, camino: ['16avos', '8vos', '4tos', 'Semi', 'Final'] },
  'octavos': { faltantes: 4, camino: ['8vos', '4tos', 'Semi', 'Final'] },
  'cuartos': { faltantes: 3, camino: ['4tos', 'Semi', 'Final'] },
  'semifinal': { faltantes: 2, camino: ['Semi', 'Final'] },
  'final': { faltantes: 1, camino: ['Final'] },
};

function mapFase(fase: string): keyof typeof FASES {
  const f = fase.toLowerCase();
  if (f.includes('partido 1')) return 'grupos1';
  if (f.includes('partido 2')) return 'grupos2';
  if (f.includes('partido 3')) return 'grupos3';
  if (f.includes('dieciseisavos') || f.includes('16')) return '16avos';
  if (f.includes('octavos')) return 'octavos';
  if (f.includes('cuartos')) return 'cuartos';
  if (f.includes('semi')) return 'semifinal';
  if (f.includes('final')) return 'final';
  return 'grupos1';
}

export function mundial2026PartidosFaltantes(i: Inputs): Outputs {
  const key = mapFase(String(i.fase || ''));
  const d = FASES[key];
  // Para "grupos1/2/3", el partido actual cuenta; faltantes incluye los siguientes.
  // Para playoff, el partido actual cuenta como 1 de los faltantes.
  const total = (key.startsWith('grupos')) ? d.faltantes : d.camino.length;
  return {
    partidosFaltantes: `${total} partido(s) para salir campeón`,
    camino: d.camino.join(' → '),
    resumen: `Si gana todos los partidos restantes, son ${total} partido(s) incluyendo eliminación directa. Campeón 2026 juega 7 partidos en total.`,
  };
}
