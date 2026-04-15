/** Cálculo de espacio útil en array RAID */
export interface Inputs { cantidadDiscos: number; tamanoDisco: number; nivelRaid?: string; }
export interface Outputs { espacioUtil: number; espacioTotal: number; espacioPerdido: number; toleranciaFallas: number; detalle: string; }

export function raidAlmacenamientoUtilDiscos(i: Inputs): Outputs {
  const n = Math.floor(Number(i.cantidadDiscos));
  const tamano = Number(i.tamanoDisco);
  const nivel = String(i.nivelRaid || '5');

  if (!n || n < 2) throw new Error('Necesitás al menos 2 discos');
  if (!tamano || tamano <= 0) throw new Error('Ingresá el tamaño de disco en TB');

  const total = n * tamano;
  let util: number;
  let tolerancia: number;
  let nombreRaid: string;

  switch (nivel) {
    case '0':
      util = total;
      tolerancia = 0;
      nombreRaid = 'RAID 0 (Stripe)';
      break;
    case '1':
      util = tamano;
      tolerancia = n - 1;
      nombreRaid = 'RAID 1 (Mirror)';
      break;
    case '5':
      if (n < 3) throw new Error('RAID 5 necesita mínimo 3 discos');
      util = (n - 1) * tamano;
      tolerancia = 1;
      nombreRaid = 'RAID 5';
      break;
    case '6':
      if (n < 4) throw new Error('RAID 6 necesita mínimo 4 discos');
      util = (n - 2) * tamano;
      tolerancia = 2;
      nombreRaid = 'RAID 6';
      break;
    case '10':
      if (n < 4 || n % 2 !== 0) throw new Error('RAID 10 necesita mínimo 4 discos (cantidad par)');
      util = (n / 2) * tamano;
      tolerancia = 1; // al menos 1 por mirror
      nombreRaid = 'RAID 10 (Mirror+Stripe)';
      break;
    default:
      throw new Error('Nivel RAID no soportado. Usá: 0, 1, 5, 6 o 10');
  }

  const perdido = total - util;

  return {
    espacioUtil: Number(util.toFixed(2)),
    espacioTotal: Number(total.toFixed(2)),
    espacioPerdido: Number(perdido.toFixed(2)),
    toleranciaFallas: tolerancia,
    detalle: `${nombreRaid} con ${n}× ${tamano} TB: ${util.toFixed(1)} TB útiles de ${total.toFixed(1)} TB brutos. ${perdido.toFixed(1)} TB usados para redundancia. Tolera ${tolerancia} disco(s) fallando.`,
  };
}
