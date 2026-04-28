export interface Inputs {
  primer_apellido: string;
  segundo_apellido?: string;
  nombre: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  sexo: 'H' | 'M';
  entidad_nacimiento: string; // clave 2 letras
}

export interface Componentes {
  apellidos: string; // 3 caracteres
  nombre: string; // 1 carácter
  fecha_nacimiento: string; // 6 caracteres YYMMDD
  sexo: string; // 1 carácter
  entidad: string; // 2 caracteres
  folio: string; // 3 caracteres (hipotético 000)
}

export interface Outputs {
  curp_esperada: string;
  digito_verificador: string;
  es_valida: boolean;
  componentes: Componentes;
  notas_validacion: string[];
}

function normalizarTexto(texto: string): string {
  // Elimina espacios, guiones, tildes y convierte a mayúsculas
  return texto
    .trim()
    .toUpperCase()
    .replace(/[\s\-]/g, '')
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ü/g, 'U')
    .replace(/Ñ/g, 'N');
}

function obtenerConsonantes(texto: string): string {
  const consonantes = 'BCDFGHJKLMNPQRSTVWXYZ';
  return texto.split('').filter(c => consonantes.includes(c)).join('');
}

function obtenerVocales(texto: string): string {
  const vocales = 'AEIOU';
  return texto.split('').filter(c => vocales.includes(c)).join('');
}

function extraerComponentesCurp(inputs: Inputs): Componentes {
  const notas: string[] = [];
  
  // Normalizar entradas
  const primerApellido = normalizarTexto(inputs.primer_apellido);
  const segundoApellido = inputs.segundo_apellido ? normalizarTexto(inputs.segundo_apellido) : '';
  const nombre = normalizarTexto(inputs.nombre);
  
  // Validación básica
  if (primerApellido.length < 2) {
    notas.push('Primer apellido muy corto (mín. 2 caracteres)');
  }
  if (nombre.length < 2) {
    notas.push('Nombre muy corto (mín. 2 caracteres)');
  }
  
  // Extrae componente 1-3: apellidos
  let apellidosComp = '';
  
  // Inicial primer apellido
  apellidosComp += primerApellido.charAt(0);
  
  // Primera consonante primer apellido
  const consAp1 = obtenerConsonantes(primerApellido.substring(1));
  apellidosComp += consAp1.length > 0 ? consAp1.charAt(0) : 'X';
  
  // Primera consonante segundo apellido (o X si no existe)
  if (segundoApellido.length > 0) {
    const consAp2 = obtenerConsonantes(segundoApellido);
    apellidosComp += consAp2.length > 0 ? consAp2.charAt(0) : 'X';
  } else {
    apellidosComp += 'X';
    notas.push('Sin segundo apellido: se usa X en posición 3');
  }
  
  // Componente 4: primera consonante nombre
  const consNombre = obtenerConsonantes(nombre);
  const nombreComp = consNombre.length > 0 ? consNombre.charAt(0) : 'X';
  
  if (nombre.indexOf(' ') > -1) {
    notas.push('Nombre compuesto detectado: se toma primera consonante del primer nombre');
  }
  
  // Componente 5-10: fecha nacimiento YYMMDD
  let fecha = '';
  try {
    const [year, month, day] = inputs.fecha_nacimiento.split('-');
    const yyyy = parseInt(year);
    const mm = month.padStart(2, '0');
    const dd = day.padStart(2, '0');
    
    if (yyyy < 1900 || yyyy > new Date().getFullYear()) {
      notas.push('Año de nacimiento fuera de rango válido (1900-presente)');
    }
    
    const yy = yyyy.toString().substring(2).padStart(2, '0');
    fecha = yy + mm + dd;
  } catch (e) {
    fecha = '000000';
    notas.push('Formato fecha inválido (esperado YYYY-MM-DD)');
  }
  
  // Componente 11: sexo
  const sexoComp = inputs.sexo === 'H' ? 'H' : 'M';
  
  // Componente 12-13: entidad
  const entidadComp = inputs.entidad_nacimiento.toUpperCase().substring(0, 2);
  
  // Folio (hipotético para validación)
  const folioComp = '000';
  
  return {
    apellidos: apellidosComp,
    nombre: nombreComp,
    fecha_nacimiento: fecha,
    sexo: sexoComp,
    entidad: entidadComp,
    folio: folioComp
  };
}

function calcularDigitoVerificador(curp17: string): string {
  // Tabla de conversión letra → número
  const letraAnum: { [key: string]: number } = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19,
    K: 20, L: 21, M: 22, N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29,
    U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };
  
  // Pesos para módulo 97 (patrón repetido)
  const pesos = [3, 7, 13, 1, 3, 7, 13, 1, 3, 7, 13, 1, 3, 7, 13, 1, 3];
  
  let suma = 0;
  for (let i = 0; i < curp17.length; i++) {
    const char = curp17.charAt(i);
    const valor = letraAnum[char] || 0;
    suma += valor * pesos[i];
  }
  
  // Módulo 97 y cálculo dígito
  const residuo = suma % 97;
  const digito = (97 - residuo) % 10;
  
  return digito.toString();
}

export function compute(inputs: Inputs): Outputs {
  const notas: string[] = [];
  
  // Extrae componentes
  const comp = extraerComponentesCurp(inputs);
  notas.push(...comp.componentes || []);
  
  // Arma CURP sin dígito verificador (17 caracteres)
  const curp17 = (
    comp.apellidos +
    comp.nombre +
    comp.fecha_nacimiento +
    comp.sexo +
    comp.entidad +
    comp.folio
  );
  
  // Valida longitud
  if (curp17.length !== 17) {
    notas.push(`Error: CURP sin dígito tiene ${curp17.length} caracteres (esperado 17)`);
  }
  
  // Calcula dígito verificador
  const digito = calcularDigitoVerificador(curp17);
  const curpCompleta = curp17 + digito;
  
  // Validación estructural
  const esValida = (
    curpCompleta.length === 18 &&
    /^[A-Z0-9]{18}$/.test(curpCompleta) &&
    (inputs.sexo === 'H' || inputs.sexo === 'M')
  );
  
  if (!esValida) {
    notas.push('CURP no cumple estructura esperada (18 caracteres alfanuméricos)');
  }
  
  return {
    curp_esperada: curpCompleta,
    digito_verificador: digito,
    es_valida: esValida,
    componentes: {
      apellidos: comp.apellidos,
      nombre: comp.nombre,
      fecha_nacimiento: comp.fecha_nacimiento,
      sexo: comp.sexo,
      entidad: comp.entidad,
      folio: comp.folio
    },
    notas_validacion: notas.length > 0 ? notas : ['CURP válida según estructura SAT 2026']
  };
}
