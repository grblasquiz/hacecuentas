/** Ahorro estimado al instalar paneles solares */
export interface Inputs { potenciaKw: number; horasSolPico: number; tarifaKwh: number; costoInstalacion: number; }
export interface Outputs { kwhMensual: number; ahorroMensual: number; ahorroAnual: number; recuperoAnios: number; detalle: string; _insight?: any; _chart?: any; }

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

  const recupero1 = Number(recuperoAnios.toFixed(1));
  const tone = recupero1 <= 6 ? 'good' : recupero1 <= 10 ? 'neutral' : 'warn';
  const veredicto = recupero1 <= 6 ? 'una inversión que se paga sola rápido'
    : recupero1 <= 10 ? 'un recupero razonable para la vida útil del panel (~25 años)'
    : 'un recupero largo: revisá tarifa, potencia o costo antes de avanzar';

  return {
    kwhMensual: Number(kwhMensual.toFixed(0)),
    ahorroMensual: Number(ahorroMensual.toFixed(0)),
    ahorroAnual: Number(ahorroAnual.toFixed(0)),
    recuperoAnios: recupero1,
    detalle: `${fmt1.format(potencia)} kW × ${fmt1.format(hsp)} HSP × 0,80 = ${fmt1.format(kwhDiario)} kWh/día × 30 = ${fmt.format(kwhMensual)} kWh/mes. Ahorro: $${fmt.format(ahorroMensual)}/mes ($${fmt.format(ahorroAnual)}/año). Recupero: ${fmt1.format(recuperoAnios)} años.`,
    _insight: { title: 'Recupero de la inversión', text: `El sistema genera **$${fmt.format(ahorroAnual)}/año** de ahorro, así que recuperás los $${fmt.format(costo)} en **${fmt1.format(recupero1)} años**: ${veredicto}.`, tone, icon: '☀️' },
    _chart: {
      type: 'scale',
      marker: recupero1,
      markerLabel: `${fmt1.format(recupero1)} años`,
      min: 0,
      segments: [
        { nombre: 'Rápido', max: 6, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Razonable', max: 10, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Largo', max: Math.max(15, Math.ceil(recupero1) + 1), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Recupero de ${fmt1.format(recupero1)} años en una escala de rápido a largo`,
    },
  };
}
