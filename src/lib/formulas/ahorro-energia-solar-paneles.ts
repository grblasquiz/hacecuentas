/** Ahorro estimado al instalar paneles solares */
export interface Inputs { potenciaKw: number; horasSolPico: number; tarifaKwh: number; costoInstalacion: number; }
export interface Outputs { kwhMensual: number; ahorroMensual: number; ahorroAnual: number; recuperoAnios: number; detalle: string; }

export function ahorroEnergiaSolarPaneles(i: Inputs): Outputs {
  const potencia = Number(i.potenciaKw);
  const hsp = Number(i.horasSolPico);
  const tarifa = Number(i.tarifaKwh);
  const costo = Number(i.costoInstalacion);

  if (!potencia || potencia <= 0) throw new Error('Ingresá la potencia del sistema en kW');
  if (!hsp || hsp <= 0) throw new Error('Ingresá las horas sol pico');
  if (!tarifa || tarifa <= 0) throw new Error('Ingresá la tarifa eléctrica');
  if (!costo || costo <= 0) throw new Error('Ingresá el costo de instalación');

  const eficiencia = 0.80;
  const kwhDiario = potencia * hsp * eficiencia;
  const kwhMensual = kwhDiario * 30;
  const ahorroMensual = kwhMensual * tarifa;
  const ahorroAnual = ahorroMensual * 12;
  const recuperoAnios = ahorroAnual > 0 ? costo / ahorroAnual : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    kwhMensual: Number(kwhMensual.toFixed(0)),
    ahorroMensual: Number(ahorroMensual.toFixed(0)),
    ahorroAnual: Number(ahorroAnual.toFixed(0)),
    recuperoAnios: Number(recuperoAnios.toFixed(1)),
    detalle: `${fmt1.format(potencia)} kW × ${fmt1.format(hsp)} HSP × 0,80 = ${fmt1.format(kwhDiario)} kWh/día × 30 = ${fmt.format(kwhMensual)} kWh/mes. Ahorro: $${fmt.format(ahorroMensual)}/mes ($${fmt.format(ahorroAnual)}/año). Recupero: ${fmt1.format(recuperoAnios)} años.`,
  };
}
