/** Carta natal básica — Big Three simplificado */
export interface Inputs { fechaNacimiento: string; horaNacimiento: number; }
export interface Outputs { sol: string; luna: string; ascendente: string; resumen: string; }

const S = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
const RANGOS: [number,number][] = [[3,21],[4,20],[5,21],[6,21],[7,23],[8,23],[9,23],[10,23],[11,22],[12,22],[1,20],[2,19]];

function getSolar(m: number, d: number): number {
  for (let i = 0; i < RANGOS.length; i++) {
    const [sm, sd] = RANGOS[i];
    const [em, ed] = RANGOS[(i+1)%12];
    if (m === sm && d >= sd) return i;
    if (m === em && d < ed && i === RANGOS.length - 1) return i;
  }
  // Capricornio fallback
  return 9;
}

function getSolarIdx(m: number, d: number): number {
  if ((m===1&&d<=19)||(m===12&&d>=22)) return 9; // Cap
  if ((m===1&&d>=20)||(m===2&&d<=18)) return 10; // Acu
  if ((m===2&&d>=19)||(m===3&&d<=20)) return 11; // Pis
  if (m===3&&d>=21||m===4&&d<=19) return 0;
  if (m===4&&d>=20||m===5&&d<=20) return 1;
  if (m===5&&d>=21||m===6&&d<=20) return 2;
  if (m===6&&d>=21||m===7&&d<=22) return 3;
  if (m===7&&d>=23||m===8&&d<=22) return 4;
  if (m===8&&d>=23||m===9&&d<=22) return 5;
  if (m===9&&d>=23||m===10&&d<=22) return 6;
  if (m===10&&d>=23||m===11&&d<=21) return 7;
  if (m===11&&d>=22||m===12&&d<=21) return 8;
  return 9;
}

const DESC_SOL: Record<string, string> = {
  Aries:'líder nato/a',Tauro:'estable y sensual',Géminis:'comunicador/a nato/a',Cáncer:'protector/a',
  Leo:'carismático/a',Virgo:'analítico/a',Libra:'equilibrado/a',Escorpio:'intenso/a',
  Sagitario:'aventurero/a',Capricornio:'ambicioso/a',Acuario:'visionario/a',Piscis:'soñador/a'
};

export function cartaNatalBasica(i: Inputs): Outputs {
  const d = new Date(i.fechaNacimiento);
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  const hora = Number(i.horaNacimiento);
  if (isNaN(hora) || hora < 0 || hora > 23) throw new Error('Hora inválida');

  const m = d.getMonth() + 1, day = d.getDate();
  const solIdx = getSolarIdx(m, day);
  const sol = S[solIdx];

  // Ascendente simplificado
  const shift = Math.floor(((hora + 18) % 24) / 2);
  const ascIdx = (solIdx + shift) % 12;
  const asc = S[ascIdx];

  // Luna simplificada: ciclo ~29.5 días
  const epoch = new Date(2000, 0, 6, 18, 14); // known new moon
  const diffDays = (d.getTime() - epoch.getTime()) / 86400000 + hora / 24;
  const lunarCycle = 29.53059;
  const phase = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;
  const lunaIdx = Math.floor((phase / lunarCycle) * 12) % 12;
  const luna = S[lunaIdx];

  const resumen = `Sol en ${sol} (${DESC_SOL[sol]}), Luna en ${luna}, Ascendente en ${asc}. ` +
    `Tu esencia es ${sol.toLowerCase()}, tus emociones son ${luna.toLowerCase()} y los demás te ven como ${asc.toLowerCase()}.`;

  return { sol, luna, ascendente: asc, resumen };
}
