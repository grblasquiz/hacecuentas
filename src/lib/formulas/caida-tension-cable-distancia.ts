/** Caída de tensión en un tramo de cable.
 *
 *  TRES CORRECCIONES sobre la versión anterior (era una fórmula de SEGURIDAD
 *  ELÉCTRICA que subestimaba la caída real por dos vías distintas a la vez):
 *
 *  1. FACTOR DE SISTEMA. Antes se aplicaba SIEMPRE el 2 del circuito monofásico
 *     (ida + vuelta). En trifásico equilibrado no hay retorno por neutro y el
 *     factor correcto es √3 ≈ 1,732 sobre la tensión de línea. Usar 2 en
 *     trifásico SOBREESTIMA la caída un 15,5% (2/√3 = 1,1547). Ahora hay
 *     selector `sistema`; el default sigue siendo monofásico.
 *
 *  2. RESISTIVIDAD A LA TEMPERATURA DE SERVICIO. Antes se usaba ρ a 20 °C. Un
 *     conductor cargado con aislación PVC trabaja a 70 °C (temperatura máxima
 *     de servicio permanente según IEC 60502 / IRAM 2178 para PVC; 90 °C para
 *     XLPE/EPR). Corrigiendo con ρ_T = ρ₂₀·(1 + α·(T − 20)) y α_Cu = 0,00393/°C,
 *     a 70 °C la resistencia sube un 19,65% → la versión vieja SUBESTIMABA la
 *     caída real casi un 20%. Ahora se calcula a la temperatura de servicio
 *     (default 70 °C, el caso conservador) y se informan los DOS valores.
 *
 *  3. RESISTIVIDADES TRUNCADAS. Antes cobre 0,0172 y aluminio 0,0282. Los
 *     valores normalizados de IEC 60228 (resistividad a 20 °C del conductor
 *     recocido, Ω·mm²/m) son 0,017241 y 0,028264.
 *
 *  Referencias: IEC 60228 (conductores de cables aislados), IEC 60502-1,
 *  IRAM 2178, AEA 90364-7-771 (caída admisible 3% iluminación / 5% total).
 */

/** Resistividad a 20 °C, Ω·mm²/m — IEC 60228. */
const RHO_20: Record<string, number> = {
  cobre: 0.017241,    // antes 0,0172 (truncado)
  aluminio: 0.028264, // antes 0,0282 (truncado)
};

/** Coeficiente de variación de la resistencia con la temperatura, 1/°C (a 20 °C). */
const ALFA: Record<string, number> = {
  cobre: 0.00393,
  aluminio: 0.00403,
};

/** Factor geométrico del sistema: monofásico/CC ida y vuelta = 2; trifásico equilibrado = √3. */
const FACTOR_SISTEMA: Record<string, number> = {
  monofasico: 2,
  continua: 2,
  trifasico: Math.sqrt(3),
};

/** Temperatura máxima de servicio permanente del conductor, por aislación (°C). */
export const TEMP_SERVICIO: Record<string, number> = {
  pvc: 70,   // IEC 60502-1 / IRAM 2178
  xlpe: 90,  // XLPE / EPR
  epr: 90,
};

export interface CaidaTensionCableDistanciaInputs {
  corriente: number;
  distancia: number;
  seccion: number;
  voltaje: number;
  material: string;
  /** 'monofasico' (default), 'trifasico' o 'continua'. */
  sistema?: string;
  /** Temperatura de servicio del conductor en °C. Default 70 (PVC a plena carga). */
  temperaturaConductor?: number;
}
export interface CaidaTensionCableDistanciaOutputs {
  caidaV: string;
  porcentaje: string;
  voltajeFinal: string;
  caidaV20C: string;
  porcentaje20C: string;
  sistema: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function caidaTensionCableDistancia(i: CaidaTensionCableDistanciaInputs): CaidaTensionCableDistanciaOutputs {
  const I = Number(i.corriente); const L = Number(i.distancia); const S = Number(i.seccion);
  const V = Number(i.voltaje);
  const material = RHO_20[i.material] !== undefined ? i.material : 'cobre';
  const rho20 = RHO_20[material];
  const alfa = ALFA[material];

  const sistema = FACTOR_SISTEMA[String(i.sistema || 'monofasico')] !== undefined
    ? String(i.sistema || 'monofasico')
    : 'monofasico';
  const k = FACTOR_SISTEMA[sistema];
  const etiquetaSistema = sistema === 'trifasico'
    ? 'trifásico (√3 · ρ · L · I / S)'
    : sistema === 'continua'
      ? 'corriente continua (2 · ρ · L · I / S)'
      : 'monofásico (2 · ρ · L · I / S)';

  // Number(x) || default mataría un 0 legítimo; acá 0 no es válido igual, pero
  // la temperatura sí puede ser 0 °C (tendido a la intemperie en invierno).
  const tRaw = Number(i.temperaturaConductor);
  const T = Number.isFinite(tRaw) ? tRaw : 70;

  if (!I || !L || !S || !V) throw new Error('Completá todos los campos');
  if (T < -20 || T > 120) throw new Error('La temperatura del conductor debe estar entre -20 y 120 °C');

  // ρ a la temperatura de servicio
  const rhoT = rho20 * (1 + alfa * (T - 20));

  const dv = k * rhoT * L * I / S;          // caída real, en caliente (conservadora)
  const dv20 = k * rho20 * L * I / S;       // referencia a 20 °C (cable frío / carga baja)
  const pct = (dv / V) * 100;
  const pct20 = (dv20 / V) * 100;
  const ok = pct < 3;

  const notaTemp = `Calculado con el conductor a ${T} °C (ρ = ${rhoT.toFixed(5)} Ω·mm²/m). Con el cable frío a 20 °C la caída sería de ${dv20.toFixed(2)} V (${pct20.toFixed(2)}%): la diferencia es real, un cable a plena carga se calienta y conduce peor.`;

  const _insight = {
    title: 'Caída de tensión del tramo',
    text: (ok
      ? `La caída es de **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), por debajo del 3% recomendado. La sección de ${S} mm² alcanza para ${L} m a ${I} A en ${etiquetaSistema.split(' (')[0]}.`
      : pct < 5
        ? `La caída llega a **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), arriba del 3% ideal. Conviene subir la sección o acortar el tramo para no perder rendimiento.`
        : `La caída es de **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), muy por encima del 5% límite. Aumentá la sección sí o sí: con esta el cable se calienta y el equipo trabaja con poca tensión.`) + ' ' + notaTemp,
    tone: ok ? 'good' : 'warn',
    icon: '⚡',
  };
  const pctR = Number(pct.toFixed(2));
  const _chart = {
    type: 'scale',
    marker: pctR,
    markerLabel: `${pctR}%`,
    min: 0,
    segments: [
      { nombre: 'Aceptable', max: 3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Alto', max: 5, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Excesivo', max: Math.max(8, Math.ceil(pctR) + 1), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Caída de tensión de ${pctR}% respecto al límite recomendado del 3%`,
  };
  return {
    caidaV: dv.toFixed(2) + ' V',
    porcentaje: pct.toFixed(2) + '%',
    voltajeFinal: (V - dv).toFixed(1) + ' V',
    caidaV20C: dv20.toFixed(2) + ' V',
    porcentaje20C: pct20.toFixed(2) + '%',
    sistema: etiquetaSistema,
    resumen: `Caída ${dv.toFixed(2)} V (${pct.toFixed(2)}%) en ${etiquetaSistema.split(' (')[0]}, conductor a ${T} °C. ${ok ? '✅ Aceptable (<3%)' : pct < 5 ? '⚠️ Alto — considerá aumentar sección' : '❌ Excesivo — aumentar sección obligatoriamente'}. A 20 °C serían ${dv20.toFixed(2)} V (${pct20.toFixed(2)}%).`,
    _insight, _chart,
  };
}
