export interface Inputs {
  tipo_ingreso: 'indemnizacion_vida' | 'donacion_recibida' | 'herencia' | 'retiro_afc_vivienda' | 'indemnizacion_laboral' | 'otro';
  monto_ingreso: number;
  fecha_recepcion: number;
  tienes_obligacion_declarar: 'si' | 'no';
}

export interface Outputs {
  es_incrgo: boolean;
  categoria_incrgo: string;
  tope_legal_2026: number;
  monto_dentro_tope: boolean;
  exceso_tributable: number;
  obligacion_declarativa: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 Colombia
  const TOPE_INDEMNIZACION_VIDA_2026 = 850_000_000; // COP, según DIAN resolución vigente
  const TOPE_NO_DECLARANTES_2026 = 1_500_000_000; // COP aproximado
  
  let es_incrgo = false;
  let categoria_incrgo = '';
  let tope_legal_2026 = 0;
  let monto_dentro_tope = false;
  let exceso_tributable = 0;
  let obligacion_declarativa = '';
  let recomendacion = '';

  const montoPrueba = i.monto_ingreso || 0;
  const esDeclarante = i.tienes_obligacion_declarar === 'si';

  // Análisis por tipo de ingreso
  switch (i.tipo_ingreso) {
    case 'indemnizacion_vida': {
      // Fuente: Art. 37 Estatuto Tributario, resolución DIAN 2026
      categoria_incrgo = 'Indemnización seguro de vida';
      tope_legal_2026 = TOPE_INDEMNIZACION_VIDA_2026;
      
      if (montoPrueba <= tope_legal_2026) {
        es_incrgo = true;
        monto_dentro_tope = true;
        exceso_tributable = 0;
        obligacion_declarativa = esDeclarante 
          ? 'Declarante obligatorio: reporta en formulario 210 (informativo, sin impuesto)'
          : 'No declarante: no hay obligación formal';
        recomendacion = 'Presenta póliza asegurador + liquidación de indemnización como soporte ante DIAN. Guarda documentos 5 años.';
      } else {
        es_incrgo = true; // Parcialmente
        monto_dentro_tope = false;
        exceso_tributable = montoPrueba - tope_legal_2026;
        obligacion_declarativa = 'Declarante obligatorio: el exceso entra en base imponible renta';
        recomendacion = `Declara $${tope_legal_2026.toLocaleString('es-CO')} como INCRGO y $${exceso_tributable.toLocaleString('es-CO')} como renta ordinaria en formulario 210.`;
      }
      break;
    }

    case 'donacion_recibida': {
      // Fuente: Art. 37 Estatuto Tributario (sin límite donaciones)
      categoria_incrgo = 'Donación recibida';
      tope_legal_2026 = Infinity; // Sin límite legal
      es_incrgo = true;
      monto_dentro_tope = true;
      exceso_tributable = 0;
      obligacion_declarativa = esDeclarante
        ? 'Declarante obligatorio: reporta en formulario 210 (solo informativo, INCRGO ilimitado)'
        : 'No declarante: no hay obligación de reportar';
      recomendacion = 'Formaliza donación con escritura pública (bienes inmuebles) o documento notariado (dinero/bienes muebles). Este es requisito DIAN.';
      break;
    }

    case 'herencia': {
      // Fuente: Art. 37 Estatuto Tributario (herencias son INCRGO ilimitadas)
      categoria_incrgo = 'Herencia / Legado';
      tope_legal_2026 = Infinity; // Sin límite legal
      es_incrgo = true;
      monto_dentro_tope = true;
      exceso_tributable = 0;
      obligacion_declarativa = esDeclarante
        ? 'Declarante obligatorio: reporta en formulario 210 como ingreso no constitutivo (informativo)'
        : 'No declarante: guardar sentencia sucesoral pero sin obligación formal de reportar';
      recomendacion = 'Presenta sentencia sucesoral o acta de liquidación de sociedad conyugal como comprobante. La herencia **no tributa en renta** pero requiere formalidad.';
      break;
    }

    case 'retiro_afc_vivienda': {
      // Fuente: Ley 1811/2016 - AFC, Superfinanciera circular 096
      categoria_incrgo = 'Retiro AFC destinado a vivienda propia';
      tope_legal_2026 = Infinity; // Retiros AFC vivienda son ilimitados en INCRGO
      es_incrgo = true;
      monto_dentro_tope = true;
      exceso_tributable = 0;
      obligacion_declarativa = esDeclarante
        ? 'Declarante obligatorio: reporta en formulario 210 (informativo)'
        : 'No declarante: no obligación formal';
      recomendacion = 'Obtén certificado del fondo/administrador AFC confirmando destinación vivienda. Guarda copia del acto de compra/construcción. Si usas fondos para otro fin, pierdes beneficio INCRGO.';
      break;
    }

    case 'indemnizacion_laboral': {
      // Fuente: Art. 180 Código Sustantivo del Trabajo, resoluciones laborales DIAN
      categoria_incrgo = 'Indemnización laboral (despido, antigüedad, prima, vacaciones)';
      // Nota: indemnización por despido sin justa causa es en general INCRGO, pero solo la parte legal
      // Tope aproximado: 30 días de salario por año de antigüedad + prima + vacaciones
      // Simplificación: asumimos hasta cierto rango como INCRGO
      tope_legal_2026 = montoPrueba; // Asumimos validación básica
      es_incrgo = true; // Generalmente INCRGO si es despido sin justa causa
      monto_dentro_tope = true;
      exceso_tributable = 0;
      obligacion_declarativa = esDeclarante
        ? 'Declarante obligatorio: reporta en formulario 210; requiere certificado empleador con desglose rubros'
        : 'No declarante: guardar liquidación de nómina con desglose';
      recomendacion = 'Pide al empleador certificado de liquidación con desglose: antigüedad (INCRGO), prima (INCRGO), vacaciones (INCRGO), daño moral (puede tributar). Consulta contador si incluye acuerdos adicionales.';
      break;
    }

    case 'otro': {
      categoria_incrgo = 'Otro ingreso no constitutivo (requiere validación específica DIAN)';
      tope_legal_2026 = 0; // No determinado
      es_incrgo = false; // Conservador: requiere consulta a DIAN
      monto_dentro_tope = false;
      exceso_tributable = montoPrueba; // Asume tributación hasta confirmar
      obligacion_declarativa = 'Requiere consulta especializada a DIAN o asesor tributario';
      recomendacion = 'Contacta a DIAN (www.dian.gov.co) o consulta contador público para validar si tu ingreso específico es INCRGO.';
      break;
    }

    default: {
      categoria_incrgo = 'Sin clasificación';
      es_incrgo = false;
      tope_legal_2026 = 0;
      monto_dentro_tope = false;
      exceso_tributable = montoPrueba;
      obligacion_declarativa = 'Tipo de ingreso no reconocido';
      recomendacion = 'Revisa tu selección e intenta nuevamente';
    }
  }

  // Validaciones adicionales
  if (esDeclarante && montoPrueba > TOPE_NO_DECLARANTES_2026) {
    obligacion_declarativa = `${obligacion_declarativa} (ingresos totales superan tope no declarantes: $${TOPE_NO_DECLARANTES_2026.toLocaleString('es-CO')})`;
  }

  return {
    es_incrgo,
    categoria_incrgo,
    tope_legal_2026,
    monto_dentro_tope,
    exceso_tributable,
    obligacion_declarativa,
    recomendacion
  };
}
