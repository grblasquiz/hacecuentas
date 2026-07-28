export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function maderaTerrazaMetrosCuadradosTablas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // --- parse inputs ---
  const largo_terraza_m  = Math.max(0, Number(i.largo_terraza)  || 0); // deck length, metres
  const ancho_terraza_m  = Math.max(0, Number(i.ancho_terraza)  || 0); // deck width, metres
  const largo_tabla_cm   = Math.max(1, Number(i.largo_tabla)    || 300); // board length, cm
  const ancho_tabla_mm   = Math.max(1, Number(i.ancho_tabla)    || 90);  // board face width, mm
  const separacion_mm    = Math.max(0, Number(i.separacion)     || 5);   // gap between boards, mm
  const desperdicio_pct  = Math.max(0, Math.min(50, (Number.isFinite(Number(i.desperdicio)) ? Number(i.desperdicio) : 10))); // waste %, 0–50

  // --- convert to consistent units (mm) ---
  const largo_terraza_mm = largo_terraza_m * 1000;
  const ancho_terraza_mm = ancho_terraza_m * 1000;
  const largo_tabla_mm   = largo_tabla_cm  * 10;

  // --- core calculation ---
  // How many boards span the deck width (boards run length-wise, so ancho_terraza drives row count)
  const cobertura_por_tabla_mm = ancho_tabla_mm + separacion_mm; // mm per board including gap
  const filas         = Math.ceil(ancho_terraza_mm / cobertura_por_tabla_mm); // rows across width
  const columnas      = Math.ceil(largo_terraza_mm / largo_tabla_mm);          // pieces along length
  const tablas_neto   = filas * columnas;
  const tablas_total  = Math.ceil(tablas_neto * (1 + desperdicio_pct / 100));

  // --- derived metrics ---
  const area_m2           = largo_terraza_m * ancho_terraza_m;
  const largo_lineal_total = tablas_total * (largo_tabla_cm / 100); // total linear metres purchased

  // --- format results ---
  const fmt = (n: number, dec = 0) =>
    n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  if (__lang === 'en') {
    const resumen =
      area_m2 === 0
        ? 'Enter your deck dimensions to calculate board quantities.'
        : `Deck area: **${fmt(area_m2, 2)} m²** — ` +
          `boards across width: **${filas}**, pieces along length: **${columnas}** — ` +
          `net boards: **${tablas_neto}**, with ${desperdicio_pct}% waste: **${tablas_total} boards**.`;

    const _insight = {
      title: 'Boards to purchase',
      text:
        area_m2 === 0
          ? 'Fill in all fields to see the result.'
          : `You need **${tablas_total} boards** (${fmt(largo_tabla_cm)} cm × ${fmt(ancho_tabla_mm)} mm, gap ${fmt(separacion_mm)} mm) for a deck of **${fmt(area_m2, 2)} m²**. ` +
            `That is ${fmt(tablas_total)} pieces = ~${largo_lineal_total.toFixed(1)} linear metres of decking. ` +
            `Add **${desperdicio_pct}% waste** already included for end cuts and trimming.`,
      tone: 'neutral',
      icon: '🪵',
    };

    return { resultado: String(tablas_total), resumen, _insight };
  }

  // --- Spanish ---
  const resumen =
    area_m2 === 0
      ? 'Ingresá las dimensiones de tu terraza para calcular la cantidad de tablas.'
      : `Área: **${fmt(area_m2, 2)} m²** — ` +
        `filas a lo ancho: **${filas}**, piezas a lo largo: **${columnas}** — ` +
        `tablas netas: **${tablas_neto}**, con ${desperdicio_pct}% de desperdicio: **${tablas_total} tablas**.`;

  const _insight = {
    title: 'Tablas a comprar',
    text:
      area_m2 === 0
        ? 'Completá todos los campos para ver el resultado.'
        : `Necesitás **${tablas_total} tablas** (${fmt(largo_tabla_cm)} cm × ${fmt(ancho_tabla_mm)} mm, separación ${fmt(separacion_mm)} mm) para una terraza de **${fmt(area_m2, 2)} m²**. ` +
          `Eso equivale a ~${largo_lineal_total.toFixed(1)} m lineales de madera. ` +
          `El **${desperdicio_pct}% de desperdicio** por cortes ya está incluido.`,
    tone: 'neutral',
    icon: '🪵',
  };

  return { resultado: String(tablas_total), resumen, _insight };
}
