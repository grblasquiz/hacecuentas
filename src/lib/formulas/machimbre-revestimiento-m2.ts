/** Machimbre para revestir una pared o cielorraso: m², metros lineales y tablas. */
export interface Inputs {
  largo_m?: number | string;
  alto_m?: number | string;
  ancho_tabla_cm?: number | string;
  desperdicio_pct?: number | string;
  __country?: string;
}

export interface Outputs {
  machimbre_m2: number;
  metros_lineales: number;
  tablas_3m: number;
  resumen: string;
  _insight?: any;
}

export function machimbreRevestimientoM2(i: Inputs): Outputs {
  const largo = Math.max(0, Number(i.largo_m) || 0);
  const alto = Math.max(0, Number(i.alto_m) || 0);
  const anchoTabla = Math.max(1, Number(i.ancho_tabla_cm) || 10);
  const desp = Math.max(0, Number(i.desperdicio_pct) || 0);

  const area = largo * alto;
  // Redondeo a 4 decimales para limpiar el error de coma flotante antes de aplicar Math.ceil.
  const area_util = Math.round(area * (1 + desp / 100) * 10000) / 10000;
  const machimbre_m2 = area_util > 0 ? Math.ceil(area_util * 100) / 100 : 0;
  const metros_lineales = area_util > 0 ? Math.ceil(area_util / (anchoTabla / 100) * 10) / 10 : 0;
  const tablas_3m = metros_lineales > 0 ? Math.ceil(metros_lineales / 3) : 0;

  const resumen = machimbre_m2 > 0
    ? `Para revestir ${largo} × ${alto} m (${area.toFixed(2)} m²) con ${desp}% de desperdicio necesitás ${machimbre_m2} m² de machimbre: ${metros_lineales} m lineales de tabla de ${anchoTabla} cm, o sea ${tablas_3m} tablas de 3 m.`
    : 'Cargá el largo y el alto de la superficie para calcular el machimbre.';

  const out: Outputs = { machimbre_m2, metros_lineales, tablas_3m, resumen };

  if (machimbre_m2 > 0) {
    out._insight = {
      title: 'Cuánto machimbre comprar',
      text: `Necesitás **${machimbre_m2} m²** de machimbre (incluye **${desp}%** de desperdicio), equivalentes a **${metros_lineales} m lineales** de tabla de ${anchoTabla} cm o **${tablas_3m} tablas** de 3 m. Comprá siempre alguna tabla de más para cortes y reposiciones.`,
      tone: 'neutral',
      icon: '🪵',
    };
  }

  return out;
}
