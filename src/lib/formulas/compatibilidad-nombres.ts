/** Compatibilidad de nombres por numerología pitagórica */
export interface Inputs { nombre1: string; nombre2: string; }
export interface Outputs { porcentaje: number; numero1: number; numero2: number; mensaje: string; }

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}

function digitRoot(name: string): number {
  const letters = normalize(name);
  let sum = 0;
  for (const ch of letters) {
    sum += ((ch.charCodeAt(0) - 96) % 9) || 9;
  }
  while (sum > 9) { sum = String(sum).split('').reduce((a, b) => a + Number(b), 0); }
  return sum;
}

const COMPAT: Record<string, number> = {
  '1-1':75,'1-2':60,'1-3':78,'1-4':55,'1-5':88,'1-6':65,'1-7':62,'1-8':72,'1-9':80,
  '2-2':70,'2-3':68,'2-4':78,'2-5':50,'2-6':90,'2-7':65,'2-8':75,'2-9':72,
  '3-3':72,'3-4':45,'3-5':80,'3-6':85,'3-7':60,'3-8':55,'3-9':92,
  '4-4':65,'4-5':42,'4-6':72,'4-7':78,'4-8':88,'4-9':50,
  '5-5':68,'5-6':48,'5-7':75,'5-8':60,'5-9':78,
  '6-6':75,'6-7':55,'6-8':70,'6-9':85,
  '7-7':72,'7-8':50,'7-9':68,
  '8-8':70,'8-9':55,
  '9-9':75
};

function getCompat(a: number, b: number): number {
  const key = a <= b ? `${a}-${b}` : `${b}-${a}`;
  return COMPAT[key] ?? 60;
}

const MSGS: Record<number, string> = {
  1:'liderazgo', 2:'sensibilidad', 3:'creatividad', 4:'estabilidad',
  5:'aventura', 6:'amor', 7:'espiritualidad', 8:'poder', 9:'sabiduría'
};

export function compatibilidadNombres(i: Inputs): Outputs {
  const n1 = String(i.nombre1 || '').trim();
  const n2 = String(i.nombre2 || '').trim();
  if (!n1 || !n2) throw new Error('Ingresá ambos nombres');

  const d1 = digitRoot(n1);
  const d2 = digitRoot(n2);
  const pct = getCompat(d1, d2);

  const msg = `${n1} (${d1}: ${MSGS[d1]}) + ${n2} (${d2}: ${MSGS[d2]}): compatibilidad del ${pct}%. ` +
    (pct >= 85 ? 'Conexión excepcional — vibran en la misma frecuencia.' :
     pct >= 70 ? 'Buena compatibilidad — se complementan bien.' :
     pct >= 55 ? 'Compatibilidad moderada — hay potencial si ambos ponen de su parte.' :
     'Vibración distinta — los desafíos pueden ser oportunidades de crecimiento.');

  return { porcentaje: pct, numero1: d1, numero2: d2, mensaje: msg };
}
