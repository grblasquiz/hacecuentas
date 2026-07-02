/**
 * Sala de decisión — "¿Me conviene alquilar o comprar?"
 *
 * Patrón VIVIENDA / OPTIMIZACIÓN. Compara el costo acumulado de ALQUILAR
 * (alquiler creciente + costo de oportunidad del anticipo que NO inmovilizás)
 * contra COMPRAR (cuota de crédito francesa + expensas + escritura ~8% inicial +
 * mantenimiento) a 5/10/20 años, y encuentra el punto de equilibrio en años.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

/** Cuota francesa mensual. V = capital, tna en %, n = meses. */
function cuotaFrancesa(V: number, tnaPct: number, nMeses: number): number {
  if (V <= 0 || nMeses <= 0) return 0;
  const i = tnaPct / 12 / 100;
  if (i === 0) return V / nMeses;
  return (V * i) / (1 - Math.pow(1 + i, -nMeses));
}

/**
 * Costo acumulado de ALQUILAR durante `anios`:
 *   - alquiler que crece `ajuste`% por año (12 cuotas por año)
 *   - + expensas (12/año)
 *   - − rendimiento del anticipo invertido (costo de oportunidad NEGATIVO:
 *     como no comprás, ese dinero lo tenés invertido y rinde; lo restamos
 *     del costo de alquilar porque es plata a tu favor).
 */
function costoAlquilar(
  alquilerMensual: number,
  ajustePct: number,
  expensas: number,
  anticipo: number,
  rendAnualPct: number,
  anios: number,
): number {
  let totalAlquiler = 0;
  for (let y = 0; y < anios; y++) {
    const alquilerAnio = alquilerMensual * Math.pow(1 + ajustePct / 100, y);
    totalAlquiler += alquilerAnio * 12;
  }
  const totalExpensas = expensas * 12 * anios;
  // El anticipo invertido genera rendimiento compuesto: ganancia = lo que rinde.
  const gananciaAnticipo = anticipo * (Math.pow(1 + rendAnualPct / 100, anios) - 1);
  return totalAlquiler + totalExpensas - gananciaAnticipo;
}

/**
 * Costo acumulado de COMPRAR durante `anios`:
 *   - escritura/sellos inicial (~8% del valor)
 *   - + cuota del crédito × meses (capada al plazo del crédito)
 *   - + expensas (12/año)
 *   - + mantenimiento (~1% del valor por año)
 * No descuenta la revalorización del inmueble (criterio conservador: lo dejamos
 * como nota, porque al final del horizonte seguís siendo dueño del bien).
 */
function costoComprar(
  valor: number,
  cuota: number,
  plazoAniosCredito: number,
  expensas: number,
  anios: number,
): number {
  const escritura = valor * 0.08;
  const mesesPagados = Math.min(anios, plazoAniosCredito) * 12;
  const totalCuotas = cuota * mesesPagados;
  const totalExpensas = expensas * 12 * anios;
  const mantenimiento = valor * 0.01 * anios;
  return escritura + totalCuotas + totalExpensas + mantenimiento;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorPropiedad));
  const anticipo = Math.max(0, num(inputs.anticipo));
  const tna = Math.max(0, num(inputs.tnaCredito));
  const plazoCredito = Math.max(0, num(inputs.plazoAniosCredito));
  const alquiler = Math.max(0, num(inputs.alquilerMensual));
  const ajuste = Math.max(0, num(inputs.ajusteAlquilerAnual));
  const expensas = Math.max(0, num(inputs.expensas));
  const permanencia = Math.max(1, num(inputs.aniosPermanencia));

  if (!valor || !alquiler || !plazoCredito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el valor de la propiedad, el alquiler mensual de algo equivalente y el plazo del crédito. Con eso comparamos el costo acumulado de alquilar contra el de comprar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Punto de equilibrio' },
      scenarios: [],
      nextActions: [
        'Cargá el **valor de la propiedad** y el **alquiler mensual** de una vivienda equivalente.',
        'Indicá el **plazo del crédito** y el **anticipo** que pondrías para comparar bien las dos opciones.',
      ],
    };
  }

  const montoCredito = Math.max(0, valor - anticipo);
  const cuota = cuotaFrancesa(montoCredito, tna, plazoCredito * 12);
  // Rendimiento del anticipo invertido si NO comprás (proxy plazo fijo/MM real).
  const rendAnticipo = Math.max(tna - 5, 30); // algo por debajo del crédito

  const horizontes = [5, 10, 20];
  const costAlq = (n: number) =>
    costoAlquilar(alquiler, ajuste, expensas, anticipo, rendAnticipo, n);
  const costComp = (n: number) =>
    costoComprar(valor, cuota, plazoCredito, expensas, n);

  // Punto de equilibrio: primer año (1..40) donde comprar acumula menos que alquilar.
  let breakEven = 0;
  for (let y = 1; y <= 40; y++) {
    if (costComp(y) <= costAlq(y)) {
      breakEven = y;
      break;
    }
  }

  const costAlqPerm = costAlq(permanencia);
  const costCompPerm = costComp(permanencia);
  const diff = costAlqPerm - costCompPerm; // + => comprar es más barato a tu horizonte

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (breakEven > 0 && permanencia >= breakEven) {
    status = 'b'; // B = comprar
    tone = 'good';
    title = 'A tu horizonte, conviene comprar';
    badge = 'Comprá';
    detail = `Comprar se paga solo a partir del año ${breakEven}, y vos pensás quedarte ${permanencia} años. En ese plazo comprar te sale ${fmtMoney(Math.abs(diff))} menos que alquilar, y además quedás como dueño de la propiedad.`;
  } else if (breakEven === 0 || permanencia < breakEven - 1) {
    status = 'a'; // A = alquilar
    tone = 'warn';
    title = 'A tu horizonte, conviene alquilar';
    badge = 'Alquilá';
    detail =
      breakEven > 0
        ? `Comprar recién se equilibra al año ${breakEven} y vos pensás quedarte solo ${permanencia} años. Hasta ahí, alquilar te sale ${fmtMoney(Math.abs(diff))} menos: te conviene alquilar e invertir el anticipo.`
        : `Con estos números, comprar no se equilibra ni siquiera en 40 años (el alquiler es barato frente al precio de venta). Alquilar e invertir el anticipo te deja mejor parado.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está muy parejo: decidí por tu plan de vida';
    badge = 'Es parejo';
    detail = `El punto de equilibrio (año ${breakEven}) cae justo cerca de tu horizonte de ${permanencia} años: la diferencia es de apenas ${fmtMoney(Math.abs(diff))}. Decidí por estabilidad, movilidad laboral y ganas de ser dueño, no solo por la plata.`;
  }

  const scenarios = horizontes.map((n) => {
    const d = costAlq(n) - costComp(n);
    return {
      label: `A ${n} años`,
      value: d >= 0 ? 'Comprar: ' + fmtMoney(d) : 'Alquilar: ' + fmtMoney(-d),
      detail:
        d >= 0
          ? `Comprar acumula ${fmtMoney(Math.abs(d))} menos que alquilar a ${n} años.`
          : `Alquilar acumula ${fmtMoney(Math.abs(d))} menos que comprar a ${n} años.`,
    };
  });

  const comparison = {
    columns: ['Alquilar', 'Comprar'] as [string, string],
    rows: [
      {
        label: 'Desembolso inicial',
        a: fmtMoney(0),
        b: fmtMoney(anticipo + valor * 0.08),
        hint: 'Comprar = anticipo + escritura/sellos (~8%)',
      },
      {
        label: 'Costo mensual (año 1)',
        a: fmtMoney(alquiler + expensas),
        b: fmtMoney(cuota + expensas + (valor * 0.01) / 12),
        hint: 'Alquiler vs cuota + expensas + mantenimiento',
      },
      {
        label: `Costo acumulado a ${permanencia} años`,
        a: fmtMoney(costAlqPerm),
        b: fmtMoney(costCompPerm),
        hint: 'Alquiler ya descuenta el rendimiento del anticipo invertido',
      },
      {
        label: 'Al final, ¿de quién es la propiedad?',
        a: 'Del propietario',
        b: 'Tuya',
        hint: 'Comprar te deja un bien; alquilar no',
      },
    ],
  };

  const nextActions = [
    breakEven > 0
      ? `Tu punto de equilibrio es el año **${breakEven}**: si pensás quedarte más que eso, comprar gana; si menos, alquilar.`
      : 'Con estos números el alquiler es muy barato frente al precio: revisá si el valor de venta no está inflado.',
    'Pedí el **CFT real del crédito** (no solo la TNA) y simulá la cuota: en créditos UVA la cuota arranca baja pero ajusta por inflación.',
    'Si alquilás, **invertí el anticipo** que no inmovilizaste: ese rendimiento es la mitad de la ecuación y mucha gente lo gasta.',
    'Sumá lo intangible: comprar da estabilidad pero te ata; alquilar da movilidad. Decidí también por tu plan de vida, no solo por el número.',
  ];

  const notes = [
    'La cuota se calcula con sistema francés (cuota fija). Para créditos UVA la cuota real ajusta por inflación: cargá la TNA como referencia y considerá el escenario de stress aparte.',
    'El costo de alquilar descuenta el rendimiento de invertir el anticipo; el de comprar NO descuenta la revalorización del inmueble (criterio conservador: al final seguís siendo dueño del bien, que vale aparte).',
    'Escritura y sellos se estiman en ~8% del valor; el mantenimiento en ~1% anual. Valores orientativos: variá según jurisdicción y estado de la propiedad.',
    'No es asesoramiento financiero ni inmobiliario. Es una estimación para decidir con números; consultá a un profesional matriculado antes de una operación de este tamaño.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: breakEven > 0 ? `${breakEven} años` : 'No se equilibra',
      label: 'Punto de equilibrio (alquilar → comprar)',
      sub:
        breakEven > 0
          ? `A tu horizonte de ${permanencia} años, comprar ${diff >= 0 ? 'ahorra' : 'cuesta'} **${fmtMoney(Math.abs(diff))}** frente a alquilar.`
          : 'Con estos números, alquilar e invertir el anticipo gana en todo el horizonte analizado.',
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'alquilar-o-comprar',
  title: '¿Me conviene alquilar o comprar? Comparador 2026',
  h1: '¿Me conviene alquilar o comprar?',
  description:
    'Compará el costo acumulado de alquilar (con alquiler creciente y costo de oportunidad del anticipo) contra comprar (cuota, expensas, escritura y mantenimiento) a 5, 10 y 20 años. Te decimos el punto de equilibrio y cuál gana a tu horizonte.',
  intro:
    'Alquilar tira plata, dicen. Pero comprar inmoviliza el anticipo, paga escritura y te ata. La respuesta real es comparar el costo acumulado de cada camino a lo largo del tiempo. Esta sala calcula cuánto gastás alquilando (alquiler que crece + lo que rinde tu anticipo invertido) contra cuánto gastás comprando (cuota + expensas + escritura + mantenimiento), encuentra el punto de equilibrio en años y te dice cuál conviene según cuánto pensás quedarte.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    valorPropiedad: 120000000,
    anticipo: 36000000,
    tnaCredito: 9,
    plazoAniosCredito: 20,
    alquilerMensual: 550000,
    ajusteAlquilerAnual: 40,
    expensas: 90000,
    aniosPermanencia: 10,
  },
  fields: [
    {
      id: 'valorPropiedad',
      label: 'Valor de la propiedad',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '120000000',
      help: 'Precio de venta de la vivienda que comprarías.',
      group: 'La compra',
      groupIcon: '🏠',
    },
    {
      id: 'anticipo',
      label: 'Anticipo que pondrías',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '36000000',
      profileKey: 'finanzas.ahorros',
      help: 'La plata propia que aportás (el resto va a crédito). Suele ser 20-30% del valor.',
      group: 'La compra',
    },
    {
      id: 'tnaCredito',
      label: 'TNA del crédito',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '9',
      help: 'Tasa nominal anual del crédito hipotecario (los UVA rondan 4-9%).',
      group: 'La compra',
    },
    {
      id: 'plazoAniosCredito',
      label: 'Plazo del crédito (años)',
      type: 'number',
      required: true,
      min: 1,
      max: 40,
      default: 20,
      help: 'Cantidad de años para devolver el crédito hipotecario.',
      group: 'La compra',
    },
    {
      id: 'alquilerMensual',
      label: 'Alquiler mensual equivalente',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '550000',
      profileKey: 'vivienda.alquilerMensual',
      help: 'Lo que pagarías de alquiler por una vivienda parecida a la que comprarías.',
      group: 'El alquiler',
      groupIcon: '🔑',
    },
    {
      id: 'ajusteAlquilerAnual',
      label: 'Aumento anual del alquiler',
      type: 'number',
      suffix: '%',
      recommended: true,
      min: 0,
      default: 40,
      placeholder: '40',
      help: 'Cuánto sube el alquiler por año (ligado a inflación/índice de ajuste).',
      group: 'El alquiler',
    },
    {
      id: 'expensas',
      label: 'Expensas mensuales',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'Las pagás en ambos casos. Se incluyen para comparar parejo.',
      group: 'Comunes',
      groupIcon: '🧾',
    },
    {
      id: 'aniosPermanencia',
      label: '¿Cuántos años pensás quedarte?',
      type: 'number',
      recommended: true,
      min: 1,
      max: 40,
      default: 10,
      help: 'Tu horizonte. Es la clave: cuanto más te quedás, más conviene comprar.',
      group: 'Comunes',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-alquiler-vs-comprar', label: 'Alquilar vs comprar' },
    { slug: 'calculadora-hipoteca-mensual-cuota-fija', label: 'Cuota de hipoteca' },
    { slug: 'calculadora-costo-total-comprar-propiedad-gastos', label: 'Costo total de comprar' },
    { slug: 'calculadora-actualizacion-alquiler-icl', label: 'Actualización de alquiler (ICL)' },
  ],
  howItWorks: `Esta sala no mira la cuota contra el alquiler de un mes: compara el costo total de cada camino a lo largo del tiempo.

1. **Costo de alquilar.** Suma los alquileres año a año (creciendo por el aumento anual) más las expensas, y le RESTA el rendimiento de invertir el anticipo que no inmovilizaste. Esa resta es clave: si alquilás, ese dinero trabaja para vos.
2. **Costo de comprar.** Suma la escritura y sellos iniciales (~8% del valor), la cuota del crédito por los meses que la pagás, las expensas y el mantenimiento (~1% anual del valor).
3. **Punto de equilibrio.** Busca el primer año en que comprar acumula menos gasto que alquilar. Antes de ese año conviene alquilar; después, comprar.
4. **Tu horizonte decide.** Compara los dos costos acumulados al plazo que pensás quedarte y te dice cuál gana y por cuánto.
5. **Escenarios.** Muestra la diferencia a 5, 10 y 20 años para que veas cómo cambia el ganador con el tiempo.`,
  faq: [
    {
      q: '¿Alquilar es siempre tirar la plata?',
      a: 'No necesariamente. Si te quedás pocos años, o si el anticipo invertido rinde más que lo que ahorrás comprando, alquilar e invertir puede dejarte mejor parado. La clave es el horizonte: cuanto más tiempo te quedás, más conviene comprar.',
    },
    {
      q: '¿Qué es el punto de equilibrio?',
      a: 'Es el año a partir del cual comprar acumula menos gasto total que alquilar. Si pensás quedarte más años que el punto de equilibrio, comprar gana; si te vas antes, alquilar fue más barato.',
    },
    {
      q: '¿Por qué se descuenta el rendimiento del anticipo?',
      a: 'Porque al alquilar no inmovilizás el anticipo: lo podés invertir en un plazo fijo, money market u otro instrumento. Ese rendimiento es plata a favor del alquiler, así que lo restamos de su costo. Si te lo gastás en vez de invertirlo, la comparación cambia.',
    },
    {
      q: '¿Incluye la revalorización de la propiedad?',
      a: 'No la descontamos del costo de comprar, a propósito: al final del horizonte seguís siendo dueño de un bien que vale aparte. Sumarla haría comprar todavía más conveniente, pero es incierta. Preferimos un cálculo conservador.',
    },
    {
      q: '¿Sirve para créditos UVA?',
      a: 'Sí, pero con cuidado: la cuota UVA arranca baja y ajusta por inflación. Acá la cuota se toma fija (sistema francés). Si tu crédito es UVA, usá la TNA como referencia y revisá el escenario de stress con la calculadora de crédito UVA, porque la cuota puede subir si tu salario no le sigue el ritmo.',
    },
    {
      q: '¿Qué gastos tiene comprar además de la cuota?',
      a: 'La escritura y sellos (alrededor del 8% del valor entre honorarios de escribano, sellos e informes), el mantenimiento del inmueble (estimado en 1% anual) y las expensas. Esos costos hacen que comprar tarde algunos años en convenir.',
    },
    {
      q: '¿Cómo elijo el aumento anual del alquiler?',
      a: 'Tomá una expectativa razonable de inflación o del índice de ajuste de tu contrato. Cuanto más alto sea el aumento del alquiler, antes conviene comprar, porque el alquiler se encarece más rápido que la cuota fija.',
    },
    {
      q: '¿Esto reemplaza el consejo de un profesional?',
      a: 'No. Es una herramienta orientativa para decidir con números, no asesoramiento financiero ni inmobiliario. Para una operación de este tamaño consultá con un escribano y un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'BCRA — Créditos hipotecarios UVA', url: 'https://www.bcra.gob.ar/' },
    { name: 'Colegio de Escribanos — Costos de escrituración', url: 'https://www.colegio-escribanos.org.ar/' },
  ],
};
