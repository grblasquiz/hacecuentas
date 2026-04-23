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
}

// Fechas de debut basadas en estimación post-sorteo FIFA 2026 (ventana 8-16 junio)
// Datos estimados hasta confirmación sorteo final. Actualizar tras diciembre 2025.
const DEBUTS: Record<string, { fecha: string; rival: string; sede: string; hora: string }> = {
  argentina: { fecha: '2026-06-13', rival: 'Rival Bombo 4 (Grupo A/B)', sede: 'MetLife Stadium, NJ, USA', hora: '21:00 BsAs' },
  brasil: { fecha: '2026-06-14', rival: 'Rival Bombo 4 (CAF/AFC)', sede: 'SoFi Stadium, Los Angeles', hora: '22:00 BsAs' },
  uruguay: { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'AT&T Stadium, Dallas', hora: '21:00 BsAs' },
  mexico: { fecha: '2026-06-11', rival: 'Partido inaugural', sede: 'Estadio Azteca, CDMX', hora: '21:00 BsAs' },
  usa: { fecha: '2026-06-12', rival: 'Rival Bombo 4', sede: 'SoFi Stadium, Los Angeles', hora: '22:00 BsAs' },
  canada: { fecha: '2026-06-12', rival: 'Rival Bombo 4', sede: 'BMO Field, Toronto', hora: '19:00 BsAs' },
  francia: { fecha: '2026-06-13', rival: 'Rival Bombo 4', sede: 'Gillette Stadium, Boston', hora: '16:00 BsAs' },
  inglaterra: { fecha: '2026-06-14', rival: 'Rival Bombo 4', sede: 'Hard Rock Stadium, Miami', hora: '16:00 BsAs' },
  espana: { fecha: '2026-06-14', rival: 'Rival Bombo 4', sede: 'Lincoln Financial, Philadelphia', hora: '16:00 BsAs' },
  portugal: { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'Mercedes-Benz, Atlanta', hora: '16:00 BsAs' },
  alemania: { fecha: '2026-06-14', rival: 'Rival Bombo 4', sede: 'Arrowhead, Kansas City', hora: '19:00 BsAs' },
  'paises-bajos': { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'Lumen Field, Seattle', hora: '22:00 BsAs' },
  belgica: { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'NRG Stadium, Houston', hora: '20:00 BsAs' },
  croacia: { fecha: '2026-06-16', rival: 'Rival Bombo 4', sede: 'BC Place, Vancouver', hora: '21:00 BsAs' },
  colombia: { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'Estadio Akron, Guadalajara', hora: '21:00 BsAs' },
  ecuador: { fecha: '2026-06-16', rival: 'Rival Bombo 4', sede: 'Estadio BBVA, Monterrey', hora: '21:00 BsAs' },
  paraguay: { fecha: '2026-06-16', rival: 'Rival Bombo 4', sede: 'Estadio Akron, Guadalajara', hora: '20:00 BsAs' },
  marruecos: { fecha: '2026-06-15', rival: 'Rival Bombo 4', sede: 'AT&T Stadium, Dallas', hora: '18:00 BsAs' },
  japon: { fecha: '2026-06-16', rival: 'Rival Bombo 4', sede: 'Lumen Field, Seattle', hora: '23:00 BsAs' },
  'corea-del-sur': { fecha: '2026-06-16', rival: 'Rival Bombo 4', sede: 'NRG Stadium, Houston', hora: '20:00 BsAs' },
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

  return {
    dias,
    fechaDebut: data.fecha,
    rivalDebut: data.rival,
    sede: data.sede,
    horarioBsAs: data.hora,
    resumen: `Para el debut de **${nombre}** en el Mundial 2026 ${estado}. Fecha: ${data.fecha}, rival: ${data.rival}, sede: ${data.sede}.`,
  };
}
