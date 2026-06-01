/**
 * Calculadora de costo de impresión 3D por pieza
 */

export interface Inputs {
  gramos: number; precioKg: number; horas: number; watts: number; kwh: number; margen: number; __lang?: string;
}

export interface Outputs {
  precioFinal: number; costoMaterial: number; costoLuz: number; costoDesgaste: number; costoTotal: number; desglose: string; _chart?: any;
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
    },
    en: {
      errorCampos: 'Please fill in all fields',
      labelLuz: 'Electricity',
      labelDesgaste: 'Wear & tear',
      centerLabel: 'Total cost',
      ariaLabel: 'Printing cost breakdown: material, electricity, and machine wear',
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
  };
}
