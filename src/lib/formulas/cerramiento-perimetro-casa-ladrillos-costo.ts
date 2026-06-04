export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cerramiento perimetral: calculadora de ladrillos, mortero y costo.
 *
 * Fuentes:
 *  - CIRSOC 101 (Reglamento INTI, Argentina) — pilares y encadenados
 *  - Red Materiales AR / Construex AR — rendimientos estándar por tipo
 *  - Aceros Arequipa / Construyendoseguro — dosificación mortero 1:1:6
 *
 * Rendimientos por tipo de unidad (unidades/m² de cara vista):
 *   Ladrillo común macizo 6×12×25 cm de soga (pared 12 cm)  → 64 u/m²
 *   Ladrillo hueco cerámico 8×18×33 cm (pared 8 cm)          → 17 u/m²
 *   Ladrillo hueco cerámico 18×18×33 cm (pared 18 cm)        → 14 u/m²
 *   Bloque de hormigón 20×20×40 cm                           → 12.5 u/m²
 *   (EN) Standard US modular brick 3⅝×2¼×7⅝ in single-wythe → 6.75 u/ft²
 *   (EN) CMU 8×8×16 in                                       → 1.125 u/ft²
 *
 * Mortero de asiento (mezcla 1:1:6 cemento:cal:arena) por m² pared:
 *   Cemento  ~7 kg  (ladrillo común) / ~5 kg (hueco/bloque)
 *   Cal      ~5 kg  / ~3.5 kg
 *   Arena    ~0.03 m³ / ~0.022 m³
 *
 * Cimiento (zapata corrida 30×30 cm): ~0.09 m³ hormigón / m lineal
 * Pilares: 1 pilar cada 3 m (20×20 cm, 4 hierros ø8, estribos ø6 c/20 cm)
 */

// Rendimientos en unidades por m² de cara vista
const RENDIMIENTO: Record<string, number> = {
  comun:  64,
  hueco8: 17,
  hueco18: 14,
  bloque: 12.5,
};

// Consumo de mortero por m² pared (ladrillo común / otros)
const MORTERO_CEMENTO_KG: Record<string, number> = {
  comun: 7, hueco8: 5, hueco18: 5, bloque: 4,
};
const MORTERO_CAL_KG: Record<string, number> = {
  comun: 5, hueco8: 3.5, hueco18: 3.5, bloque: 3,
};
const MORTERO_ARENA_M3: Record<string, number> = {
  comun: 0.030, hueco8: 0.022, hueco18: 0.022, bloque: 0.018,
};

// EN constants (US standard brick, single wythe)
const US_BRICK_PER_SQFT = 6.75;   // modular brick with 3/8" mortar joint
const CMU_PER_SQFT      = 1.125;  // 8×8×16 CMU

function fmtN(v: number, lang: string, dec = 0): string {
  return v.toLocaleString(lang === 'en' ? 'en-US' : 'es-AR', {
    maximumFractionDigits: dec,
    minimumFractionDigits: dec,
  });
}

export function cerramientoPerimetroCasaLadrillosCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  if (__lang === 'en') {
    // ── EN branch: US / global units ────────────────────────────────────
    const perimetroFt  = Math.max(Number(i.perimetro_ft) || 0, 0);
    const alturaFt     = Math.max(Number(i.altura_ft) || 0, 0);
    const vanosAnchoFt = Math.max(Number(i.vanos_ft) || 0, 0);
    const tipoCMU      = String(i.tipo_en || 'brick') === 'cmu';

    const perimetroEfectivo = Math.max(perimetroFt - vanosAnchoFt, 0);
    const areaSqft = perimetroEfectivo * alturaFt;

    const factorUnidad = tipoCMU ? CMU_PER_SQFT : US_BRICK_PER_SQFT;
    const unidadesBruto = areaSqft * factorUnidad;
    const unidadesConDesperdicio = Math.ceil(unidadesBruto * 1.10);

    // Mortar bags: ~1 bag (70 lb Type S) per 100 bricks / ~1 per 30 CMU
    const mortarBags = tipoCMU
      ? Math.ceil(unidadesConDesperdicio / 30)
      : Math.ceil(unidadesConDesperdicio / 100);

    // Footing: 12"×12" cross-section → 1 ft³/lineal ft → ft³ ÷ 27 = yd³
    const footingYd3 = perimetroEfectivo * 1.0 / 27;

    // Pillars: 1 per 10 ft of perimeter
    const pilares = Math.ceil(perimetroEfectivo / 10);

    // Pallets (500 units each)
    const pallets = Math.ceil(unidadesConDesperdicio / 500);

    const unitName = tipoCMU ? 'CMU blocks' : 'bricks';

    const resultado = `${fmtN(unidadesConDesperdicio, 'en')} ${unitName}`;
    const resumen = [
      `Wall area: ${fmtN(areaSqft, 'en', 1)} sq ft`,
      `${tipoCMU ? 'CMU blocks' : 'Bricks'} (incl. 10% waste): ${fmtN(unidadesConDesperdicio, 'en')} → ${pallets} pallet${pallets !== 1 ? 's' : ''}`,
      `Mortar (Type S bags): ${fmtN(mortarBags, 'en')}`,
      `Footing concrete: ${fmtN(footingYd3, 'en', 2)} yd³`,
      `Reinforcement pillars (every ~10 ft): ${pilares}`,
    ].join(' · ');

    const _insight = {
      title: 'Your material estimate',
      text: perimetroFt === 0 || alturaFt === 0
        ? 'Enter perimeter and wall height to see results.'
        : `A **${fmtN(perimetroEfectivo, 'en')} ft** perimeter, **${fmtN(alturaFt, 'en', 1)} ft** tall = **${fmtN(areaSqft, 'en', 0)} sq ft** of wall. You need **${fmtN(unidadesConDesperdicio, 'en')} ${unitName}** (10% waste included), **${mortarBags} bags** of Type S mortar, and **${fmtN(footingYd3, 'en', 2)} yd³** of footing concrete. Plan for **${pilares} pillar${pilares !== 1 ? 's' : ''}** spaced every ~10 ft.`,
      tone: 'neutral',
      icon: '🧱',
    };

    return { resultado, resumen, _insight };
  }

  // ── ES branch: Argentina / metric units ─────────────────────────────
  const perimetroM  = Math.max(Number(i.perimetro_m) || 0, 0);
  const alturaM     = Math.max(Number(i.altura_m) || 0, 0);
  const vanosM      = Math.max(Number(i.vanos_m) || 0, 0);
  const tipoLadrillo = String(i.tipo_ladrillo || 'comun');

  const rendimiento = RENDIMIENTO[tipoLadrillo] ?? RENDIMIENTO.comun;
  const perimetroEfectivo = Math.max(perimetroM - vanosM, 0);
  const areaM2 = perimetroEfectivo * alturaM;

  const unidadesBruto = areaM2 * rendimiento;
  const unidadesConDesperdicio = Math.ceil(unidadesBruto * 1.10);

  // Mortero de asiento (mezcla 1:1:6)
  const cementoKg = Math.ceil(areaM2 * (MORTERO_CEMENTO_KG[tipoLadrillo] ?? 7));
  const calKg     = Math.ceil(areaM2 * (MORTERO_CAL_KG[tipoLadrillo] ?? 5));
  const arenaM3   = parseFloat((areaM2 * (MORTERO_ARENA_M3[tipoLadrillo] ?? 0.030)).toFixed(2));

  // Bolsas (50 kg c/u)
  const bolsasCemento = Math.ceil(cementoKg / 50);
  const bolsasCal     = Math.ceil(calKg / 50);

  // Cimiento zapata corrida 30×30 cm → 0.09 m³/m lineal
  const cimientoM3 = parseFloat((perimetroEfectivo * 0.09).toFixed(2));

  // Pilares: 1 pilar cada 3 m lineales (CIRSOC 101)
  const pilares = Math.ceil(perimetroEfectivo / 3);

  const tipoLabel: Record<string, string> = {
    comun:   'ladrillo común',
    hueco8:  'ladrillo hueco 8 cm',
    hueco18: 'ladrillo hueco 18 cm',
    bloque:  'bloque de hormigón',
  };
  const label = tipoLabel[tipoLadrillo] ?? 'ladrillos';

  const resultado = `${fmtN(unidadesConDesperdicio, 'es')} ${label}`;

  const resumen = [
    `Área de pared: ${fmtN(areaM2, 'es', 1)} m²`,
    `${label.charAt(0).toUpperCase() + label.slice(1)} (con 10% rotura): ${fmtN(unidadesConDesperdicio, 'es')}`,
    `Cemento mezcla: ${bolsasCemento} bolsas (50 kg)`,
    `Cal hidráulica: ${bolsasCal} bolsas`,
    `Arena gruesa: ${fmtN(arenaM3, 'es', 2)} m³`,
    `Hormigón cimiento (zapata 30×30 cm): ${fmtN(cimientoM3, 'es', 2)} m³`,
    `Pilares de refuerzo (cada 3 m, CIRSOC 101): ${pilares}`,
  ].join(' · ');

  const _insight = {
    title: 'Estimación de materiales',
    text: perimetroM === 0 || alturaM === 0
      ? 'Ingresá el perímetro y la altura para ver el resultado.'
      : `Perímetro efectivo **${fmtN(perimetroEfectivo, 'es', 1)} m** × altura **${fmtN(alturaM, 'es', 1)} m** = **${fmtN(areaM2, 'es', 1)} m²** de pared. Necesitás **${fmtN(unidadesConDesperdicio, 'es')} unidades** de ${label} (ya incluye el 10% de rotura), **${bolsasCemento} bolsas de cemento**, **${bolsasCal} bolsas de cal**, **${fmtN(arenaM3, 'es', 2)} m³ de arena** y **${fmtN(cimientoM3, 'es', 2)} m³ de hormigón** para la zapata corrida. Planificá **${pilares} pilares** de refuerzo (cada 3 m, según CIRSOC 101).`,
    tone: 'neutral',
    icon: '🧱',
  };

  return { resultado, resumen, _insight };
}
