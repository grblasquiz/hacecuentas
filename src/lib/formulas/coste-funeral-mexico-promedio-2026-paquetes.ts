export interface Inputs {
  tipo_servicio: 'inhumacion' | 'cremacion' | 'cripta';
  traslado_terrestre: boolean;
  distancia_traslado_km: number;
  traslado_aereo: boolean;
  embalsamamiento: boolean;
  dias_velatorio: number;
  ataude_tipo: 'basico' | 'intermedio' | 'premium';
  ceremonia_religiosa: boolean;
  catering_receptio: boolean;
  numero_asistentes: number;
  funeraria_seleccionada: 'gayosso' | 'garcia_lopez' | 'recinto_memorial' | 'generica';
  seguro_funerario: boolean;
}

export interface Outputs {
  costo_base_servicio: number;
  costo_traslado: number;
  costo_embalsamamiento: number;
  costo_velatorio: number;
  costo_ataude: number;
  costo_ceremonia: number;
  costo_catering: number;
  costo_total: number;
  rango_paquete: string;
  comparativa_funerarias: Array<{funeraria: string; basico: number; medio: number; premium: number}>;
  opciones_seguro: Array<{plan: string; prima_mensual: number; cobertura: string; limite: number}>;
  recomendaciones: string;
}

export function compute(i: Inputs): Outputs {
  // Costos base por tipo servicio (MXN 2026, fuente: funerarias principales)
  const costosBase: Record<string, number> = {
    inhumacion: 12000,  // promedio nacional
    cremacion: 7500,    // 40% menos que inhumación
    cripta: 15000       // mausoleo/cripta
  };

  let costoBase = costosBase[i.tipo_servicio] || 12000;

  // Ajuste por funeraria (variabilidad ±10%)
  const ajustesFuneraria: Record<string, number> = {
    gayosso: 1.05,
    garcia_lopez: 0.95,
    recinto_memorial: 1.08,
    generica: 1.0
  };
  costoBase = costoBase * (ajustesFuneraria[i.funeraria_seleccionada] || 1.0);

  // Traslado terrestre
  let costoTraslado = 0;
  if (i.traslado_terrestre) {
    const tarifaBase = 3500; // primeros 15 km
    const kmAdicionales = Math.max(0, i.distancia_traslado_km - 15);
    const tarifaPorKm = 200; // $200/km adicional
    costoTraslado = tarifaBase + (kmAdicionales * tarifaPorKm);
  }
  if (i.traslado_aereo) {
    costoTraslado += 25000; // promedio traslado aéreo nacional
  }

  // Embalsamamiento
  let costoEmbalsamamiento = 0;
  if (i.embalsamamiento) {
    const tarifaPorDia = 2000; // $2-2.5K/día promedio
    costoEmbalsamamiento = tarifaPorDia * Math.min(i.dias_velatorio, 7);
  }

  // Velatorio (renta de sala)
  const tarifaVelatorio: Record<string, number> = {
    basico: 1500,
    intermedio: 2500,
    premium: 3500
  };
  const tipoSalaAjustado = i.ataude_tipo || 'intermedio';
  const costoVelatorio = (tarifaVelatorio[tipoSalaAjustado] || 2500) * i.dias_velatorio;

  // Ataúd
  const costosAtaude: Record<string, number> = {
    basico: 5500,
    intermedio: 11500,
    premium: 22500
  };
  const costoAtaude = costosAtaude[i.ataude_tipo] || 11500;

  // Ceremonia religiosa
  const costoCeremonia = i.ceremonia_religiosa ? 2000 : 0;

  // Catering
  let costoCatering = 0;
  if (i.catering_receptio && i.numero_asistentes > 0) {
    const tarifaPorPersona = 100; // $100/persona (bebidas/refrigerios)
    costoCatering = tarifaPorPersona * i.numero_asistentes;
  }

  // Total
  const costoTotal = costoBase + costoTraslado + costoEmbalsamamiento + costoVelatorio + costoAtaude + costoCeremonia + costoCatering;

  // Categoría de paquete
  let rangoPaquete = 'Personalizado';
  if (costoTotal < 80000) {
    rangoPaquete = 'Paquete Básico ($30-80K)';
  } else if (costoTotal < 150000) {
    rangoPaquete = 'Paquete Medio ($80-150K)';
  } else {
    rangoPaquete = 'Paquete Premium ($150K+)';
  }

  // Comparativa de funerarias
  const comparativaFunerarias = [
    {
      funeraria: 'Gayosso',
      basico: 31500,
      medio: 80000,
      premium: 150000
    },
    {
      funeraria: 'J. García López',
      basico: 28500,
      medio: 75000,
      premium: 135000
    },
    {
      funeraria: 'Recinto Memorial',
      basico: 35000,
      medio: 87500,
      premium: 160000
    },
    {
      funeraria: 'Promedio Nacional',
      basico: 32000,
      medio: 80000,
      premium: 145000
    }
  ];

  // Opciones de seguro funerario
  const opcionesSeguro = [
    {
      plan: 'Básico',
      prima_mensual: 200,
      cobertura: 'Inhumación simple',
      limite: 50000
    },
    {
      plan: 'Intermedio',
      prima_mensual: 325,
      cobertura: 'Inhumación + traslado + embalsamamiento',
      limite: 100000
    },
    {
      plan: 'Premium',
      prima_mensual: 550,
      cobertura: 'Todo incluido + servicios internacionales',
      limite: 200000
    },
    {
      plan: 'Cobertura Familiar (hasta 4 personas)',
      prima_mensual: 750,
      cobertura: 'Paquete completo por persona',
      limite: 150000
    }
  ];

  // Recomendaciones personalizadas
  let recomendaciones = '';
  if (costoTotal > 100000 && !i.seguro_funerario) {
    recomendaciones += '💡 Tu presupuesto estimado es elevado. Considera contratar un seguro funerario (plan Intermedio o Premium) para proteger a tu familia. ';
  }
  if (i.traslado_aereo && !i.seguro_funerario) {
    recomendaciones += '⚠️ Los traslados aéreos son costosos. Un seguro con cobertura internacional (plan Premium, $550/mes) recuperaría su costo en 4 años. ';
  }
  if (i.ataude_tipo === 'premium' && costoTotal > 120000) {
    recomendaciones += '📌 Tu ataúd premium aumenta significativamente el costo. Considera opciones intermedias sin sacrificar calidad. ';
  }
  if (i.tipo_servicio === 'cremacion') {
    recomendaciones += '✓ La cremación es la opción más económica (-40-50%). Verifica que sea permitida por tu credo. ';
  }
  if (i.funeraria_seleccionada === 'garcia_lopez') {
    recomendaciones += '💰 J. García López tiene precios competitivos. Solicita cotización por región para descartar costos adicionales. ';
  }
  if (!recomendaciones) {
    recomendaciones = '✓ Tu presupuesto está dentro de los rangos nacionales. Compara con otras funerarias y solicita póliza de seguro si corresponde.';
  }

  return {
    costo_base_servicio: Math.round(costoBase),
    costo_traslado: Math.round(costoTraslado),
    costo_embalsamamiento: Math.round(costoEmbalsamamiento),
    costo_velatorio: Math.round(costoVelatorio),
    costo_ataude: Math.round(costoAtaude),
    costo_ceremonia: Math.round(costoCeremonia),
    costo_catering: Math.round(costoCatering),
    costo_total: Math.round(costoTotal),
    rango_paquete: rangoPaquete,
    comparativa_funerarias: comparativaFunerarias,
    opciones_seguro: opcionesSeguro,
    recomendaciones: recomendaciones
  };
}
