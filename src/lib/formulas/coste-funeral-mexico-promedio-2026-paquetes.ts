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
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).traslado_terrestre = (i as any).traslado_terrestre === true || (i as any).traslado_terrestre === 'true';
  (i as any).traslado_aereo = (i as any).traslado_aereo === true || (i as any).traslado_aereo === 'true';
  (i as any).embalsamamiento = (i as any).embalsamamiento === true || (i as any).embalsamamiento === 'true';
  (i as any).ceremonia_religiosa = (i as any).ceremonia_religiosa === true || (i as any).ceremonia_religiosa === 'true';
  (i as any).catering_receptio = (i as any).catering_receptio === true || (i as any).catering_receptio === 'true';
  (i as any).seguro_funerario = (i as any).seguro_funerario === true || (i as any).seguro_funerario === 'true';
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

  // Slices del donut (valores ya redondeados; el total del gráfico = su suma exacta)
  const rBase = Math.round(costoBase);
  const rTraslado = Math.round(costoTraslado);
  const rEmbals = Math.round(costoEmbalsamamiento);
  const rVelatorio = Math.round(costoVelatorio);
  const rAtaude = Math.round(costoAtaude);
  const rCeremonia = Math.round(costoCeremonia);
  const rCatering = Math.round(costoCatering);
  const sliceDefs = [
    { label: 'Servicio base', value: rBase },
    { label: 'Ataúd', value: rAtaude },
    { label: 'Velatorio', value: rVelatorio },
    { label: 'Traslado', value: rTraslado },
    { label: 'Embalsamamiento', value: rEmbals },
    { label: 'Ceremonia', value: rCeremonia },
    { label: 'Catering', value: rCatering },
  ].filter(s => s.value > 0);
  const totalSlices = sliceDefs.reduce((a, s) => a + s.value, 0);
  const totalFmt = '$' + totalSlices.toLocaleString('es-MX');

  const esPremium = rangoPaquete.includes('Premium');
  const insightTone = esPremium ? 'warn' : rangoPaquete.includes('Básico') ? 'good' : 'neutral';
  const mayor = sliceDefs.slice().sort((a, b) => b.value - a.value)[0];
  const mayorPct = totalSlices > 0 ? Math.round((mayor.value / totalSlices) * 100) : 0;
  const insightText = esPremium
    ? `El presupuesto total ronda **${totalFmt} MXN** (${rangoPaquete}). El rubro más pesado es **${mayor.label}** (~${mayorPct}% del total). Pedí cotizaciones a varias funerarias y evaluá un seguro funerario para no descapitalizarte.`
    : `Tu servicio estimado suma **${totalFmt} MXN** (${rangoPaquete}). El ítem que más pesa es **${mayor.label}** (~${mayorPct}% del total). Comparar funerarias puede mover el precio ±10%.`;

  return {
    costo_base_servicio: rBase,
    costo_traslado: rTraslado,
    costo_embalsamamiento: rEmbals,
    costo_velatorio: rVelatorio,
    costo_ataude: rAtaude,
    costo_ceremonia: rCeremonia,
    costo_catering: rCatering,
    costo_total: Math.round(costoTotal),
    rango_paquete: rangoPaquete,
    comparativa_funerarias: comparativaFunerarias,
    opciones_seguro: opcionesSeguro,
    recomendaciones: recomendaciones,
    _insight: {
      title: 'Desglose del costo funerario',
      text: insightText,
      tone: insightTone,
      icon: '🕊️',
    },
    _chart: {
      type: 'doughnut',
      slices: sliceDefs,
      prefix: '$',
      centerValue: totalFmt,
      centerLabel: 'costo total',
      ariaLabel: `Desglose del costo funerario por rubro, total ${totalFmt} pesos mexicanos`,
    },
  };
}
