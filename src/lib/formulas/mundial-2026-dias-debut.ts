/** Mundial 2026: días hasta el debut de cada selección en fase de grupos */
export interface Inputs {
  seleccion: string;
  fechaHoy?: string;
}

export interface Outputs {
  dias: number;
  fechaDebut: string;
  rivalDebut: string;
  sede: string;
  horarioBsAs: string;
  resumen: string;
  _insight?: any;
}

// Debuts REALES del Mundial 2026 (fase de grupos, 11–17 jun; todos jugados).
// Resultado entre paréntesis desde la perspectiva de la selección.
// Fuente: fixture openfootball (src/lib/data/mundial-2026-fixture.json), actualizado 2-jul-2026.
const DEBUTS: Record<string, { fecha: string; rival: string; sede: string; hora: string }> = {
  argentina: { fecha: '2026-06-16', rival: 'Argelia (ganó 3-0)', sede: 'Arrowhead Stadium, Kansas City', hora: '22:00 BsAs' },
  brasil: { fecha: '2026-06-13', rival: 'Marruecos (empató 1-1)', sede: 'MetLife Stadium, NJ', hora: '19:00 BsAs' },
  uruguay: { fecha: '2026-06-15', rival: 'Arabia Saudita (empató 1-1)', sede: 'Hard Rock Stadium, Miami', hora: '19:00 BsAs' },
  mexico: { fecha: '2026-06-11', rival: 'Sudáfrica (ganó 2-0, inaugural)', sede: 'Estadio Azteca, CDMX', hora: '16:00 BsAs' },
  usa: { fecha: '2026-06-12', rival: 'Paraguay (ganó 4-1)', sede: 'SoFi Stadium, Los Angeles', hora: '22:00 BsAs' },
  canada: { fecha: '2026-06-12', rival: 'Bosnia y Herzegovina (empató 1-1)', sede: 'BMO Field, Toronto', hora: '16:00 BsAs' },
  francia: { fecha: '2026-06-16', rival: 'Senegal (ganó 3-1)', sede: 'MetLife Stadium, NJ', hora: '16:00 BsAs' },
  inglaterra: { fecha: '2026-06-17', rival: 'Croacia (ganó 4-2)', sede: 'AT&T Stadium, Dallas', hora: '17:00 BsAs' },
  espana: { fecha: '2026-06-15', rival: 'Cabo Verde (empató 0-0)', sede: 'Mercedes-Benz Stadium, Atlanta', hora: '13:00 BsAs' },
  portugal: { fecha: '2026-06-17', rival: 'RD del Congo (empató 1-1)', sede: 'NRG Stadium, Houston', hora: '14:00 BsAs' },
  alemania: { fecha: '2026-06-14', rival: 'Curazao (ganó 7-1)', sede: 'NRG Stadium, Houston', hora: '14:00 BsAs' },
  'paises-bajos': { fecha: '2026-06-14', rival: 'Japón (empató 2-2)', sede: 'AT&T Stadium, Dallas', hora: '17:00 BsAs' },
  belgica: { fecha: '2026-06-15', rival: 'Egipto (empató 1-1)', sede: 'Lumen Field, Seattle', hora: '16:00 BsAs' },
  croacia: { fecha: '2026-06-17', rival: 'Inglaterra (perdió 2-4)', sede: 'AT&T Stadium, Dallas', hora: '17:00 BsAs' },
  colombia: { fecha: '2026-06-17', rival: 'Uzbekistán (ganó 3-1)', sede: 'Estadio Azteca, CDMX', hora: '23:00 BsAs' },
  ecuador: { fecha: '2026-06-14', rival: 'Costa de Marfil (perdió 0-1)', sede: 'Lincoln Financial Field, Filadelfia', hora: '20:00 BsAs' },
  paraguay: { fecha: '2026-06-12', rival: 'Estados Unidos (perdió 1-4)', sede: 'SoFi Stadium, Los Angeles', hora: '22:00 BsAs' },
  marruecos: { fecha: '2026-06-13', rival: 'Brasil (empató 1-1)', sede: 'MetLife Stadium, NJ', hora: '19:00 BsAs' },
  japon: { fecha: '2026-06-14', rival: 'Países Bajos (empató 2-2)', sede: 'AT&T Stadium, Dallas', hora: '17:00 BsAs' },
  'corea-del-sur': { fecha: '2026-06-11', rival: 'República Checa (ganó 2-1)', sede: 'Estadio Akron, Guadalajara', hora: '23:00 BsAs' },
};

export function mundial2026DiasDebut(i: Inputs): Outputs {
  const sel = String(i.seleccion || 'argentina').toLowerCase();
  const data = DEBUTS[sel];
  if (!data) throw new Error('Selección no encontrada. Elegí una opción del listado.');

  const hoyStr = String(i.fechaHoy || '').trim();
  const hoy = hoyStr ? new Date(hoyStr + 'T00:00:00') : new Date();
  hoy.setHours(0, 0, 0, 0);
  const debut = new Date(data.fecha + 'T00:00:00');
  if (isNaN(hoy.getTime()) || isNaN(debut.getTime())) throw new Error('Fecha inválida');

  const MS = 86400000;
  const dias = Math.round((debut.getTime() - hoy.getTime()) / MS);

  const nombre = sel.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const estado = dias > 0 ? `faltan **${dias} días**` : dias === 0 ? '**debuta hoy**' : `el debut fue hace **${Math.abs(dias)} días**`;

  const semanas = Math.floor(Math.abs(dias) / 7);
  const _insight = {
    title: `Debut de ${nombre}`,
    text: dias > 0
      ? `Faltan **${dias} días**${semanas >= 1 ? ` (unas ${semanas} semana${semanas === 1 ? '' : 's'})` : ''} para el debut de **${nombre}** ante ${data.rival}, el ${data.fecha} en ${data.sede}. Horario: ${data.hora}.`
      : dias === 0
        ? `**${nombre} debuta hoy** ante ${data.rival} en ${data.sede}. Horario: ${data.hora}.`
        : `El debut de **${nombre}** ya fue hace **${Math.abs(dias)} días** (${data.fecha}), ante ${data.rival} en ${data.sede}.`,
    tone: dias === 0 ? 'good' : 'neutral',
    icon: dias === 0 ? '⚽' : '📅',
  };

  return {
    dias,
    fechaDebut: data.fecha,
    rivalDebut: data.rival,
    sede: data.sede,
    horarioBsAs: data.hora,
    resumen: `Para el debut de **${nombre}** en el Mundial 2026 ${estado}. Fecha: ${data.fecha}, rival: ${data.rival}, sede: ${data.sede}.`,
    _insight,
  };
}
