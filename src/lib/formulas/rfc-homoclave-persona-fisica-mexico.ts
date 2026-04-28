export interface Inputs {
  primer_apellido: string;
  segundo_apellido?: string;
  nombres: string;
  fecha_nacimiento: string;
  estado_nacimiento: string;
}

export interface Outputs {
  rfc_estimado: string;
  rfc_sin_homoclave: string;
  homoclave_calculada: string;
  fecha_componente: string;
  componentes_desglose: {
    letra_1: string;
    letra_2: string;
    letra_3: string;
    letra_4: string;
    anio: string;
    mes: string;
    dia: string;
    homoclave: string;
  };
}

function normalizarTexto(texto: string): string {
  return texto
    .toUpperCase()
    .trim()
    .replace(/[ÀÁÄÂ]/g, 'A')
    .replace(/[ÈÉËÊ]/g, 'E')
    .replace(/[ÌÍÏÎ]/g, 'I')
    .replace(/[ÒÓÖÔ]/g, 'O')
    .replace(/[ÙÚÜÛ]/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/\s+/g, ' ');
}

function obtenerPrimeraConsonante(texto: string): string {
  const consonantes = 'BCDFGHJKLMNPQRSTVWXYZ';
  const normalizado = normalizarTexto(texto);
  for (let i = 1; i < normalizado.length; i++) {
    const char = normalizado[i];
    if (consonantes.includes(char)) return char;
  }
  return 'X';
}

function calcularHomoclave(primerApellido: string, segundoApellido: string, nombres: string): string {
  // Algoritmo SAT simplificado para homoclave
  const normApellido1 = normalizarTexto(primerApellido);
  const normApellido2 = normalizarTexto(segundoApellido || '');
  const normNombres = normalizarTexto(nombres);
  
  // Construcción de cadena para cálculo
  const cadenaBase = (normApellido1 + normApellido2 + normNombres).replace(/\s+/g, '');
  
  // Tabla SAT: A=10, B=11, ... Z=35, 0-9=0-9
  const tablaSAT: Record<string, number> = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
    'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27,
    'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33, 'Y': 34, 'Z': 35
  };
  
  // Pesos SAT para primeras posiciones
  const pesos = [17, 29, 24];
  let suma = 0;
  
  for (let i = 0; i < Math.min(3, cadenaBase.length); i++) {
    const char = cadenaBase[i];
    const valor = tablaSAT[char] || 0;
    suma += valor * pesos[i];
  }
  
  // Módulo 1000 y conversión a base 36
  const resto = suma % 1000;
  const base36 = resto.toString(36).toUpperCase();
  
  // Padding a 3 caracteres
  return (base36 + '00').substring(0, 3);
}

export function compute(i: Inputs): Outputs {
  // Validación mínima
  if (!i.primer_apellido || !i.nombres || !i.fecha_nacimiento) {
    return {
      rfc_estimado: 'DATOS_INCOMPLETOS',
      rfc_sin_homoclave: '',
      homoclave_calculada: '',
      fecha_componente: '',
      componentes_desglose: {
        letra_1: '',
        letra_2: '',
        letra_3: '',
        letra_4: '',
        anio: '',
        mes: '',
        dia: '',
        homoclave: ''
      }
    };
  }
  
  // Normalizar entrada
  const normApellido1 = normalizarTexto(i.primer_apellido);
  const normApellido2 = normalizarTexto(i.segundo_apellido || '');
  const normNombres = normalizarTexto(i.nombres);
  
  // Componente 1: 4 letras
  const letra1 = normApellido1[0] || 'X';
  const letra2 = obtenerPrimeraConsonante(normApellido1);
  const letra3 = normApellido2[0] || 'X';
  const letra4 = normNombres[0] || 'X';
  const letras = letra1 + letra2 + letra3 + letra4;
  
  // Componente 2: Fecha YYMMDD
  let fechaComponente = '';
  try {
    const fecha = new Date(i.fecha_nacimiento);
    const yy = String(fecha.getFullYear() % 100).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    fechaComponente = yy + mm + dd;
  } catch (e) {
    fechaComponente = '000000';
  }
  
  // Componente 3: Homoclave
  const homoclave = calcularHomoclave(normApellido1, normApellido2, normNombres);
  
  // RFC sin homoclave (8 caracteres)
  const rfcSinHomoclave = letras + fechaComponente;
  
  // RFC completo (13 caracteres)
  const rfcEstimado = rfcSinHomoclave + homoclave;
  
  // Desglose
  const [yy, mm, dd] = [
    fechaComponente.substring(0, 2),
    fechaComponente.substring(2, 4),
    fechaComponente.substring(4, 6)
  ];
  
  return {
    rfc_estimado: rfcEstimado,
    rfc_sin_homoclave: rfcSinHomoclave,
    homoclave_calculada: homoclave,
    fecha_componente: fechaComponente,
    componentes_desglose: {
      letra_1: letra1,
      letra_2: letra2,
      letra_3: letra3,
      letra_4: letra4,
      anio: yy,
      mes: mm,
      dia: dd,
      homoclave: homoclave
    }
  };
}
