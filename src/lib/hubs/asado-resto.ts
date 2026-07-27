import type { HubData } from './types';
import { rendimientoMasaEmpanadasCantidad } from '../formulas/rendimiento-masa-empanadas-cantidad';
import { compute as empanadasPorPersona } from '../formulas/empanadas-por-persona-evento-asado-cumple';
import { tamanoParrillaPersonasM2 } from '../formulas/tamano-parrilla-personas-m2';
import { ensaladaPorPersona } from '../formulas/ensalada-por-persona';
import { panParaComidaEvento } from '../formulas/pan-para-comida-evento';
import { carbonAsadoKg } from '../formulas/carbon-asado-kg';

/**
 * Hub de decisión — "Empanadas, carbón y guarniciones: ¿cuánto preparo?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Es el COMPLEMENTO del hub `/eventos/asado`:
 * ese resuelve la carne, este resuelve todo lo demás que sale de la misma
 * juntada. No pisa `asado.ts` (carne), ni `bebidas-evento.ts` (bebida e hielo),
 * ni `comida-evento.ts` (comida de fiesta: pizza, sushi, torta, canapés).
 *
 * Cuatro ramas:
 *  1. empanadas   — cuántas empanadas para N invitados y cuánta masa lleva eso
 *  2. harina      — al revés: tengo X g de harina, ¿cuántas tapas me salen?
 *  3. guarniciones— ensalada y pan
 *  4. fuego       — carbón, leña y qué tamaño de parrilla hace falta
 *
 * NÚMEROS: ninguno está escrito a mano. Todos se DERIVAN llamando a las
 * fórmulas reales del repo con cantidades grandes o "redondas", para que los
 * `Math.ceil` y los redondeos a 0,25 kg no contaminen el valor unitario:
 *
 *   empanadas por adulto y por chico según el rol → empanadas-por-persona-…
 *   g de harina por tapa, relleno y receta de masa → rendimiento-masa-empanadas-…
 *   g de ensalada por persona y la lista de verdura → ensalada-por-persona.ts
 *   g de pan por adulto según el tipo de comida     → pan-para-comida-evento.ts
 *   kg de carbón y leña por persona, pastillas      → carbon-asado-kg.ts
 *   cm² de parrilla por persona y las bandas        → tamano-parrilla-personas-m2.ts
 */

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/* ───────────────────── Empanadas por persona ───────────────────── */

export const ROLES_EMPANADA: Array<{ id: string; label: string; hint: string }> = [
  { id: 'principal', label: 'Plato principal: las empanadas son la comida', hint: 'lo que más se pide' },
  { id: 'picada', label: 'Acompañando otra comida (picada, asado)', hint: '' },
  { id: 'picoteo', label: 'Picoteo o entrada, algo suelto', hint: '' },
];

/**
 * Empanadas por adulto y por chico en cada rol, desde su fórmula.
 * Se pide 50/50 y no 100/0 porque la fórmula original hace
 * `Number(adult_percentage) || 70`, así que un 0 se convierte en 70.
 */
function porcionesDe(rol: string): { adulto: number; nino: number } {
  const out = empanadasPorPersona({ total_guests: 1000, adult_percentage: 50, event_type: rol } as any);
  return { adulto: r(out.adults_portion / 500), nino: r(out.children_portion / 500) };
}

export const PORCIONES: Record<string, { adulto: number; nino: number }> = Object.fromEntries(
  ROLES_EMPANADA.map((x) => [x.id, porcionesDe(x.id)])
);

/** Unidades por docena, desde la misma fórmula (docenas = ceil(total / 12)). */
export const POR_DOCENA = (() => {
  const out = empanadasPorPersona({ total_guests: 1000, adult_percentage: 100, event_type: 'principal' } as any);
  return Math.round(out.total_empanadas / out.total_dozens);
})();

/* ─────────────────── Masa: harina, relleno y receta ─────────────────── */

export const TIPOS_TAPA: Array<{ id: string; label: string }> = [
  { id: 'casera_criolla', label: 'Masa casera criolla (al horno)' },
  { id: 'casera_frita', label: 'Masa casera para freír' },
  { id: 'comprada', label: 'Tapas compradas (paquete)' },
];

/** g de harina por tapa según el tipo de masa, desde su fórmula. */
export const HARINA_POR_TAPA: Record<string, number> = Object.fromEntries(
  ['casera_criolla', 'casera_frita', 'comprada'].map((t) => [
    t,
    r(
      Number(
        rendimientoMasaEmpanadasCantidad({ modo: 'empanadas_deseadas', cantidad: 1000, tipoTapa: t }).harinaGramos
      ) / 1000
    ),
  ])
);

/** g de relleno por empanada, desde la misma fórmula. */
export const RELLENO_POR_EMPANADA_G = (() => {
  const out = rendimientoMasaEmpanadasCantidad({ modo: 'empanadas_deseadas', cantidad: 1000, tipoTapa: 'casera_criolla' });
  return r((out.rellenoKg * 1000) / 1000);
})();

/** Tapas que trae el paquete comprado, desde la misma fórmula. */
export const TAPAS_POR_PAQUETE = (() => {
  const out = rendimientoMasaEmpanadasCantidad({ modo: 'empanadas_deseadas', cantidad: 1200, tipoTapa: 'comprada' });
  const paquetes = Number(String(out.ingredientesMasa).match(/^(\d+)/)?.[1] || 100);
  return Math.round(1200 / paquetes);
})();

/**
 * Proporciones de la masa (sobre el peso de harina), leídas de la propia
 * receta que devuelve la fórmula. Nada se copia a mano.
 */
function recetaDe(tipo: string): { grasa: number; agua: number; sal: number; huevo: boolean } {
  const out = rendimientoMasaEmpanadasCantidad({ modo: 'harina_disponible', cantidad: 100000, tipoTapa: tipo });
  const s = String(out.ingredientesMasa);
  const num = (re: RegExp) => Number(s.match(re)?.[1] || 0);
  return {
    grasa: r(num(/([\d.]+) g grasa/) / 100000, 3),
    agua: r(num(/([\d.]+) ml agua/) / 100000, 3),
    sal: r(num(/([\d.]+) g sal/) / 100000, 3),
    huevo: /huevo/.test(s),
  };
}

export const RECETA_MASA: Record<string, { grasa: number; agua: number; sal: number; huevo: boolean }> = {
  casera_criolla: recetaDe('casera_criolla'),
  casera_frita: recetaDe('casera_frita'),
};

/* ─────────────────────────── Ensalada ─────────────────────────── */

/** g de ensalada por persona según el rol, desde ensalada-por-persona.ts. */
export const ENSALADA_G: Record<string, number> = {
  guarnicion: r((ensaladaPorPersona({ personas: 1000, rol: 'guarnicion' }).ensalada_kg * 1000) / 1000, 0),
  principal: r((ensaladaPorPersona({ personas: 1000, rol: 'principal' }).ensalada_kg * 1000) / 1000, 0),
};

/** Lechugas por kg de ensalada (p elegido para que no haya redondeo). */
export const LECHUGAS_POR_KG = (() => {
  const o = ensaladaPorPersona({ personas: 3000, rol: 'guarnicion' });
  return o.lechugas / ((3000 * ENSALADA_G.guarnicion) / 1000);
})();

/** Tomates por kg de ensalada (idem). */
export const TOMATES_POR_KG = (() => {
  const o = ensaladaPorPersona({ personas: 800, rol: 'guarnicion' });
  return o.tomates / ((800 * ENSALADA_G.guarnicion) / 1000);
})();

/** g de cebolla por kg de ensalada, leídos de la lista de compras. */
export const CEBOLLA_G_POR_KG = (() => {
  const o = ensaladaPorPersona({ personas: 1000, rol: 'guarnicion' });
  const g = Number(String(o.lista_compras).match(/~([\d.]+) g de cebolla/)?.[1] || 0);
  return r(g / ((1000 * ENSALADA_G.guarnicion) / 1000), 0);
})();

/* ─────────────────────────────── Pan ─────────────────────────────── */

export const TIPOS_COMIDA_PAN: Array<{ id: string; label: string }> = [
  { id: 'asado', label: 'Asado (va choripán y se come mucho pan)' },
  { id: 'picada', label: 'Picada o tabla' },
  { id: 'sandwiches', label: 'Sándwiches: el pan es la comida' },
  { id: 'comida', label: 'Comida común de mesa' },
];

/** g de pan por adulto según el tipo de comida, desde pan-para-comida-evento.ts. */
export const PAN_G_ADULTO: Record<string, number> = Object.fromEntries(
  TIPOS_COMIDA_PAN.map((t) => [t.id, r(panParaComidaEvento({ adultos: 1000, tipo_comida: t.id }).pan_kg, 0)])
);

/** Fracción de la ración de adulto que come un chico, desde la misma fórmula. */
export const PAN_FACTOR_NINO = r(
  panParaComidaEvento({ ninos: 1000, tipo_comida: 'comida' }).pan_kg / PAN_G_ADULTO.comida,
  2
);

const _pan = panParaComidaEvento({ adultos: 1000, tipo_comida: 'comida' });
/** Peso del mignón (g), desde la misma fórmula. */
export const MIGNON_G = Math.round((1000 * PAN_G_ADULTO.comida) / _pan.mignones);
/** Peso de la flauta o baguette (g), desde la misma fórmula. */
export const FLAUTA_G = Math.round((1000 * PAN_G_ADULTO.comida) / _pan.flautas);

/* ────────────────────────── Carbón y leña ────────────────────────── */

export const DURACIONES: Array<{ id: string; label: string }> = [
  { id: 'rapido', label: 'Corto: se prende, se come y listo' },
  { id: 'normal', label: 'Normal: tarde de asado' },
  { id: 'largo', label: 'Largo: pica, asado y sobremesa' },
];

/** kg de carbón por persona en cada duración, desde carbon-asado-kg.ts. */
export const CARBON_KG_PERSONA: Record<string, number> = Object.fromEntries(
  DURACIONES.map((d) => [d.id, r(carbonAsadoKg({ personas: 1000, tipo_asado: d.id }).carbon_kg / 1000, 3)])
);

/** kg de leña por persona cuando se suma leña, desde la misma fórmula. */
export const LENA_KG_PERSONA = r(
  carbonAsadoKg({ personas: 1000, tipo_asado: 'normal', incluir_lena: 'si' }).lena_kg / 1000,
  3
);

/** kg de carbón que enciende una pastilla, desde la misma fórmula. */
export const CARBON_POR_PASTILLA = (() => {
  const o = carbonAsadoKg({ personas: 1000, tipo_asado: 'normal' });
  return r(o.carbon_kg / o.pastillas, 1);
})();

/** Minutos hasta tener brasa, por duración, desde la misma fórmula. */
export const MINUTOS_BRASA: Record<string, number> = Object.fromEntries(
  DURACIONES.map((d) => [d.id, carbonAsadoKg({ personas: 10, tipo_asado: d.id }).tiempo_brasas_min])
);

/* ────────────────────────── Tamaño de parrilla ────────────────────────── */

export const TIPOS_PARRILLA: Array<{ id: string; label: string }> = [
  { id: 'solo_carne', label: 'Sólo carne a la parrilla' },
  { id: 'estandar', label: 'Carne + chorizos' },
  { id: 'completo', label: 'Completo: carne, chorizos, achuras y verduras' },
];

/** cm² de parrilla por persona en cada modalidad, desde su fórmula. */
export const CM2_POR_PERSONA: Record<string, number> = Object.fromEntries(
  TIPOS_PARRILLA.map((t) => [t.id, r(tamanoParrillaPersonasM2({ personas: 1000, tipoAsado: t.id }).superficieCm2 / 1000, 1)])
);

/**
 * Bandas de tamaño de parrilla, DESCUBIERTAS barriendo la fórmula real en vez
 * de copiar los umbrales a mano: con `solo_carne` la superficie es exactamente
 * 250 cm² por persona, así que pidiendo personas = cm²/250 se recorre el eje
 * de superficie de a 1 cm² y se detecta dónde cambia el tipo de parrilla.
 */
export const BANDAS_PARRILLA: Array<{ label: string; hasta: number }> = (() => {
  const out: Array<{ label: string; hasta: number }> = [];
  const base = CM2_POR_PERSONA.solo_carne;
  let prev = '';
  for (let cm2 = 1; cm2 <= 8000; cm2++) {
    const label = tamanoParrillaPersonasM2({ personas: cm2 / base, tipoAsado: 'solo_carne' }).tipoParrilla;
    if (label !== prev) {
      if (out.length) out[out.length - 1].hasta = cm2 - 1;
      out.push({ label, hasta: 0 });
      prev = label;
    }
  }
  // La última banda no tiene techo. Se usa un número grande y NO Infinity:
  // `define:vars` serializa a JSON y ahí Infinity se convierte en null.
  if (out.length) out[out.length - 1].hasta = 9_999_999;
  return out;
})();

const nAr = (v: number, d = 1) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

/** Disclaimer textual de cocina, copiado de src/lib/disclaimers.ts. */
const DISCLAIMER_COCINA =
  'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.';

export const hub: HubData = {
  slug: 'eventos/empanadas-y-guarniciones',
  title: 'Empanadas, carbón y guarniciones: ¿cuánto preparo para el evento?',
  description:
    'Cuántas empanadas por persona, cuánta harina y relleno lleva la masa, cuánta ensalada y pan calcular y cuánto carbón comprar para el asado. Todo lo que va alrededor de la carne, en una sola cuenta.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Guía para organizar la juntada',
  h1: 'Empanadas, carbón y guarniciones: ¿cuánto preparo?',
  lede:
    'La carne casi siempre está calculada; lo que falla es todo lo demás. Cuántas empanadas salen de un kilo de harina, cuánto relleno lleva cada una, cuánta ensalada y cuánto pan por persona, y cuántos kilos de carbón hacen falta para que la parrilla no se quede sin brasa a mitad de camino.',
  stamps: [
    'Actualizado 27-07-2026',
    `${PORCIONES.principal.adulto} empanadas por adulto como plato principal`,
    `${HARINA_POR_TAPA.casera_criolla} g de harina por tapa`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Lo que tenés que preparar',

  cases: {
    title: '¿Qué estás calculando?',
    intro:
      'Partimos de las empanadas, que es lo que más se pregunta. Si lo que te falta es la masa, las guarniciones o el fuego, cambiá la rama: los mismos invitados dan listas distintas.',
    items: [
      {
        id: 'empanadas',
        label: 'Cuántas empanadas hago',
        hint: 'Por invitado · el caso más común',
        answer: `Como plato principal se calculan ${PORCIONES.principal.adulto} empanadas por adulto y ${PORCIONES.principal.nino} por chico; si son acompañamiento, ${PORCIONES.picada.adulto} y ${PORCIONES.picada.nino}.`,
        yes: [
          `Ración según el rol: ${PORCIONES.principal.adulto} por adulto de plato principal, ${PORCIONES.picada.adulto} de acompañamiento y ${PORCIONES.picoteo.adulto} de picoteo`,
          `El total pasado a docenas, que es como se pide y como se compra (${POR_DOCENA} por docena)`,
          'El reparto por sabor: carne, pollo, jamón y queso y verdura',
          `La masa que hace falta: ${HARINA_POR_TAPA.casera_criolla} g de harina por tapa y ${RELLENO_POR_EMPANADA_G} g de relleno por unidad`,
          'Si las encargás, el costo con el precio de la docena que cargues vos',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'La empanada de verdura siempre sobra y la de carne siempre falta: no repartas los sabores en partes iguales',
          'Si además hay asado, picada o pizza, bajá a la ración de acompañamiento o te van a quedar tres docenas frías',
          'Contá una empanada extra por adulto si es de noche y no hay otra comida fuerte',
        ],
        plazo:
          'encargá las empanadas con 48 horas de anticipación; si las hacés en casa, armalas el día anterior y congelalas crudas separadas por papel.',
      },
      {
        id: 'harina',
        label: 'Tengo la harina: ¿cuántas salen?',
        hint: 'La cuenta al revés',
        answer: `Con masa criolla salen unas ${Math.floor(1000 / HARINA_POR_TAPA.casera_criolla)} tapas por kilo de harina: ${HARINA_POR_TAPA.casera_criolla} g de harina por tapa.`,
        yes: [
          `Cuántas tapas salen de la harina que tenés: ${HARINA_POR_TAPA.casera_criolla} g por tapa en criolla y ${HARINA_POR_TAPA.casera_frita} g en masa para freír`,
          `La receta completa: grasa, agua y sal en proporción a la harina`,
          `El relleno que vas a necesitar: ${RELLENO_POR_EMPANADA_G} g por empanada`,
          `Si comprás tapas, cuántos paquetes de ${TAPAS_POR_PAQUETE} unidades`,
        ],
        warn: [
          DISCLAIMER_COCINA,
          'La masa para freír lleva menos grasa y algo de huevo, y rinde un poco más de tapas por kilo',
          'Las tapas caseras salen más gruesas que las compradas: la misma harina rinde menos si estirás poco',
          'El relleno se hace el día anterior y se enfría bien: caliente moja la masa y la empanada se abre en el horno',
        ],
        plazo:
          'la masa descansa como mínimo 30 minutos en heladera antes de estirarla, y el relleno tiene que estar frío de heladera al armar.',
      },
      {
        id: 'guarniciones',
        label: 'Ensalada y pan',
        hint: 'Lo que nunca se calcula',
        answer: `De guarnición se calculan ${ENSALADA_G.guarnicion} g de ensalada por persona, y ${ENSALADA_G.principal} g si la ensalada es el plato principal.`,
        yes: [
          `Ensalada: ${ENSALADA_G.guarnicion} g por persona de guarnición, ${ENSALADA_G.principal} g de plato principal`,
          'La lista de verdura: lechugas, tomates y cebolla de una mixta base',
          `Pan: ${PAN_G_ADULTO.asado} g por adulto en un asado, ${PAN_G_ADULTO.comida} g en una comida común y ${PAN_G_ADULTO.sandwiches} g si es de sándwiches`,
          `El pan pasado a unidades: mignones de ${MIGNON_G} g o flautas de ${FLAUTA_G} g`,
        ],
        warn: [
          DISCLAIMER_COCINA,
          'La ensalada se lava y se corta antes pero se aliña recién al servir: aliñada de antes se marchita en media hora',
          'Si hay choripán, el pan se dispara: es la primera cosa que se termina en un asado',
          'El tomate se compra el mismo día y se guarda fuera de la heladera; el frío le mata el sabor',
          'La cebolla cruda divide aguas: ponela aparte en un bowl chico y no mezclada en la ensaladera grande',
        ],
        plazo:
          'lavá y cortá la verdura hasta 4 horas antes y guardala tapada en heladera; el pan, comprado el mismo día.',
      },
      {
        id: 'fuego',
        label: 'Carbón, leña y parrilla',
        hint: 'Que no se apague a mitad de camino',
        answer: `Se calculan entre ${nAr(CARBON_KG_PERSONA.rapido, 2)} y ${nAr(CARBON_KG_PERSONA.largo, 2)} kg de carbón por persona según lo largo que sea el asado.`,
        yes: [
          `Carbón: ${nAr(CARBON_KG_PERSONA.rapido, 2)} kg por persona en un asado corto, ${nAr(CARBON_KG_PERSONA.normal, 2)} en uno normal y ${nAr(CARBON_KG_PERSONA.largo, 2)} en uno largo`,
          `Leña, si la sumás: ${nAr(LENA_KG_PERSONA, 2)} kg por persona`,
          `Pastillas de encendido: una cada ${nAr(CARBON_POR_PASTILLA, 1)} kg de carbón, mínimo dos`,
          `Qué tamaño de parrilla hace falta: de ${nAr(CM2_POR_PERSONA.solo_carne, 0)} a ${nAr(CM2_POR_PERSONA.completo, 0)} cm² por persona según qué pongas arriba`,
        ],
        warn: [
          DISCLAIMER_COCINA,
          'El carbón se compra de más, siempre: sobra y se guarda seco para la próxima, faltar es quedarse a mitad del asado',
          'Con leña calculá que tarda bastante más en hacer brasa: prendela antes que el carbón, no junto',
          'Una parrilla amontonada no dora, hierve la carne en su jugo: dejá una zona libre al costado para regular las brasas',
          'Guardá el carbón bajo techo: mojado no prende y las bolsas apiladas afuera juntan humedad aunque no llueva',
        ],
        plazo: `calculá entre ${MINUTOS_BRASA.rapido} y ${MINUTOS_BRASA.largo} minutos desde que prendés hasta tener brasa útil, y sumale media hora si vas a usar leña.`,
      },
    ],
  },

  inputsTitle: 'Contá quiénes van',
  inputsIntro:
    'Con adultos y chicos ya sale casi todo. Los campos de abajo afinan cada rama: el rol de las empanadas, los sabores, el tipo de comida para el pan y lo largo que va a ser el asado.',
  fields: [
    { id: 'adultos', label: 'Adultos', type: 'number', min: 0, max: 500, step: 1, value: 10 },
    { id: 'ninos', label: 'Chicos (hasta 12 años)', type: 'number', min: 0, max: 500, step: 1, value: 4 },
    {
      id: 'rolEmpanada',
      label: '¿Qué papel juegan las empanadas?',
      type: 'select',
      value: 'principal',
      options: ROLES_EMPANADA.map((x) => ({ value: x.id, label: x.label })),
    },
    {
      id: 'tipoTapa',
      label: 'Masa',
      type: 'select',
      value: 'casera_criolla',
      options: TIPOS_TAPA.map((x) => ({ value: x.id, label: x.label })),
    },
    {
      id: 'harina',
      label: 'Harina que tenés (g)',
      type: 'number',
      min: 0,
      max: 100000,
      step: 50,
      value: 1000,
      thousands: true,
      help: 'Sólo se usa en la rama "Tengo la harina".',
    },
    { id: 'pctCarne', label: 'Sabor: carne (%)', type: 'number', min: 0, max: 100, step: 5, value: 40 },
    { id: 'pctPollo', label: 'Sabor: pollo (%)', type: 'number', min: 0, max: 100, step: 5, value: 30 },
    { id: 'pctJyq', label: 'Sabor: jamón y queso (%)', type: 'number', min: 0, max: 100, step: 5, value: 20 },
    { id: 'pctVerdura', label: 'Sabor: verdura (%)', type: 'number', min: 0, max: 100, step: 5, value: 10 },
    {
      id: 'rolEnsalada',
      label: 'La ensalada, ¿qué es?',
      type: 'select',
      value: 'guarnicion',
      options: [
        { value: 'guarnicion', label: `Guarnición (${ENSALADA_G.guarnicion} g por persona)` },
        { value: 'principal', label: `Plato principal (${ENSALADA_G.principal} g por persona)` },
      ],
    },
    {
      id: 'tipoComida',
      label: 'Tipo de comida (define el pan)',
      type: 'select',
      value: 'asado',
      options: TIPOS_COMIDA_PAN.map((x) => ({ value: x.id, label: x.label })),
    },
    {
      id: 'duracion',
      label: '¿Cuánto va a durar el asado?',
      type: 'select',
      value: 'normal',
      options: DURACIONES.map((x) => ({ value: x.id, label: x.label })),
    },
    {
      id: 'lena',
      label: '¿Sumás leña además del carbón?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, sólo carbón' },
        { value: 'si', label: 'Sí, carbón y leña' },
      ],
    },
    {
      id: 'tipoParrilla',
      label: '¿Qué va a la parrilla?',
      type: 'select',
      value: 'estandar',
      options: TIPOS_PARRILLA.map((x) => ({ value: x.id, label: x.label })),
    },
    {
      id: 'precioDocena',
      label: 'Precio de la docena de empanadas ($)',
      type: 'number',
      min: 0,
      value: 0,
      thousands: true,
      help: 'Si las encargás y lo cargás, se estima el gasto.',
    },
  ],
  fineprint: `${DISCLAIMER_COCINA} Las raciones son de referencia para un evento en Argentina: si tu grupo come notoriamente más o menos, ajustá la rama o los invitados. Los precios los ponés vos, no estimamos valores de mercado.`,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte lo que preparás',
    caption:
      'El anillo cambia con la rama: en empanadas muestra el reparto por sabor, que es literalmente el pedido; en la masa, la composición de la receta; en guarniciones, la verdura y el pan; y en el fuego, el combustible. Cada porción es un renglón distinto de la compra.',
  },
  breakdownTitle: 'Tu lista para el evento',
  breakdownIntro:
    'Las barras comparan cada rubro con el más grande. Las empanadas van en unidades, la masa en gramos, la ensalada y el carbón en kilos; lo único en pesos es el gasto estimado.',

  faq: [
    {
      q: '¿Cuántas empanadas por persona hay que calcular?',
      a: `Depende del rol que jueguen. Si son el plato principal, <b>${PORCIONES.principal.adulto} por adulto y ${PORCIONES.principal.nino} por chico</b>. Si acompañan un asado o una picada, ${PORCIONES.picada.adulto} y ${PORCIONES.picada.nino}. Y si son puro picoteo de entrada, ${PORCIONES.picoteo.adulto} y ${PORCIONES.picoteo.nino}. Para 10 adultos y 4 chicos de plato principal son ${PORCIONES.principal.adulto * 10 + PORCIONES.principal.nino * 4} empanadas, o sea ${Math.ceil((PORCIONES.principal.adulto * 10 + PORCIONES.principal.nino * 4) / POR_DOCENA)} docenas.`,
    },
    {
      q: '¿Cuántas empanadas salen de un kilo de harina?',
      a: `Con masa criolla al horno, que lleva <b>${HARINA_POR_TAPA.casera_criolla} g de harina por tapa</b>, salen unas ${Math.floor(1000 / HARINA_POR_TAPA.casera_criolla)} tapas por kilo: poco menos de tres docenas. Con masa para freír, que es más fina y lleva ${HARINA_POR_TAPA.casera_frita} g por tapa, salen ${Math.floor(1000 / HARINA_POR_TAPA.casera_frita)}. Si estirás grueso vas a sacar bastante menos, así que si es la primera vez calculá un kilo cada tres docenas y quedate tranquilo.`,
    },
    {
      q: '¿Qué lleva la masa de empanadas y en qué proporción?',
      a: `Sobre el peso de la harina: <b>${Math.round(RECETA_MASA.casera_criolla.grasa * 100)}% de grasa, ${Math.round(RECETA_MASA.casera_criolla.agua * 100)}% de agua y ${nAr(RECETA_MASA.casera_criolla.sal * 100, 1)}% de sal</b> para la criolla de horno. La masa para freír baja la grasa al ${Math.round(RECETA_MASA.casera_frita.grasa * 100)}% y suma un huevo. Con un kilo de harina de masa criolla eso son ${Math.round(1000 * RECETA_MASA.casera_criolla.grasa)} g de grasa, ${Math.round(1000 * RECETA_MASA.casera_criolla.agua)} ml de agua y ${Math.round(1000 * RECETA_MASA.casera_criolla.sal)} g de sal.`,
    },
    {
      q: '¿Cuánto relleno lleva cada empanada?',
      a: `Alrededor de <b>${RELLENO_POR_EMPANADA_G} g por unidad</b>, que es lo que entra en una tapa estándar sin que se abra al cerrarla. Tres docenas de empanadas se llevan aproximadamente ${nAr((36 * RELLENO_POR_EMPANADA_G) / 1000, 1)} kg de relleno. Ojo con una trampa clásica: el relleno de carne pierde bastante peso al cocinarse, así que si arrancás de carne picada cruda calculá alrededor de un 25% más de lo que necesitás ya cocido.`,
    },
    {
      q: '¿Cómo reparto los sabores de las empanadas?',
      a: 'Un reparto que funciona en casi cualquier evento es 40% de carne, 30% de pollo, 20% de jamón y queso y 10% de verdura. La regla de oro es que la de carne siempre se termina y la de verdura casi siempre sobra, así que no repartas en partes iguales aunque parezca lo justo. Si hay chicos, corré unos puntos de carne hacia jamón y queso. Y pedí que las marquen o repulguen distinto, porque una vez horneadas son todas iguales.',
    },
    {
      q: '¿Cuánta ensalada por persona calculo?',
      a: `Como guarnición, <b>${ENSALADA_G.guarnicion} g por persona</b>; si la ensalada es el plato principal, <b>${ENSALADA_G.principal} g</b>. En una mixta base eso se traduce en unas ${nAr(LECHUGAS_POR_KG, 2)} lechugas y ${nAr(TOMATES_POR_KG, 2)} tomates por kilo de ensalada, más ${CEBOLLA_G_POR_KG} g de cebolla. Para 14 personas de guarnición son alrededor de ${nAr((14 * ENSALADA_G.guarnicion) / 1000, 2)} kg. Aliñala recién al servir.`,
    },
    {
      q: '¿Cuánto pan hay que comprar para un asado?',
      a: `En un asado se van <b>${PAN_G_ADULTO.asado} g de pan por adulto</b>, bastante más que los ${PAN_G_ADULTO.comida} g de una comida común de mesa, porque está el choripán y el pan con chimichurri de la espera. Si la comida son sándwiches, subí a ${PAN_G_ADULTO.sandwiches} g. Los chicos comen alrededor de la mitad. Pasado a unidades: mignones de ${MIGNON_G} g o flautas de ${FLAUTA_G} g. Compralo el mismo día.`,
    },
    {
      q: '¿Cuánto carbón necesito para el asado?',
      a: `Entre <b>${nAr(CARBON_KG_PERSONA.rapido, 2)} y ${nAr(CARBON_KG_PERSONA.largo, 2)} kg por persona</b> según cuánto dure: ${nAr(CARBON_KG_PERSONA.rapido, 2)} kg si es corto, ${nAr(CARBON_KG_PERSONA.normal, 2)} kg en una tarde normal y ${nAr(CARBON_KG_PERSONA.largo, 2)} kg si hay picada, asado y sobremesa larga. Para 14 personas de asado normal son unos ${nAr(14 * CARBON_KG_PERSONA.normal, 1)} kg, o sea dos bolsas de las chicas. Sumá una pastilla de encendido cada ${nAr(CARBON_POR_PASTILLA, 1)} kg, con un mínimo de dos.`,
    },
    {
      q: '¿Cuánto tarda el carbón en hacer brasa?',
      a: `Entre ${MINUTOS_BRASA.rapido} y ${MINUTOS_BRASA.largo} minutos desde que prendés hasta tener brasa útil, según la cantidad de carbón y el viento. Con leña calculá bastante más, porque primero tiene que quemarse la madera entera: si vas a mezclar, prendé la leña primero y sumá el carbón después. La brasa está lista cuando el carbón se ve gris ceniza por fuera y anaranjado por dentro, no cuando todavía tiene llama.`,
    },
    {
      q: '¿Qué tamaño de parrilla necesito para X personas?',
      a: `Se calculan <b>${nAr(CM2_POR_PERSONA.solo_carne, 0)} cm² por persona</b> si va sólo carne, ${nAr(CM2_POR_PERSONA.estandar, 0)} cm² si además hay chorizos y ${nAr(CM2_POR_PERSONA.completo, 0)} cm² si va todo: carne, achuras y verduras. Para 14 personas con asado completo hacen falta unos ${nAr(14 * CM2_POR_PERSONA.completo, 0)} cm², que es ${nAr((14 * CM2_POR_PERSONA.completo) / 10000, 2)} m². Dejá siempre una zona libre al costado para mover brasas: si está todo cubierto de carne no podés regular el fuego.`,
    },
    {
      q: '¿Las empanadas se pueden hacer con anticipación?',
      a: 'Sí, y conviene. Armalas crudas, apoyalas en una bandeja separadas entre sí, congelalas y recién cuando están duras guardalas apiladas con papel entre capas. Van del freezer al horno sin descongelar, sumando unos minutos de cocción. Lo que no funciona es armarlas el día anterior y dejarlas en heladera: el relleno moja la masa desde adentro y se abren solas en el horno.',
    },
    {
      q: '¿Cómo combino esto con la carne del asado?',
      a: 'Esta página resuelve todo lo que rodea a la carne: empanadas, masa, ensalada, pan, carbón y parrilla. Los kilos de carne por corte —tira, vacío, pollo, chorizos, morcillas y achuras— se calculan aparte, porque la lista de la carnicería es otra cuenta. La regla práctica es que si además de la carne hay empanadas de entrada, la carne rinde bastante más de lo calculado: podés bajar una categoría de ración sin que falte nada.',
    },
  ],

  sources: [
    {
      name: 'Guías Alimentarias para la Población Argentina — tamaño de porción',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable/guias-alimentarias',
      publisher: 'Ministerio de Salud de la Nación',
    },
    {
      name: 'Manipulación segura de alimentos: cadena de frío, cocción y conservación',
      url: 'https://www.argentina.gob.ar/anmat/inspeccion-vigilancia/alimentos',
      publisher: 'ANMAT',
    },
    {
      name: 'Código Alimentario Argentino — Capítulo IX: harinas y productos farináceos',
      url: 'https://www.argentina.gob.ar/anmat/codigoalimentario',
      publisher: 'ANMAT · Código Alimentario Argentino',
    },
    {
      name: 'Tabla de composición y rendimiento de cortes vacunos argentinos',
      url: 'https://www.ipcva.com.ar/cortes/',
      publisher: 'Instituto de Promoción de la Carne Vacuna Argentina (IPCVA)',
    },
    {
      name: 'Precios de alimentos y bebidas — capítulo del IPC',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
  ],

  replaces: [
    '/calculadora-rendimiento-masa-empanadas-cantidad',
    '/calculadora-empanadas-por-persona-evento-asado-cumple',
    '/calculadora-tamano-parrilla-personas-m2',
    '/calculadora-ensalada-por-persona',
    '/calculadora-pan-para-comida-evento',
    '/calculadora-carbon-asado-kg',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
