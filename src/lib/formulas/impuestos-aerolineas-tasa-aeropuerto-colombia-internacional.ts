// TRM oficial live desde datos.gov.co (cron diario fetch-colombia.mjs), con fallback verificado.
import coLive from "../../data/live/colombia.json";

export interface Inputs {
  tipo_vuelo: 'domestico' | 'internacional_usa' | 'internacional_latinoamerica' | 'internacional_europa';
  tarifa_base_cop: number;
  aeropuerto_salida: 'bog' | 'mde' | 'cali' | 'bta' | 'otro';
  numero_pasajeros: number;
}

export interface Outputs {
  tarifa_base_total: number;
  iva_domestico: number;
  tasa_seguridad: number;
  contribucion_turismo: number;
  tasa_salida_internacional: number;
  derechos_administrativos: number;
  impuestos_totales: number;
  precio_final_cop: number;
  precio_final_usd: number;
  porcentaje_impuestos: number;
  costo_por_pasajero: number;
  desglose_conceptos: Record<string, number>;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - fuentes DIAN, Aerocivil, ACDAC, Fontur
  const TRM_2026 = (coLive as any)?.trm?.valor ?? 3678.15; // TRM live datos.gov.co con fallback verificado
  const IVA_DOMESTICO = 0.05; // 5% IVA vuelos domésticos (Decreto 1165/2017)
  
  // Tasas por tipo vuelo (COP por pasajero) - Aerocivil 2026
  const tasas_domestico = {
    seguridad: 10500, // ACDAC + servicios aeronavegación
    fontur: 4200, // Contribución desarrollo turístico
    administrativo: 2800, // Derechos gestión aeroportuaria
  };
  
  const tasas_internacional = {
    salida_usd: 90, // Tasa salida internacional ~$90 USD (Aerocivil)
    seguridad: 17000, // Mayor para internacionales
    fontur: 6000, // Contribución turismo internacional
    administrativo: 4000, // Derechos administrativos
  };

  const tarifa_base_total = i.tarifa_base_cop * i.numero_pasajeros;
  let iva_domestico = 0;
  let tasa_seguridad = 0;
  let contribucion_turismo = 0;
  let tasa_salida_internacional = 0;
  let derechos_administrativos = 0;

  if (i.tipo_vuelo === 'domestico') {
    // Vuelo doméstico: aplica IVA 5%
    iva_domestico = tarifa_base_total * IVA_DOMESTICO;
    tasa_seguridad = tasas_domestico.seguridad * i.numero_pasajeros;
    contribucion_turismo = tasas_domestico.fontur * i.numero_pasajeros;
    derechos_administrativos = tasas_domestico.administrativo * i.numero_pasajeros;
  } else {
    // Vuelos internacionales: exención IVA, aplica tasa salida
    iva_domestico = 0; // Exención servicios internacionales (DIAN)
    tasa_salida_internacional = tasas_internacional.salida_usd * TRM_2026 * i.numero_pasajeros;
    tasa_seguridad = tasas_internacional.seguridad * i.numero_pasajeros;
    contribucion_turismo = tasas_internacional.fontur * i.numero_pasajeros;
    derechos_administrativos = tasas_internacional.administrativo * i.numero_pasajeros;
  }

  const impuestos_totales = iva_domestico + tasa_seguridad + contribucion_turismo + tasa_salida_internacional + derechos_administrativos;
  const precio_final_cop = tarifa_base_total + impuestos_totales;
  const precio_final_usd = precio_final_cop / TRM_2026;
  const porcentaje_impuestos = tarifa_base_total > 0 ? (impuestos_totales / tarifa_base_total) * 100 : 0;
  const costo_por_pasajero = i.numero_pasajeros > 0 ? precio_final_cop / i.numero_pasajeros : 0;

  const desglose_conceptos: Record<string, number> = {
    tarifa_base_total,
    iva_domestico,
    tasa_seguridad,
    contribucion_turismo,
    tasa_salida_internacional,
    derechos_administrativos,
    impuestos_totales,
    precio_final_cop,
  };

  const baseR = Math.round(tarifa_base_total);
  const ivaR = Math.round(iva_domestico);
  const segR = Math.round(tasa_seguridad);
  const turR = Math.round(contribucion_turismo);
  const salR = Math.round(tasa_salida_internacional);
  const admR = Math.round(derechos_administrativos);
  const impR = Math.round(impuestos_totales);
  const pctR = Math.round(porcentaje_impuestos * 10) / 10;
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  const esInternacional = i.tipo_vuelo !== 'domestico';
  const _insight = {
    title: esInternacional ? 'Tu vuelo internacional con impuestos' : 'Tu vuelo doméstico con impuestos',
    text: `Sobre una tarifa base de **${fmtCOP(baseR)}** se suman **${fmtCOP(impR)}** en tasas e impuestos `
      + `(un **${pctR.toFixed(1)}%** extra), dejando el precio final en **${fmtCOP(Math.round(precio_final_cop))}** `
      + `(~US$${(Math.round(precio_final_usd * 100) / 100).toLocaleString('en-US')}). `
      + (esInternacional
          ? `El grueso es la **tasa de salida internacional** (${fmtCOP(salR)}).`
          : `Incluye el **IVA del 5%** (${fmtCOP(ivaR)}) propio de los vuelos domésticos.`),
    tone: 'warn',
    icon: '✈️'
  };

  // Donut: tarifa base + cada concepto de impuesto (las slices suman el precio final).
  const slices: { label: string; value: number }[] = [{ label: 'Tarifa base', value: baseR }];
  if (ivaR > 0) slices.push({ label: 'IVA (5%)', value: ivaR });
  if (segR > 0) slices.push({ label: 'Tasa de seguridad', value: segR });
  if (turR > 0) slices.push({ label: 'Contribución turismo (Fontur)', value: turR });
  if (salR > 0) slices.push({ label: 'Tasa salida internacional', value: salR });
  if (admR > 0) slices.push({ label: 'Derechos administrativos', value: admR });
  const totalSlices = slices.reduce((a, s) => a + s.value, 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmtCOP(totalSlices),
    centerLabel: 'Precio final',
    ariaLabel: `Precio final de ${fmtCOP(totalSlices)} compuesto por la tarifa base de ${fmtCOP(baseR)} más ${fmtCOP(impR)} en tasas e impuestos.`
  };

  return {
    tarifa_base_total: baseR,
    iva_domestico: ivaR,
    tasa_seguridad: segR,
    contribucion_turismo: turR,
    tasa_salida_internacional: salR,
    derechos_administrativos: admR,
    impuestos_totales: impR,
    precio_final_cop: Math.round(precio_final_cop),
    precio_final_usd: Math.round(precio_final_usd * 100) / 100,
    porcentaje_impuestos: pctR,
    costo_por_pasajero: Math.round(costo_por_pasajero),
    desglose_conceptos,
    _insight,
    _chart,
  };
}
