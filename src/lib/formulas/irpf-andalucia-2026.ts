/** IRPF España Andalucía 2026 — asalariado (tramos estatales + autonómicos Andalucía) */
export interface Inputs { salarioBrutoAnual: number; cotizacionSS: number; minimoPersonal: number; }
export interface Outputs { cuotaEstatal: number; cuotaAutonomica: number; cuotaTotal: number; tipoEfectivo: number; netoAnual: number; netoMensual: number; desglose: string; _insight?: any; _chart?: any; }

const TRAMOS_ESTATALES: Array<[number, number]> = [
  [12450, 0.095],
  [20200, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [300000, 0.225],
  [Infinity, 0.245],
];

// Tramos autonómicos Andalucía 2026 (rebajas 2022-2023: marginal bajó a 22,5%)
const TRAMOS_ANDALUCIA: Array<[number, number]> = [
  [13000, 0.095],
  [21000, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [Infinity, 0.225],
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

export function irpfAndalucia2026(i: Inputs): Outputs {
  const salario = Number(i.salarioBrutoAnual);
  const ss = Number(i.cotizacionSS) || Math.min(salario * 0.0635, 4495);
  const minimo = Number(i.minimoPersonal) || 5550;
  if (!salario || salario <= 0) throw new Error('Ingresá salario bruto anual válido');
  const baseImponible = Math.max(0, salario - ss - minimo);
  const cuotaEstatal = calcularTramos(baseImponible, TRAMOS_ESTATALES);
  const cuotaAutonomica = calcularTramos(baseImponible, TRAMOS_ANDALUCIA);
  const cuotaTotal = cuotaEstatal + cuotaAutonomica;
  const tipoEfectivo = salario > 0 ? (cuotaTotal / salario) * 100 : 0;
  const netoAnual = salario - ss - cuotaTotal;
  const netoMensual = Math.round(netoAnual / 14);
  const fmtEUR = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €';
  const tipoEfectivoPct = Number(tipoEfectivo.toFixed(2));

  const tone = tipoEfectivoPct >= 25 ? 'warn' : tipoEfectivoPct <= 12 ? 'good' : 'neutral';
  const _insight = {
    title: 'De tu bruto a tu bolsillo',
    text: `Sobre ${fmtEUR(salario)} brutos pagás **${fmtEUR(cuotaTotal)}** de IRPF (estatal + Andalucía), un tipo efectivo del **${tipoEfectivoPct}%**. Te quedan **${fmtEUR(netoMensual)}/mes** netos en 14 pagas.`,
    tone,
    icon: '🪙',
  };

  // Donut: el bruto se reparte en cotización SS + IRPF + neto. Suman el salario bruto.
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto en mano', value: Math.round(netoAnual) },
      { label: 'IRPF', value: Math.round(cuotaTotal) },
      { label: 'Seguridad Social', value: Math.round(ss) },
    ].filter((s) => s.value > 0),
    prefix: '',
    centerValue: fmtEUR(salario),
    centerLabel: 'Bruto anual',
    ariaLabel: `Reparto del salario bruto de ${fmtEUR(salario)}: neto en mano ${fmtEUR(netoAnual)}, IRPF ${fmtEUR(cuotaTotal)} y cotización a la Seguridad Social ${fmtEUR(ss)}.`,
  };

  return {
    cuotaEstatal: Math.round(cuotaEstatal),
    cuotaAutonomica: Math.round(cuotaAutonomica),
    cuotaTotal: Math.round(cuotaTotal),
    tipoEfectivo: tipoEfectivoPct,
    netoAnual: Math.round(netoAnual),
    netoMensual,
    desglose: `Base imponible: ${baseImponible.toFixed(0)}€ | Estatal: ${cuotaEstatal.toFixed(0)}€ | Andalucía: ${cuotaAutonomica.toFixed(0)}€ | Total IRPF: ${cuotaTotal.toFixed(0)}€`,
    _insight,
    _chart,
  };
}
