export interface Inputs {
  tipo_tramite: 'primera_vez' | 'duplicado' | 'rectificacion' | 'renovacion' | 'extranjeria';
  departamento: string;
  edad: number;
  expedicion_anterior: 'si' | 'no';
}

export interface Outputs {
  costo_tramite: number;
  plazo_dias: number;
  validez_anios: number;
  fecha_vencimiento: string;
  requiere_foto: string;
  requiere_comprobante: string;
  valida_voto: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes tarifa 2026 Registraduría Nacional (COP)
  const TARIFA_PRIMERA_VEZ = 0; // Gratuita para mayores 18 años
  const TARIFA_DUPLICADO_BASE = 75000; // Bogotá referencia
  const TARIFA_RECTIFICACION = 50000;
  const TARIFA_RENOVACION = 50000;
  const TARIFA_EXTRANJERIA_BASE = 120000;
  
  const VALIDEZ_MAYORES = 10; // años
  const VALIDEZ_MENORES = 5; // años
  const VALIDEZ_EXTRANJERIA = 2; // años
  
  // Ajustes por departamento (porcentaje sobre tarifa base)
  const AJUSTE_DEPTO: Record<string, number> = {
    'bogota': 1.0,
    'antioquia': 0.95,
    'atlantico': 0.95,
    'bolivar': 0.90,
    'boyaca': 0.85,
    'caldas': 0.88,
    'caqueta': 0.80,
    'cauca': 0.85,
    'cesar': 0.88,
    'cordoba': 0.90,
    'cundinamarca': 0.98,
    'guainia': 0.75,
    'guajira': 0.90,
    'guaviare': 0.75,
    'huila': 0.85,
    'magdalena': 0.88,
    'meta': 0.85,
    'nariño': 0.80,
    'norte_santander': 0.85,
    'putumayo': 0.78,
    'quindio': 0.90,
    'risaralda': 0.92,
    'santander': 0.90,
    'sucre': 0.85,
    'tolima': 0.88,
    'valle': 0.95,
    'vaupes': 0.70,
    'vichada': 0.72
  };
  
  // Plazos base (días hábiles)
  const PLAZO_BASE: Record<string, number> = {
    'primera_vez': 7,
    'duplicado': 12,
    'rectificacion': 18,
    'renovacion': 12,
    'extranjeria': 20
  };
  
  // Calcular costo
  let costo_tramite = 0;
  let validez_anios = 0;
  let plazo_base = PLAZO_BASE[i.tipo_tramite] || 10;
  let requiere_foto = 'Sí';
  let requiere_comprobante = '';
  let valida_voto = 'Sí';
  
  const ajuste = AJUSTE_DEPTO[i.departamento] || 0.90;
  
  switch (i.tipo_tramite) {
    case 'primera_vez':
      if (i.edad < 18) {
        costo_tramite = 0; // Gratuita
        validez_anios = VALIDEZ_MENORES;
        requiere_comprobante = 'Registro civil original, cédula anterior (si existe), fotografía 4×4 cm';
      } else {
        costo_tramite = TARIFA_PRIMERA_VEZ;
        validez_anios = VALIDEZ_MAYORES;
        requiere_comprobante = 'Registro civil original, fotografía 4×4 cm, comprobante mayoría edad';
      }
      break;
      
    case 'duplicado':
      costo_tramite = Math.round(TARIFA_DUPLICADO_BASE * ajuste);
      validez_anios = i.edad >= 18 ? VALIDEZ_MAYORES : VALIDEZ_MENORES;
      requiere_comprobante = 'Cédula anterior (si existe), denuncia de pérdida/robo (Fiscalía), fotografía 4×4 cm';
      break;
      
    case 'rectificacion':
      costo_tramite = Math.round(TARIFA_RECTIFICACION * ajuste);
      validez_anios = VALIDEZ_MAYORES;
      plazo_base = 18;
      requiere_comprobante = 'Sentencia judicial o registro civil rectificado, cédula anterior, fotografía';
      break;
      
    case 'renovacion':
      costo_tramite = Math.round(TARIFA_RENOVACION * ajuste);
      validez_anios = VALIDEZ_MAYORES;
      requiere_comprobante = 'Cédula vigente, fotografía 4×4 cm, solicitud renovación';
      break;
      
    case 'extranjeria':
      costo_tramite = Math.round(TARIFA_EXTRANJERIA_BASE * ajuste);
      validez_anios = VALIDEZ_EXTRANJERIA;
      plazo_base = 20;
      requiere_comprobante = 'Pasaporte, visa de residencia, permanencia >3 meses, fotografía, formulario';
      valida_voto = 'No (solo para identidad exterior)';
      break;
  }
  
  // Ajustar plazo por departamento remoto
  const PLAZO_AJUSTE: Record<string, number> = {
    'guainia': 25,
    'guaviare': 25,
    'vaupes': 30,
    'vichada': 28,
    'caqueta': 20,
    'putumayo': 20
  };
  
  const plazo_dias = PLAZO_AJUSTE[i.departamento] || plazo_base;
  
  // Calcular fecha vencimiento (aprox)
  const hoy = new Date('2026-04-28');
  const vencimiento = new Date(hoy);
  vencimiento.setFullYear(vencimiento.getFullYear() + validez_anios);
  const fecha_vencimiento = vencimiento.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Validez voto ajustada
  if (i.tipo_tramite === 'extranjeria') {
    valida_voto = 'No';
  } else if (i.edad < 18 && i.tipo_tramite === 'primera_vez') {
    valida_voto = 'No (solo a los 18 años con cédula nueva)';
  }
  
  return {
    costo_tramite,
    plazo_dias,
    validez_anios,
    fecha_vencimiento,
    requiere_foto,
    requiere_comprobante,
    valida_voto
  };
}
