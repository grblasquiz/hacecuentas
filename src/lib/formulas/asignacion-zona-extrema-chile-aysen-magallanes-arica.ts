export interface Inputs {
  sueldo_bruto: number;
  zona: 'arica_parinacota' | 'tarapaca' | 'antofagasta' | 'magallanes' | 'aysen' | 'Los Lagos';
}

export interface Outputs {
  porcentaje_zona: number;
  monto_asignacion: number;
  afp_asignacion: number;
  salud_asignacion: number;
  irpf_asignacion: number;
  neto_asignacion: number;
  beneficio_anual: number;
  detalle_zona: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DL 889/1975 - Zonas extremas Chile 2026
  const PORCENTAJES_ZONA: Record<string, { porcentaje: number; nombre: string }> = {
    'arica_parinacota': { porcentaje: 0.10, nombre: 'Arica y Parinacota' },
    'tarapaca': { porcentaje: 0.10, nombre: 'Tarapacá - Iquique' },
    'antofagasta': { porcentaje: 0.05, nombre: 'Antofagasta' },
    'magallanes': { porcentaje: 0.08, nombre: 'Magallanes y Antártica' },
    'aysen': { porcentaje: 0.08, nombre: 'Aysén' },
    'Los Lagos': { porcentaje: 0.05, nombre: 'Los Lagos (sectores extremos)' }
  };

  // Tasas cotización 2026 Chile
  const TASA_AFP = 0.10; // 10% obligatorio AFP
  const TASA_SALUD = 0.07; // 7% Isapre/Fonasa promedio
  const TASA_IRPF_ESTIMADA = 0.19; // Tramo estimado medio IRPF 2026
  const TASA_BONO_EMPLEO = 0.05; // Aproximación bono empleo si aplica

  // Validaciones
  if (i.sueldo_bruto <= 0) {
    return {
      porcentaje_zona: 0,
      monto_asignacion: 0,
      afp_asignacion: 0,
      salud_asignacion: 0,
      irpf_asignacion: 0,
      neto_asignacion: 0,
      beneficio_anual: 0,
      detalle_zona: 'Sueldo debe ser mayor a 0'
    };
  }

  if (!PORCENTAJES_ZONA[i.zona]) {
    return {
      porcentaje_zona: 0,
      monto_asignacion: 0,
      afp_asignacion: 0,
      salud_asignacion: 0,
      irpf_asignacion: 0,
      neto_asignacion: 0,
      beneficio_anual: 0,
      detalle_zona: 'Zona no válida. Verifica DL 889.'
    };
  }

  // Obtener porcentaje zona
  const zonaData = PORCENTAJES_ZONA[i.zona];
  const porcentaje_zona = zonaData.porcentaje * 100; // Para display

  // 1. Calcular asignación bruta
  const monto_asignacion = Math.round(i.sueldo_bruto * zonaData.porcentaje);

  // 2. Descuentos obligatorios sobre asignación
  const afp_asignacion = Math.round(monto_asignacion * TASA_AFP);
  const salud_asignacion = Math.round(monto_asignacion * TASA_SALUD);

  // 3. IRPF - Cálculo prorrateo
  // Se aplica escala progresiva sobre (sueldo + asignación)
  // Estimación: prorrateo proporcional de IRPF calculado en base anual
  const renta_total_mensual = i.sueldo_bruto + monto_asignacion;
  const renta_total_anual = renta_total_mensual * 12;

  // IRPF estimado anual con tramos 2026 (simplificado)
  // Tramo 1: hasta $0 = 0%
  // Tramo 2: $0 a $49.500 UTA = 5%
  // Tramo 3: $49.500 a $115.000 UTA = 14%
  // Tramo 4: $115.000 a $159.000 UTA = 17%
  // Tramo 5: más de $159.000 UTA = 23%
  // UTA 2026 = $64.461 (Banco Central)

  const UTA_2026 = 64461;
  const renta_uta = renta_total_anual / UTA_2026;

  let irpf_anual = 0;
  if (renta_uta > 159000) {
    irpf_anual = renta_total_anual * 0.23; // máximo tramo
  } else if (renta_uta > 115000) {
    irpf_anual = renta_total_anual * 0.17;
  } else if (renta_uta > 49500) {
    irpf_anual = renta_total_anual * 0.14;
  } else if (renta_uta > 0) {
    irpf_anual = renta_total_anual * 0.05;
  }

  // Descuento bono empleo (si aplica, mín. ingresos)
  const bono_empleo_anual = Math.max(0, Math.min(357600, irpf_anual * TASA_BONO_EMPLEO)); // ~$357.600 máximo 2026

  const irpf_neto_anual = Math.max(0, irpf_anual - bono_empleo_anual);
  const irpf_neto_mensual = Math.round(irpf_neto_anual / 12);

  // Prorrateo IRPF a asignación (proporcional)
  const irpf_asignacion = Math.round(
    (monto_asignacion / renta_total_mensual) * irpf_neto_mensual
  );

  // 4. Neto en mano
  const neto_asignacion = Math.round(
    monto_asignacion - afp_asignacion - salud_asignacion - irpf_asignacion
  );

  // 5. Beneficio anual
  const beneficio_anual = neto_asignacion * 12;

  // Detalle descriptivo
  const detalle_zona = `${zonaData.nombre} | Asignación ${porcentaje_zona.toFixed(1)}% s/sueldo bruto | DL 889/1975 | Imponible AFP e Isapre | Descontable IRPF`;

  return {
    porcentaje_zona: Math.round(porcentaje_zona * 100) / 100,
    monto_asignacion,
    afp_asignacion,
    salud_asignacion,
    irpf_asignacion,
    neto_asignacion: Math.max(0, neto_asignacion),
    beneficio_anual: Math.max(0, beneficio_anual),
    detalle_zona
  };
}
