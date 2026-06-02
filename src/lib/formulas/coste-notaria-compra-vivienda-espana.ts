export interface Inputs {
  precio_compra: number;
  con_hipoteca: boolean;
  importe_hipoteca?: number;
  comunidad_autonoma: string;
  incluir_gestor: boolean;
}

export interface Outputs {
  coste_escritura_compra: number;
  coste_escritura_hipoteca: number;
  registro_propiedad: number;
  tasacion: number;
  ajd: number;
  coste_gestor: number;
  gastos_totales: number;
  porcentaje_precio: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes aranceles notariales 2026 España (Colegio Notarial)
  // Escala para operaciones compraventa inmuebles
  const ESCALA_ARANCEL_NOTARIO_2026 = [
    { hasta: 6000, tarifa: 105 },
    { hasta: 12000, tarifa: 195 },
    { hasta: 30000, tarifa: 378 },
    { hasta: 60000, tarifa: 525 },
    { hasta: 150000, tarifa: 840 },
    { hasta: 300000, tarifa: 1470 },
    { hasta: 600000, tarifa: 2100 },
    { hasta: Infinity, tarifa: 2100 }
  ];

  // Tasas AJD por comunidad autónoma 2026 (AEAT)
  const TASAS_AJD: { [key: string]: number } = {
    "madrid": 0.005,         // 0,5%
    "cataluna": 0.0075,      // 0,75%
    "andalucia": 0.010,      // 1,0%
    "valencia": 0.010,       // 1,0%
    "galicia": 0.005,        // 0,5%
    "castilla_leon": 0.006,  // 0,6%
    "pais_vasco": 0.006,     // 0,6% (Impuesto Transmisiones)
    "castilla_mancha": 0.007,// 0,7%
    "murcia": 0.007,         // 0,7%
    "aragon": 0.006,         // 0,6%
    "asturias": 0.008,       // 0,8%
    "extremadura": 0.008,    // 0,8%
    "baleares": 0.007,       // 0,7%
    "canarias": 0.007,       // 0,7% (Impuesto AJD canario reducido)
    "cantabria": 0.008,      // 0,8%
    "la_rioja": 0.008,       // 0,8%
    "navarra": 0.007,        // 0,7% (régimen foral)
    "ceuta_melilla": 0.010   // 1,0%
  };

  const precioCompra = i.precio_compra || 0;
  const tieneHipoteca = i.con_hipoteca || false;
  const importeHipoteca = i.importe_hipoteca || 0;
  const ccaa = i.comunidad_autonoma || "madrid";
  const incluirGestor = i.incluir_gestor || false;

  // 1. Cálculo coste notaría escritura compra
  // Se busca en escala según precio
  let costeEscrituraCompra = 0;
  for (const tramo of ESCALA_ARANCEL_NOTARIO_2026) {
    if (precioCompra <= tramo.hasta) {
      costeEscrituraCompra = tramo.tarifa;
      break;
    }
  }
  // Añadir % complementario si supera 600k (aprox. 0,20%)
  if (precioCompra > 600000) {
    costeEscrituraCompra += (precioCompra - 600000) * 0.002;
  }

  // 2. Cálculo coste notaría escritura hipoteca (80-90% de compra)
  // Si hay hipoteca, aprox. 85% del coste de compra
  let costeEscrituraHipoteca = 0;
  if (tieneHipoteca && importeHipoteca > 0) {
    // Escala aplicada a importe hipoteca
    for (const tramo of ESCALA_ARANCEL_NOTARIO_2026) {
      if (importeHipoteca <= tramo.hasta) {
        costeEscrituraHipoteca = tramo.tarifa * 0.85; // 85% aprox.
        break;
      }
    }
    if (importeHipoteca > 600000) {
      costeEscrituraHipoteca += (importeHipoteca - 600000) * 0.002 * 0.85;
    }
  }

  // 3. Cálculo registro de propiedad
  // Arancel registrador aprox. 0,15% del valor, con mínimos/máximos por CCAA
  // Estimación simplificada: 0,15% con mín 300€, máx 700€ para normales
  let registroPropiedad = Math.max(300, Math.min(700, precioCompra * 0.0015));
  // Ajuste por CCAA (algunas son ligeramente más caras)
  if (["cataluna", "madrid", "pais_vasco"].includes(ccaa)) {
    registroPropiedad = Math.max(350, Math.min(750, precioCompra * 0.0018));
  }

  // 4. Tasación vivienda (obligatoria si hipoteca)
  let tasacion = 0;
  if (tieneHipoteca) {
    // Tasación: 300-500€ según entidad. Usar 400€ como promedio
    tasacion = 400;
  }

  // 5. AJD (Actos Jurídicos Documentados)
  const tasaAJD = TASAS_AJD[ccaa] || 0.007; // Default 0,7% si no definida
  const ajd = precioCompra * tasaAJD;

  // 6. Coste gestoría (opcional)
  let costeGestor = 0;
  if (incluirGestor) {
    // Gestoría: aprox. 300-500€, usar 400€
    costeGestor = 400;
  }

  // 7. Gastos totales
  const gastosTotales = costeEscrituraCompra + costeEscrituraHipoteca + registroPropiedad + tasacion + ajd + costeGestor;

  // 8. % sobre precio
  const porcentajePrecio = precioCompra > 0 ? (gastosTotales / precioCompra) * 100 : 0;

  // Valores redondeados (los mismos que se devuelven)
  const r_compra = Math.round(costeEscrituraCompra * 100) / 100;
  const r_hipoteca = Math.round(costeEscrituraHipoteca * 100) / 100;
  const r_registro = Math.round(registroPropiedad * 100) / 100;
  const r_tasacion = Math.round(tasacion * 100) / 100;
  const r_ajd = Math.round(ajd * 100) / 100;
  const r_gestor = Math.round(costeGestor * 100) / 100;
  const r_total = Math.round(gastosTotales * 100) / 100;
  const r_pct = Math.round(porcentajePrecio * 100) / 100;

  const fmtEur = (n: number) => `${Math.round(n).toLocaleString('es-ES')} €`;

  // --- Insight narrativo ---
  // Sin ITP/IVA, los gastos notariales+registro+AJD de obra nueva rondan el 1–2% del precio.
  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (r_pct >= 2) insightTone = 'warn';
  else if (r_pct > 0 && r_pct <= 1) insightTone = 'good';

  const partidas = [
    { label: 'el AJD', val: r_ajd },
    { label: 'la escritura de compra', val: r_compra },
    { label: 'la escritura de hipoteca', val: r_hipoteca },
    { label: 'el registro', val: r_registro }
  ];
  const mayor = partidas.reduce((a, b) => (b.val > a.val ? b : a));

  const _insight = {
    title: 'Cuánto sumás a la compra',
    text: `Comprar esta vivienda te añade unos **${fmtEur(r_total)}** en gastos (notaría, registro, AJD${tieneHipoteca ? ', tasación' : ''}), un **${r_pct}%** sobre el precio. La partida más pesada es **${mayor.label}** (${fmtEur(mayor.val)})${r_ajd >= mayor.val ? ', un impuesto que varía según tu comunidad autónoma' : ''}. Ojo: esto no incluye ITP ni IVA.`,
    tone: insightTone,
    icon: '🏡'
  };

  // --- Gráfico donut: composición de los gastos totales ---
  const slices = [
    { label: 'AJD', value: r_ajd },
    { label: 'Escritura compra', value: r_compra },
    { label: 'Escritura hipoteca', value: r_hipoteca },
    { label: 'Registro', value: r_registro },
    { label: 'Tasación', value: r_tasacion },
    { label: 'Gestoría', value: r_gestor }
  ].filter(s => s.value > 0);
  const sumaSlices = slices.reduce((a, s) => a + s.value, 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '€',
    centerValue: `${Math.round(sumaSlices).toLocaleString('es-ES')} €`,
    centerLabel: 'gastos totales',
    ariaLabel: `Reparto de los gastos de compra: AJD ${fmtEur(r_ajd)}, escritura de compra ${fmtEur(r_compra)}${r_hipoteca > 0 ? `, escritura de hipoteca ${fmtEur(r_hipoteca)}` : ''}, registro ${fmtEur(r_registro)}${r_tasacion > 0 ? `, tasación ${fmtEur(r_tasacion)}` : ''}${r_gestor > 0 ? `, gestoría ${fmtEur(r_gestor)}` : ''}.`
  };

  return {
    coste_escritura_compra: r_compra,
    coste_escritura_hipoteca: r_hipoteca,
    registro_propiedad: r_registro,
    tasacion: r_tasacion,
    ajd: r_ajd,
    coste_gestor: r_gestor,
    gastos_totales: r_total,
    porcentaje_precio: r_pct,
    _insight,
    _chart
  };
}
