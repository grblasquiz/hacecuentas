export interface Inputs {
  precio_vivienda: number;
  tipo_vivienda: 'usada' | 'nueva';
  ccaa: string;
  vivienda_habitual: 'si' | 'no';
  edad_comprador?: number;
}

export interface Outputs {
  impuesto_principal: number;
  tipo_itp_aplicado: number;
  ajd: number;
  total_impuestos: number;
  porcentaje_sobre_precio: number;
  nota_reduccion: string;
}

// Tipos ITP generales y reducidos por CCAA (2026)
// Fuente: Ministerio de Hacienda y Consejerías de Hacienda autonómicas
const ITP_TIPOS: Record<string, { general: number; reducido: number; condicion_reducido: string }> = {
  AND: { general: 0.07, reducido: 0.035, condicion_reducido: 'Tipo reducido para jóvenes <35 años con VH y renta limitada' },
  ARA: { general: 0.08, reducido: 0.05,  condicion_reducido: 'Tipo reducido para VH con comprador <36 años' },
  AST: { general: 0.08, reducido: 0.03,  condicion_reducido: 'Tipo reducido para VH con requisitos de renta' },
  BAL: { general: 0.08, reducido: 0.04,  condicion_reducido: 'Tipo reducido para VH con precio ≤270.000 €' },
  CAN: { general: 0.065,reducido: 0.04,  condicion_reducido: 'Tipo reducido para VH con requisitos de renta (IGIC en lugar de ITP/IVA)' },
  CAB: { general: 0.10, reducido: 0.05,  condicion_reducido: 'Tipo reducido para VH y compradores jóvenes' },
  CLM: { general: 0.09, reducido: 0.06,  condicion_reducido: 'Tipo reducido para VH' },
  CYL: { general: 0.08, reducido: 0.04,  condicion_reducido: 'Tipo reducido para jóvenes <36 años con VH' },
  CAT: { general: 0.10, reducido: 0.05,  condicion_reducido: 'Tipo reducido para VH con precio ≤190.000 €' },
  EXT: { general: 0.08, reducido: 0.05,  condicion_reducido: 'Tipo reducido para VH' },
  GAL: { general: 0.10, reducido: 0.06,  condicion_reducido: 'Tipo reducido para VH' },
  MAD: { general: 0.06, reducido: 0.04,  condicion_reducido: 'Tipo reducido para VH (familia numerosa o jóvenes <35 con renta limitada)' },
  MUR: { general: 0.08, reducido: 0.03,  condicion_reducido: 'Tipo reducido para jóvenes <35 años con VH' },
  NAV: { general: 0.06, reducido: 0.06,  condicion_reducido: 'Régimen foral; tipo único orientativo' },
  RIO: { general: 0.07, reducido: 0.05,  condicion_reducido: 'Tipo reducido para VH' },
  VAL: { general: 0.10, reducido: 0.08,  condicion_reducido: 'Tipo reducido para VH, discapacidad o familia numerosa' },
  PVA: { general: 0.07, reducido: 0.07,  condicion_reducido: 'Régimen foral; tipo orientativo' },
};

// Tipos AJD por CCAA para vivienda nueva (2026)
// Fuente: Ministerio de Hacienda y Consejerías de Hacienda autonómicas
const AJD_TIPOS: Record<string, number> = {
  AND: 0.012,
  ARA: 0.010,
  AST: 0.012,
  BAL: 0.015,
  CAN: 0.007, // Canarias usa IGIC; AJD propio
  CAB: 0.010,
  CLM: 0.015,
  CYL: 0.010,
  CAT: 0.015,
  EXT: 0.010,
  GAL: 0.015,
  MAD: 0.007,
  MUR: 0.015,
  NAV: 0.005,
  RIO: 0.010,
  VAL: 0.015,
  PVA: 0.005,
};

// IVA vivienda nueva estatal: 10 % (4 % VPO régimen especial, no contemplado aquí)
const IVA_VIVIENDA_NUEVA = 0.10;

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, i.precio_vivienda || 0);
  const ccaa = i.ccaa || 'MAD';
  const esNueva = i.tipo_vivienda === 'nueva';
  const esHabitual = i.vivienda_habitual === 'si';
  const edad = i.edad_comprador ?? 99;

  const datosCCAA = ITP_TIPOS[ccaa] ?? ITP_TIPOS['MAD'];
  const tipoAJD = AJD_TIPOS[ccaa] ?? AJD_TIPOS['MAD'];

  let impuesto_principal = 0;
  let tipo_itp_aplicado = 0;
  let ajd = 0;
  let nota_reduccion = '';

  if (!esNueva) {
    // Vivienda usada: calcula ITP
    // Determina si aplica tipo reducido:
    // Condición simplificada: vivienda habitual Y (menor de 35/36 OR CCAA con reducción general por VH)
    // En la práctica cada CCAA tiene requisitos adicionales (renta, precio). Se indica en la nota.
    const ccaaSinReduccionEspecificaJoven: string[] = ['NAV', 'PVA', 'GAL', 'CAB', 'EXT', 'RIO', 'CLM'];
    const aplicaReducido = esHabitual && (
      edad < 36 ||
      !ccaaSinReduccionEspecificaJoven.includes(ccaa)
    );

    if (aplicaReducido && datosCCAA.reducido < datosCCAA.general) {
      tipo_itp_aplicado = datosCCAA.reducido;
      nota_reduccion = `Se ha aplicado el tipo reducido del ${
        (datosCCAA.reducido * 100).toFixed(1)
      }%. ${datosCCAA.condicion_reducido}. Verifica que cumples todos los requisitos de renta y precio máximo en tu CCAA antes de autoliquidar.`;
    } else {
      tipo_itp_aplicado = datosCCAA.general;
      if (esHabitual && datosCCAA.reducido < datosCCAA.general) {
        nota_reduccion = `Se ha aplicado el tipo general (${
          (datosCCAA.general * 100).toFixed(1)
        }%). Podrías optar a un tipo reducido del ${
          (datosCCAA.reducido * 100).toFixed(1)
        }% si cumples: ${datosCCAA.condicion_reducido}.`;
      } else {
        nota_reduccion = `Tipo ITP general de ${
          (datosCCAA.general * 100).toFixed(1)
        }% para ${ccaa}. La base imponible puede ser el valor de referencia catastral si supera el precio escriturado.`;
      }
    }

    impuesto_principal = precio * tipo_itp_aplicado;
    ajd = 0; // En vivienda usada el AJD de la escritura es mínimo (cuota fija, no proporcional al precio) y la hipoteca la paga el banco
  } else {
    // Vivienda nueva: IVA 10% + AJD
    // Canarias: IGIC 6,5% en lugar de IVA; se indica en nota
    if (ccaa === 'CAN') {
      tipo_itp_aplicado = 0.065; // IGIC Canarias
      impuesto_principal = precio * tipo_itp_aplicado;
      nota_reduccion = 'En Canarias la vivienda nueva tributa por IGIC al 6,5 % (no IVA estatal) más AJD canario. Verifica el tipo IGIC vigente en el Gobierno de Canarias.';
    } else {
      tipo_itp_aplicado = IVA_VIVIENDA_NUEVA;
      impuesto_principal = precio * IVA_VIVIENDA_NUEVA;
      nota_reduccion = `IVA al 10% (general para vivienda libre). Las VPO de régimen especial tributan al 4%. AJD al ${
        (tipoAJD * 100).toFixed(1)
      }% según ${ccaa}.`;
    }
    ajd = precio * tipoAJD;
  }

  const total_impuestos = impuesto_principal + ajd;
  const porcentaje_sobre_precio = precio > 0 ? (total_impuestos / precio) * 100 : 0;

  return {
    impuesto_principal: Math.round(impuesto_principal * 100) / 100,
    tipo_itp_aplicado: Math.round(tipo_itp_aplicado * 10000) / 100, // en porcentaje con 2 decimales
    ajd: Math.round(ajd * 100) / 100,
    total_impuestos: Math.round(total_impuestos * 100) / 100,
    porcentaje_sobre_precio: Math.round(porcentaje_sobre_precio * 100) / 100,
    nota_reduccion,
  };
}
