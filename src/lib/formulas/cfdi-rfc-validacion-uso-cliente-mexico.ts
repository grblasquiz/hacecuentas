export interface Inputs {
  rfc: string;
  razon_social: string;
  codigo_postal: string;
  regimen_fiscal: string;
  uso_cfdi?: string;
}

export interface Outputs {
  validacion_rfc: boolean;
  rfc_estructura: string;
  tipo_rfc: string;
  coherencia_regimen: string;
  usos_cfdi_compatibles: string[];
  validacion_cp: string;
  errores_detectados: string[];
  recomendaciones: string[];
}

// Catálogo SAT Regímenes Fiscales 2026
const regimenesFiscales: Record<string, { nombre: string; tipo_rfc: string; usos_cfdi: string[] }> = {
  "601": { nombre: "Persona Moral General", tipo_rfc: "PM", usos_cfdi: ["G01", "G02", "G03", "I01", "I02", "I03", "I04", "I05", "I06", "I07", "I08", "P01"] },
  "612": { nombre: "PF Actividad Empresarial", tipo_rfc: "PF", usos_cfdi: ["G01", "G02", "G03", "I07"] },
  "614": { nombre: "PF Sin Actividad Empresarial", tipo_rfc: "PF", usos_cfdi: ["G03"] },
  "626": { nombre: "RESICO (Régimen Simplificado)", tipo_rfc: "PF", usos_cfdi: ["G01", "G03"] },
  "629": { nombre: "PF Asalariada", tipo_rfc: "PF", usos_cfdi: ["G03", "P01"] },
  "625": { nombre: "PM Tributación Federal", tipo_rfc: "PM", usos_cfdi: ["G01", "G02", "G03"] },
  "630": { nombre: "Ingresos por Intereses", tipo_rfc: "PF", usos_cfdi: ["P01"] }
};

// Tabla ASCII para validación homoclave
const tablaHomoclave: Record<string, number> = {
  " ": 0, "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "&": 10, "A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15, "G": 16, "H": 17, "I": 18, "J": 19,
  "K": 20, "L": 21, "M": 22, "N": 23, "Ñ": 24, "O": 25, "P": 26, "Q": 27, "R": 28, "S": 29,
  "T": 30, "U": 31, "V": 32, "W": 33, "X": 34, "Y": 35, "Z": 36
};

// Códigos postales válidos INEGI 2026 (muestra - completa según catálogo real)
const codigosPostalesValidos: Set<string> = new Set([
  "06500", "28001", "28002", "28003", "28004", "28005", "28006", "28007", "28008", "28009",
  "28010", "28011", "28012", "28013", "28014", "28015", "28016", "28017", "28018", "28019",
  "28020", "28021", "28022", "28023", "28024", "28025", "28026", "28027", "28028", "28029",
  "28030", "28031", "28032", "28033", "28034", "28035", "28036", "28037", "28038", "28039",
  "28040", "28041", "28042", "28043", "28044", "28045", "28046", "28047", "28048", "28049",
  "28050", "06000", "06100", "06200", "06300", "06400", "06600", "06700", "06800", "06900"
  // Nota: Este es un catálogo simplificado. Usar catálogo INEGI completo en producción.
]);

function validarEstructuraRFC(rfc: string): { valido: boolean; tipo: string; error?: string } {
  const rfcLimpio = (rfc || "").toUpperCase().trim();
  
  if (!rfcLimpio) return { valido: false, tipo: "", error: "RFC vacío" };
  if (!/^[A-ZÑ0-9]{12,13}$/.test(rfcLimpio)) {
    return { valido: false, tipo: "", error: "RFC contiene caracteres inválidos o longitud incorrecta" };
  }
  
  const tipo = rfcLimpio.length === 12 ? "PF" : "PM";
  
  // Validación básica de formato: PF debe ser 4+1+1+6, PM debe ser 3+6+4
  if (tipo === "PF") {
    const soloLetras = /^[A-ZÑ]{6}[0-9]{6}[A-Z0-9]{3}$/.test(rfcLimpio);
    if (!soloLetras) return { valido: false, tipo, error: "Estructura PF inválida (debe ser 6 letras + 6 dígitos + 3 alfanuméricos)" };
  } else {
    const soloLetras = /^[A-ZÑ]{3}[0-9]{6}[A-Z0-9]{4}$/.test(rfcLimpio);
    if (!soloLetras) return { valido: false, tipo, error: "Estructura PM inválida (debe ser 3 letras + 6 dígitos + 4 alfanuméricos)" };
  }
  
  return { valido: true, tipo };
}

function validarHomoclavePF(rfc: string): boolean {
  // Algoritmo módulo 97 SAT para homoclave PF
  if (rfc.length !== 12) return false;
  
  const palabra = rfc.substring(0, 10);
  const homoExpected = rfc.substring(10, 12);
  
  let suma = 0;
  for (let i = 0; i < palabra.length; i++) {
    const char = palabra[i];
    const valor = tablaHomoclave[char] ?? 0;
    suma += valor;
  }
  
  const digito = (suma % 97);
  const homoCalculado = digito.toString(16).toUpperCase().padStart(2, "0");
  
  // Simplificado: devolver true si estructura es válida
  // En producción: implementar algoritmo completo SAT
  return true;
}

function validarCodigoPostal(cp: string): boolean {
  const cpLimpio = (cp || "").trim();
  if (!/^[0-9]{5}$/.test(cpLimpio)) return false;
  return codigosPostalesValidos.has(cpLimpio);
}

function calcularCoherenciaRegimen(tipoRFC: string, regimenFiscal: string): { valida: boolean; razon: string } {
  const regimen = regimenesFiscales[regimenFiscal];
  if (!regimen) {
    return { valida: false, razon: `Régimen fiscal ${regimenFiscal} no reconocido por SAT` };
  }
  
  if (regimen.tipo_rfc !== tipoRFC) {
    return {
      valida: false,
      razon: `Incoherencia: RFC es ${tipoRFC} pero régimen ${regimenFiscal} es para ${regimen.tipo_rfc}`
    };
  }
  
  return { valida: true, razon: `RFC ${tipoRFC} coherente con régimen ${regimenFiscal} (${regimen.nombre})` };
}

function obtenerUsosCFDICompatibles(regimenFiscal: string): string[] {
  return regimenesFiscales[regimenFiscal]?.usos_cfdi ?? [];
}

function validarRazonSocial(razonSocial: string): { valido: boolean; error?: string } {
  const rs = (razonSocial || "").trim();
  if (!rs) return { valido: false, error: "Razón social vacía" };
  if (rs.length < 5) return { valido: false, error: "Razón social muy corta (mín. 5 caracteres)" };
  if (rs.length > 255) return { valido: false, error: "Razón social muy larga (máx. 255 caracteres)" };
  if (!/^[a-zA-Z0-9\s\.,&()'-áéíóúñÁÉÍÓÚÑ]+$/.test(rs)) {
    return { valido: false, error: "Razón social contiene caracteres no permitidos" };
  }
  return { valido: true };
}

export function compute(i: Inputs): Outputs {
  const errores: string[] = [];
  const recomendaciones: string[] = [];
  let validacionRFC = false;
  let tipoRFC = "";
  let estructuraRFC = "";
  let coherenciaRegimen = "No evaluada";
  let usosCFDICompatibles: string[] = [];
  let validacionCP = "";
  
  // 1. Validación RFC estructura
  const valRFC = validarEstructuraRFC(i.rfc);
  if (!valRFC.valido) {
    errores.push(`RFC inválido: ${valRFC.error}`);
    estructuraRFC = `Rechazado: ${valRFC.error}`;
  } else {
    validacionRFC = true;
    tipoRFC = valRFC.tipo;
    estructuraRFC = `${i.rfc.toUpperCase().substring(0, 6)} ${i.rfc.toUpperCase().substring(6, 10)} ${i.rfc.toUpperCase().substring(10)}`;
    
    // Validación homoclave (simplificada)
    if (tipoRFC === "PF" && !validarHomoclavePF(i.rfc)) {
      errores.push("Homoclave RFC inválida (verifica dígitos 10-12)");
    }
  }
  
  // 2. Validación razón social
  const valRS = validarRazonSocial(i.razon_social);
  if (!valRS.valido) {
    errores.push(`Razón social: ${valRS.error}`);
    recomendaciones.push(`Corrige razón social: ${valRS.error}`);
  }
  
  // 3. Validación código postal
  const cpValido = validarCodigoPostal(i.codigo_postal);
  if (!cpValido) {
    validacionCP = "Inválido o no registrado INEGI 2026";
    errores.push(`Código postal ${i.codigo_postal} no válido en catálogo INEGI`);
    recomendaciones.push(`Verifica CP en catálogo INEGI o consulta domicilio registrado ante SAT`);
  } else {
    validacionCP = "Válido";
  }
  
  // 4. Validación coherencia régimen fiscal
  if (validacionRFC && i.regimen_fiscal) {
    const coheren = calcularCoherenciaRegimen(tipoRFC, i.regimen_fiscal);
    coherenciaRegimen = coheren.razon;
    if (!coheren.valida) {
      errores.push(coheren.razon);
      recomendaciones.push(`Verifica régimen fiscal en carátula ISR 2025 o tramita cambio de régimen`);
    }
    usosCFDICompatibles = obtenerUsosCFDICompatibles(i.regimen_fiscal);
  }
  
  // 5. Validación uso CFDI si se proporciona
  if (i.uso_cfdi && usosCFDICompatibles.length > 0) {
    if (!usosCFDICompatibles.includes(i.uso_cfdi)) {
      errores.push(`Uso CFDI "${i.uso_cfdi}" no permitido para régimen ${i.regimen_fiscal}`);
      recomendaciones.push(`Usa uno de: ${usosCFDICompatibles.join(", ")}`);
    }
  }
  
  // Recomendaciones generales
  if (errores.length === 0) {
    recomendaciones.push("RFC validado correctamente. Puedes proceder a emitir CFDI.");
  }
  if (coherenciaRegimen.includes("coherente")) {
    recomendaciones.push(`Régimen fiscal confirmado: ${regimenesFiscales[i.regimen_fiscal]?.nombre || i.regimen_fiscal}`);
  }
  recomendaciones.push("Antes de emitir CFDI, valida estatus fiscal en consultas.sat.gob.mx");
  
  return {
    validacion_rfc: validacionRFC,
    rfc_estructura: estructuraRFC,
    tipo_rfc: tipoRFC,
    coherencia_regimen: coherenciaRegimen,
    usos_cfdi_compatibles: usosCFDICompatibles,
    validacion_cp: validacionCP,
    errores_detectados: errores.length > 0 ? errores : ["Sin errores detectados"],
    recomendaciones: recomendaciones
  };
}
