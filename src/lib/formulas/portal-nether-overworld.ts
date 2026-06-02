/** Minecraft Nether ↔ Overworld portal coordinates converter */
export interface Inputs {
  direccion: string; // 'overworld-to-nether' | 'nether-to-overworld'
  x: number;
  y: number;
  z: number;
}

export interface Outputs {
  xDestino: number;
  yDestino: number;
  zDestino: number;
  mundoDestino: string;
  resumen: string;
  _insight?: any;
}

export function portalNetherOverworld(i: Inputs): Outputs {
  const x = Number(i.x);
  const y = Number(i.y);
  const z = Number(i.z);
  const dir = String(i.direccion || 'overworld-to-nether');

  if (!isFinite(x) || !isFinite(y) || !isFinite(z)) throw new Error('Ingresá coordenadas X, Y, Z');

  let xd: number, yd: number, zd: number, dest: string;
  if (dir === 'overworld-to-nether') {
    xd = Math.floor(x / 8);
    zd = Math.floor(z / 8);
    yd = y; // Y se preserva (idealmente 70-120 en Nether)
    dest = 'Nether';
  } else {
    xd = x * 8;
    zd = z * 8;
    yd = y;
    dest = 'Overworld';
  }

  const _insight = {
    title: 'Coordenadas del portal',
    text: dir === 'overworld-to-nether'
      ? `1 bloque en el Nether equivale a 8 en el Overworld, por eso dividís X y Z entre 8: armá el portal en **X=${xd}, Z=${zd}** (Nether) para salir cerca de (${x}, ${z}) arriba. Construí ambos portales en estas coordenadas para que se enlacen.`
      : `Cada bloque del Nether vale 8 en el Overworld, así que multiplicás X y Z por 8: tu portal del Overworld va en **X=${xd}, Z=${zd}**. Construí ambos portales en estas coordenadas para que se enlacen.`,
    tone: 'neutral',
    icon: '🌀',
  };

  return {
    xDestino: xd,
    yDestino: yd,
    zDestino: zd,
    mundoDestino: dest,
    resumen: `Construí el portal en **${dest}** en coordenadas **X=${xd}, Y=${yd}, Z=${zd}** para alinear con (${x}, ${y}, ${z}).`,
    _insight,
  };
}
