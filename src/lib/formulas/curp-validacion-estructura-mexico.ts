export interface Inputs {
  primer_apellido: string;
  segundo_apellido?: string;
  nombre: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  sexo: 'H' | 'M';
  entidad_nacimiento: string; // clave 2 letras (ej. DF, JC, NL)
}

export interface Componentes {
  iniciales: string;        // pos 1-4
  fecha_nacimiento: string; // pos 5-10 (YYMMDD)
  sexo: string;             // pos 11
  entidad: string;          // pos 12-13
  consonantes_internas: string; // pos 14-16
  homoclave: string;        // pos 17 (asignada por RENAPO — no derivable)
}

export interface Outputs {
  curp_esperada: string;
  digito_verificador: string;
  es_valida: boolean;
  componentes: Componentes;
  notas_validacion: string[];
  _insight?: any;
}

const VOCALES = 'AEIOU';
const CONSONANTES = 'BCDFGHJKLMNPQRSTVWXYZ';
// Nombres de pila que se omiten para tomar el SIGUIENTE nombre (regla RENAPO).
const NOMBRES_OMITIBLES = new Set(['MARIA', 'MA', 'JOSE', 'J']);
// Palabras altisonantes: si las 4 iniciales forman una, la 2da letra pasa a X.
const ALTISONANTES = new Set([
  'BACA','BAKA','BUEI','BUEY','CACA','CACO','CAGA','CAGO','CAKA','CAKO','COGE','COGI','COJA','COJE','COJI','COJO','COLA','CULO',
  'FALO','FETO','GETA','GUEI','GUEY','JOTO','KACA','KACO','KAGA','KAGO','KAKA','KAKO','KOGE','KOGI','KOJA','KOJE','KOJI','KOJO',
  'KOLA','KULO','LILO','LOCA','LOCO','LOKA','LOKO','MAME','MAMO','MEAR','MEAS','MEON','MIAR','MION','MOCO','MOKO','MULA','MULO',
  'NACA','NACO','PEDA','PEDO','PENE','PIPI','PITO','POPO','PUTA','PUTO','QULO','RATA','ROBA','ROBE','ROBO','RUIN','SENO','TETA',
  'VACA','VAGA','VAGO','VAKA','VUEI','VUEY','WUEI','WUEY',
]);

function normalizar(texto: string): string {
  // Mayúsculas, sin tildes; Ñ→X y dígitos/símbolos fuera. Se quitan partículas
  // de enlace comunes (DE, LA, LOS, etc.) según convención RENAPO.
  let t = (texto || '')
    .trim().toUpperCase()
    .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ü/g, 'U')
    .replace(/Ñ/g, 'X');
  // quitar partículas de enlace
  t = ' ' + t + ' ';
  for (const p of [' DE ', ' DEL ', ' LA ', ' LAS ', ' LOS ', ' Y ', ' MC ', ' MAC ', ' VON ', ' VAN ']) {
    t = t.split(p).join(' ');
  }
  return t.replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
}

function primeraVocalInterna(t: string): string {
  for (let i = 1; i < t.length; i++) if (VOCALES.includes(t[i])) return t[i];
  return 'X';
}
function primeraConsonanteInterna(t: string): string {
  for (let i = 1; i < t.length; i++) if (CONSONANTES.includes(t[i])) return t[i];
  return 'X';
}
function inicial(t: string): string {
  return t.length > 0 ? t[0] : 'X';
}

// Dígito verificador oficial CURP: Σ valor(char)·(18−i) sobre las 17 primeras
// posiciones, dígito = (10 − (Σ mod 10)) mod 10. Diccionario con Ñ=24.
function digitoVerificador(curp17: string): string {
  const DICT = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const v = DICT.indexOf(curp17.charAt(i));
    suma += (v < 0 ? 0 : v) * (18 - i);
  }
  return String((10 - (suma % 10)) % 10);
}

function extraer(inputs: Inputs, notas: string[]): Componentes {
  const ap1 = normalizar(inputs.primer_apellido);
  const ap2 = inputs.segundo_apellido ? normalizar(inputs.segundo_apellido) : '';
  // Nombre de pila: omitir MARIA/JOSE/etc. si hay un segundo nombre.
  const nombres = normalizar(inputs.nombre).split(' ').filter(Boolean);
  let nombreUsado = nombres[0] || '';
  if (nombres.length > 1 && NOMBRES_OMITIBLES.has(nombres[0])) {
    nombreUsado = nombres[1];
    notas.push(`Nombre compuesto: se usa "${nombres[1]}" (se omite "${nombres[0]}" según RENAPO).`);
  }
  const ap1c = ap1.replace(/ /g, '');
  const ap2c = ap2.replace(/ /g, '');
  const nomC = nombreUsado;

  if (ap1c.length < 2) notas.push('Primer apellido muy corto: posiciones se completan con X.');
  if (!nomC) notas.push('Falta el nombre.');

  // pos 1-4
  let iniciales =
    inicial(ap1c) +
    primeraVocalInterna(ap1c) +
    (ap2c ? inicial(ap2c) : 'X') +
    inicial(nomC);
  if (!ap2c) notas.push('Sin segundo apellido: se usa X en la posición 3.');
  // Palabra altisonante → 2da letra a X
  if (ALTISONANTES.has(iniciales)) {
    iniciales = iniciales[0] + 'X' + iniciales.slice(2);
    notas.push('Las 4 iniciales formaban una palabra inconveniente: la 2da letra se cambia a X (regla RENAPO).');
  }

  // pos 5-10
  let fecha = '000000';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(inputs.fecha_nacimiento || ''));
  let anio = 0;
  if (m) {
    anio = parseInt(m[1], 10);
    fecha = m[1].slice(2) + m[2] + m[3];
    if (anio < 1900) notas.push('Año de nacimiento fuera de rango.');
  } else {
    notas.push('Fecha inválida (se espera YYYY-MM-DD).');
  }

  // pos 11
  const sexo = inputs.sexo === 'M' ? 'M' : 'H';

  // pos 12-13
  const entidad = String(inputs.entidad_nacimiento || 'NE').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2).padEnd(2, 'E');

  // pos 14-16: consonantes internas
  const consonantes =
    primeraConsonanteInterna(ap1c) +
    (ap2c ? primeraConsonanteInterna(ap2c) : 'X') +
    primeraConsonanteInterna(nomC);

  // pos 17: homoclave — asignada por RENAPO, NO derivable. Placeholder por época:
  // dígito (0-9) para nacidos antes de 2000; letra (A-Z) desde 2000.
  const homoclave = anio >= 2000 ? 'A' : '0';

  return { iniciales, fecha_nacimiento: fecha, sexo, entidad, consonantes_internas: consonantes, homoclave };
}

export function compute(inputs: Inputs): Outputs {
  const notas: string[] = [];
  const c = extraer(inputs, notas);

  const curp17 = c.iniciales + c.fecha_nacimiento + c.sexo + c.entidad + c.consonantes_internas + c.homoclave;
  const dv = digitoVerificador(curp17);
  const curp = curp17 + dv;

  // Estructura válida: 18 caracteres con el patrón oficial AAAA######H/M AA AAA #.
  const patron = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]\d$/;
  const es_valida = patron.test(curp) && !notas.some((n) => n.includes('inválida') || n.includes('Falta'));

  notas.push('La posición 17 (homoclave) la asigna RENAPO y no se puede derivar; acá es un valor de referencia. Verificá tu CURP oficial en gob.mx.');

  const _insight = {
    title: es_valida ? 'CURP reconstruida' : 'Revisá los datos',
    text: es_valida
      ? `Con esos datos, la CURP sigue el patrón **${curp}** (primeros 16 caracteres derivados de tus datos + homoclave de referencia + dígito verificador **${dv}**). La homoclave real la asigna RENAPO.`
      : `No se pudo reconstruir una CURP con estructura válida: revisá nombre, apellidos, fecha y entidad.`,
    tone: es_valida ? 'good' : 'warn',
    icon: '🪪',
  };

  return {
    curp_esperada: curp,
    digito_verificador: dv,
    es_valida,
    componentes: c,
    notas_validacion: notas,
    _insight,
  };
}
