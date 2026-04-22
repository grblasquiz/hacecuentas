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

  return {
    xDestino: xd,
    yDestino: yd,
    zDestino: zd,
    mundoDestino: dest,
    resumen: `Construí el portal en **${dest}** en coordenadas **X=${xd}, Y=${yd}, Z=${zd}** para alinear con (${x}, ${y}, ${z}).`,
  };
}
