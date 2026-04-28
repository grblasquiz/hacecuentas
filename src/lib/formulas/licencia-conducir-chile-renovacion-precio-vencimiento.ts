export interface Inputs {
  clase_licencia: 'b_normal' | 'b_automatica' | 'c' | 'e' | 'a1' | 'a2' | 'a3' | 'taxi' | 'bus';
  dias_vencida: number;
  examen_psicotecnico: 'no' | 'si' | 'revalidacion';
  include_expedited: 'no' | 'si';
  primera_licencia: 'no' | 'si';
}

export interface Outputs {
  arancel_base: number;
  costo_examen_oftalmologico: number;
  costo_psicotecnico: number;
  multa_vencimiento: number;
  costo_expedited: number;
  costo_total: number;
  vigencia_anos: number;
  fecha_vencimiento: string;
  requisitos_docentes: string;
  sancion_adicional: string;
}

export function compute(i: Inputs): Outputs {
  // Aranceles base SII 2026 Chile
  const aranceles: Record<string, number> = {
    'b_normal': 14500,
    'b_automatica': 15200,
    'c': 16800,
    'e': 22100,
    'a1': 12300,
    'a2': 14900,
    'a3': 18700,
    'taxi': 20500,
    'bus': 24300
  };

  // Vigencia en años por clase
  const vigencia_anos: Record<string, number> = {
    'b_normal': 6,
    'b_automatica': 6,
    'c': 6,
    'e': 4,
    'a1': 4,
    'a2': 4,
    'a3': 4,
    'taxi': 4,
    'bus': 4
  };

  // Costo examen oftalmológico (obligatorio todas las renovaciones)
  const costo_examen_oftalmologico = 8500; // SII 2026

  // Costo examen psicotécnico por clase (si aplica)
  const psicotecnico_costos: Record<string, number> = {
    'b_normal': 0,
    'b_automatica': 0,
    'c': 0,
    'e': 20000,
    'a1': 18500,
    'a2': 22000,
    'a3': 25000,
    'taxi': 22000,
    'bus': 25000
  };

  const arancel_base = aranceles[i.clase_licencia];
  const vigencia = vigencia_anos[i.clase_licencia];
  
  // Determinar costo psicotécnico
  let costo_psicotecnico = 0;
  if (i.examen_psicotecnico === 'si' || i.examen_psicotecnico === 'revalidacion') {
    costo_psicotecnico = psicotecnico_costos[i.clase_licencia] > 0 
      ? psicotecnico_costos[i.clase_licencia] 
      : (i.examen_psicotecnico === 'revalidacion' ? 15000 : 0);
  }

  // Calcular multa por vencimiento (UTM 2026 = $68.100)
  const UTM_2026 = 68100;
  let multa_vencimiento = 0;
  if (i.dias_vencida > 0) {
    if (i.dias_vencida <= 180) {
      multa_vencimiento = 0.5 * UTM_2026; // $34.050
    } else if (i.dias_vencida <= 365) {
      multa_vencimiento = 1 * UTM_2026; // $68.100
    } else {
      multa_vencimiento = 3 * UTM_2026; // $204.300
    }
  }

  // Costo recargo exprés
  const costo_expedited = i.include_expedited === 'si' ? 3500 : 0;

  // Costo primera licencia si aplica
  const costo_primera_licencia = i.primera_licencia === 'si' ? 8500 : 0;

  // Total
  const costo_total = arancel_base + costo_examen_oftalmologico + costo_psicotecnico + 
                      multa_vencimiento + costo_expedited + costo_primera_licencia;

  // Calcular fecha vencimiento (hoy + vigencia años)
  const hoy = new Date();
  const fecha_vencimiento_date = new Date(hoy.getFullYear() + vigencia, hoy.getMonth(), hoy.getDate());
  const fecha_vencimiento = fecha_vencimiento_date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Requisitos documentales según clase
  let requisitos_docentes = 'Cédula de identidad original, comprobante domicilio (<3 meses), foto 4×4 color.';
  if (i.clase_licencia === 'e' || i.clase_licencia === 'taxi' || i.clase_licencia === 'bus') {
    requisitos_docentes += ' Clase profesional: certificado médico aptitud física, antecedentes policiales (últimos 10 años).';
  }
  if (i.primera_licencia === 'si') {
    requisitos_docentes += ' Primera licencia: curso básico seguridad vial (certificado), aprobación teórica/práctica Registro Civil.';
  }

  // Sanción adicional si conduce vencida
  let sancion_adicional = 'No aplica (licencia vigente)';
  if (i.dias_vencida > 0) {
    if (i.dias_vencida <= 90) {
      sancion_adicional = 'Infracción menor: $101.700 (Carabineros). Retención vehículo hasta $60.000 caución.';
    } else if (i.dias_vencida <= 365) {
      sancion_adicional = 'Infracción grave: $202.500 (Carabineros). Retención vehículo obligatoria.';
    } else {
      sancion_adicional = 'Infracción muy grave: $339.000 (Carabineros). Retención vehículo hasta 30 días. Posible internamiento juzgado de policía.';
    }
  }

  return {
    arancel_base,
    costo_examen_oftalmologico,
    costo_psicotecnico,
    multa_vencimiento: Math.round(multa_vencimiento),
    costo_expedited,
    costo_total: Math.round(costo_total),
    vigencia_anos: vigencia,
    fecha_vencimiento,
    requisitos_docentes,
    sancion_adicional
  };
}
