/** Ahorro estimado al instalar paneles solares.
 *
 *  QUÉ ESTABA MAL: se valuaba el 100% de la generación a TARIFA PLENA, como si
 *  cada kWh generado te ahorrara un kWh comprado. No es así: bajo la Ley 27.424
 *  el excedente que se inyecta a la red se reconoce a alrededor del 70% de la
 *  tarifa final (el crédito se calcula sobre el valor mayorista de la energía y
 *  no incluye cargos de distribución ni impuestos). Con la cuenta vieja, el
 *  recupero salía IDÉNTICO para cualquier tamaño de sistema, así que cuanto más
 *  sobredimensionabas, más "convenía" — el consejo exactamente inverso al
 *  correcto. Sobredimensionar es el error más caro de una instalación solar.
 *
 *  AHORA: si se informa el consumo mensual, la generación se parte en
 *  autoconsumo (vale la tarifa plena) y excedente inyectado (vale el 70%). El
 *  factor de inyección es el mismo que ya despeja el hub
 *  `/construccion/paneles-solares` (FACTOR_INYECCION) de la fórmula de
 *  amortización, y se importa de ahí para que no se separen.
 *
 *  Si NO se informa el consumo, se mantiene el supuesto anterior (todo
 *  autoconsumido, sistema dimensionado a medida) y se avisa en el detalle.
 */
import { FACTOR_INYECCION_RED } from './paneles-solares-amortizacion-anos-argentina';

export interface Inputs {
  potenciaKw: number;
  horasSolPico: number;
  tarifaKwh: number;
  costoInstalacion: number;
  /** Consumo del hogar, kWh/mes. Si viene, separa autoconsumo de excedente inyectado. */
  consumoKwhMes?: number;
}
export interface Outputs {
  kwhMensual: number;
  autoconsumoKwhMes: number;
  inyectadoKwhMes: number;
  ahorroMensual: number;
  ahorroAnual: number;
  recuperoAnios: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function ahorroEnergiaSolarPaneles(i: Inputs): Outputs {
  const potencia = Number(i.potenciaKw);
  const hsp = Number(i.horasSolPico);
  const tarifa = Number(i.tarifaKwh);
  const costo = Number(i.costoInstalacion);
  const consumoRaw = Number(i.consumoKwhMes);
  const tieneConsumo = Number.isFinite(consumoRaw) && consumoRaw > 0;

  if (!potencia || potencia <= 0) throw new Error('Ingresá la potencia del sistema en kW');
  if (!hsp || hsp <= 0) throw new Error('Ingresá las horas sol pico');
  if (!tarifa || tarifa <= 0) throw new Error('Ingresá la tarifa eléctrica');
  if (!costo || costo <= 0) throw new Error('Ingresá el costo de instalación');

  const eficiencia = 0.80;
  const kwhDiario = potencia * hsp * eficiencia;
  const kwhMensual = kwhDiario * 30;

  // Reparto autoconsumo / excedente inyectado.
  const autoconsumo = tieneConsumo ? Math.min(kwhMensual, consumoRaw) : kwhMensual;
  const inyectado = Math.max(0, kwhMensual - autoconsumo);

  // ANTES: `const ahorroMensual = kwhMensual * tarifa;` — todo a tarifa plena.
  const ahorroMensual = autoconsumo * tarifa + inyectado * tarifa * FACTOR_INYECCION_RED;
  const ahorroAnual = ahorroMensual * 12;
  const recuperoAnios = ahorroAnual > 0 ? costo / ahorroAnual : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  const recupero1 = Number(recuperoAnios.toFixed(1));
  const tone = recupero1 <= 6 ? 'good' : recupero1 <= 10 ? 'neutral' : 'warn';
  const veredicto = recupero1 <= 6 ? 'una inversión que se paga sola rápido'
    : recupero1 <= 10 ? 'un recupero razonable para la vida útil del panel (~25 años)'
    : 'un recupero largo: revisá tarifa, potencia o costo antes de avanzar';

  const pctInyeccion = Math.round(FACTOR_INYECCION_RED * 100);
  const notaReparto = tieneConsumo
    ? (inyectado > 0
        ? `De los ${fmt.format(kwhMensual)} kWh que genera por mes, ${fmt.format(autoconsumo)} kWh los autoconsumís (valen la tarifa plena) y ${fmt.format(inyectado)} kWh se inyectan a la red, que bajo la Ley 27.424 se pagan al ${pctInyeccion}% de la tarifa.`
        : `Toda la generación se autoconsume: el sistema queda por debajo de tu consumo, así que cada kWh vale la tarifa plena. Es el escenario más rentable por kWp instalado.`)
    : `Supone que se autoconsume toda la generación. Cargá tu consumo mensual para separar el excedente, que se inyecta a la red y se paga sólo al ${pctInyeccion}% de la tarifa.`;

  const avisoSobre = tieneConsumo && inyectado > autoconsumo * 0.25
    ? ` Ojo: estás generando bastante más de lo que consumís. Cada kWp de más rinde un ${100 - pctInyeccion}% menos que los anteriores y cuesta lo mismo, así que agrandar el sistema ALARGA el repago en vez de acortarlo.`
    : '';

  return {
    kwhMensual: Number(kwhMensual.toFixed(0)),
    autoconsumoKwhMes: Number(autoconsumo.toFixed(0)),
    inyectadoKwhMes: Number(inyectado.toFixed(0)),
    ahorroMensual: Number(ahorroMensual.toFixed(0)),
    ahorroAnual: Number(ahorroAnual.toFixed(0)),
    recuperoAnios: recupero1,
    detalle: `${fmt1.format(potencia)} kW × ${fmt1.format(hsp)} HSP × 0,80 = ${fmt1.format(kwhDiario)} kWh/día × 30 = ${fmt.format(kwhMensual)} kWh/mes. ${notaReparto} Ahorro: $${fmt.format(ahorroMensual)}/mes ($${fmt.format(ahorroAnual)}/año). Recupero: ${fmt1.format(recuperoAnios)} años.`,
    _insight: { title: 'Recupero de la inversión', text: `El sistema genera **$${fmt.format(ahorroAnual)}/año** de ahorro, así que recuperás los $${fmt.format(costo)} en **${fmt1.format(recupero1)} años**: ${veredicto}.${avisoSobre}`, tone, icon: '☀️' },
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
