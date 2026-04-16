/** Ascendente zodiacal simplificado */
export interface Inputs { fechaNacimiento: string; horaNacimiento: number; }
export interface Outputs { ascendente: string; signoSolar: string; mensaje: string; }

const SIGNOS_ORD = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
const SIGNOS_RANGO: [number,number,string][] = [[3,21,'Aries'],[4,20,'Tauro'],[5,21,'Géminis'],[6,21,'Cáncer'],[7,23,'Leo'],[8,23,'Virgo'],[9,23,'Libra'],[10,23,'Escorpio'],[11,22,'Sagitario'],[12,22,'Capricornio'],[1,20,'Acuario'],[2,19,'Piscis']];

function getSolar(m: number, d: number): string {
  // reverse order check
  for (let i = SIGNOS_RANGO.length - 1; i >= 0; i--) {
    const [sm, sd, name] = SIGNOS_RANGO[i];
    if (m === sm && d >= sd) return name;
    if (m > sm && (i === SIGNOS_RANGO.length - 1 || m < SIGNOS_RANGO[i+1][0] || (m === SIGNOS_RANGO[i+1][0] && d < SIGNOS_RANGO[i+1][1]))) return name;
  }
  return 'Capricornio';
}

const ASC_DESC: Record<string, string> = {
  'Aries':'Enérgico/a, directo/a, impaciente. Primera impresión fuerte.',
  'Tauro':'Sereno/a, confiable, sensual. Transmitís calma y seguridad.',
  'Géminis':'Simpático/a, comunicativo/a, inquieto/a. Siempre tenés algo para decir.',
  'Cáncer':'Cálido/a, protector/a, reservado/a al principio. La gente se siente cuidada.',
  'Leo':'Carismático/a, llamativo/a, seguro/a. Entrás a un lugar y se nota.',
  'Virgo':'Ordenado/a, discreto/a, analítico/a. Transmitís seriedad y competencia.',
  'Libra':'Elegante, encantador/a, diplomático/a. Caés bien a todo el mundo.',
  'Escorpio':'Magnético/a, intenso/a, misterioso/a. Tu mirada lo dice todo.',
  'Sagitario':'Alegre, aventurero/a, expansivo/a. Contagiás optimismo.',
  'Capricornio':'Serio/a, maduro/a, responsable. Te ven como alguien confiable.',
  'Acuario':'Único/a, excéntrico/a, libre. No seguís las reglas convencionales.',
  'Piscis':'Soñador/a, empático/a, artístico/a. Transmitís sensibilidad.',
};

export function ascendenteZodiacal(i: Inputs): Outputs {
  const d = new Date(i.fechaNacimiento);
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  const hora = Number(i.horaNacimiento);
  if (isNaN(hora) || hora < 0 || hora > 23) throw new Error('Ingresá una hora válida (0-23)');

  const m = d.getMonth() + 1;
  const day = d.getDate();
  const solar = getSolar(m, day);
  const solarIdx = SIGNOS_ORD.indexOf(solar);

  // Simplified: ascendant shifts ~1 sign every 2 hours from sunrise (~6AM)
  const shift = Math.floor(((hora + 18) % 24) / 2); // 6AM = 0 shift
  const ascIdx = (solarIdx + shift) % 12;
  const asc = SIGNOS_ORD[ascIdx];

  const msg = `Sol en ${solar}, Ascendente en ${asc}. ${ASC_DESC[asc]}`;

  return { ascendente: asc, signoSolar: solar, mensaje: msg };
}
