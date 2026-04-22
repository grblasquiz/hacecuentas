/** IRPF España Cataluña 2026 — asalariado (tramos estatales + autonómicos Cataluña) */
export interface Inputs { salarioBrutoAnual: number; cotizacionSS: number; minimoPersonal: number; }
export interface Outputs { cuotaEstatal: number; cuotaAutonomica: number; cuotaTotal: number; tipoEfectivo: number; netoAnual: number; netoMensual: number; desglose: string; }

const TRAMOS_ESTATALES: Array<[number, number]> = [
  [12450, 0.095],
  [20200, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [300000, 0.225],
  [Infinity, 0.245],
];

// Tramos autonómicos Cataluña 2026 (de los más altos, llega a 25,5% → total marginal ~50%)
const TRAMOS_CATALUNA: Array<[number, number]> = [
  [12450, 0.105],
  [17707, 0.12],
  [21000, 0.14],
  [33007, 0.15],
  [53407, 0.188],
  [90000, 0.215],
  [120000, 0.235],
  [175000, 0.245],
  [Infinity, 0.255],
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

export function irpfCataluna2026(i: Inputs): Outputs {
  const salario = Number(i.salarioBrutoAnual);
  const ss = Number(i.cotizacionSS) || Math.min(salario * 0.0635, 4495);
  const minimo = Number(i.minimoPersonal) || 5550;
  if (!salario || salario <= 0) throw new Error('Ingresá salario bruto anual válido');
  const baseImponible = Math.max(0, salario - ss - minimo);
  const cuotaEstatal = calcularTramos(baseImponible, TRAMOS_ESTATALES);
  const cuotaAutonomica = calcularTramos(baseImponible, TRAMOS_CATALUNA);
  const cuotaTotal = cuotaEstatal + cuotaAutonomica;
  const tipoEfectivo = salario > 0 ? (cuotaTotal / salario) * 100 : 0;
  const netoAnual = salario - ss - cuotaTotal;
  return {
    cuotaEstatal: Math.round(cuotaEstatal),
    cuotaAutonomica: Math.round(cuotaAutonomica),
    cuotaTotal: Math.round(cuotaTotal),
    tipoEfectivo: Number(tipoEfectivo.toFixed(2)),
    netoAnual: Math.round(netoAnual),
    netoMensual: Math.round(netoAnual / 14),
    desglose: `Base imponible: ${baseImponible.toFixed(0)}€ | Estatal: ${cuotaEstatal.toFixed(0)}€ | Cataluña: ${cuotaAutonomica.toFixed(0)}€ | Total IRPF: ${cuotaTotal.toFixed(0)}€`,
  };
}
