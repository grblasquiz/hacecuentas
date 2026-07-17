/**
 * Calculadora de materiales de construcción (cómputo de obra) — Argentina.
 *
 * El usuario elige un ELEMENTO de obra y carga la superficie (m²); la calculadora
 * devuelve el cómputo de materiales con dosificaciones estándar argentinas, sumando
 * ~10 % de desperdicio (editable) y redondeando hacia arriba las unidades comprables
 * (ladrillos, bolsas, cajas → Math.ceil).
 *
 * RATIOS — verificados contra las calcs hermanas del repo (ya revisadas por el gate
 * editorial) y contra fuentes de obra AR (redmateriales.com.ar, lacaleramateriales.com.ar,
 * servidos.ar, calcumat.com.ar):
 *
 *  · Ladrillo común 24×12×6 cm, pared de 15 cm (de canto): 63 ladrillos/m² · mortero 0,04 m³/m²
 *      (repo ladrillos-m2.ts; web lacaleramateriales: 50–63/m²).
 *  · Ladrillo común, pared de 30 cm (muro doble/portante): 126 ladrillos/m² · mortero 0,08 m³/m²
 *      (el doble de la pared de 15 cm + junta central; fuentes AR: 126–134/m²).
 *  · Ladrillo hueco 8/12/18 (cara vista 18×33 cm): ~16 ladrillos/m². La CARA es la misma en
 *      los tres → la cantidad por m² NO cambia; lo que cambia es el espesor del muro y el
 *      volumen de mortero. Mortero 0,02 / 0,025 / 0,03 m³/m² para 8 / 12 / 18
 *      (repo ladrillos-m2.ts; web servidos.ar / redmateriales: 15–16/m²).
 *  · Mortero de asiento 1:1:4 (cemento:cal:arena) por m³ de mortero: 300 kg cemento
 *      (6 bolsas de 50 kg), 150 kg cal (6 bolsas de 25 kg), 1,1 m³ arena. Aproximado, lado
 *      conservador; derivado del módulo revoque del repo (1:1:6 → 200 cem + 100 cal por m³)
 *      escalado a la dosis más rica de asiento. [RATIO A REVISAR: el split cemento/cal exacto
 *      varía con el criterio del albañil; la cantidad de ladrillos y el volumen de mortero
 *      son los datos fuertes.]
 *  · Contrapiso (cascotero) por m³: ~3 bolsas de cemento de 50 kg, 0,9 m³ arena, 0,9 m³ cascote
 *      (repo contrapiso-m3.ts; web servidos.ar / calcumat: ~15 kg cemento/m² a 10 cm = 3 bolsas/m³).
 *  · Carpeta de nivelación 1:3 (cemento:arena) por m³: 350 kg cemento (7 bolsas de 50 kg),
 *      1,05 m³ arena (repo revoque fino 1:3 = 350 kg cemento/m³).
 *  · Revoque completo (grueso 1:1:6 + fino 1:3, 2 cm) por m³ de mortero: 275 kg cemento
 *      (5,5 bolsas), 75 kg cal (3 bolsas de 25 kg), 1,0 m³ arena (repo revoque-mortero.ts).
 *  · Piso cerámico: cajas = área / (m² por caja, def. 1,5) · pegamento 4,5 kg/m² (cerámico
 *      30–60 cm, bolsa de 25 kg) · pastina ~0,20 kg/m² (cerámico 45×45, junta 3 mm)
 *      (repo ceramicos-m2-cajas.ts + pegamento-ceramicas-bolsas-m2-area.ts + juntas-pastina...).
 *
 * NO dimensiona seguridad estructural: es un cómputo de cantidades para presupuestar.
 */

export interface Inputs {
  /** Elemento de obra: pared_comun | pared_hueco8 | pared_hueco12 | pared_hueco18 | contrapiso | carpeta | revoque | piso_ceramico */
  elemento?: string;
  /** Superficie de la obra en m² (para todos los elementos). */
  superficie?: number | string;
  /** Espesor en cm — solo contrapiso / carpeta / revoque. Vacío = estándar del elemento. */
  espesor_cm?: number | string;
  /** m² por caja de cerámica — solo piso cerámico. Def. 1,5. */
  m2_por_caja?: number | string;
  /** % de desperdicio. Def. 10. */
  desperdicio_pct?: number | string;
  __lang?: string;
  __country?: string;
}

export interface Outputs {
  elemento: string;
  resumen: string;
  _table?: any;
  _insight?: any;
}

// Ladrillos por m² y mortero de asiento (m³ por m² de pared).
const LADRILLOS: Record<string, { porM2: number; morteroM3PorM2: number; label: string; muro: string }> = {
  pared_comun:    { porM2: 63,  morteroM3PorM2: 0.040, label: 'Ladrillo común 24×12×6 cm', muro: 'pared de 15 cm' },
  pared_comun_30: { porM2: 126, morteroM3PorM2: 0.080, label: 'Ladrillo común 24×12×6 cm', muro: 'pared de 30 cm (muro doble)' },
  pared_hueco8:  { porM2: 16, morteroM3PorM2: 0.020, label: 'Ladrillo hueco 8×18×33 cm',    muro: 'tabique de 8 cm' },
  pared_hueco12: { porM2: 16, morteroM3PorM2: 0.025, label: 'Ladrillo hueco 12×18×33 cm',   muro: 'pared de 12 cm' },
  pared_hueco18: { porM2: 16, morteroM3PorM2: 0.030, label: 'Ladrillo hueco 18×18×33 cm',   muro: 'pared de 18 cm' },
};

// Mortero de asiento 1:1:4 (cemento:cal:arena) — por m³ de mortero.
const MORTERO_ASIENTO = { cementoKgM3: 300, calKgM3: 150, arenaM3PorM3: 1.1 };

// Espesores estándar (cm) si el usuario no ingresa uno.
const ESPESOR_DEFAULT: Record<string, number> = { contrapiso: 8, carpeta: 3, revoque: 2 };

// Formateadores es-AR.
const na = (x: number): string => x.toLocaleString('es-AR', { maximumFractionDigits: 2 }); // superficie / espesor
const ni = (x: number): string => Math.round(x).toLocaleString('es-AR');                    // enteros grandes
const nf = (x: number, dec = 2): string =>
  x.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });    // m³ / kg

export function compute(inputs: Inputs): Outputs {
  const elemento = String(inputs.elemento || 'pared_comun');
  const area = Math.max(0, Number(inputs.superficie) || 0);

  const despRaw = inputs.desperdicio_pct;
  const desp =
    despRaw === '' || despRaw === null || despRaw === undefined
      ? 10
      : Math.max(0, Math.min(40, Number(despRaw) || 0));
  const f = 1 + desp / 100;

  if (area <= 0) {
    throw new Error('Ingresá la superficie de la obra en m² (un número mayor a cero).');
  }

  const espRaw = inputs.espesor_cm;
  const espUser =
    espRaw === '' || espRaw === null || espRaw === undefined ? 0 : Math.max(0, Number(espRaw) || 0);

  const materiales: string[][] = []; // [material, cantidad, unidad]
  let elementoLabel = '';
  let resumen = '';
  let icon = '🧱';

  if (elemento in LADRILLOS) {
    // ── Pared de ladrillo ─────────────────────────────────────────
    const d = LADRILLOS[elemento];
    const ladrillos = Math.ceil(area * d.porM2 * f);
    const morteroM3 = area * d.morteroM3PorM2 * f;
    const cementoKg = morteroM3 * MORTERO_ASIENTO.cementoKgM3;
    const calKg = morteroM3 * MORTERO_ASIENTO.calKgM3;
    const arenaM3 = morteroM3 * MORTERO_ASIENTO.arenaM3PorM3;
    const bolsasCem = Math.ceil(cementoKg / 50);
    const bolsasCal = Math.ceil(calKg / 25);

    elementoLabel = `Pared — ${d.label} (${d.muro})`;
    materiales.push([d.label, ni(ladrillos), 'unidades']);
    materiales.push(['Mortero de asiento (1:1:4)', nf(morteroM3), 'm³']);
    materiales.push(['— Cemento (del mortero)', String(bolsasCem), 'bolsas de 50 kg']);
    materiales.push(['— Cal (del mortero)', String(bolsasCal), 'bolsas de 25 kg']);
    materiales.push(['— Arena (del mortero)', nf(arenaM3), 'm³']);
    resumen =
      `${na(area)} m² de ${d.label.toLowerCase()} (${d.muro}): ${ni(ladrillos)} ladrillos y ` +
      `${nf(morteroM3)} m³ de mortero de asiento (${bolsasCem} bolsas de cemento + ${bolsasCal} de cal + ${nf(arenaM3)} m³ de arena).`;
  } else if (elemento === 'contrapiso') {
    // ── Contrapiso (hormigón de cascote) ──────────────────────────
    const esp = espUser > 0 ? espUser : ESPESOR_DEFAULT.contrapiso;
    const volGeom = area * (esp / 100);
    const volMat = volGeom * f;
    const bolsasCem = Math.ceil(volMat * 3);
    const arenaM3 = volMat * 0.9;
    const cascoteM3 = volMat * 0.9;

    elementoLabel = `Contrapiso (${na(esp)} cm de espesor)`;
    icon = '🏗️';
    materiales.push(['Volumen de contrapiso', nf(volGeom), 'm³']);
    materiales.push(['Cemento', String(bolsasCem), 'bolsas de 50 kg']);
    materiales.push(['Arena', nf(arenaM3), 'm³']);
    materiales.push(['Cascote', nf(cascoteM3), 'm³']);
    resumen =
      `Contrapiso de ${na(area)} m² × ${na(esp)} cm = ${nf(volGeom)} m³ de mezcla: ` +
      `${bolsasCem} bolsas de cemento, ${nf(arenaM3)} m³ de arena y ${nf(cascoteM3)} m³ de cascote.`;
  } else if (elemento === 'carpeta') {
    // ── Carpeta de nivelación (mortero 1:3) ───────────────────────
    const esp = espUser > 0 ? espUser : ESPESOR_DEFAULT.carpeta;
    const volGeom = area * (esp / 100);
    const volMat = volGeom * f;
    const cementoKg = volMat * 350;
    const bolsasCem = Math.ceil(cementoKg / 50);
    const arenaM3 = volMat * 1.05;

    elementoLabel = `Carpeta de nivelación 1:3 (${na(esp)} cm)`;
    materiales.push(['Volumen de carpeta', nf(volGeom), 'm³']);
    materiales.push(['Cemento', String(bolsasCem), 'bolsas de 50 kg']);
    materiales.push(['Arena', nf(arenaM3), 'm³']);
    resumen =
      `Carpeta de ${na(area)} m² × ${na(esp)} cm (mortero 1:3): ` +
      `${bolsasCem} bolsas de cemento y ${nf(arenaM3)} m³ de arena.`;
  } else if (elemento === 'revoque') {
    // ── Revoque completo (grueso 1:1:6 + fino 1:3) ────────────────
    const esp = espUser > 0 ? espUser : ESPESOR_DEFAULT.revoque;
    const volGeom = area * (esp / 100);
    const volMat = volGeom * f;
    const cementoKg = volMat * 275;
    const calKg = volMat * 75;
    const bolsasCem = Math.ceil(cementoKg / 50);
    const bolsasCal = Math.ceil(calKg / 25);
    const arenaM3 = volMat * 1.0;

    elementoLabel = `Revoque completo grueso + fino (${na(esp)} cm)`;
    icon = '🔧';
    materiales.push(['Volumen de mortero', nf(volGeom), 'm³']);
    materiales.push(['Cemento', String(bolsasCem), 'bolsas de 50 kg']);
    materiales.push(['Cal', String(bolsasCal), 'bolsas de 25 kg']);
    materiales.push(['Arena', nf(arenaM3), 'm³']);
    resumen =
      `Revoque completo de ${na(area)} m² (${na(esp)} cm): ` +
      `${bolsasCem} bolsas de cemento, ${bolsasCal} bolsas de cal y ${nf(arenaM3)} m³ de arena.`;
  } else if (elemento === 'piso_ceramico') {
    // ── Piso cerámico (cajas + pegamento + pastina) ───────────────
    const m2cRaw = inputs.m2_por_caja;
    const m2c =
      m2cRaw === '' || m2cRaw === null || m2cRaw === undefined
        ? 1.5
        : Math.max(0.1, Number(m2cRaw) || 1.5);
    const cajas = Math.ceil((area * f) / m2c);
    const m2Comprados = cajas * m2c;
    const bolsasPeg = Math.ceil((area * 4.5 * f) / 25);
    const pastinaKg = Math.round(area * 0.2 * f * 10) / 10;

    elementoLabel = 'Piso cerámico';
    icon = '🔲';
    materiales.push(['Cerámica', String(cajas), `cajas (${na(m2c)} m²/caja)`]);
    materiales.push(['Pegamento', String(bolsasPeg), 'bolsas de 25 kg']);
    materiales.push(['Pastina', nf(pastinaKg, 1), 'kg']);
    resumen =
      `Piso cerámico de ${na(area)} m²: ${cajas} cajas (${na(m2Comprados)} m²), ` +
      `${bolsasPeg} bolsas de pegamento y ${nf(pastinaKg, 1)} kg de pastina.`;
  } else {
    throw new Error('Elegí un elemento de obra válido (pared, contrapiso, carpeta, revoque o piso cerámico).');
  }

  const despTxt = desp > 0 ? ` Cantidades con ${na(desp)}% de desperdicio incluido.` : '';
  resumen += despTxt;

  const table = {
    title: `Cómputo de materiales — ${elementoLabel}`,
    headers: ['Material', 'Cantidad', 'Unidad'],
    align: ['left', 'right', 'left'],
    rows: materiales,
    note:
      (desp > 0 ? `Incluye ${na(desp)}% de desperdicio. ` : '') +
      'Las unidades comprables (ladrillos, bolsas, cajas) se redondean hacia arriba. Dosificaciones estándar de obra argentina; para el dimensionado estructural consultá a un profesional matriculado.',
  };

  const insight = {
    title: 'Cómputo de materiales',
    text:
      `**${elementoLabel}.** ${resumen} ` +
      'Comprá siempre por unidad cerrada (pallet de ladrillos, bolsa entera) y del mismo lote para no quedarte corto a mitad de obra ni tener diferencias de tono.',
    tone: 'neutral',
    icon,
  };

  return { elemento: elementoLabel, resumen, _table: table, _insight: insight };
}
