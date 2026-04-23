/** Mundial 2026: fixture de 16avos según posición en el grupo */
export interface Inputs {
  grupo: string; // 'A' ... 'L'
  posicion: string; // '1' | '2' | '3'
}

export interface Outputs {
  rivalTipo: string;
  proximoRival: string;
  ladoBracket: string;
  posibleOctavos: string;
  caminoFinal: string;
  resumen: string;
}

// Bracket simplificado del Mundial 2026 (48 equipos, 32 clasifican)
// Mapeo aproximado basado en distribución FIFA oficial
const CRUCES_16AVOS: Record<string, { rival: string; lado: string; octavos: string }> = {
  // 1ros del grupo vs mejores terceros (teórico más "accesible")
  'A-1': { rival: '3er mejor de grupos C/D/E/F', lado: 'Superior', octavos: 'Ganador 2do B vs 2do F' },
  'B-1': { rival: '3er mejor de grupos A/C/E', lado: 'Superior', octavos: 'Ganador 1ro A vs 3er mejor' },
  'C-1': { rival: '3er mejor de grupos D/E/F', lado: 'Superior', octavos: 'Ganador 2do D vs 2do E' },
  'D-1': { rival: '3er mejor de grupos B/E/F', lado: 'Superior', octavos: 'Ganador 1ro C vs 3er mejor' },
  'E-1': { rival: '3er mejor de grupos A/D/F', lado: 'Inferior', octavos: 'Ganador 2do F vs 2do H' },
  'F-1': { rival: '3er mejor de grupos B/C/E', lado: 'Inferior', octavos: 'Ganador 1ro E vs 3er mejor' },
  'G-1': { rival: '3er mejor de grupos H/I/J', lado: 'Inferior', octavos: 'Ganador 2do H vs 2do J' },
  'H-1': { rival: '3er mejor de grupos G/I/K', lado: 'Inferior', octavos: 'Ganador 1ro G vs 3er mejor' },
  'I-1': { rival: '3er mejor de grupos J/K/L', lado: 'Inferior', octavos: 'Ganador 2do J vs 2do L' },
  'J-1': { rival: '3er mejor de grupos G/I/L', lado: 'Inferior', octavos: 'Ganador 1ro I vs 3er mejor' },
  'K-1': { rival: '3er mejor de grupos H/I/L', lado: 'Inferior', octavos: 'Ganador 2do L vs 2do J' },
  'L-1': { rival: '3er mejor de grupos G/H/K', lado: 'Inferior', octavos: 'Ganador 1ro K vs 3er mejor' },
  // 2dos del grupo vs otros 2dos
  'A-2': { rival: '2do del Grupo F', lado: 'Superior', octavos: 'Ganador 1ro B vs 3er mejor' },
  'B-2': { rival: '2do del Grupo E', lado: 'Superior', octavos: 'Ganador 1ro F vs 3er mejor' },
  'C-2': { rival: '2do del Grupo D', lado: 'Superior', octavos: 'Ganador 1ro A vs 3er mejor' },
  'D-2': { rival: '2do del Grupo C', lado: 'Superior', octavos: 'Ganador 1ro E vs 3er mejor' },
  'E-2': { rival: '2do del Grupo B', lado: 'Inferior', octavos: 'Ganador 1ro D vs 3er mejor' },
  'F-2': { rival: '2do del Grupo A', lado: 'Inferior', octavos: 'Ganador 1ro H vs 3er mejor' },
  'G-2': { rival: '2do del Grupo L', lado: 'Inferior', octavos: 'Ganador 1ro J vs 3er mejor' },
  'H-2': { rival: '2do del Grupo K', lado: 'Inferior', octavos: 'Ganador 1ro I vs 3er mejor' },
  'I-2': { rival: '2do del Grupo J', lado: 'Inferior', octavos: 'Ganador 1ro L vs 3er mejor' },
  'J-2': { rival: '2do del Grupo I', lado: 'Inferior', octavos: 'Ganador 1ro G vs 3er mejor' },
  'K-2': { rival: '2do del Grupo H', lado: 'Inferior', octavos: 'Ganador 1ro L vs 3er mejor' },
  'L-2': { rival: '2do del Grupo G', lado: 'Inferior', octavos: 'Ganador 1ro K vs 3er mejor' },
};

export function mundial2026FixtureOctavos(i: Inputs): Outputs {
  const grupo = String(i.grupo || 'A').toUpperCase();
  const pos = String(i.posicion || '1');

  if (!/^[A-L]$/.test(grupo)) throw new Error('Grupo debe ser A-L.');
  if (!/^[123]$/.test(pos)) throw new Error('Posición debe ser 1, 2 o 3.');

  // Para 3er mejor, el cruce es siempre vs un 1er de grupo (asignado por ranking global)
  if (pos === '3') {
    return {
      rivalTipo: '1er de otro grupo',
      proximoRival: 'Un 1er de grupo (según ranking de los 8 mejores terceros)',
      ladoBracket: 'Asignado al terminar fase de grupos',
      posibleOctavos: 'Ganador 2do de grupo vs 2do de otro grupo',
      caminoFinal: '16avos (vs 1ro) → octavos → cuartos → semi → final. Camino difícil: siempre enfrentás al 1er del grupo en tu primera ronda.',
      resumen: `Como **3er mejor del Grupo ${grupo}**, tu rival en 16avos es **un 1er de grupo** (asignado por ranking FIFA entre los 8 mejores terceros). El cruce exacto se define al terminar la fase de grupos.`,
    };
  }

  const key = `${grupo}-${pos}`;
  const data = CRUCES_16AVOS[key];
  if (!data) throw new Error('Combinación inválida.');

  const posLabel = pos === '1' ? '1er' : '2do';
  const camino = pos === '1'
    ? '16avos (vs mejor tercero) → octavos → cuartos → semi → final. Camino más favorable en 16avos.'
    : '16avos (vs otro 2do) → octavos → cuartos → semi → final. Cruces de nivel similar en 16avos.';

  return {
    rivalTipo: pos === '1' ? 'Mejor tercero' : '2do de otro grupo',
    proximoRival: data.rival,
    ladoBracket: data.lado,
    posibleOctavos: data.octavos,
    caminoFinal: camino,
    resumen: `Como **${posLabel} del Grupo ${grupo}**, en 16avos jugás contra: **${data.rival}**. Lado del bracket: ${data.lado}. En octavos posible rival: ${data.octavos}.`,
  };
}
