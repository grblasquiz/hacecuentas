/**
 * Calculadora de costo de impresión 3D por pieza
 */

export interface Inputs {
  gramos: number; precioKg: number; horas: number; watts: number; kwh: number; margen: number; __lang?: string;
}

export interface Outputs {
  precioFinal: number; costoMaterial: number; costoLuz: number; costoDesgaste: number; costoTotal: number; desglose: string; _chart?: any; _insight?: any;
}

export function costoImpresion3dPieza(inputs: Inputs): Outputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCampos: 'Completá todos los campos',
      labelLuz: 'Luz',
      labelDesgaste: 'Desgaste',
      centerLabel: 'Costo total',
      ariaLabel: 'Composición del costo de impresión: material, luz y desgaste de la máquina',
      insightTitle: 'Material vs. ganancia',
      insightConGanancia: (pctMat: number, gan: string, mg: number) => `El **filamento es el ${pctMat}%** del costo: ahí está la palanca para ajustar precio. Tu margen del **${mg}%** suma **$${gan}** de ganancia sobre el costo.`,
      insightSinGanancia: (pctMat: number) => `El **filamento es el ${pctMat}%** del costo. Estás vendiendo **al costo** (margen 0%): no cubrís fallas ni reimpresiones.`,
    },
    en: {
      errorCampos: 'Please fill in all fields',
      labelLuz: 'Electricity',
      labelDesgaste: 'Wear & tear',
      centerLabel: 'Total cost',
      ariaLabel: 'Printing cost breakdown: material, electricity, and machine wear',
      insightTitle: 'Material vs. profit',
      insightConGanancia: (pctMat: number, gan: string, mg: number) => `**Filament is ${pctMat}%** of the cost: that's your lever to adjust price. Your **${mg}%** margin adds **$${gan}** of profit on top of cost.`,
      insightSinGanancia: (pctMat: number) => `**Filament is ${pctMat}%** of the cost. You're selling **at cost** (0% margin): it doesn't cover failed prints or reprints.`,
    },
  } as const)[__lang];
  const g = Number(inputs.gramos);
  const pk = Number(inputs.precioKg);
  const h = Number(inputs.horas);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const mg = Number(inputs.margen);
  if (!g || !pk || !h || !w || !kwh) throw new Error(T.errorCampos);
  const material = (g / 1000) * pk;
  const luz = h * (w / 1000) * kwh;
  const desgaste = (material + luz) * 0.10;
  const total = material + luz + desgaste;
  const precio = total * (1 + mg / 100);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Material', value: Number(material.toFixed(0)) },
      { label: T.labelLuz, value: Number(luz.toFixed(0)) },
      { label: T.labelDesgaste, value: Number(desgaste.toFixed(0)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };
  const mgPct = Number.isFinite(mg) ? mg : 0;
  const pctMaterial = total > 0 ? Math.round((material / total) * 100) : 0;
  const ganancia = precio - total;
  const insight = {
    title: T.insightTitle,
    text: mgPct > 0
      ? T.insightConGanancia(pctMaterial, Math.round(ganancia).toLocaleString('es-AR'), mgPct)
      : T.insightSinGanancia(pctMaterial),
    tone: mgPct > 0 ? ('good' as const) : ('warn' as const),
    icon: '🖨️',
  };

  return {
    precioFinal: Number(precio.toFixed(0)),
    costoMaterial: Number(material.toFixed(0)),
    costoLuz: Number(luz.toFixed(0)),
    costoDesgaste: Number(desgaste.toFixed(0)),
    costoTotal: Number(total.toFixed(0)),
    desglose: __lang === 'en'
      ? `Material ${Math.round((material/total)*100)}% · Electricity ${Math.round((luz/total)*100)}% · Wear ${Math.round((desgaste/total)*100)}%`
      : `Material ${Math.round((material/total)*100)}% · Luz ${Math.round((luz/total)*100)}% · Desgaste ${Math.round((desgaste/total)*100)}%`,
    _chart: chart,
    _insight: insight,
  };
}
