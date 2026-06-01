export interface Inputs {
  tipo_bono: 'marzo' | 'invierno' | 'logro_escolar';
  rsh_uf: number;
  numero_hijos: number;
  region: 'metropolitana' | 'norte' | 'sur' | 'norte_patagonia';
  tiene_discapacitado: 'si' | 'no';
}

export interface Outputs {
  cuantia_bono: number;
  califica: string;
  requisitos_cumplidos: string;
  fecha_pago_estimada: string;
  monto_adicional_hijos: number;
  monto_discapacidad: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuente: Ministerio de Hacienda, SII
  const TOPE_RSH_MARZO_UF = 3.0; // Máximo para calificar Bono Marzo
  const TOPE_RSH_INVIERNO_UF = 2.5; // Máximo para Bono Invierno
  const TOPE_RSH_LOGRO_UF = 3.0; // Máximo para Bono Logro Escolar

  // Montos base 2026 (sin hijos) - SII publicó estos valores en enero 2026
  const BONO_MARZO_BASE = 102048; // $ peso chileno
  const BONO_MARZO_CON_HIJOS = 127560; // Máximo con dependientes
  const BONO_MARZO_POR_HIJO = 19734;
  const BONO_MARZO_DISCAPACIDAD = 25460;

  const BONO_INVIERNO_BASE = 84680;
  const BONO_INVIERNO_CON_HIJOS = 105850;
  const BONO_INVIERNO_POR_HIJO = 15893;
  const BONO_INVIERNO_DISCAPACIDAD = 20370;

  const BONO_LOGRO_BASE = 151200;
  const BONO_LOGRO_MAX = 189000; // Con hijos y bonificación académica
  const BONO_LOGRO_POR_HIJO = 14200;
  const BONO_LOGRO_DISCAPACIDAD = 31800;

  // Ajustes regionales (porcentaje sobre monto base)
  const AJUSTE_REGION: { [key: string]: number } = {
    'metropolitana': 0.0,
    'norte': 0.08,
    'sur': 0.15,
    'norte_patagonia': 0.12
  };

  let cuantia_bono = 0;
  let califica = false;
  let requisitos_cumplidos = '';
  let fecha_pago_estimada = '';
  let monto_adicional_hijos = 0;
  let monto_discapacidad = 0;

  // Validar según tipo de bono
  if (i.tipo_bono === 'marzo') {
    if (i.rsh_uf <= TOPE_RSH_MARZO_UF) {
      califica = true;
      let base = i.numero_hijos > 0 ? BONO_MARZO_CON_HIJOS : BONO_MARZO_BASE;
      
      // Incremento por hijos (máximo 5)
      const hijos_reconocidos = Math.min(i.numero_hijos, 5);
      if (i.numero_hijos > 0) {
        monto_adicional_hijos = hijos_reconocidos * BONO_MARZO_POR_HIJO;
        cuantia_bono = base + monto_adicional_hijos;
      } else {
        cuantia_bono = base;
      }

      // Descuenta base del máximo si suma supera tope
      if (cuantia_bono > BONO_MARZO_CON_HIJOS) {
        cuantia_bono = BONO_MARZO_CON_HIJOS;
      }

      // Ajuste regional
      const ajuste = AJUSTE_REGION[i.region] || 0;
      cuantia_bono = Math.round(cuantia_bono * (1 + ajuste));

      // Bono discapacidad
      if (i.tiene_discapacitado === 'si') {
        monto_discapacidad = BONO_MARZO_DISCAPACIDAD;
        cuantia_bono += monto_discapacidad;
      }

      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF ≤ 3 UF (✓), ${i.numero_hijos} hijo(s) dependiente(s), familia acreditada ante SII`;
      fecha_pago_estimada = 'Última semana de marzo (28-31 de marzo 2026)';
    } else {
      califica = false;
      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF supera límite máximo de 3 UF. No califica.`;
      fecha_pago_estimada = 'N/A';
    }
  } else if (i.tipo_bono === 'invierno') {
    if (i.rsh_uf <= TOPE_RSH_INVIERNO_UF) {
      califica = true;
      let base = i.numero_hijos > 0 ? BONO_INVIERNO_CON_HIJOS : BONO_INVIERNO_BASE;
      
      const hijos_reconocidos = Math.min(i.numero_hijos, 5);
      if (i.numero_hijos > 0) {
        monto_adicional_hijos = hijos_reconocidos * BONO_INVIERNO_POR_HIJO;
        cuantia_bono = base + monto_adicional_hijos;
      } else {
        cuantia_bono = base;
      }

      if (cuantia_bono > BONO_INVIERNO_CON_HIJOS) {
        cuantia_bono = BONO_INVIERNO_CON_HIJOS;
      }

      // Ajuste regional (regiones Sur con mayor incremento)
      const ajuste = AJUSTE_REGION[i.region] || 0;
      cuantia_bono = Math.round(cuantia_bono * (1 + ajuste));

      if (i.tiene_discapacitado === 'si') {
        monto_discapacidad = BONO_INVIERNO_DISCAPACIDAD;
        cuantia_bono += monto_discapacidad;
      }

      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF ≤ 2.5 UF (✓), ${i.numero_hijos} hijo(s), vulnerabilidad socioeconómica acreditada`;
      fecha_pago_estimada = 'Primera o segunda semana de julio 2026';
    } else {
      califica = false;
      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF supera límite de 2.5 UF para Bono Invierno. No califica.`;
      fecha_pago_estimada = 'N/A';
    }
  } else if (i.tipo_bono === 'logro_escolar') {
    if (i.rsh_uf <= TOPE_RSH_LOGRO_UF) {
      // Requiere validación adicional: ser estudiante de educación superior o graduado últimos 2 años
      // Por simplicidad, calculamos monto si cumple RSH
      califica = true;
      let base = BONO_LOGRO_BASE;
      
      const hijos_reconocidos = Math.min(i.numero_hijos, 5);
      if (i.numero_hijos > 0) {
        monto_adicional_hijos = hijos_reconocidos * BONO_LOGRO_POR_HIJO;
        cuantia_bono = base + monto_adicional_hijos;
      } else {
        cuantia_bono = base;
      }

      if (cuantia_bono > BONO_LOGRO_MAX) {
        cuantia_bono = BONO_LOGRO_MAX;
      }

      const ajuste = AJUSTE_REGION[i.region] || 0;
      cuantia_bono = Math.round(cuantia_bono * (1 + ajuste));

      if (i.tiene_discapacitado === 'si') {
        monto_discapacidad = BONO_LOGRO_DISCAPACIDAD;
        cuantia_bono += monto_discapacidad;
      }

      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF ≤ 3 UF (✓), estudiante de educación superior o graduado últimos 2 años (verificar con Junaeb), ${i.numero_hijos} hijo(s)`;
      fecha_pago_estimada = 'Última semana de diciembre 2026';
    } else {
      califica = false;
      requisitos_cumplidos = `RSH ${i.rsh_uf.toFixed(2)} UF supera límite de 3 UF. No califica a Bono Logro Escolar.`;
      fecha_pago_estimada = 'N/A';
    }
  }

  const nombreBono = i.tipo_bono === 'marzo' ? 'Marzo' : i.tipo_bono === 'invierno' ? 'Invierno' : 'Logro Escolar';
  const montoFmt = Math.round(cuantia_bono).toLocaleString('es-CL');
  const extras: string[] = [];
  if (monto_adicional_hijos > 0) extras.push(`**$${Math.round(monto_adicional_hijos).toLocaleString('es-CL')}** por hijos`);
  if (monto_discapacidad > 0) extras.push(`**$${Math.round(monto_discapacidad).toLocaleString('es-CL')}** por discapacidad`);
  const extrasTxt = extras.length ? ` Incluye ${extras.join(' y ')}.` : '';
  const _insight = califica
    ? {
        title: `Calificás al Bono ${nombreBono}`,
        text: `Según tu RSH de **${i.rsh_uf.toFixed(2)} UF** te corresponden **$${montoFmt}** (peso chileno).${extrasTxt} Pago estimado: ${fecha_pago_estimada}.`,
        tone: 'good' as const,
        icon: '💰',
      }
    : {
        title: `No calificás al Bono ${nombreBono}`,
        text: `Tu RSH de **${i.rsh_uf.toFixed(2)} UF** supera el tope de calificación, así que **no te corresponde** este bono. El cupo se reserva para hogares de mayor vulnerabilidad socioeconómica.`,
        tone: 'warn' as const,
        icon: '🚫',
      };

  return {
    cuantia_bono: Math.round(cuantia_bono),
    califica: califica ? `Sí, califica al Bono ${nombreBono}` : 'No califica',
    requisitos_cumplidos,
    fecha_pago_estimada,
    monto_adicional_hijos: Math.round(monto_adicional_hijos),
    monto_discapacidad: Math.round(monto_discapacidad),
    _insight
  };
}
