/** Cálculo de espacio útil en array RAID */
export interface Inputs { cantidadDiscos: number; tamanoDisco: number; nivelRaid?: string; }
export interface Outputs { espacioUtil: number; espacioTotal: number; espacioPerdido: number; toleranciaFallas: number; detalle: string; _insight?: any; _chart?: any; }

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
  const eficiencia = total > 0 ? (util / total) * 100 : 0;

  // --- Insight: eficiencia vs redundancia ---
  let insightText: string;
  let insightTone: "good" | "warn" | "neutral";
  if (tolerancia === 0) {
    insightText = `${nombreRaid} aprovecha el **100%** del espacio (${util.toFixed(1)} TB útiles), pero **no tolera ninguna falla**: si un solo disco muere, perdés todos los datos. Sirve para velocidad o datos descartables, no para respaldo.`;
    insightTone = "warn";
  } else if (eficiencia <= 55) {
    insightText = `${nombreRaid} te deja **${util.toFixed(1)} TB útiles** de ${total.toFixed(1)} TB (${eficiencia.toFixed(0)}% de aprovechamiento): sacrificás **${perdido.toFixed(1)} TB** a cambio de tolerar ${tolerancia} disco(s) fallando. Es seguridad cara en espacio.`;
    insightTone = "neutral";
  } else {
    insightText = `${nombreRaid} logra un buen equilibrio: **${util.toFixed(1)} TB útiles** (${eficiencia.toFixed(0)}% del total) tolerando **${tolerancia} disco(s)** fallando. Solo ${perdido.toFixed(1)} TB se van en redundancia.`;
    insightTone = "good";
  }

  const _insight = {
    title: "Espacio útil vs. redundancia",
    text: insightText,
    tone: insightTone,
    icon: "💽",
  };

  // --- Donut: útil + redundancia suman el total bruto ---
  const _chart = perdido > 0 ? {
    type: "doughnut",
    slices: [
      { label: "Útil", value: Number(util.toFixed(2)) },
      { label: "Redundancia", value: Number(perdido.toFixed(2)) },
    ],
    suffix: " TB",
    centerValue: `${util.toFixed(1)} TB`,
    centerLabel: "útiles",
    ariaLabel: `De ${total.toFixed(1)} TB brutos, ${util.toFixed(1)} TB son útiles y ${perdido.toFixed(1)} TB van a redundancia`,
  } : undefined;

  return {
    espacioUtil: Number(util.toFixed(2)),
    espacioTotal: Number(total.toFixed(2)),
    espacioPerdido: Number(perdido.toFixed(2)),
    toleranciaFallas: tolerancia,
    detalle: `${nombreRaid} con ${n}× ${tamano} TB: ${util.toFixed(1)} TB útiles de ${total.toFixed(1)} TB brutos. ${perdido.toFixed(1)} TB usados para redundancia. Tolera ${tolerancia} disco(s) fallando.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
