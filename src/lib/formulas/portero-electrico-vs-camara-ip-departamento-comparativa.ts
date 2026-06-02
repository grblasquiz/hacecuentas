export interface Inputs {
  opcionPortero: number;
  instalacionPortero: number;
  mantenimientoAnualPortero: number;
  opcionCamara: number;
  instalacionCamara: number;
  suscripcionMensual: number;
  mantenimientoAnualCamara: number;
  inflacionAnual: number;
}

export interface Outputs {
  tcoPortero: number;
  tcoCamara: number;
  diferencia: number;
  opcionMasEconomica: string;
  featuresPortero: string;
  featuresCamara: string;
  desgloseCostos: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const ANOS = 5;

  // Sanitizar inputs
  const equipoPortero = Math.max(0, Number(i.opcionPortero) || 0);
  const instPortero = Math.max(0, Number(i.instalacionPortero) || 0);
  const mantPortero = Math.max(0, Number(i.mantenimientoAnualPortero) || 0);
  const equipoCamara = Math.max(0, Number(i.opcionCamara) || 0);
  const instCamara = Math.max(0, Number(i.instalacionCamara) || 0);
  const suscMensual = Math.max(0, Number(i.suscripcionMensual) || 0);
  const mantCamara = Math.max(0, Number(i.mantenimientoAnualCamara) || 0);
  const inflacion = Math.max(0, Number(i.inflacionAnual) || 0) / 100;

  if (equipoPortero === 0 && equipoCamara === 0) {
    return {
      tcoPortero: 0,
      tcoCamara: 0,
      diferencia: 0,
      opcionMasEconomica: "Ingresá al menos el costo de un equipo para comparar.",
      featuresPortero: "",
      featuresCamara: "",
      desgloseCostos: "",
    };
  }

  // Costos iniciales (se pagan al inicio, sin ajuste inflacionario)
  const inicialPortero = equipoPortero + instPortero;
  const inicialCamara = equipoCamara + instCamara;

  // Costo operativo anual base
  const opexAnualPortero = mantPortero;
  const opexAnualCamaraBase = mantCamara + suscMensual * 12;

  // Acumular costos operativos ajustados por inflación para cada año
  let opexTotalPortero = 0;
  let opexTotalCamara = 0;
  const detalleAnios: string[] = [];

  for (let ano = 1; ano <= ANOS; ano++) {
    // El costo operativo del año n crece con la inflación acumulada
    // factor = (1 + inflacion)^ano
    const factor = Math.pow(1 + inflacion, ano);
    const opexPorteroAno = opexAnualPortero * factor;
    const opexCamaraAno = opexAnualCamaraBase * factor;
    opexTotalPortero += opexPorteroAno;
    opexTotalCamara += opexCamaraAno;
    detalleAnios.push(
      `Año ${ano} (×${factor.toFixed(2)}): Portero $${Math.round(opexPorteroAno).toLocaleString("es-AR")} | Cámara $${Math.round(opexCamaraAno).toLocaleString("es-AR")}`
    );
  }

  const tcoPortero = inicialPortero + opexTotalPortero;
  const tcoCamara = inicialCamara + opexTotalCamara;
  const diferencia = Math.abs(tcoPortero - tcoCamara);

  const opcionMasEconomica =
    tcoPortero < tcoCamara
      ? `Portero eléctrico: ahorrás $${Math.round(diferencia).toLocaleString("es-AR")} ARS en 5 años`
      : tcoPortero > tcoCamara
      ? `Cámara IP: ahorrás $${Math.round(diferencia).toLocaleString("es-AR")} ARS en 5 años`
      : "Ambas opciones tienen el mismo costo a 5 años";

  // Features descripción fija (no depende de inputs de usuario)
  const featuresPortero = [
    "✅ Audio bidireccional",
    "⚠️ Video solo si es videoportero (monitor interior)",
    "❌ Sin acceso remoto por app",
    "❌ Sin grabación de visitas",
    "✅ Funciona sin internet",
    "✅ Vida útil estimada: 10-15 años",
    "⚠️ Requiere obra civil para cableado",
  ].join(" | ");

  const featuresCamara = [
    "✅ Audio bidireccional",
    "✅ Video en tiempo real (app móvil)",
    "✅ Acceso remoto desde cualquier lugar",
    suscMensual > 0
      ? "✅ Grabación en la nube (con suscripción)"
      : "❌ Grabación requiere suscripción (no configurada)",
    "✅ Notificaciones push",
    "⚠️ Requiere Wi-Fi estable en la puerta",
    "⚠️ Vida útil estimada: 4-6 años",
  ].join(" | ");

  const desgloseCostos = [
    `--- PORTERO ELÉCTRICO ---`,
    `Equipo: $${Math.round(equipoPortero).toLocaleString("es-AR")}`,
    `Instalación: $${Math.round(instPortero).toLocaleString("es-AR")}`,
    `Costo inicial total: $${Math.round(inicialPortero).toLocaleString("es-AR")}`,
    `Opex acumulado 5 años (c/inflación): $${Math.round(opexTotalPortero).toLocaleString("es-AR")}`,
    `TCO 5 años: $${Math.round(tcoPortero).toLocaleString("es-AR")}`,
    ``,
    `--- CÁMARA IP ---`,
    `Equipo: $${Math.round(equipoCamara).toLocaleString("es-AR")}`,
    `Instalación: $${Math.round(instCamara).toLocaleString("es-AR")}`,
    `Costo inicial total: $${Math.round(inicialCamara).toLocaleString("es-AR")}`,
    `Suscripción mensual base: $${Math.round(suscMensual).toLocaleString("es-AR")}`,
    `Opex acumulado 5 años (c/inflación): $${Math.round(opexTotalCamara).toLocaleString("es-AR")}`,
    `TCO 5 años: $${Math.round(tcoCamara).toLocaleString("es-AR")}`,
    ``,
    `--- DETALLE POR AÑO (inflación ${(inflacion * 100).toFixed(0)}%/año) ---`,
    ...detalleAnios,
  ].join("\n");

  const porteroGana = tcoPortero < tcoCamara;
  const empate = Math.round(tcoPortero) === Math.round(tcoCamara);
  const ganadorNombre = porteroGana ? 'Portero eléctrico' : 'Cámara IP';
  const ganadorInicial = porteroGana ? inicialPortero : inicialCamara;
  const ganadorOpex = porteroGana ? opexTotalPortero : opexTotalCamara;
  const ganadorTco = porteroGana ? tcoPortero : tcoCamara;
  const fmtArs = (n: number) => Math.round(n).toLocaleString('es-AR');
  const difPct = ganadorTco > 0 ? (diferencia / ganadorTco) * 100 : 0;

  const _insight = {
    title: 'Comparativa a 5 años',
    text: empate
      ? `A 5 años ambas opciones cuestan prácticamente lo mismo (**$${fmtArs(tcoPortero)}**). Decidí por las prestaciones: la cámara IP suma acceso remoto y grabación, el portero gana en vida útil y no depende de internet.`
      : `A 5 años el **${ganadorNombre.toLowerCase()}** sale **$${fmtArs(diferencia)}** más barato (${difPct.toFixed(0)}% menos). ${porteroGana ? 'Ojo: el portero no tiene acceso remoto ni grabación, y exige obra civil.' : 'La suscripción mensual de la cámara es lo que más pesa en el largo plazo: revisá si la necesitás.'}`,
    tone: empate ? 'neutral' : (porteroGana ? 'good' : 'warn'),
    icon: '🚪',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Equipo + instalación', value: Math.round(ganadorInicial) },
      { label: 'Operación 5 años (c/inflación)', value: Math.round(ganadorOpex) },
    ],
    prefix: '$',
    centerValue: '$' + fmtArs(ganadorTco),
    centerLabel: `TCO ${ganadorNombre}`,
    ariaLabel: `Costo total a 5 años de la opción más económica (${ganadorNombre}): $${fmtArs(ganadorInicial)} de equipo e instalación más $${fmtArs(ganadorOpex)} de operación.`,
  };

  return {
    tcoPortero: Math.round(tcoPortero),
    tcoCamara: Math.round(tcoCamara),
    diferencia: Math.round(diferencia),
    opcionMasEconomica,
    featuresPortero,
    featuresCamara,
    desgloseCostos,
    _insight,
    _chart,
  };
}
