/**
 * Agrega 2 ejemplos resueltos (solvedExamples) computados de la fórmula real a
 * cada una de las 8 calcs ganadoras de orgánico que tenían solvedExamples=0.
 * Anti-fabricación: TODO número sale de correr la fórmula. Idempotente.
 *
 * Uso: npx tsx scripts/gen-organic-examples.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { compute as arlCompute } from '../src/lib/formulas/aportes-arl-colombia-empleador-empleado-riesgo.ts';
import { millasAviancaLifemiles } from '../src/lib/formulas/millas-avianca-lifemiles.ts';
import { costoM2Construccion } from '../src/lib/formulas/costo-m2-construccion.ts';
import { compute as recargoCompute } from '../src/lib/formulas/recargo-dominical-festivo-colombia-2026.ts';
import { conversorMetrosLinealesAMetrosCuadrados as convLineal } from '../src/lib/formulas/conversor-metros-lineales-a-metros-cuadrados.ts';
import { interesJudicialTasa } from '../src/lib/formulas/interes-judicial-tasa.ts';
import { primaAntiguedadMexico } from '../src/lib/formulas/prima-antiguedad-mexico.ts';
import { compute as gastosCompute } from '../src/lib/formulas/gastos-notariales-registro-compraventa-2026.ts';

const REVIEW = '2026-06-25';
const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const ars = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const usd = (n: number) => 'US$' + Math.round(n).toLocaleString('en-US');
const mxn = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');

function patch(dir: string, slug: string, examples: any[]) {
  const p = path.join('src/content', dir, slug + '.json');
  const raw = fs.readFileSync(p, 'utf8');
  const c = JSON.parse(raw);
  c.solvedExamples = examples; // estaban en 0
  c.lastReviewed = REVIEW;
  const next = JSON.stringify(c, null, 2) + '\n';
  if (next !== raw) { fs.writeFileSync(p, next); console.log(`[${slug.slice(0, 38)}] ${examples.length} ejemplos.`); }
  else console.log(`[${slug.slice(0, 38)}] sin cambios.`);
}

// 1) ARL Colombia
{
  const a = arlCompute({ salario_mensual: 1_423_500, clase_riesgo: 'I', numero_trabajadores: 1 });
  const b = arlCompute({ salario_mensual: 2_500_000, clase_riesgo: 'V', numero_trabajadores: 1 });
  patch('calcs-co', 'calculadora-aportes-arl-colombia-empleador-empleado-riesgo', [
    {
      title: 'Empleado de oficina (Clase I) con salario de $1.423.500',
      steps: [
        `**Clase de riesgo I** (${a.clase_riesgo_desc}): tarifa ${a.tarifa_arl}.`,
        `La ARL la paga **100% el empleador**: ${cop(a.aporte_empleador_mensual)}/mes. El empleado aporta $0.`,
        `Base = salario mensual $1.423.500 × tarifa de la clase I.`,
      ],
      result: `El empleador paga ${cop(a.aporte_empleador_mensual)} por mes de ARL (${cop(a.aporte_anual_empleador)} al año). El trabajador no aporta nada a riesgos laborales.`,
    },
    {
      title: 'Trabajador de alto riesgo (Clase V) con salario de $2.500.000',
      steps: [
        `**Clase de riesgo V** (${b.clase_riesgo_desc}): tarifa ${b.tarifa_arl}, la más alta.`,
        `Aporte mensual a cargo del empleador: ${cop(b.aporte_empleador_mensual)}.`,
        `La clase V multiplica varias veces el costo respecto de la clase I a igual salario.`,
      ],
      result: `Para un salario de $2.500.000 en clase V, el empleador paga ${cop(b.aporte_empleador_mensual)}/mes de ARL. El nivel de riesgo de la actividad define la tarifa, no el cargo.`,
    },
  ]);
}

// 2) Avianca LifeMiles
{
  const a = millasAviancaLifemiles({ destino: 'miami', cabina: 'economy', tipoViaje: 'ida-vuelta' });
  const b = millasAviancaLifemiles({ destino: 'madrid', cabina: 'business', tipoViaje: 'ida-vuelta' });
  patch('calcs', 'calculadora-millas-avianca-lifemiles', [
    {
      title: 'Bogotá–Miami ida y vuelta en económica',
      steps: [
        `Ruta y cabina elegidas: Miami, económica, ida y vuelta.`,
        `Millas LifeMiles requeridas (aprox.): **${a.millasRequeridas.toLocaleString('es-CO')}**.`,
        `Además se pagan impuestos y tasas en efectivo: ${a.impuestos}.`,
      ],
      result: `Un ida y vuelta a Miami en económica cuesta cerca de **${a.millasRequeridas.toLocaleString('es-CO')} millas** + impuestos. Equivale a un valor estimado de ${usd(a.valorEstimadoUsd)} si compraras el pasaje.`,
    },
    {
      title: 'Bogotá–Madrid ida y vuelta en business',
      steps: [
        `Ruta y cabina: Madrid, business, ida y vuelta (el mejor uso de millas por valor).`,
        `Millas requeridas (aprox.): **${b.millasRequeridas.toLocaleString('es-CO')}**.`,
        `Impuestos y tasas: ${b.impuestos}.`,
      ],
      result: `Madrid en business sale ~**${b.millasRequeridas.toLocaleString('es-CO')} millas** + impuestos, con un valor estimado de ${usd(b.valorEstimadoUsd)}. Las cabinas premium suelen dar el mayor valor por milla.`,
    },
  ]);
}

// 3) Costo m2 construcción (AR)
{
  const a = costoM2Construccion({ m2: 100, tipo: 'estandar', provincia: 'gba_sur' });
  const b = costoM2Construccion({ m2: 60, tipo: 'economico', provincia: 'caba' });
  patch('calcs', 'costo-m2-construccion', [
    {
      title: 'Casa estándar de 100 m² en GBA Sur',
      steps: [
        `Superficie 100 m², terminación **estándar**.`,
        `Costo por m²: ${usd(a.costoPorM2USD)} (${ars(a.costoPorM2ARS)}).`,
        `Total = 100 m² × costo por m².`,
      ],
      result: `Construir 100 m² estándar cuesta aproximadamente ${usd(a.costoTotalUSD)} (${ars(a.costoTotalARS)}), sólo obra, sin terreno ni honorarios.`,
    },
    {
      title: 'Vivienda económica de 60 m² en CABA',
      steps: [
        `Superficie 60 m², terminación **económica**.`,
        `Costo por m²: ${usd(b.costoPorM2USD)} (${ars(b.costoPorM2ARS)}).`,
        `Total = 60 m² × costo por m².`,
      ],
      result: `60 m² económicos rondan ${usd(b.costoTotalUSD)} (${ars(b.costoTotalARS)}) de obra. La terminación (económica/estándar/premium) mueve el costo por m² más que la provincia.`,
    },
  ]);
}

// 4) Recargo dominical/festivo (CO)
{
  const a = recargoCompute({ salarioMensual: 1_423_500, horas: 8, fecha: '2026-03-15', nocturno: 'no' });
  const b = recargoCompute({ salarioMensual: 2_000_000, horas: 8, fecha: '2026-09-13', nocturno: 'no' });
  patch('calcs-co', 'calculadora-recargo-dominical-festivo-colombia-2026', [
    {
      title: 'Domingo trabajado en marzo 2026 (8 horas, salario mínimo)',
      steps: [
        `Salario $1.423.500, 8 horas un domingo de marzo 2026.`,
        `Recargo vigente: ${a.recargo_aplicado}. Valor hora festiva: ${a.valor_hora_festiva}.`,
        `Solo el recargo (sobre la hora ordinaria) suma ${a.solo_recargo}.`,
      ],
      result: `Por ese domingo el trabajador cobra ${a.pago_total} por las 8 horas. ${a.comparativa}`,
    },
    {
      title: 'Domingo trabajado en septiembre 2026 (recargo 90%)',
      steps: [
        `Salario $2.000.000, 8 horas un domingo de septiembre 2026.`,
        `Recargo vigente: ${b.recargo_aplicado} (la reforma sube el recargo dominical de 75% a 80/90/100% por etapas).`,
        `Valor hora festiva: ${b.valor_hora_festiva}; solo recargo: ${b.solo_recargo}.`,
      ],
      result: `El total por las 8 horas es ${b.pago_total}. El mismo domingo se paga más a medida que sube el recargo legal: ${b.comparativa}`,
    },
  ]);
}

// 5) Conversor metros lineales -> m2
{
  const a = convLineal({ valor: 10, ancho: 1.4, direccion: 'ida' });
  const b = convLineal({ valor: 25, ancho: 0.9, direccion: 'ida' });
  patch('calcs', 'conversor-metros-lineales-a-metros-cuadrados', [
    {
      title: '10 metros lineales de tela de 1,40 m de ancho',
      steps: [
        `Metros lineales: 10. Ancho del rollo: 1,40 m.`,
        `m² = metros lineales × ancho = 10 × 1,40.`,
        `Resultado: **${a.metrosCuadrados.toLocaleString('es-AR')} m²**.`,
      ],
      result: `10 metros lineales de un material de 1,40 m de ancho equivalen a ${a.metrosCuadrados.toLocaleString('es-AR')} m². El ancho del rollo es el dato que falta para convertir.`,
    },
    {
      title: '25 metros lineales de material de 0,90 m de ancho',
      steps: [
        `Metros lineales: 25. Ancho: 0,90 m.`,
        `m² = 25 × 0,90.`,
        `Resultado: **${b.metrosCuadrados.toLocaleString('es-AR')} m²**.`,
      ],
      result: `25 metros lineales a 0,90 m de ancho dan ${b.metrosCuadrados.toLocaleString('es-AR')} m². A menor ancho, menos m² por cada metro lineal.`,
    },
  ]);
}

// 6) Interés judicial (tasa)
{
  const a = interesJudicialTasa({ capital: 1_000_000, tasaAnual: 50, fechaDesde: '2024-01-01', fechaHasta: '2026-01-01' });
  const b = interesJudicialTasa({ capital: 500_000, tasaAnual: 75, fechaDesde: '2025-06-01', fechaHasta: '2026-06-01' });
  patch('calcs', 'interes-judicial-tasa', [
    {
      title: 'Capital de $1.000.000 al 50% anual durante 2 años',
      steps: [
        `Capital $1.000.000, tasa 50% anual, del 01/01/2024 al 01/01/2026 (${a.diasTranscurridos} días).`,
        `Intereses generados: ${ars(a.interesesGenerados)} (${a.porcentajeTotal} del capital).`,
        `Total = capital + intereses.`,
      ],
      result: `La deuda actualizada es ${ars(a.totalConIntereses)}: $1.000.000 de capital más ${ars(a.interesesGenerados)} de intereses judiciales por los 2 años.`,
    },
    {
      title: 'Capital de $500.000 al 75% anual durante 1 año',
      steps: [
        `Capital $500.000, tasa 75% anual, del 01/06/2025 al 01/06/2026 (${b.diasTranscurridos} días).`,
        `Intereses: ${ars(b.interesesGenerados)} (${b.porcentajeTotal}).`,
        `Total con intereses = capital + intereses.`,
      ],
      result: `El monto a pagar es ${ars(b.totalConIntereses)}. La tasa que fija el juzgado (acá 75% anual) define cuánto crece la deuda mientras dura el juicio.`,
    },
  ]);
}

// 7) Prima de antigüedad (MX)
{
  const a = primaAntiguedadMexico({ salarioDiario: 500, aniosAntiguedad: 10, motivo: 'jubilacion', smgDiario: 315.04 });
  const b = primaAntiguedadMexico({ salarioDiario: 1500, aniosAntiguedad: 15, motivo: 'despido', smgDiario: 315.04 });
  patch('calcs-mx', 'calculadora-prima-antiguedad-mexico', [
    {
      title: 'Trabajador con $500/día y 10 años de antigüedad (jubilación)',
      steps: [
        `Salario diario $500, 10 años de antigüedad. Días de prima: ${a.diasPrima} (12 por año).`,
        `Salario aplicable (con tope de 2 salarios mínimos): ${mxn(a.salarioAplicable)}/día.`,
        `Prima = días × salario aplicable.`,
      ],
      result: `Le corresponden ${mxn(a.primaAntiguedad)} de prima de antigüedad. ${a.aplica}`,
    },
    {
      title: 'Salario alto ($1.500/día) y 15 años: aplica el tope',
      steps: [
        `Salario diario $1.500, 15 años → ${b.diasPrima} días de prima.`,
        `El salario se topea en 2 salarios mínimos: se usa ${mxn(b.salarioAplicable)}/día (tope ${mxn(b.salarioTope)}), no los $1.500 reales.`,
        `Prima = ${b.diasPrima} días × ${mxn(b.salarioAplicable)}.`,
      ],
      result: `La prima es ${mxn(b.primaAntiguedad)}. Aunque gane $1.500/día, la ley topea la base en 2 salarios mínimos para esta prestación.`,
    },
  ]);
}

// 8) Gastos notariales compraventa (CO)
{
  const a = gastosCompute({ valorInmueble: 300_000_000, quienPagaNotaria: 'mitades', tipoVendedor: 'natural' });
  const b = gastosCompute({ valorInmueble: 500_000_000, quienPagaNotaria: 'mitades', tipoVendedor: 'natural' });
  patch('calcs-co', 'calculadora-gastos-notariales-registro-compraventa-2026', [
    {
      title: 'Compraventa de vivienda de $300.000.000',
      steps: [
        `Valor del inmueble: $300.000.000. Notariales a mitades, vendedor persona natural.`,
        `Costo del comprador: ${a.totalComprador}.`,
        `Costo del vendedor: ${a.totalVendedor}.`,
      ],
      result: `El cierre cuesta en total ${a.totalCierre}: el comprador pone ${a.totalComprador} (sobre todo beneficencia, registro y mitad de notaría) y el vendedor ${a.totalVendedor} (retención + mitad de notaría).`,
    },
    {
      title: 'Compraventa de $500.000.000',
      steps: [
        `Valor $500.000.000, gastos de notaría compartidos por mitades.`,
        `Comprador: ${b.totalComprador}. Vendedor: ${b.totalVendedor}.`,
        `Los rubros (notaría ~0,3%, registro, beneficencia, rentas) escalan con el valor.`,
      ],
      result: `El total de escrituración es ${b.totalCierre}. Quién paga la notaría (mitades, comprador o vendedor) cambia el reparto, no el total.`,
    },
  ]);
}
