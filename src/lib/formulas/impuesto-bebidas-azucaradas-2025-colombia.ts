export interface Inputs {
  tipo_bebida: string;
  gramos_azucar_100ml: number;
  volumen_ml: number;
  precio_base: number;
}

export interface Outputs {
  tarifa_impuesto: number;
  impuesto_bebida: number;
  subtotal_impuesto: number;
  iva_total: number;
  precio_final: number;
  carga_tributaria_porciento: number;
  impuesto_por_100ml: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes IBUA Art. 513-4 ET — Tarifa 2026 (UVT-indexada, DIAN Res. 000247/2025)
  // Umbrales oficiales: 5g y 9g por 100ml (3 tramos). Confirmar pesos vs resolución oficial.
  const TARIFA_EXENTA = 0;  // $/100ml (< 5g azúcar/100ml — exento)
  const TARIFA_MEDIA = 40;  // $/100ml (≥5g y <9g azúcar/100ml) — 2026
  const TARIFA_ALTA = 68;   // $/100ml (≥9g azúcar/100ml) — 2026
  const IVA = 0.19;         // 19% según Ley 1819/2016

  // Validación básica
  const gramoAzucar = Math.max(0, Math.min(15, i.gramos_azucar_100ml));
  const volumen = Math.max(100, Math.min(5000, i.volumen_ml));
  const precioBase = Math.max(0, i.precio_base);

  // 1. Determinar tarifa según contenido de azúcar (Art. 513-4 ET, umbrales 5g/9g)
  let tarifaImpuesto: number;
  if (gramoAzucar < 5) {
    tarifaImpuesto = TARIFA_EXENTA;
  } else if (gramoAzucar < 9) {
    tarifaImpuesto = TARIFA_MEDIA;
  } else {
    tarifaImpuesto = TARIFA_ALTA;
  }

  // 2. Calcular impuesto a bebidas azucaradas
  // Impuesto = (tarifa en $/100ml × volumen en ml) / 100
  const impuestoBebida = (tarifaImpuesto * volumen) / 100;

  // 3. Subtotal (precio base + impuesto bebida)
  const subtotal = precioBase + impuestoBebida;

  // 4. IVA 19% sobre subtotal que ya incluye impuesto
  const ivaTotal = subtotal * IVA;

  // 5. Precio final consumidor
  const precioFinal = subtotal + ivaTotal;

  // 6. Carga tributaria total
  const cargaTributaria = precioFinal > 0 ? ((impuestoBebida + ivaTotal) / precioFinal) * 100 : 0;

  // 7. Impuesto normalizado a 100ml
  const impuestoPor100ml = tarifaImpuesto;

  // ── INSIGHT + GRÁFICO ───────────────────────────────────────────────────────
  const cop = (v: number) => '$' + Math.round(v).toLocaleString('es-CO');
  const tramo =
    gramoAzucar < 5 ? 'exenta (menos de 5 g/100 ml)' :
    gramoAzucar < 9 ? 'tarifa media (5–9 g/100 ml)' :
    'tarifa alta (9 g/100 ml o más)';
  const cargaFmt = (Math.round(cargaTributaria * 100) / 100).toLocaleString('es-CO');

  const _insight = tarifaImpuesto === 0
    ? {
        title: 'Bebida sin IBUA',
        text: `Con **${gramoAzucar} g de azúcar/100 ml** la bebida es **${tramo}**: no paga impuesto saludable. El precio final de ${cop(precioFinal)} solo carga el IVA del 19%.`,
        tone: 'good' as const,
        icon: '🥤',
      }
    : {
        title: 'Cuánto suma el impuesto saludable',
        text: `Con **${gramoAzucar} g/100 ml** aplica **${tramo}**: ${cop(impuestoBebida)} de IBUA en ${volumen} ml. Sumando el IVA, los impuestos son el **${cargaFmt}%** del precio final de **${cop(precioFinal)}**.`,
        tone: 'warn' as const,
        icon: '🥤',
      };

  const slices = [
    { label: 'Precio base', value: Math.round(precioBase * 100) / 100 },
    { label: 'IBUA (azúcar)', value: Math.round(impuestoBebida * 100) / 100 },
    { label: 'IVA 19%', value: Math.round(ivaTotal * 100) / 100 },
  ].filter((s) => s.value > 0);

  const _chart = precioFinal > 0 && slices.length >= 2
    ? {
        type: 'doughnut' as const,
        slices,
        prefix: '$',
        centerValue: cop(precioFinal),
        centerLabel: 'Precio final',
        ariaLabel: 'Composición del precio final: base, impuesto a bebidas azucaradas e IVA',
      }
    : undefined;

  return {
    tarifa_impuesto: Math.round(tarifaImpuesto * 100) / 100,
    impuesto_bebida: Math.round(impuestoBebida * 100) / 100,
    subtotal_impuesto: Math.round(subtotal * 100) / 100,
    iva_total: Math.round(ivaTotal * 100) / 100,
    precio_final: Math.round(precioFinal * 100) / 100,
    carga_tributaria_porciento: Math.round(cargaTributaria * 100) / 100,
    impuesto_por_100ml: Math.round(impuestoPor100ml * 100) / 100,
    _insight,
    _chart
  };
}
