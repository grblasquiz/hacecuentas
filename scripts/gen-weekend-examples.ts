/**
 * Agrega 2 ejemplos resueltos (solvedExamples) computados de la fórmula real a
 * 22 calcs con tráfico orgánico de fin de semana que no tenían ejemplos.
 * Anti-fabricación: TODO número sale de correr la fórmula. Idempotente.
 *
 * Uso: npx tsx scripts/gen-weekend-examples.ts
 */
import fs from 'node:fs';
import path from 'node:path';

import { millasLatamDestino } from '../src/lib/formulas/millas-latam-destino.ts';
import { corteOptimoTablero } from '../src/lib/formulas/corte-optimo-tablero.ts';
import { consumoNaftaLitros100km } from '../src/lib/formulas/consumo-nafta-litros-100km.ts';
import { horarioLlegadaZonaHoraria } from '../src/lib/formulas/horario-llegada-zona-horaria.ts';
import { filamento3dNecesarioModelo } from '../src/lib/formulas/filamento-3d-necesario-modelo.ts';
import { arrozAguaProporcion } from '../src/lib/formulas/arroz-agua-proporcion.ts';
import { puntosAmexMembershipRewards } from '../src/lib/formulas/puntos-amex-membership-rewards.ts';
import { compararNaftaVsGncAhorro } from '../src/lib/formulas/comparar-nafta-vs-gnc-ahorro.ts';
import { descuentoVueloMillasVsCash } from '../src/lib/formulas/descuento-vuelo-millas-vs-cash.ts';
import { framinghamRiesgoCardiovascular } from '../src/lib/formulas/framingham-riesgo-cardiovascular.ts';
import { meserosNecesariosInvitados } from '../src/lib/formulas/meseros-necesarios-invitados.ts';
import { neumaticosMedidaEquivalente } from '../src/lib/formulas/neumaticos-medida-equivalente.ts';
import { patenteAutoProvincia } from '../src/lib/formulas/patente-auto-provincia.ts';
import { puntosVsCashVueloCuandoConviene } from '../src/lib/formulas/puntos-vs-cash-vuelo-cuando-conviene.ts';
import { celsiusFahrenheit } from '../src/lib/formulas/celsius-fahrenheit.ts';
import { autonomiaTanqueCombustible } from '../src/lib/formulas/autonomia-tanque-combustible.ts';
import { fiambreQuesoPorInvitadoPicada } from '../src/lib/formulas/fiambre-queso-por-invitado-picada.ts';
import { millasAmericanAaDestino } from '../src/lib/formulas/millas-american-aa-destino.ts';
import { presionNeumaticosPsiBar } from '../src/lib/formulas/presion-neumaticos-psi-bar.ts';
import { primingSugarCarbonatacionCerveza } from '../src/lib/formulas/priming-sugar-carbonatacion-cerveza.ts';
import { techosTejas } from '../src/lib/formulas/techos-tejas.ts';
import { valorMillasViajeroFrecuente } from '../src/lib/formulas/valor-millas-viajero-frecuente.ts';

const REVIEW = '2026-06-27';
const ars = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const usd = (n: number) => 'US$' + Math.round(n).toLocaleString('en-US');
const nAr = (n: number) => Number(n).toLocaleString('es-AR');

function patch(slug: string, examples: any[]) {
  const p = path.join('src/content/calcs', slug + '.json');
  const raw = fs.readFileSync(p, 'utf8');
  const c = JSON.parse(raw);
  c.solvedExamples = examples;
  c.lastReviewed = REVIEW;
  const next = JSON.stringify(c, null, 2) + '\n';
  if (next !== raw) {
    fs.writeFileSync(p, next);
    console.log(`[${slug.slice(0, 46)}] ${examples.length} ejemplos.`);
  } else {
    console.log(`[${slug.slice(0, 46)}] sin cambios.`);
  }
}

// 1) Millas LATAM por destino
{
  const a = millasLatamDestino({ destino: 'miami', cabina: 'economy', tipoViaje: 'ida-vuelta' });
  const b = millasLatamDestino({ destino: 'madrid', cabina: 'business', tipoViaje: 'ida-vuelta' });
  patch('calculadora-millas-latam-destino', [
    {
      title: `Buenos Aires–Miami ida y vuelta en economy: ${nAr(a.millasRequeridas)} millas`,
      context: 'Querés usar tus millas LATAM Pass para unas vacaciones en Miami en clase económica.',
      steps: [
        `Destino **Miami**, cabina **economy**, **ida y vuelta**.`,
        `Millas LATAM Pass requeridas: **${nAr(a.millasRequeridas)}**.`,
        `Valor estimado del canje (a 1,2¢/milla): **${usd(a.valorEstimadoUsd)}**. Las tasas e impuestos (${a.impuestos}) se pagan aparte en efectivo.`,
      ],
      result: `Necesitás **${nAr(a.millasRequeridas)} millas** + impuestos para Miami en economy ida y vuelta, un canje valuado en **${usd(a.valorEstimadoUsd)}**.`,
    },
    {
      title: `Buenos Aires–Madrid en business: ${nAr(b.millasRequeridas)} millas`,
      context: 'Tenés un pozo grande de millas y querés exprimirlas en un tramo largo en business.',
      steps: [
        `Destino **Madrid**, cabina **business**, **ida y vuelta**.`,
        `Millas requeridas: **${nAr(b.millasRequeridas)}** (la business usa el tramo más caro de la tabla).`,
        `Valor estimado: **${usd(b.valorEstimadoUsd)}**, muy por encima del canje en economy.`,
      ],
      result: `Madrid en business sale **${nAr(b.millasRequeridas)} millas** + impuestos, con un valor estimado de **${usd(b.valorEstimadoUsd)}**. Las cabinas premium dan el mayor valor por milla.`,
    },
  ]);
}

// 2) Corte óptimo de tablero
{
  const a = corteOptimoTablero({ piezaAncho: 60, piezaAlto: 40, piezasNecesarias: 20 });
  const b = corteOptimoTablero({ piezaAncho: 80, piezaAlto: 50, piezasNecesarias: 8 });
  patch('calculadora-corte-optimo-tablero', [
    {
      title: `20 estantes de 60×40 cm: ${a.tablasNecesarias}`,
      context: 'Vas a cortar 20 estantes de 60×40 cm de una placa de melamina estándar (274×183 cm).',
      steps: [
        `Pieza **60×40 cm**, necesitás **20** unidades.`,
        `Orientación óptima de corte: **${a.orientacion}** → **${a.piezasPorTabla}**.`,
        `Desperdicio del tablero: **${a.desperdicio}**.`,
      ],
      result: `Comprá **${a.tablasNecesarias}**: con esa orientación sacás ${a.piezasPorTabla.toLowerCase()} y el descarte es de ${a.desperdicio}.`,
    },
    {
      title: `8 puertas de 80×50 cm: ${b.tablasNecesarias}`,
      context: 'Necesitás 8 frentes de mueble de 80×50 cm y querés saber cuántas placas comprar.',
      steps: [
        `Pieza **80×50 cm**, necesitás **8** unidades.`,
        `Mejor orientación: **${b.orientacion}** → **${b.piezasPorTabla}**.`,
        `Desperdicio: **${b.desperdicio}**.`,
      ],
      result: `Te alcanzan **${b.tablasNecesarias}**. Piezas grandes dejan más recorte (${b.desperdicio}): conviene aprovechar los sobrantes en piezas chicas.`,
    },
  ]);
}

// 3) Consumo nafta L/100km
{
  const a = consumoNaftaLitros100km({ kmRecorridos: 500, litrosCargados: 40 });
  const b = consumoNaftaLitros100km({ kmRecorridos: 300, litrosCargados: 45 });
  patch('calculadora-consumo-nafta-litros-100km', [
    {
      title: `500 km con 40 L: ${a.consumoL100km} L/100km`,
      context: 'Anotaste el odómetro entre dos cargas: recorriste 500 km y cargaste 40 litros para llenar.',
      steps: [
        `Fórmula: litros ÷ km × 100 = 40 ÷ 500 × 100.`,
        `Consumo: **${a.consumoL100km} L/100km**.`,
        `Rendimiento equivalente: **${a.kmPorLitro} km/L**.`,
      ],
      result: `Tu auto consume **${a.consumoL100km} L/100km** (${a.kmPorLitro} km/L), un consumo eficiente para uso mixto.`,
    },
    {
      title: `300 km con 45 L en ciudad: ${b.consumoL100km} L/100km`,
      context: 'Manejaste casi todo en ciudad con mucho tráfico: 300 km y 45 litros entre cargas.',
      steps: [
        `Cálculo: 45 ÷ 300 × 100.`,
        `Consumo: **${b.consumoL100km} L/100km** (**${b.kmPorLitro} km/L**).`,
        `El uso 100% urbano y el tráfico disparan el consumo frente a ruta.`,
      ],
      result: `En ciudad el auto trepa a **${b.consumoL100km} L/100km**. Revisar presión de neumáticos y manejar suave ayuda a bajarlo.`,
    },
  ]);
}

// 4) Horario de llegada por zona horaria
{
  const a = horarioLlegadaZonaHoraria({ horaSalida: '14:00', diferenciaHorariaDestino: 5, duracionVueloHoras: 12 });
  const b = horarioLlegadaZonaHoraria({ horaSalida: '22:00', diferenciaHorariaDestino: -3, duracionVueloHoras: 10.5 });
  patch('calculadora-horario-llegada-zona-horaria', [
    {
      title: `Vuelo a Europa: salís 14:00, llegás ${a.horaLlegadaLocal}`,
      context: 'Volás de Buenos Aires a Madrid: salís 14:00, son +5h de diferencia y el vuelo dura 12 horas.',
      steps: [
        `Hora de salida **14:00**, duración **12h**, diferencia **+5h** (vas al este).`,
        `Hora de llegada en horario del destino: **${a.horaLlegadaLocal}** del ${a.diasQueAvanza === 1 ? 'día siguiente' : 'mismo día'}.`,
        `Vas al este: el jet lag pega más fuerte que viajando al oeste.`,
      ],
      result: `Aterrizás a las **${a.horaLlegadaLocal}** (${a.diasQueAvanza === 1 ? 'día siguiente' : 'mismo día'}). Dale margen al sueño los primeros días: ir al este es lo que más cuesta.`,
    },
    {
      title: `Vuelo nocturno al oeste: salís 22:00, llegás ${b.horaLlegadaLocal}`,
      context: 'Tomás un vuelo nocturno hacia el oeste (-3h): salís 22:00 y el vuelo dura 10h30.',
      steps: [
        `Salida **22:00**, duración **10h30**, diferencia **-3h** (vas al oeste).`,
        `Llegada en horario local del destino: **${b.horaLlegadaLocal}**.`,
        `Al oeste el cuerpo se acomoda más fácil: te dará sueño temprano los primeros días.`,
      ],
      result: `Llegás a las **${b.horaLlegadaLocal}**. Viajar al oeste se lleva mejor que al este: la adaptación es más rápida.`,
    },
  ]);
}

// 5) Filamento 3D
{
  const a = filamento3dNecesarioModelo({ volumen: 50, infill: 20, densidad: 1.24, diametro: 1.75 });
  const b = filamento3dNecesarioModelo({ volumen: 120, infill: 100, densidad: 1.24, diametro: 1.75 });
  patch('calculadora-filamento-3d-necesario-modelo', [
    {
      title: `Pieza de 50 cm³ al 20% de relleno: ${a.gramos} g de PLA`,
      context: 'Imprimís una pieza decorativa de 50 cm³ en PLA (densidad 1,24) con 20% de infill, filamento de 1,75 mm.',
      steps: [
        `Volumen **50 cm³**, relleno **20%**, PLA (densidad **1,24 g/cm³**).`,
        `Filamento necesario: **${a.gramos} g** (**${a.metros} m**).`,
        `Eso es el **${a.porcentajeBobina}**.`,
      ],
      result: `Vas a gastar **${a.gramos} g** de PLA (${a.porcentajeBobina}). Sumá un 5-10% extra por purga, brim y soportes.`,
    },
    {
      title: `Pieza maciza de 120 cm³ al 100%: ${b.gramos} g`,
      context: 'Una pieza funcional de 120 cm³ impresa sólida (100% de relleno) en PLA de 1,75 mm.',
      steps: [
        `Volumen **120 cm³**, relleno **100%** (pieza maciza).`,
        `Filamento: **${b.gramos} g** (**${b.metros} m**), el **${b.porcentajeBobina}**.`,
        `A más relleno, más material: el 100% casi triplica lo de una pieza al 20%.`,
      ],
      result: `La pieza sólida se lleva **${b.gramos} g** (${b.porcentajeBobina}). Para piezas grandes, bajar el infill ahorra muchísimo filamento.`,
    },
  ]);
}

// 6) Arroz: agua y proporción
{
  const a = arrozAguaProporcion({ tipoArroz: 'blanco_largo', cantidadGramos: 300 });
  const b = arrozAguaProporcion({ tipoArroz: 'integral', porciones: 4 });
  patch('calculadora-arroz-agua-proporcion-coccion', [
    {
      title: `300 g de arroz blanco largo: ${a.aguaMl} ml de agua`,
      context: 'Vas a cocinar 300 g de arroz blanco largo fino (tipo Gallo Oro) como guarnición.',
      steps: [
        `Arroz blanco largo: proporción **2 de agua por 1 de arroz**.`,
        `Agua = 300 g × 2 = **${a.aguaMl} ml** (~${a.aguaTazas} tazas).`,
        `Cocción **${a.tiempoCoccion} min** tapado; rinde ~**${a.rendimientoCocido} g** cocido.`,
      ],
      result: `Para 300 g usá **${a.aguaMl} ml de agua** y ${a.tiempoCoccion} min de cocción. Rinde ~${a.rendimientoCocido} g cocido.`,
    },
    {
      title: `Arroz integral para 4 porciones: ${b.arrozGramos} g y ${b.aguaMl} ml`,
      context: 'Cocinás arroz integral para 4 personas como guarnición y no sabés cuánta agua va.',
      steps: [
        `4 porciones × 70 g/persona = **${b.arrozGramos} g** de arroz crudo.`,
        `El integral necesita más agua: proporción **2,5 a 1** → **${b.aguaMl} ml** (~${b.aguaTazas} tazas).`,
        `Cocción **${b.tiempoCoccion} min** (remojar 30 min antes acorta el tiempo).`,
      ],
      result: `Para 4 porciones: **${b.arrozGramos} g** de integral + **${b.aguaMl} ml** de agua, ${b.tiempoCoccion} min. El integral lleva más agua y más tiempo que el blanco.`,
    },
  ]);
}

// 7) Puntos Amex Membership Rewards
{
  const a = puntosAmexMembershipRewards({ puntos: 50000, canal: 'transferencia-aerolinea' });
  const b = puntosAmexMembershipRewards({ puntos: 50000, canal: 'cashback' });
  patch('calculadora-puntos-amex-membership-rewards', [
    {
      title: `50.000 puntos transferidos a aerolínea: ${usd(a.valorUsd)}`,
      context: 'Tenés 50.000 puntos Amex Membership Rewards y los transferís a un programa de aerolínea.',
      steps: [
        `Canal **transferencia a aerolínea**: **${a.centavosPorPunto}¢ por punto**.`,
        `Valor = 50.000 × ${a.centavosPorPunto}¢ = **${usd(a.valorUsd)}**.`,
        `Es el canal más rentable de Amex Membership Rewards.`,
      ],
      result: `Transfiriendo a aerolínea, 50.000 puntos valen **${usd(a.valorUsd)}** (${a.centavosPorPunto}¢/punto). ${a.recomendacion}`,
    },
    {
      title: `Los mismos 50.000 puntos en cashback: solo ${usd(b.valorUsd)}`,
      context: 'Comparás qué pasa si en vez de transferir esos 50.000 puntos los usás como cashback.',
      steps: [
        `Canal **cashback**: **${b.centavosPorPunto}¢ por punto**, mucho menos que transferir.`,
        `Valor = 50.000 × ${b.centavosPorPunto}¢ = **${usd(b.valorUsd)}**.`,
        `Diferencia vs aerolínea: perdés más de la mitad del valor.`,
      ],
      result: `En cashback los mismos puntos rinden apenas **${usd(b.valorUsd)}**. ${b.recomendacion}`,
    },
  ]);
}

// 8) Nafta vs GNC
{
  const a = compararNaftaVsGncAhorro({ kmMensuales: 2000, consumoNafta: 9, precioNafta: 1100, precioGnc: 650, costoEquipo: 2500000 });
  const b = compararNaftaVsGncAhorro({ kmMensuales: 800, consumoNafta: 8, precioNafta: 1100, precioGnc: 650, costoEquipo: 2500000 });
  patch('calculadora-comparar-nafta-vs-gnc-ahorro', [
    {
      title: `2.000 km/mes: ahorrás ${ars(a.ahorroMensual)} con GNC`,
      context: 'Hacés 2.000 km por mes (mucho uso), nafta a $1.100/L, GNC a $650/m³, equipo de $2.500.000.',
      steps: [
        `Gasto mensual en nafta: **${ars(a.gastoMensualNafta)}**.`,
        `Gasto mensual en GNC (factor 1,3 m³ vs L): **${ars(a.gastoMensualGnc)}**.`,
        `Ahorro: **${ars(a.ahorroMensual)}/mes** (${ars(a.ahorroAnual)}/año). El equipo se amortiza en **${a.mesesAmortizacion} meses**.`,
      ],
      result: `Con uso intensivo, el GNC ahorra **${ars(a.ahorroMensual)}/mes** y el equipo se paga solo en ${a.mesesAmortizacion} meses.`,
    },
    {
      title: `Solo 800 km/mes: amortización a ${b.mesesAmortizacion} meses`,
      context: 'Usás poco el auto (800 km/mes). ¿Sigue conviniendo invertir $2.500.000 en el equipo de GNC?',
      steps: [
        `Nafta: **${ars(b.gastoMensualNafta)}/mes**. GNC: **${ars(b.gastoMensualGnc)}/mes**.`,
        `Ahorro mensual: **${ars(b.ahorroMensual)}** (${ars(b.ahorroAnual)}/año).`,
        `Con poco kilometraje, el equipo tarda **${b.mesesAmortizacion} meses** en amortizarse.`,
      ],
      result: `Con 800 km/mes ahorrás **${ars(b.ahorroMensual)}/mes**, pero el equipo recién se paga en ${b.mesesAmortizacion} meses: cuanto menos manejás, menos conviene convertir.`,
    },
  ]);
}

// 9) Descuento vuelo: millas vs cash
{
  const a = descuentoVueloMillasVsCash({ precioEnCashUsd: 1200, millasRequeridas: 60000, tasasImpuestosUsd: 100, valorMilla: 1.3 });
  const b = descuentoVueloMillasVsCash({ precioEnCashUsd: 400, millasRequeridas: 40000, tasasImpuestosUsd: 80, valorMilla: 1.3 });
  patch('calculadora-descuento-vuelo-millas-vs-cash', [
    {
      title: `Vuelo de US$1.200 por 60.000 millas: ${a.valorMillaObtenidoCent}¢/milla`,
      context: 'Un vuelo cuesta US$1.200 en efectivo o 60.000 millas + US$100 de tasas. ¿Conviene canjear?',
      steps: [
        `Ahorro en cash = US$1.200 − US$100 de tasas = **${usd(a.ahorroEnCashUsd)}**.`,
        `Valor por milla = ${usd(a.ahorroEnCashUsd)} ÷ 60.000 = **${a.valorMillaObtenidoCent}¢/milla** (referencia 1,3¢).`,
        a.recomendacion,
      ],
      result: `Cada milla te rinde **${a.valorMillaObtenidoCent}¢**, por encima de la referencia de 1,3¢. ${a.recomendacion}`,
    },
    {
      title: `Vuelo barato de US$400 por 40.000 millas: ${b.valorMillaObtenidoCent}¢/milla`,
      context: 'Un tramo corto sale US$400 en cash o 40.000 millas + US$80. Caso típico donde no conviene quemar millas.',
      steps: [
        `Ahorro en cash = US$400 − US$80 = **${usd(b.ahorroEnCashUsd)}**.`,
        `Valor por milla = ${usd(b.ahorroEnCashUsd)} ÷ 40.000 = **${b.valorMillaObtenidoCent}¢/milla**, debajo de 1,3¢.`,
        b.recomendacion,
      ],
      result: `Acá cada milla rinde apenas **${b.valorMillaObtenidoCent}¢**. ${b.recomendacion}`,
    },
  ]);
}

// 10) Framingham riesgo cardiovascular
{
  const a = framinghamRiesgoCardiovascular({ edad: 45, sexo: 'm', colesterolTotal: 200, hdl: 45, sistolica: 125, tratamientoHTA: false, fumador: false, diabetico: false });
  const b = framinghamRiesgoCardiovascular({ edad: 60, sexo: 'm', colesterolTotal: 260, hdl: 38, sistolica: 150, tratamientoHTA: true, fumador: true, diabetico: false });
  patch('calculadora-framingham-riesgo-cardiovascular', [
    {
      title: `Hombre de 45 años sano: riesgo ${a.riesgoPorcentaje}% a 10 años`,
      context: 'Hombre de 45 años, colesterol 200, HDL 45, presión 125, no fumador, sin diabetes ni HTA tratada.',
      steps: [
        `Suma de puntos Framingham por edad, colesterol, HDL y presión: **puntaje ${a.puntaje}**.`,
        `Riesgo cardiovascular a 10 años: **${a.riesgoPorcentaje}%** (${a.categoria}).`,
        a.recomendacion,
      ],
      result: `Riesgo a 10 años: **${a.riesgoPorcentaje}%** (${a.categoria}). ${a.recomendacion}`,
    },
    {
      title: `Hombre de 60 años fumador e hipertenso: riesgo ${b.riesgoPorcentaje}%`,
      context: 'Hombre de 60 años, colesterol 260, HDL 38, presión 150 con tratamiento, fumador. Perfil de alto riesgo.',
      steps: [
        `El puntaje sube por edad, colesterol alto, HDL bajo, presión tratada y tabaquismo: **puntaje ${b.puntaje}**.`,
        `Riesgo a 10 años: **${b.riesgoPorcentaje}%** (${b.categoria}), con edad cardiovascular ~${b.edadCardiovascular}.`,
        b.recomendacion,
      ],
      result: `Riesgo a 10 años: **${b.riesgoPorcentaje}%** (${b.categoria}). ${b.recomendacion}`,
    },
  ]);
}

// 11) Meseros necesarios
{
  const a = meserosNecesariosInvitados({ invitados: 100, tipoServicio: 'cenaServida' });
  const b = meserosNecesariosInvitados({ invitados: 100, tipoServicio: 'buffet' });
  patch('calculadora-meseros-necesarios-invitados', [
    {
      title: `100 invitados con cena servida: ${a.meseros} mozos`,
      context: 'Organizás un casamiento de 100 invitados con servicio de cena en la mesa (plato servido).',
      steps: [
        `**100 invitados**, servicio **cena servida** (1 mozo cada ~11 personas).`,
        `Mozos: **${a.meseros}**; bartenders: **${a.bartenders}**; maître: **${a.maitre}**.`,
        `Costo estimado de personal por la jornada: **${ars(a.costoEstimado)}**.`,
      ],
      result: `Para 100 invitados con cena servida: **${a.meseros} mozos, ${a.bartenders} bartenders y ${a.maitre} maître** (~${ars(a.costoEstimado)}).`,
    },
    {
      title: `Los mismos 100 invitados en buffet: solo ${b.meseros} mozos`,
      context: 'Comparás cuántos mozos necesitás si en vez de cena servida hacés un buffet (el invitado se sirve).',
      steps: [
        `**100 invitados**, servicio **buffet** (1 mozo cada ~27 personas).`,
        `Mozos: **${b.meseros}** (menos que en cena servida); bartenders: **${b.bartenders}**; maître: **${b.maitre}**.`,
        `Costo estimado: **${ars(b.costoEstimado)}**.`,
      ],
      result: `En buffet bajás a **${b.meseros} mozos** (${ars(b.costoEstimado)}). El tipo de servicio define cuánto personal necesitás.`,
    },
  ]);
}

// 12) Neumáticos: medida equivalente
{
  const a = neumaticosMedidaEquivalente({ ancho1: 205, perfil1: 55, rin1: 16, ancho2: 215, perfil2: 50, rin2: 17 });
  const b = neumaticosMedidaEquivalente({ ancho1: 195, perfil1: 65, rin1: 15, ancho2: 205, perfil2: 60, rin2: 16 });
  patch('calculadora-neumaticos-medida-equivalente', [
    {
      title: `205/55 R16 → 215/50 R17: diferencia de ${a.diferenciaPorcentaje}%`,
      context: 'Querés pasar de la medida original 205/55 R16 a unas llantas de 17" con 215/50 R17.',
      steps: [
        `Diámetro original 205/55 R16: **${a.diametroTotal1} mm**.`,
        `Diámetro alternativo 215/50 R17: **${a.diametroTotal2} mm**.`,
        `Diferencia: **${a.diferenciaPorcentaje > 0 ? '+' : ''}${a.diferenciaPorcentaje}%** (la regla es mantenerse dentro del ±3%).`,
      ],
      result: `La 215/50 R17 difiere **${a.diferenciaPorcentaje > 0 ? '+' : ''}${a.diferenciaPorcentaje}%** del original: dentro de tolerancia, no afecta el velocímetro de forma significativa.`,
    },
    {
      title: `195/65 R15 → 205/60 R16: ${b.diferenciaPorcentaje}% de diferencia`,
      context: 'Subís de rodado 15 a 16 cambiando 195/65 R15 por 205/60 R16 y querés confirmar que son equivalentes.',
      steps: [
        `Diámetro 195/65 R15: **${b.diametroTotal1} mm**.`,
        `Diámetro 205/60 R16: **${b.diametroTotal2} mm**.`,
        `Diferencia: **${b.diferenciaPorcentaje > 0 ? '+' : ''}${b.diferenciaPorcentaje}%**.`,
      ],
      result: `La diferencia es **${b.diferenciaPorcentaje > 0 ? '+' : ''}${b.diferenciaPorcentaje}%**: una equivalencia válida para subir de rodado sin descalibrar el velocímetro.`,
    },
  ]);
}

// 13) Patente auto por provincia
{
  const a = patenteAutoProvincia({ valuacionFiscal: 15000000, provincia: 'buenos-aires', cuotas: 5 });
  const b = patenteAutoProvincia({ valuacionFiscal: 15000000, provincia: 'caba', cuotas: 12 });
  patch('calculadora-patente-auto-provincia', [
    {
      title: `Auto de $15.000.000 en PBA: ${ars(a.patenteAnual)}/año`,
      context: 'Tu auto tiene una valuación fiscal de $15.000.000 y está radicado en Provincia de Buenos Aires.',
      steps: [
        `Valuación fiscal **$15.000.000**, alícuota representativa PBA **${a.alicuotaAplicada}%**.`,
        `Patente anual = $15.000.000 × ${a.alicuotaAplicada}% = **${ars(a.patenteAnual)}**.`,
        `En 5 cuotas: **${ars(a.patenteCuota)}** cada una (~${ars(a.patenteMensual)}/mes).`,
      ],
      result: `En PBA pagás ≈ **${ars(a.patenteAnual)}/año**. Muchas provincias dan ~35% de descuento si pagás todo el año por adelantado.`,
    },
    {
      title: `El mismo auto en CABA: ${ars(b.patenteAnual)}/año`,
      context: 'Comparás cuánto pagarías por ese mismo auto de $15.000.000 si estuviera patentado en CABA.',
      steps: [
        `Valuación **$15.000.000**, alícuota representativa CABA **${b.alicuotaAplicada}%** (más alta que PBA).`,
        `Patente anual = **${ars(b.patenteAnual)}**.`,
        `La diferencia con PBA viene solo de la alícuota provincial.`,
      ],
      result: `En CABA el mismo auto paga ≈ **${ars(b.patenteAnual)}/año** (alícuota ${b.alicuotaAplicada}%). La provincia de radicación cambia bastante el monto.`,
    },
  ]);
}

// 14) Puntos vs cash: cuándo conviene
{
  const a = puntosVsCashVueloCuandoConviene({ precioCashUsd: 800, puntosRequeridos: 35000, impuestosCanje: 60 });
  const b = puntosVsCashVueloCuandoConviene({ precioCashUsd: 250, puntosRequeridos: 25000, impuestosCanje: 40 });
  patch('calculadora-puntos-vs-cash-vuelo-cuando-conviene', [
    {
      title: `Vuelo de US$800 por 35.000 puntos: ${a.centavosPorPunto}¢/punto`,
      context: 'Un pasaje sale US$800 en efectivo o 35.000 puntos + US$60 de impuestos del canje.',
      steps: [
        `Valor neto = US$800 − US$60 = **${usd(a.ahorroUsd)}**.`,
        `Centavos por punto = ${usd(a.ahorroUsd)} ÷ 35.000 = **${a.centavosPorPunto}¢/punto**.`,
        a.decision,
      ],
      result: `Cada punto rinde **${a.centavosPorPunto}¢**. ${a.decision}`,
    },
    {
      title: `Vuelo de US$250 por 25.000 puntos: solo ${b.centavosPorPunto}¢/punto`,
      context: 'Un tramo barato de US$250 o 25.000 puntos + US$40. Caso clásico donde conviene pagar en efectivo.',
      steps: [
        `Valor neto = US$250 − US$40 = **${usd(b.ahorroUsd)}**.`,
        `Centavos por punto = ${usd(b.ahorroUsd)} ÷ 25.000 = **${b.centavosPorPunto}¢/punto**, por debajo del piso de 1,5¢.`,
        b.decision,
      ],
      result: `Acá el punto rinde apenas **${b.centavosPorPunto}¢**. ${b.decision}`,
    },
  ]);
}

// 15) Conversor Celsius/Fahrenheit
{
  const a = celsiusFahrenheit({ modo: 'c-a-f', temperatura: 37 });
  const b = celsiusFahrenheit({ modo: 'f-a-c', temperatura: 100 });
  patch('conversor-celsius-fahrenheit-temperatura', [
    {
      title: `37 °C a Fahrenheit: ${a.resultado}`,
      context: 'Querés saber a cuántos grados Fahrenheit equivale la temperatura corporal normal de 37 °C.',
      steps: [
        `Fórmula: **°F = °C × 9/5 + 32**.`,
        `Reemplazás: 37 × 9/5 + 32.`,
        `Resultado: **${a.resultado}**.`,
      ],
      result: `37 °C equivalen a **${a.resultado}**, la temperatura corporal normal en la escala Fahrenheit.`,
    },
    {
      title: `100 °F a Celsius: ${b.resultado}`,
      context: 'Una receta o un termostato en EE.UU. marca 100 °F y querés el equivalente en Celsius.',
      steps: [
        `Fórmula: **°C = (°F − 32) × 5/9**.`,
        `Reemplazás: (100 − 32) × 5/9.`,
        `Resultado: **${b.resultado}**.`,
      ],
      result: `100 °F equivalen a **${b.resultado}**: un día muy caluroso, no el punto de ebullición (ese es 212 °F).`,
    },
  ]);
}

// 16) Autonomía del tanque
{
  const a = autonomiaTanqueCombustible({ capacidadTanque: 50, consumoL100km: 8, precioLitro: 1100 });
  const b = autonomiaTanqueCombustible({ capacidadTanque: 65, consumoL100km: 12, precioLitro: 1100 });
  patch('calculadora-autonomia-tanque-combustible', [
    {
      title: `Tanque de 50 L a 8 L/100km: ${nAr(a.autonomiaKm)} km`,
      context: 'Tu auto tiene un tanque de 50 litros y consume 8 L/100km en uso mixto; nafta a $1.100/L.',
      steps: [
        `Autonomía = (50 L ÷ 8 L/100km) × 100 = **${nAr(a.autonomiaKm)} km**.`,
        `Llenar el tanque: 50 L × $1.100 = **${ars(a.costoLlenarTanque)}**.`,
        `Costo por km: **${ars(a.costoPorKm)}/km**.`,
      ],
      result: `Con el tanque lleno recorrés **${nAr(a.autonomiaKm)} km** antes de recargar, a **${ars(a.costoPorKm)}/km**.`,
    },
    {
      title: `SUV de 65 L a 12 L/100km: ${nAr(b.autonomiaKm)} km`,
      context: 'Una camioneta con tanque de 65 litros pero que consume más (12 L/100km) en ciudad.',
      steps: [
        `Autonomía = (65 ÷ 12) × 100 = **${nAr(b.autonomiaKm)} km**.`,
        `Llenar: 65 L × $1.100 = **${ars(b.costoLlenarTanque)}**.`,
        `Costo por km: **${ars(b.costoPorKm)}/km**, mayor que un auto eficiente pese al tanque más grande.`,
      ],
      result: `La SUV rinde **${nAr(b.autonomiaKm)} km** por tanque a **${ars(b.costoPorKm)}/km**: el consumo pesa más que el tamaño del tanque.`,
    },
  ]);
}

// 17) Fiambre y queso por invitado (picada)
{
  const a = fiambreQuesoPorInvitadoPicada({ invitados: 10, rol: 'principal' });
  const b = fiambreQuesoPorInvitadoPicada({ invitados: 20, rol: 'aperitivo' });
  patch('calculadora-fiambre-queso-por-invitado-picada', [
    {
      title: `Picada como plato principal para 10: ${a.kgFiambre} kg de fiambre`,
      context: 'Hacés una picada que es la comida principal de una junta de 10 personas.',
      steps: [
        `**10 invitados**, rol **plato principal** (${a.gramosFiambrePorPersona}g de fiambre + ${a.gramosQuesoPorPersona}g de queso por persona).`,
        `Fiambre: **${a.kgFiambre} kg**; queso: **${a.kgQueso} kg**; aceitunas: **${a.kgAceitunas} kg**.`,
        `Pedí en la fiambrería con algo de margen.`,
      ],
      result: `Para 10 personas con la picada como plato fuerte: **${a.kgFiambre} kg de fiambre, ${a.kgQueso} kg de queso y ${a.kgAceitunas} kg de aceitunas**.`,
    },
    {
      title: `Picada de aperitivo para 20: ${b.kgFiambre} kg de fiambre`,
      context: 'Una picada chica como aperitivo antes de cenar, para 20 invitados (porciones más chicas).',
      steps: [
        `**20 invitados**, rol **aperitivo** (solo ${b.gramosFiambrePorPersona}g de fiambre + ${b.gramosQuesoPorPersona}g de queso por persona).`,
        `Fiambre: **${b.kgFiambre} kg**; queso: **${b.kgQueso} kg**; aceitunas: **${b.kgAceitunas} kg**.`,
        `Como solo abre el apetito, las cantidades por persona son la mitad que de plato principal.`,
      ],
      result: `Picada de aperitivo para 20: **${b.kgFiambre} kg de fiambre, ${b.kgQueso} kg de queso y ${b.kgAceitunas} kg de aceitunas**. El rol define cuánto comprar por persona.`,
    },
  ]);
}

// 18) Millas American AAdvantage por destino
{
  const a = millasAmericanAaDestino({ destino: 'miami', cabina: 'economy', tipoViaje: 'ida-vuelta' });
  const b = millasAmericanAaDestino({ destino: 'madrid', cabina: 'business', tipoViaje: 'ida-vuelta' });
  patch('calculadora-millas-american-aa-destino', [
    {
      title: `Miami ida y vuelta en economy: ${nAr(a.millasRequeridas)} millas AAdvantage`,
      context: 'Querés usar tus millas AAdvantage de American Airlines para ir a Miami en clase económica.',
      steps: [
        `Destino **Miami**, cabina **economy**, **ida y vuelta**.`,
        `Millas AAdvantage requeridas: **${nAr(a.millasRequeridas)}**.`,
        `Valor estimado del canje: **${usd(a.valorEstimadoUsd)}**. Sumá ${a.impuestos}`,
      ],
      result: `Miami en economy ida y vuelta cuesta **${nAr(a.millasRequeridas)} millas** + impuestos, un canje valuado en **${usd(a.valorEstimadoUsd)}**.`,
    },
    {
      title: `Madrid en business: ${nAr(b.millasRequeridas)} millas`,
      context: 'Tenés muchas millas AAdvantage acumuladas y querés un tramo largo a Europa en business.',
      steps: [
        `Destino **Madrid**, cabina **business**, **ida y vuelta**.`,
        `Millas requeridas: **${nAr(b.millasRequeridas)}**.`,
        `Valor estimado: **${usd(b.valorEstimadoUsd)}**, donde la milla rinde más.`,
      ],
      result: `Madrid en business sale **${nAr(b.millasRequeridas)} millas** + impuestos (valor ~${usd(b.valorEstimadoUsd)}). Los canjes premium exprimen el mayor valor por milla.`,
    },
  ]);
}

// 19) Presión neumáticos PSI/Bar
{
  const a = presionNeumaticosPsiBar({ valorPresion: 32, unidadOrigen: 1 }); // PSI -> bar/kPa
  const b = presionNeumaticosPsiBar({ valorPresion: 2.2, unidadOrigen: 2 }); // bar -> PSI/kPa
  patch('calculadora-presion-neumaticos-psi-bar', [
    {
      title: `32 PSI a bar: ${a.bar} bar`,
      context: 'El manual de tu auto pide 32 PSI y querés saber cuánto es en bar para el inflador del taller.',
      steps: [
        `Origen: **32 PSI**.`,
        `Conversión: 32 × 0,0689 = **${a.bar} bar** (también **${a.kpa} kPa**).`,
        `Está en el rango normal de presión para autos (28-36 PSI).`,
      ],
      result: `32 PSI equivalen a **${a.bar} bar** (${a.kpa} kPa), una presión normal para la mayoría de los autos.`,
    },
    {
      title: `2,2 bar a PSI: ${b.psi} PSI`,
      context: 'Un inflador europeo marca en bar (2,2 bar) y vos pensás en PSI: querés el equivalente.',
      steps: [
        `Origen: **2,2 bar**.`,
        `Conversión: 2,2 × 14,5 = **${b.psi} PSI** (también **${b.kpa} kPa**).`,
        `Comparás ese valor con lo que pide tu vehículo en la etiqueta de la puerta.`,
      ],
      result: `2,2 bar equivalen a **${b.psi} PSI** (${b.kpa} kPa): dentro del rango habitual para autos de pasajeros.`,
    },
  ]);
}

// 20) Priming sugar carbonatación
{
  const a = primingSugarCarbonatacionCerveza({ volumenCerveza: 20, volumenesCO2: 2.4, temperaturaFermentacion: 20, tipoAzucar: 'dextrosa' });
  const b = primingSugarCarbonatacionCerveza({ volumenCerveza: 20, volumenesCO2: 3.8, temperaturaFermentacion: 18, tipoAzucar: 'sacarosa' });
  patch('calculadora-priming-sugar-carbonatacion-cerveza', [
    {
      title: `20 L de IPA a 2,4 vol con dextrosa: ${a.gramosAzucar} g`,
      context: 'Embotellás 20 L de una IPA buscando 2,4 volúmenes de CO2, fermentada a 20 °C, cebando con dextrosa.',
      steps: [
        `Volumen **20 L**, objetivo **2,4 vol** de CO2, fermentación a **20 °C**.`,
        `CO2 residual de la fermentación: **${a.co2Residual} vol** (ya está disuelto, solo cebás la diferencia).`,
        `Azúcar de cebado: **${a.gramosOnzas}**.`,
      ],
      result: `Agregá **${a.gramosAzucar} g** de dextrosa (${a.gramosOnzas}) a los 20 L. ${a.recomendacion}`,
    },
    {
      title: `Estilo belga a 3,8 vol con sacarosa: ${b.gramosAzucar} g (zona de riesgo)`,
      context: 'Una cerveza belga muy carbonatada (3,8 vol), fermentada a 18 °C, cebada con azúcar de mesa (sacarosa).',
      steps: [
        `Volumen **20 L**, objetivo alto **3,8 vol**, fermentación a **18 °C**.`,
        `CO2 residual: **${b.co2Residual} vol**.`,
        `Azúcar necesaria: **${b.gramosOnzas}** de sacarosa.`,
      ],
      result: `Necesitás **${b.gramosAzucar} g** de sacarosa. ${b.recomendacion}`,
    },
  ]);
}

// 21) Tejas por m² de techo
{
  const a = techosTejas({ m2: 100, tipoTeja: 'francesa', pendiente: 30, desperdicio: 10 });
  const b = techosTejas({ m2: 80, tipoTeja: 'colonial', pendiente: 35, desperdicio: 10 });
  patch('calculadora-tejas-techo-m2', [
    {
      title: `100 m² con teja francesa: ${nAr(a.tejas)} tejas`,
      context: 'Vas a techar 100 m² (medidos en planta) con teja francesa, pendiente del 30%.',
      steps: [
        `**100 m² en planta**, teja **francesa** (~${a.tejasPorM2}/m²), pendiente **30%**.`,
        `La pendiente sube la superficie real a **${a.m2Reales} m²**.`,
        `Con 10% de desperdicio: **${nAr(a.tejas)} tejas** + ${a.cumbreras} cumbrera(s) y ~${a.listonesMlineales} m de listones.`,
      ],
      result: `Comprá **${nAr(a.tejas)} tejas francesas** para 100 m². La pendiente y el 10% de recorte ya están incluidos.`,
    },
    {
      title: `80 m² con teja colonial: ${nAr(b.tejas)} tejas`,
      context: 'Un techo de 80 m² con teja colonial (criolla), que lleva muchas más piezas por m², pendiente 35%.',
      steps: [
        `**80 m² en planta**, teja **colonial** (~${b.tejasPorM2}/m², el doble que la francesa), pendiente **35%**.`,
        `Superficie real ajustada por pendiente: **${b.m2Reales} m²**.`,
        `Total con 10% de desperdicio: **${nAr(b.tejas)} tejas**.`,
      ],
      result: `La colonial necesita **${nAr(b.tejas)} tejas** para 80 m²: al ser más chica, lleva más del doble de piezas por m² que la francesa.`,
    },
  ]);
}

// 22) Valor de millas viajero frecuente
{
  const a = valorMillasViajeroFrecuente({ programa: 'latam-pass', millas: 60000, valorVueloUsd: 1000, cotizacionUsd: 1200 });
  const b = valorMillasViajeroFrecuente({ programa: 'smiles', millas: 50000, valorVueloUsd: 400, cotizacionUsd: 1200 });
  patch('calculadora-valor-millas-viajero-frecuente', [
    {
      title: `60.000 millas LATAM Pass por un vuelo de US$1.000: ${(a.valorPorMillaUsd * 100).toFixed(2)}¢/milla`,
      context: 'Tenés 60.000 millas LATAM Pass y un vuelo que querés canjear cuesta US$1.000 en efectivo.',
      steps: [
        `Valor por milla = US$1.000 ÷ 60.000 = **${(a.valorPorMillaUsd * 100).toFixed(2)}¢/milla** (${ars(a.valorPorMillaArs)}/milla a $1.200 por dólar).`,
        `Promedio de referencia de LATAM Pass: **${a.valorBaseMillaCent}¢**.`,
        `Resultado: **${a.esBuenCanje}**.`,
      ],
      result: `El canje vale **${(a.valorPorMillaUsd * 100).toFixed(2)}¢/milla** vs ${a.valorBaseMillaCent}¢ de referencia: ${a.esBuenCanje.toLowerCase()}.`,
    },
    {
      title: `50.000 millas Smiles por un vuelo de US$400: ${(b.valorPorMillaUsd * 100).toFixed(2)}¢/milla`,
      context: 'Pensás canjear 50.000 millas Smiles por un tramo corto que sale apenas US$400 en efectivo.',
      steps: [
        `Valor por milla = US$400 ÷ 50.000 = **${(b.valorPorMillaUsd * 100).toFixed(2)}¢/milla**.`,
        `Promedio Smiles: **${b.valorBaseMillaCent}¢**, bastante por encima de lo que rinde acá.`,
        `Resultado: **${b.esBuenCanje}**.`,
      ],
      result: `Rinde solo **${(b.valorPorMillaUsd * 100).toFixed(2)}¢/milla** (${b.esBuenCanje.toLowerCase()}): conviene pagar el vuelo barato en efectivo y guardar las millas.`,
    },
  ]);
}

console.log('Listo.');
