export interface Inputs {
  nivel_educativo: 'basica' | 'media' | 'superior';
  region: 'rm' | 'v' | 'viii' | 'ix' | 'x' | 'xi' | 'xii' | 'i' | 'ii' | 'iii' | 'iv' | 'vi' | 'vii' | 'xiv' | 'xv' | 'xvi';
  tne_estado: 'activa' | 'bloqueada';
  dias_transporte: number;
}

export interface Outputs {
  tarifa_adulto_diaria: number;
  tarifa_tne_diaria: number;
  ahorro_diario: number;
  costo_mensual_adulto: number;
  costo_mensual_tne: number;
  ahorro_mensual: number;
  ahorro_anual: number;
  recargo_mensual: number;
  estado_tne_mensaje: string;
}

// Tarifas adulto diarias por región 2026 (CLP)
// Fuente: SII, Transporte Público Chile
const TARIFAS_ADULTO_DIARIA: Record<string, number> = {
  rm: 2850,    // Metropolitana
  v: 2100,     // Valparaíso
  viii: 1950,  // Bío Bío
  ix: 1800,    // La Araucanía
  x: 2050,     // Los Lagos
  xi: 2400,    // Aysén
  xii: 2550,   // Magallanes
  i: 2100,     // Tarapacá
  ii: 2200,    // Antofagasta
  iii: 1900,   // Atacama
  iv: 1850,    // Coquimbo
  vi: 1950,    // Libertador O'Higgins
  vii: 1900,   // Maule
  xiv: 2000,   // Los Ríos
  xv: 2150,    // Arica y Parinacota
  xvi: 1950    // Ñuble
};

// Descuento TNE: 1/3 (multiplica por 2/3)
const DESCUENTO_TNE_FACTOR = 2 / 3;

// Recargo estimado si TNE bloqueada: multa promedio transportista
const RECARGO_BLOQUEADA_MULTA = 7500; // CLP

export function compute(i: Inputs): Outputs {
  // Validación inputs
  const dias = Math.max(1, Math.min(31, i.dias_transporte || 22));
  const tarifa_adulto = TARIFAS_ADULTO_DIARIA[i.region] || 2850;

  // Cálculo tarifas
  const tarifa_tne = Math.round(tarifa_adulto * DESCUENTO_TNE_FACTOR);
  const ahorro_diario = tarifa_adulto - tarifa_tne;
  const costo_mensual_adulto = Math.round(tarifa_adulto * dias);
  const costo_mensual_tne = Math.round(tarifa_tne * dias);
  const ahorro_mensual = Math.round(costo_mensual_adulto - costo_mensual_tne);
  const ahorro_anual = Math.round(ahorro_mensual * 12);

  // Recargo si TNE bloqueada
  let recargo_mensual = 0;
  let estado_tne_mensaje = '';

  if (i.tne_estado === 'bloqueada') {
    // Si está bloqueada: paga tarifa adulto + multa
    recargo_mensual = Math.round(costo_mensual_adulto + RECARGO_BLOQUEADA_MULTA - costo_mensual_tne);
    estado_tne_mensaje = `⚠️ TNE BLOQUEADA. Pagarás $${costo_mensual_adulto.toLocaleString('es-CL')} (tarifa adulto) + multa $${RECARGO_BLOQUEADA_MULTA.toLocaleString('es-CL')} por viaje inválido. Actualiza acreditación en Junaeb: www.junaeb.cl`;
  } else {
    // TNE activa
    recargo_mensual = 0;
    estado_tne_mensaje = `✅ TNE ACTIVA. Disfrutas descuento 1/3. Ahorro estimado: $${ahorro_anual.toLocaleString('es-CL')}/año. Vigencia hasta 31-12-2026.`;
  }

  return {
    tarifa_adulto_diaria: tarifa_adulto,
    tarifa_tne_diaria: tarifa_tne,
    ahorro_diario,
    costo_mensual_adulto,
    costo_mensual_tne,
    ahorro_mensual,
    ahorro_anual,
    recargo_mensual,
    estado_tne_mensaje
  };
}
