/** Huella de carbono diaria estimada */
export interface Inputs { kmAuto: number; kmTransportePublico: number; horasElectricidad: number; comidas?: string; }
export interface Outputs { co2DiarioKg: number; co2AnualTon: number; comparacionPromedio: string; detalle: string; }

export function huellaCarbono(i: Inputs): Outputs {
  const kmAuto = Number(i.kmAuto) || 0;
  const kmTP = Number(i.kmTransportePublico) || 0;
  const horasElec = Number(i.horasElectricidad) || 0;
  const dieta = String(i.comidas || 'omnivoro');

  if (kmAuto < 0 || kmTP < 0 || horasElec < 0) throw new Error('Los valores no pueden ser negativos');

  const co2Auto = kmAuto * 0.21;
  const co2TP = kmTP * 0.04;
  const co2Elec = horasElec * 0.15;
  const dietaMap: Record<string, number> = { omnivoro: 3.5, vegetariano: 2.0, vegano: 1.5 };
  const co2Dieta = dietaMap[dieta] || 3.5;

  const diario = co2Auto + co2TP + co2Elec + co2Dieta;
  const anual = (diario * 365) / 1000;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const promedioArg = 4.2;
  const pct = ((anual / promedioArg) * 100).toFixed(0);
  const comp = anual > promedioArg
    ? `Tu huella estimada (${fmt.format(anual)} ton) está **por encima** del promedio argentino (4,2 ton/año).`
    : `Tu huella estimada (${fmt.format(anual)} ton) está **por debajo** del promedio argentino (4,2 ton/año).`;

  return {
    co2DiarioKg: Number(diario.toFixed(2)),
    co2AnualTon: Number(anual.toFixed(2)),
    comparacionPromedio: comp,
    detalle: `Auto: ${fmt.format(co2Auto)} kg | Transporte público: ${fmt.format(co2TP)} kg | Electricidad: ${fmt.format(co2Elec)} kg | Alimentación: ${fmt.format(co2Dieta)} kg. Total diario: ${fmt.format(diario)} kg (${pct}% del promedio ARG).`,
  };
}
