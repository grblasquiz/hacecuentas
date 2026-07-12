/**
 * hub-content — capa de PRESENTACIÓN de los hubs agrupadores (mockup aprobado
 * 2026-07-12). Separada de `pillars.ts` (taxonomía + autoridad interna) para no
 * tocar el archivo que importan Header/home/calculadoras: acá vive sólo el copy
 * de las cards del rediseño.
 *
 * El componente `CalculatorHub.astro` compone: taxonomía (pillars.ts) + este
 * copy + los JSON reales de las calcs (título/desc/fecha). Los `blurb`/`meta`
 * son copy curado corto; si falta un override, el componente cae al
 * `description` real de la calc y a "Actualizada <año>". Nunca inventa números:
 * el `receipt` de ejemplo sólo existe donde el mockup lo mostró (Sueldos).
 */

export interface HubNeed {
  icon: string;
  tone: 'i1' | 'i2' | 'i3' | 'i4' | 'i5' | 'i6';
  title: string;
  desc: string;
  href: string;
}
export interface HubQuick {
  tag: string;
  title: string;
  desc: string;
  placeholder: string; // valor de ejemplo en el input (sólo visual)
  cta: string;
  micro: string; // admite <b> (se inyecta con set:html — copy interno confiable)
}
export interface HubCardMeta {
  badge: string;
  title?: string; // título corto para la card (si falta, usa el h1 real de la calc)
  blurb?: string; // qué resuelve en una oración (si falta, usa description real)
  meta: string; // metadato real: fecha, normativa o duración
  cta: string;
}
export interface HubReceipt {
  label: string;
  big: string;
  rows: Array<[string, string]>;
}
export interface HubFact {
  icon: string;
  title: string;
  desc: string;
  href: string;
}
export interface HubContent {
  eyebrow: string;
  titleLines: string[]; // la última línea se pinta con el acento
  lead: string;
  trust: string[];
  quick: HubQuick;
  needs: HubNeed[];
  primary: HubCardMeta & { receipt?: HubReceipt };
  cards: Record<string, HubCardMeta>; // slug → copy de la card
  roomTags?: Record<string, string>; // slug de sala → etiqueta corta ("Aumento")
  guideBadge?: string;
  facts?: HubFact[]; // datos de referencia enriquecidos (si falta, usa dataPages)
}

export const HUB_CONTENT: Record<string, HubContent> = {
  'sueldos-y-trabajo': {
    eyebrow: '💼 Trabajo en Argentina',
    titleLines: ['Entendé tu sueldo.', 'Decidí mejor.'],
    lead: 'Calculá cuánto cobrás en mano, tu aguinaldo, vacaciones, indemnización y todo lo que impacta en tu trabajo.',
    trust: ['Fórmulas verificadas', 'Normativa 2026', 'Cálculo privado'],
    quick: {
      tag: '⚡ Acceso rápido',
      title: '¿Cuánto te queda en mano?',
      desc: 'Ingresá tu sueldo bruto mensual y abrí el cálculo completo.',
      placeholder: '1.500.000',
      cta: 'Calcular →',
      micro: 'Estimación con <b>17% de aportes</b> + Impuesto a las Ganancias si corresponde.',
    },
    needs: [
      { icon: '💵', tone: 'i1', title: 'Quiero saber cuánto cobro', desc: 'Bruto, neto y descuentos', href: '/sueldo-en-mano-argentina' },
      { icon: '🎁', tone: 'i2', title: 'Quiero calcular mi aguinaldo', desc: 'SAC completo o proporcional', href: '/calculadora-aguinaldo-sac' },
      { icon: '🏖️', tone: 'i3', title: 'Me voy de vacaciones', desc: 'Días y plus vacacional', href: '/calculadora-vacaciones-argentina' },
      { icon: '📄', tone: 'i4', title: 'Terminé una relación laboral', desc: 'Renuncia o despido', href: '/calculadora-liquidacion-final-renuncia' },
      { icon: '📈', tone: 'i5', title: 'Quiero pedir un aumento', desc: 'Inflación y paritarias', href: '/calculadora-ajuste-sueldo-inflacion' },
      { icon: '🕐', tone: 'i6', title: 'Quiero calcular horas y antigüedad', desc: 'Extras, jornada y años', href: '/calculadora-horas-extras-50-100' },
    ],
    primary: {
      badge: 'La más usada',
      title: 'Calculadora de sueldo neto en mano',
      blurb: 'Del sueldo bruto a lo que realmente recibís, con aportes, Ganancias y deducciones vigentes.',
      meta: 'Actualizada julio 2026',
      cta: 'Calcular mi sueldo →',
      receipt: {
        label: 'Tu sueldo estimado',
        big: '$ 1.245.000',
        rows: [
          ['Sueldo bruto', '$1.500.000'],
          ['Aportes', '− $255.000'],
          ['Ganancias', '$0'],
        ],
      },
    },
    cards: {
      'calculadora-aguinaldo-sac': { badge: 'Popular', title: 'Calculadora de Aguinaldo (SAC)', blurb: 'Calculá el medio aguinaldo completo o proporcional y sus descuentos.', meta: '⏱ 1 min', cta: 'Calcular →' },
      'calculadora-indemnizacion-despido': { badge: 'Derechos laborales', title: 'Indemnización por despido', blurb: 'Estimá antigüedad, preaviso, integración y liquidación final.', meta: '⚖️ LCT Argentina', cta: 'Calcular →' },
      'calculadora-impuesto-ganancias-sueldo': { badge: 'Ganancias', title: 'Impuesto a las Ganancias sobre sueldo', blurb: 'Conocé si te corresponde pagar y cuánto impacta en tu ingreso.', meta: 'Actualizada 2026', cta: 'Calcular →' },
      'calculadora-horas-extras-50-100': { badge: 'Tiempo trabajado', title: 'Horas extras al 50% y 100%', blurb: 'Calculá el valor de tus horas extra según día y franja horaria.', meta: '⏱ 2 min', cta: 'Calcular →' },
      'calculadora-vacaciones-argentina': { badge: 'Vacaciones', title: 'Vacaciones y plus vacacional', blurb: 'Días que te corresponden, monto y proporción según antigüedad.', meta: '📅 Por antigüedad', cta: 'Calcular →' },
      'calculadora-antiguedad-laboral': { badge: 'Trayectoria laboral', title: 'Antigüedad laboral', blurb: 'Calculá años, meses y días trabajados entre dos fechas.', meta: '📅 Fechas exactas', cta: 'Calcular →' },
      'salario-minimo-vital-movil-argentina': { badge: 'Referencia salarial', title: 'Salario Mínimo Vital y Móvil', blurb: 'Consultá el valor vigente y comparalo con tu ingreso mensual.', meta: 'Actualizado 2026', cta: 'Consultar →' },
      'calculadora-ajuste-sueldo-inflacion': { badge: 'Poder adquisitivo', title: '¿Tu sueldo le ganó a la inflación?', blurb: 'Compará la evolución de tu salario contra la inflación acumulada.', meta: '📊 Comparación real', cta: 'Comparar →' },
      'calculadora-liquidacion-final-renuncia': { badge: 'Renuncia', title: 'Liquidación final por renuncia', blurb: 'Estimá días trabajados, vacaciones pendientes, SAC y conceptos finales.', meta: '⚖️ LCT Argentina', cta: 'Calcular →' },
      'calculadora-jubilacion-anses-monto-minimo-maxima-2026': { badge: 'Jubilación', title: 'Jubilación ANSES: mínima y máxima', blurb: 'Consultá montos vigentes y referencias previsionales de 2026.', meta: '👴 ANSES 2026', cta: 'Consultar →' },
    },
    roomTags: {
      'cuanto-aumento-pedir': 'Aumento',
      'aceptar-oferta-laboral': 'Oferta',
      'me-despidieron': 'Despido',
      'cuanto-cambia-mi-sueldo-con-la-paritaria': 'Paritaria',
      'trabajo-remoto-hibrido-o-presencial': 'Modalidad',
      'cuanto-vale-mi-hora': 'Tu hora',
    },
    guideBadge: 'Guía esencial 2026',
    facts: [
      { icon: '📊', title: 'Datos del aguinaldo 2026', desc: 'Fechas, cálculo y preguntas frecuentes.', href: '/datos-aguinaldo-2026' },
      { icon: '📌', title: 'Topes SIPA 2026', desc: 'Bases mínima y máxima actualizadas.', href: '/datos-topes-sipa-2026' },
      { icon: '⚖️', title: 'Salario mínimo vital y móvil', desc: 'Valor vigente e histórico mensual.', href: '/salario-minimo-vital-movil-argentina' },
    ],
  },

  'impuestos-argentina': {
    eyebrow: '🧾 Impuestos en Argentina',
    titleLines: ['Pagá lo justo.', 'Ni un peso de más.'],
    lead: 'Calculá tu monotributo, Ganancias, IVA y Bienes Personales con las escalas y categorías ARCA vigentes de 2026.',
    trust: ['Escalas ARCA 2026', 'Categorías al día', 'Cálculo privado'],
    quick: {
      tag: '⚡ Acceso rápido',
      title: '¿Qué categoría de monotributo te toca?',
      desc: 'Ingresá tu facturación anual y verificá tu categoría y cuota 2026.',
      placeholder: '8.000.000',
      cta: 'Ver categoría →',
      micro: 'Según los <b>topes de facturación ARCA vigentes 2026</b>.',
    },
    needs: [
      { icon: '🧾', tone: 'i1', title: 'Quiero saber mi categoría de monotributo', desc: 'Topes y cuota 2026', href: '/calculadora-monotributo-2026' },
      { icon: '📊', tone: 'i2', title: 'Pago Ganancias sobre mi sueldo', desc: '4ta categoría y deducciones', href: '/calculadora-impuesto-ganancias-sueldo' },
      { icon: '🧮', tone: 'i3', title: 'Necesito agregar o discriminar IVA', desc: '21%, 10,5% y percepciones', href: '/calculadora-iva-agregar-discriminar' },
      { icon: '💎', tone: 'i4', title: 'Tengo que pagar Bienes Personales', desc: 'Mínimo no imponible y alícuotas', href: '/calculadora-bienes-personales-2026' },
      { icon: '🔄', tone: 'i5', title: '¿Monotributo o Responsable Inscripto?', desc: 'Compará los dos regímenes', href: '/calculadora-monotributo-vs-responsable-inscripto' },
      { icon: '🏛️', tone: 'i6', title: 'Pago Ingresos Brutos en mi provincia', desc: 'Alícuotas por jurisdicción', href: '/calculadora-ingresos-brutos-provincial' },
    ],
    primary: {
      badge: 'La más usada',
      title: 'Calculadora de Monotributo 2026',
      blurb: 'Categoría, cuota mensual y componentes (impositivo, jubilación y obra social) según tu facturación.',
      meta: 'Actualizada 2026',
      cta: 'Calcular mi cuota →',
    },
    cards: {
      'calculadora-impuesto-ganancias-sueldo': { badge: 'Ganancias', title: 'Impuesto a las Ganancias sobre sueldo', blurb: 'Conocé si te corresponde pagar y cuánto se descuenta de tu recibo.', meta: 'Actualizada 2026', cta: 'Calcular →' },
      'calculadora-monotributo-vs-responsable-inscripto': { badge: 'Comparador', title: 'Monotributo vs. Responsable Inscripto', blurb: 'Compará impuestos totales y carga administrativa para elegir régimen.', meta: '⚖️ Comparación', cta: 'Comparar →' },
      'calculadora-monotributo-categoria-2026-recategorizacion-julio': { badge: 'Recategorización', title: 'Recategorización de julio 2026', blurb: 'Verificá si tenés que cambiar de categoría en el semestre.', meta: '🗓️ Julio 2026', cta: 'Verificar →' },
      'calculadora-iva-agregar-discriminar': { badge: 'IVA', title: 'IVA: agregar o discriminar', blurb: 'Sumá o separá el IVA de cualquier importe con la alícuota que elijas.', meta: '⏱ 1 min', cta: 'Calcular →' },
      'calculadora-bienes-personales-2026': { badge: 'Patrimonio', title: 'Bienes Personales 2026', blurb: 'Estimá el impuesto según tus bienes y el mínimo no imponible vigente.', meta: 'Actualizada 2026', cta: 'Calcular →' },
      'calculadora-ingresos-brutos-provincial': { badge: 'Provincial', title: 'Ingresos Brutos por provincia', blurb: 'Calculá IIBB con la alícuota de tu actividad y jurisdicción.', meta: '🏛️ Por provincia', cta: 'Calcular →' },
      'calculadora-impuesto-cheque-debitos-creditos': { badge: 'Bancario', title: 'Impuesto al cheque (débitos y créditos)', blurb: 'Cuánto te retienen por los movimientos de tu cuenta bancaria.', meta: '🏦 0,6%', cta: 'Calcular →' },
      'calculadora-impuesto-sellos-inmueble-contrato': { badge: 'Contratos', title: 'Impuesto de sellos', blurb: 'Estimá el sellado de un contrato o compraventa según tu provincia.', meta: '📄 Por provincia', cta: 'Calcular →' },
      'calculadora-autonomos-categoria-monto-2026': { badge: 'Autónomos', title: 'Autónomos: categoría y aporte 2026', blurb: 'Conocé tu categoría de autónomo y el monto mensual a pagar.', meta: 'Actualizada 2026', cta: 'Consultar →' },
    },
    roomTags: {
      'monotributo-o-responsable-inscripto': 'Régimen',
      'que-categoria-de-monotributo-me-corresponde': 'Categoría',
      'relacion-dependencia-o-facturar': 'Empleo',
      'cuanto-facturar-para-ganar-x-neto': 'Facturación',
    },
    guideBadge: 'Guía esencial 2026',
  },

  'finanzas-personales': {
    eyebrow: '💰 Finanzas personales',
    titleLines: ['Que tu plata', 'rinda mejor.'],
    lead: 'Simulá préstamos, plazos fijos, interés compuesto y deuda de tarjeta con números reales para decidir en 2026.',
    trust: ['Tasas y CFT reales', 'Actualizado 2026', 'Cálculo privado'],
    quick: {
      tag: '⚡ Acceso rápido',
      title: '¿Cuánto sería la cuota?',
      desc: 'Ingresá el monto del préstamo y estimá tu cuota mensual.',
      placeholder: '2.000.000',
      cta: 'Calcular cuota →',
      micro: 'Sistema francés con <b>CFT</b> — el costo real del crédito.',
    },
    needs: [
      { icon: '🏦', tone: 'i1', title: 'Quiero simular un préstamo', desc: 'Cuota, CFT y total', href: '/calculadora-cuota-prestamo' },
      { icon: '🐷', tone: 'i2', title: 'Cuánto rinde mi plazo fijo', desc: 'TNA, TEA y tasa real', href: '/calculadora-plazo-fijo' },
      { icon: '📈', tone: 'i3', title: 'Quiero ver el interés compuesto', desc: 'Cuánto crece tu ahorro', href: '/calculadora-interes-compuesto' },
      { icon: '💳', tone: 'i4', title: 'Tengo deuda de tarjeta', desc: 'Pago mínimo e intereses', href: '/calculadora-tarjeta-credito-pago-minimo-intereses' },
      { icon: '🏠', tone: 'i5', title: '¿Crédito UVA o tasa fija?', desc: 'Compará escenarios', href: '/calculadora-credito-uva-vs-tasa-fija' },
      { icon: '🛟', tone: 'i6', title: 'Quiero armar mi fondo de emergencia', desc: 'Cuántos meses cubrís', href: '/calculadora-fondo-emergencia-meses' },
    ],
    primary: {
      badge: 'La más usada',
      title: 'Calculadora de cuota de préstamo',
      blurb: 'Cuota mensual, CFT y costo total del crédito por el sistema francés.',
      meta: '⏱ 1 min',
      cta: 'Calcular mi cuota →',
    },
    cards: {
      'calculadora-plazo-fijo': { badge: 'Ahorro', title: 'Plazo fijo: cuánto ganás', blurb: 'Interés y monto final según TNA, plazo y capital.', meta: '🏦 TNA / TEA', cta: 'Calcular →' },
      'calculadora-interes-compuesto': { badge: 'Inversión', title: 'Interés compuesto', blurb: 'Proyectá cuánto crece tu dinero con aportes y capitalización.', meta: '📈 Largo plazo', cta: 'Calcular →' },
      'calculadora-costo-financiero-total-cft': { badge: 'Créditos', title: 'Costo Financiero Total (CFT)', blurb: 'El precio real de un préstamo: tasa, IVA, comisiones y seguros.', meta: '⚖️ Comparar', cta: 'Calcular →' },
      'calculadora-credito-uva-vs-tasa-fija': { badge: 'Hipotecas', title: 'Crédito UVA vs. tasa fija', blurb: 'Compará ambos esquemas y cómo evoluciona la cuota con la inflación.', meta: '🏠 Vivienda', cta: 'Comparar →' },
      'calculadora-tarjeta-credito-pago-minimo-intereses': { badge: 'Deudas', title: 'Tarjeta: pago mínimo e intereses', blurb: 'Cuánto pagás de más si abonás sólo el mínimo del resumen.', meta: '💳 Financiación', cta: 'Calcular →' },
      'calculadora-fondo-emergencia-meses': { badge: 'Planificación', title: 'Fondo de emergencia', blurb: 'Cuántos meses de gastos cubrís y cuánto falta para tu colchón.', meta: '🛟 Meta', cta: 'Calcular →' },
      'calculadora-presupuesto-50-30-20': { badge: 'Presupuesto', title: 'Regla 50/30/20', blurb: 'Repartí tu sueldo entre necesidades, gustos y ahorro.', meta: '📊 Método', cta: 'Calcular →' },
      'calculadora-inflacion-acumulada-periodo': { badge: 'Inflación', title: 'Inflación acumulada por período', blurb: 'Cuánto subieron los precios entre dos fechas según el IPC.', meta: '📉 INDEC', cta: 'Calcular →' },
      'calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses': { badge: 'Comparador', title: 'Ahorro: UVA vs pesos vs dólar', blurb: 'Dónde habría rendido más tu dinero en los últimos 12 meses.', meta: '📅 12 meses', cta: 'Comparar →' },
    },
    roomTags: {
      'puedo-pagar-este-prestamo': 'Préstamo',
      'cancelar-deuda-o-invertir': 'Deuda',
      'como-salir-de-deudas': 'Deudas',
      'cuotas-o-contado': 'Pagos',
      'me-conviene-adelantar-cuotas': 'Cuotas',
      'que-hago-con-mis-ahorros': 'Ahorros',
      'cuanto-fondo-de-emergencia-necesito': 'Fondo',
      'puedo-afrontar-un-credito-uva': 'Crédito UVA',
    },
    guideBadge: 'Guía esencial 2026',
  },

  'negocios-e-independientes': {
    eyebrow: '📊 Negocios e independientes',
    titleLines: ['Que tu negocio', 'cierre los números.'],
    lead: 'Calculá márgenes, punto de equilibrio, tarifa por hora y costo laboral para cobrar lo justo y ganar de verdad.',
    trust: ['Fórmulas verificadas', 'Monotributo 2026', 'Cálculo privado'],
    quick: {
      tag: '⚡ Acceso rápido',
      title: '¿Cuál es tu margen real?',
      desc: 'Ingresá tu costo y precio de venta para ver el margen.',
      placeholder: '10.000',
      cta: 'Calcular margen →',
      micro: 'Margen y markup sobre el <b>precio de venta</b>.',
    },
    needs: [
      { icon: '🏷️', tone: 'i1', title: 'Quiero calcular mi margen', desc: 'Markup y ganancia', href: '/calculadora-margen-ganancia-markup' },
      { icon: '⚖️', tone: 'i2', title: 'Quiero mi punto de equilibrio', desc: 'Cuánto vender para no perder', href: '/calculadora-punto-equilibrio-break-even' },
      { icon: '⏱️', tone: 'i3', title: '¿Cuánto cobrar por hora?', desc: 'Tarifa freelance', href: '/calculadora-cuanto-cobro-por-hora-freelance' },
      { icon: '👥', tone: 'i4', title: '¿Cuánto me cuesta un empleado?', desc: 'Costo laboral total', href: '/calculadora-costo-laboral-empleado' },
      { icon: '🧾', tone: 'i5', title: 'Soy freelance y facturo', desc: 'Monotributo e impuestos', href: '/calculadora-impuestos-monotributo-freelance' },
      { icon: '📈', tone: 'i6', title: '¿Rinde mi publicidad?', desc: 'ROAS y CAC/LTV', href: '/calculadora-roas-retorno-inversion-publicitaria' },
    ],
    primary: {
      badge: 'La más usada',
      title: 'Calculadora de margen y markup',
      blurb: 'Margen de ganancia, markup y precio de venta a partir de tu costo.',
      meta: '⏱ 1 min',
      cta: 'Calcular margen →',
    },
    cards: {
      'calculadora-punto-equilibrio-break-even': { badge: 'Rentabilidad', title: 'Punto de equilibrio (break-even)', blurb: 'Cuántas unidades o pesos necesitás vender para cubrir costos.', meta: '📊 Break-even', cta: 'Calcular →' },
      'calculadora-iva-agregar-discriminar': { badge: 'Precios', title: 'Precio con IVA', blurb: 'Agregá o discriminá el IVA para armar tus precios de lista.', meta: '🧮 21% / 10,5%', cta: 'Calcular →' },
      'calculadora-costo-laboral-empleado': { badge: 'Equipo', title: 'Costo laboral de un empleado', blurb: 'Cuánto te cuesta realmente contratar, con cargas y aguinaldo.', meta: '👥 Cargas 2026', cta: 'Calcular →' },
      'calculadora-cuanto-cobro-por-hora-freelance': { badge: 'Freelance', title: '¿Cuánto cobrar por hora?', blurb: 'Tu tarifa por hora según ingresos deseados y horas facturables.', meta: '⏱ Tarifa', cta: 'Calcular →' },
      'calculadora-impuestos-monotributo-freelance': { badge: 'Impuestos', title: 'Monotributo freelance', blurb: 'Cuánto pagás de impuestos según lo que facturás por mes.', meta: '🧾 2026', cta: 'Calcular →' },
      'calculadora-hora-freelance-por-pais-mercado': { badge: 'Mercados', title: 'Tarifa freelance por país', blurb: 'Compará cuánto se cobra la hora en distintos mercados.', meta: '🌎 Global', cta: 'Comparar →' },
      'calculadora-roas-retorno-inversion-publicitaria': { badge: 'Marketing', title: 'ROAS: retorno de la publicidad', blurb: 'Cuántos pesos generás por cada peso invertido en ads.', meta: '📈 Ads', cta: 'Calcular →' },
      'calculadora-cac-ltv-costo-adquisicion-cliente': { badge: 'Métricas', title: 'CAC y relación LTV/CAC', blurb: 'Cuánto te cuesta conseguir un cliente y cuánto vale en el tiempo.', meta: '📊 Unit economics', cta: 'Calcular →' },
      'calculadora-tasa-de-conversion': { badge: 'Conversión', title: 'Tasa de conversión', blurb: 'Qué porcentaje de tus visitas o leads termina comprando.', meta: '💬 %', cta: 'Calcular →' },
    },
    roomTags: {
      'mi-negocio-es-rentable': 'Rentabilidad',
      'cuanto-cobrar-por-hora-freelance': 'Tarifa',
      'cuanto-cobrar-por-mi-producto-o-servicio': 'Precios',
      'puedo-contratar-a-una-persona': 'Contratar',
      'me-conviene-aceptar-este-cliente': 'Cliente',
      'cuanto-invertir-en-publicidad': 'Ads',
    },
    guideBadge: 'Guía esencial 2026',
  },
};
