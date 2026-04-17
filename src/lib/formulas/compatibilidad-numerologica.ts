/** Compatibilidad numerológica por número de vida */
export interface Inputs { fecha1: string; fecha2: string; }
export interface Outputs { compatibilidad: number; numVida1: number; numVida2: number; mensaje: string; }

function lifeNumber(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) throw new Error('Fecha inválida');
  const digits = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  let sum = digits.split('').reduce((a,b) => a + Number(b), 0);
  // Check master numbers before final reduction
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((a,b) => a + Number(b), 0);
  }
  return sum;
}

const COMPAT: Record<string, number> = {
  '1-1':70,'1-2':55,'1-3':80,'1-4':50,'1-5':88,'1-6':62,'1-7':65,'1-8':58,'1-9':82,
  '2-2':72,'2-3':70,'2-4':78,'2-5':48,'2-6':92,'2-7':60,'2-8':72,'2-9':68,
  '3-3':75,'3-4':42,'3-5':82,'3-6':88,'3-7':58,'3-8':52,'3-9':90,
  '4-4':68,'4-5':40,'4-6':75,'4-7':80,'4-8':90,'4-9':48,
  '5-5':72,'5-6':45,'5-7':78,'5-8':62,'5-9':80,
  '6-6':78,'6-7':52,'6-8':72,'6-9':88,
  '7-7':75,'7-8':48,'7-9':70,
  '8-8':72,'8-9':55,
  '9-9':78,
  '1-11':85,'2-11':90,'3-11':78,'4-11':55,'5-11':72,'6-11':82,'7-11':88,'8-11':60,'9-11':85,
  '1-22':72,'2-22':80,'3-22':60,'4-22':92,'5-22':55,'6-22':85,'7-22':70,'8-22':88,'9-22':75,
  '11-11':80,'11-22':85,'22-22':78
};

const MSGS: Record<number, string> = {
  1:'líder',2:'diplomático/a',3:'creativo/a',4:'estable',5:'aventurero/a',
  6:'amoroso/a',7:'espiritual',8:'ambicioso/a',9:'sabio/a',11:'intuitivo/a',22:'visionario/a'
};

export function compatibilidadNumerologica(i: Inputs): Outputs {
  const n1 = lifeNumber(String(i.fecha1));
  const n2 = lifeNumber(String(i.fecha2));
  const key = n1 <= n2 ? `${n1}-${n2}` : `${n2}-${n1}`;
  const pct = COMPAT[key] ?? 65;

  const msg = `Número de vida ${n1} (${MSGS[n1]}) + ${n2} (${MSGS[n2]}): compatibilidad del ${pct}%. ` +
    (pct >= 85 ? 'Conexión excepcional — se potencian mutuamente.' :
     pct >= 70 ? 'Buena afinidad — se complementan en muchas áreas.' :
     pct >= 55 ? 'Compatibilidad moderada — requiere esfuerzo consciente.' :
     'Energías muy distintas — los desafíos pueden ser oportunidades de crecimiento.');

  return { compatibilidad: pct, numVida1: n1, numVida2: n2, mensaje: msg };
}
