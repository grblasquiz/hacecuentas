/**
 * "Calculadora SUBE Argentina" — cuánto sale viajar en transporte público y cuánto
 * gastás por mes con la tarjeta SUBE, aplicando los descuentos vigentes 2026.
 *
 * Modela dos beneficios que SÍ se acumulan entre sí:
 *   1) Descuento por viajes frecuentes (la "escala SUBE" mensual): los primeros 20
 *      viajes del mes van a tarifa plena; del 21 al 30 -20%; del 31 al 40 -30%;
 *      del 41 en adelante -40%. El descuento es MARGINAL (cada tramo paga su %),
 *      no plano sobre todo el mes.
 *   2) Tarifa Social Federal: -55% sobre la tarifa, para jubilados/pensionados, AUH,
 *      monotributo social, trabajadoras de casas particulares, Progresar, etc.
 *
 * Importante: la Tarifa Social Federal y la escala por frecuencia SE ACUMULAN
 * (fuente: argentina.gob.ar / Red SUBE). El combo "Red SUBE" por combinación de
 * medios en 2 horas (-50% 2º viaje / -75% 3º) es un beneficio aparte que NO se
 * modela acá porque depende de la combinación puntual, no del gasto mensual.
 *
 * Tarifas = boleto mínimo (0-3 km) con SUBE registrada, vigentes jun-2026.
 * `dataUpdate.frequency` = monthly: la tarifa sube seguido, revisar el cuadro.
 * Devuelve outputs + _insight + _table (escala de descuentos por tramo).
 */

export interface SubeInputs {
  transporte: string;
  viajesPorDia: number | string;
  diasPorMes: number | string;
  viajesPorMes?: number | string;
  tarifaSocial: string;
  redSube: string;
  __lang?: string;
}

export interface SubeOutputs {
  costoPorViaje: number;
  gastoSinDescuento: number;
  gastoConDescuento: number;
  ahorro: number;
  _insight?: any;
  _table?: any;
}

// Boleto mínimo (0-3 km) con SUBE registrada/nominalizada, vigente jun-2026.
// Fuente: Ministerio de Transporte / argentina.gob.ar/redsube.
const TARIFAS: Record<string, { nombre: string; emoji: string; tarifa: number }> = {
  colectivo_amba:    { nombre: 'Colectivo AMBA (jurisdicción nacional)', emoji: '🚌', tarifa: 728.28 },
  subte:             { nombre: 'Subte (CABA)',                            emoji: '🚇', tarifa: 1558 },
  tren:              { nombre: 'Tren (AMBA)',                             emoji: '🚆', tarifa: 350 },
  colectivo_interurbano: { nombre: 'Colectivo interurbano (PBA)',        emoji: '🚍', tarifa: 1015.61 },
};

// Escala por frecuencia mensual (descuento MARGINAL por tramo de viajes).
// desde = primer viaje del tramo (1-indexado); off = descuento sobre la tarifa.
const ESCALA_FRECUENCIA: { desde: number; hasta: number; off: number; label: string }[] = [
  { desde: 1,  hasta: 20,       off: 0,    label: 'Viajes 1 a 20' },
  { desde: 21, hasta: 30,       off: 0.20, label: 'Viajes 21 a 30' },
  { desde: 31, hasta: 40,       off: 0.30, label: 'Viajes 31 a 40' },
  { desde: 41, hasta: Infinity, off: 0.40, label: 'Viajes 41 en adelante' },
];

const TARIFA_SOCIAL_OFF = 0.55; // Tarifa Social Federal: -55%.

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

export function calculadoraSubeArgentina(inputs: SubeInputs): SubeOutputs {
  const key = (inputs.transporte || '').toString();
  // Acepta tanto la key interna como el label visible (robustez ante el select).
  let t = TARIFAS[key];
  if (!t) {
    const found = Object.values(TARIFAS).find((x) => x.nombre === key || x.nombre.startsWith(key));
    t = found || TARIFAS.colectivo_amba;
  }
  const tarifaBase = t.tarifa;

  const social = String(inputs.tarifaSocial).toLowerCase() === 'si' || String(inputs.tarifaSocial).toLowerCase() === 'sí';
  const conEscala = String(inputs.redSube).toLowerCase() === 'si' || String(inputs.redSube).toLowerCase() === 'sí';

  // Cantidad de viajes del mes: viajesPorMes directo, o viajesPorDia × diasPorMes.
  let viajesMes: number;
  const directos = Number(inputs.viajesPorMes);
  if (inputs.viajesPorMes != null && inputs.viajesPorMes !== '' && Number.isFinite(directos) && directos > 0) {
    viajesMes = Math.round(directos);
  } else {
    const vpd = Math.max(0, Number(inputs.viajesPorDia) || 0);
    const dpm = Math.max(0, Number(inputs.diasPorMes) || 0);
    viajesMes = Math.round(vpd * dpm);
  }
  viajesMes = Math.max(0, viajesMes);

  // Tarifa unitaria tras tarifa social (la social NO depende de la frecuencia).
  const tarifaSocialAplicada = social ? tarifaBase * (1 - TARIFA_SOCIAL_OFF) : tarifaBase;

  // Gasto SIN ningún descuento mensual (sí incluye social si corresponde, para
  // que "sin descuento" signifique "sin la escala por frecuencia").
  const gastoSinDescuento = tarifaSocialAplicada * viajesMes;

  // Gasto CON la escala por frecuencia (marginal por tramo), acumulada con social.
  let gastoConDescuento = 0;
  const desglose: { label: string; viajes: number; precioUnit: number; subtotal: number; off: number }[] = [];
  for (const tramo of ESCALA_FRECUENCIA) {
    if (viajesMes < tramo.desde) break;
    const hasta = Math.min(viajesMes, tramo.hasta);
    const viajesTramo = hasta - tramo.desde + 1;
    if (viajesTramo <= 0) continue;
    const off = conEscala ? tramo.off : 0;
    const precioUnit = tarifaSocialAplicada * (1 - off);
    const subtotal = precioUnit * viajesTramo;
    gastoConDescuento += subtotal;
    desglose.push({ label: tramo.label, viajes: viajesTramo, precioUnit, subtotal, off });
  }

  const ahorro = gastoSinDescuento - gastoConDescuento;
  // Costo por viaje "efectivo" del mes con todos los descuentos aplicados.
  const costoPorViaje = viajesMes > 0 ? gastoConDescuento / viajesMes : tarifaSocialAplicada;

  // --- Tabla: la escala de descuentos por frecuencia para ESTE transporte. ---
  const tableRows = ESCALA_FRECUENCIA.map((tramo) => {
    const off = conEscala ? tramo.off : 0;
    const precio = tarifaSocialAplicada * (1 - off);
    const usado = viajesMes >= tramo.desde;
    return [
      tramo.label + (usado ? ' ✓' : ''),
      off > 0 ? '-' + Math.round(off * 100) + '%' : 'Tarifa plena',
      fmt(precio),
    ];
  });

  const notaTabla = social
    ? `Precios ya con Tarifa Social (-55%) sobre la tarifa base de ${fmt(tarifaBase)}. La escala por frecuencia se acumula con la Tarifa Social. ✓ = tramo que alcanzás con ${viajesMes} viajes/mes.`
    : `Sobre la tarifa base de ${fmt(tarifaBase)} (boleto mínimo, SUBE registrada). ✓ = tramo que alcanzás con ${viajesMes} viajes/mes. Si tenés Tarifa Social, sumás -55% adicional.`;

  // --- Insight narrativo. ---
  let narrativa: string;
  const transp = `${t.emoji} ${t.nombre}`;
  if (viajesMes === 0) {
    narrativa = `Cargá tus viajes por mes para ver el gasto en ${transp}. El boleto mínimo con SUBE registrada es ${fmt(tarifaBase)}.`;
  } else {
    narrativa = `Con ${viajesMes} viajes por mes en ${transp} gastás ${fmt(gastoConDescuento)} al mes`;
    if (ahorro > 0.5) {
      const pctAhorro = gastoSinDescuento > 0 ? Math.round((ahorro / gastoSinDescuento) * 100) : 0;
      narrativa += `. La escala por frecuencia te ahorra ${fmt(ahorro)} (${pctAhorro}%): los viajes después del 20 bajan de precio.`;
    } else if (viajesMes <= 20 && conEscala) {
      narrativa += `. Todavía no llegás a la escala de descuentos: arranca recién en el viaje 21 del mes.`;
    } else {
      narrativa += `.`;
    }
    if (social) {
      narrativa += ` Ya incluye la Tarifa Social Federal (-55%).`;
    }
  }

  return {
    costoPorViaje,
    gastoSinDescuento,
    gastoConDescuento,
    ahorro,
    _insight: { type: 'highlight', icon: '🚌', text: narrativa },
    _table: {
      title: `Escala SUBE por frecuencia — ${t.nombre}`,
      headers: ['Tramo del mes', 'Descuento', 'Precio por viaje'],
      rows: tableRows,
      note: notaTabla,
    },
  };
}
