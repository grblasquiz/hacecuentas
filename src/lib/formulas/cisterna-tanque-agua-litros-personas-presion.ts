export interface Inputs {
  personas: number;
  diasReserva: number;
  tipoUso: string;
  presionMinBar: string;
}

export interface Outputs {
  litrosTanque: number;
  litrosConMargen: number;
  alturaColumnaM: number;
  consumoDiario: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const personas = Math.max(1, Math.round(Number(i.personas) || 1));
  const diasReserva = Math.max(1, Math.round(Number(i.diasReserva) || 1));
  const tipoUso = i.tipoUso || "residencial";
  const presionMinBar = Number(i.presionMinBar) || 0.5;

  // Dotación en litros por persona por día según tipo de uso
  // Fuente: Reglamento de Instalaciones Sanitarias GCBA / normas provinciales
  const DOTACION: Record<string, number> = {
    residencial: 250, // L/persona/día — estándar residencial Argentina
    oficina: 100,     // L/persona/día — uso laboral / comercial
    riego: 350,       // L/persona/día — residencial + 100 L/día jardín estimado
  };

  const dotacion = DOTACION[tipoUso] ?? 250;

  // Consumo diario total
  const consumoDiario = personas * dotacion;

  // Volumen mínimo = consumo diario × días de reserva
  const litrosTanque = consumoDiario * diasReserva;

  // Volumen recomendado con margen de seguridad del 20%
  // (cubre variaciones de consumo, pérdidas por flotante, picos esporádicos)
  const MARGEN = 1.20;
  const litrosConMargen = Math.ceil(litrosTanque * MARGEN);

  // Altura mínima de columna de agua para la presión requerida
  // 1 bar = 10,197 metros columna de agua (mca)
  // Derivado de: P = ρ × g × h  →  h = P / (ρ × g)
  // Con ρ = 1000 kg/m³, g = 9,81 m/s²  →  1 bar (100.000 Pa) / (1000 × 9,81) ≈ 10,197 m
  const BAR_A_METROS = 10.197;
  const alturaColumnaM = presionMinBar * BAR_A_METROS;

  // Descripción del tipo de uso para el resumen
  const labelUso: Record<string, string> = {
    residencial: "residencial",
    oficina: "oficina/comercio",
    riego: "vivienda con riego",
  };

  const labelPresion: Record<string, string> = {
    "0.5": "0,5 bar (calefón estándar)",
    "1.0": "1,0 bar (ducha presurizada)",
    "1.5": "1,5 bar (ducha de lluvia)",
  };

  const presionKey = String(presionMinBar);

  const detalle =
    `Uso ${labelUso[tipoUso] ?? tipoUso} · Dotación ${dotacion} L/persona/día · ` +
    `${personas} persona${personas !== 1 ? "s" : ""} × ${diasReserva} día${diasReserva !== 1 ? "s" : ""} = ${consumoDiario} L/día. ` +
    `Presión requerida: ${labelPresion[presionKey] ?? presionKey + " bar"} → ` +
    `el fondo del tanque debe estar al menos ${alturaColumnaM.toFixed(1)} m sobre el punto de uso más desfavorable.`;

  // Margen de seguridad en litros (litrosConMargen = litrosTanque + margen)
  const margenLitros = litrosConMargen - litrosTanque;

  const _insight = {
    title: 'Tanque recomendado',
    text: `Para **${personas} persona${personas !== 1 ? "s" : ""}** con **${diasReserva} día${diasReserva !== 1 ? "s" : ""}** de reserva necesitás un tanque de **${litrosConMargen.toLocaleString('es-AR')} L** (${litrosTanque.toLocaleString('es-AR')} L de consumo + 20% de margen). El fondo del tanque debe quedar al menos **${alturaColumnaM.toFixed(1)} m** sobre la canilla más alta para lograr la presión pedida.`,
    tone: 'neutral',
    icon: '🚰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Consumo base', value: litrosTanque },
      { label: 'Margen 20%', value: margenLitros },
    ],
    prefix: '',
    centerValue: `${litrosConMargen.toLocaleString('es-AR')} L`,
    centerLabel: 'Tanque',
    ariaLabel: `Volumen recomendado de ${litrosConMargen} litros: ${litrosTanque} de consumo base más ${margenLitros} de margen de seguridad.`,
  };

  return {
    litrosTanque,
    litrosConMargen,
    alturaColumnaM: Math.round(alturaColumnaM * 100) / 100,
    consumoDiario,
    detalle,
    _insight,
    _chart,
  };
}
