/** IRPF España Madrid 2026 — asalariado (tramos estatales + autonómicos Madrid) */
export interface Inputs { salarioBrutoAnual: number; cotizacionSS: number; minimoPersonal: number; }
export interface Outputs { cuotaEstatal: number; cuotaAutonomica: number; cuotaTotal: number; tipoEfectivo: number; netoAnual: number; netoMensual: number; desglose: string; _insight?: any; _chart?: any; }

// Tramos estatales 2026 (mitad del IRPF total se paga al Estado)
const TRAMOS_ESTATALES: Array<[number, number]> = [
  [12450, 0.095],
  [20200, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [300000, 0.225],
  [Infinity, 0.245],
];

// Tramos autonómicos Madrid 2026 (Comunidad con tramos más bajos de España)
const TRAMOS_MADRID: Array<[number, number]> = [
  [13362, 0.085],
  [19004, 0.107],
  [35425, 0.128],
  [57320, 0.174],
  [Infinity, 0.205],
];

function calcularTramos(base: number, tramos: Array<[number, number]>): number {
  if (base <= 0) return 0;
  let impuesto = 0;
  let prev = 0;
  for (const [limite, tasa] of tramos) {
    if (base > prev) {
      const gravable = Math.min(base, limite) - prev;
      impuesto += gravable * tasa;
      prev = limite;
      if (base <= limite) break;
    }
  }
  return impuesto;
}

export function irpfMadrid2026(i: Inputs): Outputs {
  const salario = Number(i.salarioBrutoAnual);
  const ss = Number(i.cotizacionSS) || Math.min(salario * 0.0635, 4495);
  const minimo = Number(i.minimoPersonal) || 5550;
  if (!salario || salario <= 0) throw new Error('Ingresá salario bruto anual válido');
  const baseImponible = Math.max(0, salario - ss - minimo);
  const cuotaEstatal = calcularTramos(baseImponible, TRAMOS_ESTATALES);
  const cuotaAutonomica = calcularTramos(baseImponible, TRAMOS_MADRID);
  const cuotaTotal = cuotaEstatal + cuotaAutonomica;
  const tipoEfectivo = salario > 0 ? (cuotaTotal / salario) * 100 : 0;
  const netoAnual = salario - ss - cuotaTotal;

  const rEstatal = Math.round(cuotaEstatal);
  const rAuto = Math.round(cuotaAutonomica);
  const rTotal = Math.round(cuotaTotal);
  const rNetoMensual = Math.round(netoAnual / 14);
  const tef = Number(tipoEfectivo.toFixed(2));

  const tone: 'good' | 'warn' | 'neutral' = tef < 15 ? 'good' : tef < 25 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu IRPF en Madrid',
    text: `De tus ${salario.toLocaleString('es-ES')}€ brutos pagás **${rTotal.toLocaleString('es-ES')}€** de IRPF al año (tipo efectivo **${tef}%**), repartidos entre **${rEstatal.toLocaleString('es-ES')}€** estatales y **${rAuto.toLocaleString('es-ES')}€** del tramo madrileño. Te quedan **${rNetoMensual.toLocaleString('es-ES')}€** netos al mes (en 14 pagas). Madrid tiene la escala autonómica más baja de España.`,
    tone,
    icon: '🇪🇸',
  };

  const out: Outputs = {
    cuotaEstatal: rEstatal,
    cuotaAutonomica: rAuto,
    cuotaTotal: rTotal,
    tipoEfectivo: tef,
    netoAnual: Math.round(netoAnual),
    netoMensual: rNetoMensual,
    desglose: `Base imponible: ${baseImponible.toFixed(0)}€ | Estatal: ${cuotaEstatal.toFixed(0)}€ | Madrid: ${cuotaAutonomica.toFixed(0)}€ | Total IRPF: ${cuotaTotal.toFixed(0)}€`,
    _insight,
  };

  // Donut: la cuota total se reparte en tramo estatal + tramo autonómico (Madrid)
  if (rEstatal + rAuto > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Tramo estatal', value: rEstatal },
        { label: 'Tramo Madrid', value: rAuto },
      ],
      prefix: '',
      centerValue: (rEstatal + rAuto).toLocaleString('es-ES') + '€',
      centerLabel: 'IRPF total',
      ariaLabel: 'Reparto de la cuota de IRPF entre el tramo estatal y el tramo autonómico de Madrid',
    };
  }

  return out;
}
