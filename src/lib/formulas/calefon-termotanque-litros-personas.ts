export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Water heater / hot water tank capacity sizing.
 *
 * Real method: Argentine ENARGAS / gasista-matriculado rule of 30-50 L per
 * person per day at 60 °C, plus a simultaneity factor for peak demand.
 * Matches U.S. DOE peak-hour-demand approach and European ACS norms.
 *
 * Sources:
 *   - ENARGAS: modos-eficientes-económicos-producir-agua-caliente-viviendas.pdf
 *   - DOE Energy Saver: energy.gov/energysaver/sizing-new-water-heater
 *   - IRAM 2440 / NAG-314 (calentadores de acumulación a gas)
 */
export function calefonTermotanqueLitrosPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // --- Inputs ---
  const personas = Math.max(1, Math.round(Number(i.personas) || 1));

  // usageLevel: 'bajo' | 'normal' | 'alto'
  const usoRaw = String(i.uso_diario || 'normal').toLowerCase();
  const uso = usoRaw === 'bajo' || usoRaw === 'low'
    ? 'bajo'
    : usoRaw === 'alto' || usoRaw === 'high'
      ? 'alto'
      : 'normal';

  // heaterType: 'termotanque' | 'calefon'
  const tipoRaw = String(i.tipo_equipo || 'termotanque').toLowerCase();
  const tipo = tipoRaw === 'calefon' || tipoRaw === 'tankless'
    ? 'calefon'
    : 'termotanque';

  // --- Core calculation ---
  // Litros/persona/día de agua caliente pura a 60 °C (no mezcla).
  // Fuente: ENARGAS "modos eficientes ACS" y DOE Energy Saver.
  // Uso bajo: ducha rápida ~6 min, sin bañera → ~22 L/pp
  // Uso normal: ducha ~10 min → ~30 L/pp (estándar ENARGAS para dimensionado)
  // Uso alto: ducha larga + bañera o lavarropas agua caliente → ~42 L/pp
  const LPP_BAJO   = 22;
  const LPP_NORMAL = 30;
  const LPP_ALTO   = 42;

  const lppMap: Record<string, number> = {
    bajo: LPP_BAJO,
    normal: LPP_NORMAL,
    alto: LPP_ALTO,
  };
  const lpp = lppMap[uso];

  // Demanda diaria estimada
  const demandaDiaria = personas * lpp;

  // Simultaneidad: no todos consumen al mismo tiempo. Factor según ENARGAS:
  //   1-2 pers → coef 1.0 (todos usan juntos)
  //   3-4 pers → coef 0.85 (pico ~85% demanda)
  //   5-6 pers → coef 0.75
  //   7+ pers  → coef 0.65
  const coefSim =
    personas <= 2 ? 1.00 :
    personas <= 4 ? 0.85 :
    personas <= 6 ? 0.75 :
                   0.65;

  const demandaPico = demandaDiaria * coefSim;

  // Redondear a tamaño comercial disponible en AR (litros nominales)
  const tamañosComerciales = [50, 80, 120, 150, 180, 200];
  let litrosRecomendados = tamañosComerciales[tamañosComerciales.length - 1];
  for (const t of tamañosComerciales) {
    if (t >= demandaPico) { litrosRecomendados = t; break; }
  }

  // Calefón instantáneo: la capacidad se expresa en L/min, no en depósito
  // Mostrar caudal recomendado: 1 ducha ≈ 8-10 L/min, pico 2 simultáneas ≈ 22 L/min
  let calefonCaudal = '';
  if (tipo === 'calefon') {
    if (personas <= 2) calefonCaudal = '14 L/min';
    else if (personas <= 4) calefonCaudal = '22 L/min (modulante)';
    else calefonCaudal = '22+ L/min + termotanque auxiliar';
  }

  // --- Texts ---
  const usageLabel =
    __lang === 'en'
      ? (uso === 'bajo' ? 'low' : uso === 'alto' ? 'high' : 'average')
      : (uso === 'bajo' ? 'bajo' : uso === 'alto' ? 'alto' : 'normal');

  let resultado: string;
  let resumen: string;
  let insTitle: string;
  let insText: string;

  if (tipo === 'calefon') {
    resultado = __lang === 'en' ? calefonCaudal : calefonCaudal;
    if (__lang === 'en') {
      resumen = `Tankless / instant heater: recommended flow rate **${calefonCaudal}** for ${personas} person${personas > 1 ? 's' : ''} (${usageLabel} usage). Daily hot water demand ≈ ${Math.round(demandaDiaria)} L/day. Note: tankless heaters can't supply two simultaneous showers unless rated ≥22 L/min.`;
      insTitle = 'Tankless heater recommendation';
      insText = `For **${personas} person${personas > 1 ? 's' : ''}** with **${usageLabel}** usage, a tankless heater rated at **${calefonCaudal}** covers your peak demand. For 2+ simultaneous showers, a storage tank is safer.`;
    } else {
      resumen = `Calefón instantáneo: caudal recomendado **${calefonCaudal}** para ${personas} persona${personas > 1 ? 's' : ''} (uso ${usageLabel}). Demanda diaria estimada: ${Math.round(demandaDiaria)} L/día. Atención: un calefón de 14 L/min no abastece 2 duchas simultáneas — en ese caso optar por ≥22 L/min o termotanque.`;
      insTitle = 'Recomendación calefón';
      insText = `Para **${personas} persona${personas > 1 ? 's' : ''}** con uso **${usageLabel}**, un calefón de **${calefonCaudal}** cubre el pico. Para 2 duchas simultáneas, optá por ≥22 L/min o un termotanque.`;
    }
  } else {
    resultado = `${litrosRecomendados} L`;
    if (__lang === 'en') {
      resumen = `Recommended storage tank: **${litrosRecomendados} L** for ${personas} person${personas > 1 ? 's' : ''} (${usageLabel} daily usage). Estimated daily demand: ${Math.round(demandaDiaria)} L · Peak (simultaneous) demand: ${Math.round(demandaPico)} L. Standard commercial models: 50 L (1-2p) · 80 L (3p) · 120 L (4-5p) · 150 L (6p) · 180+ L (7+p).`;
      insTitle = 'Tank size recommendation';
      insText = `For **${personas} person${personas > 1 ? 's' : ''}** with **${usageLabel}** daily use, a **${litrosRecomendados} L** storage tank is the right size. This accounts for a peak simultaneity factor of ${Math.round(coefSim * 100)}% — meaning not everyone uses hot water at the same moment.`;
    } else {
      resumen = `Termotanque recomendado: **${litrosRecomendados} L** para ${personas} persona${personas > 1 ? 's' : ''} (uso ${usageLabel}). Demanda diaria estimada: ${Math.round(demandaDiaria)} L · Demanda pico (simultáneo): ${Math.round(demandaPico)} L. Modelos comerciales: 50 L (1-2p) · 80 L (3p) · 120 L (4-5p) · 150 L (6p) · 180+ L (7+p).`;
      insTitle = 'Capacidad recomendada';
      insText = `Para **${personas} persona${personas > 1 ? 's' : ''}** con uso **${usageLabel}**, el termotanque ideal es de **${litrosRecomendados} L**. El cálculo aplica un factor de simultaneidad del ${Math.round(coefSim * 100)}%: no todos usan agua caliente al mismo tiempo.`;
    }
  }

  return {
    resultado,
    resumen,
    _insight: {
      title: insTitle,
      text: insText,
      tone: 'info',
      icon: '🚿',
    },
  };
}
