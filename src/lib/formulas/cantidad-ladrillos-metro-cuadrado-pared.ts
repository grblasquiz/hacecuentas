export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Brick type data: [bricksPerM2_singleLeaf, labelEs, labelEn]
const BRICK_TYPES: Record<string, [number, string, string]> = {
  'comun_12':     [67,  'Ladrillo común macizo — pared 12 cm',             'Solid clay brick — 12 cm wall (6×12×24 cm)'],
  'comun_24':     [134, 'Ladrillo común macizo — pared 24 cm',             'Solid clay brick — 24 cm wall (6×12×24 cm)'],
  'comun_pandere':[52,  'Ladrillo común macizo — panderete 6 cm',          'Solid clay brick — 6 cm leaf (panderete)'],
  'hueco8':       [17,  'Ladrillo hueco cerámico 8×18×33 cm',              'Hollow ceramic brick 8×18×33 cm'],
  'hueco12':      [17,  'Ladrillo hueco cerámico 12×18×33 cm',             'Hollow ceramic brick 12×18×33 cm'],
  'hueco18':      [16,  'Ladrillo hueco cerámico 18×18×33 cm',             'Hollow ceramic brick 18×18×33 cm'],
  'portante12':   [16,  'Ladrillo cerámico portante 12×19×33 cm (IRAM)',   'Structural ceramic brick 12×19×33 cm (IRAM)'],
  'portante18':   [16,  'Ladrillo cerámico portante 18×19×33 cm (IRAM)',   'Structural ceramic brick 18×19×33 cm (IRAM)'],
  'bloque_h':     [13,  'Bloque de hormigón 19×19×39 cm',                  'Concrete block 19×19×39 cm'],
  'cara_vista':   [75,  'Ladrillo cara vista / a la vista 5×10×24 cm',     'Face/exposed brick 5×10×24 cm'],
  'standard_uk':  [60,  'Standard UK metric brick 215×65×102.5 mm',        'Standard UK metric brick 215×65×102.5 mm'],
  'modular_us':   [75,  'Modular US brick 194×57 mm (ASTM C216)',          'Modular US brick 194×57 mm (ASTM C216)'],
};

export function cantidadLadrillosMetroCuadradoPared(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const areaM2   = Math.max(Number(i.areaM2) || 0, 0);
  const tipoBrick = String(i.tipoBrick || 'comun_12');
  const mermaPct = Math.max((Number.isFinite(Number(i.mermaPct)) ? Number(i.mermaPct) : 5), 0);

  const brickData = BRICK_TYPES[tipoBrick] ?? BRICK_TYPES['comun_12'];
  const [bricksPerM2, labelEs, labelEn] = brickData;
  const tipoLabel = __lang === 'en' ? labelEn : labelEs;

  const base       = Math.ceil(areaM2 * bricksPerM2);
  const conMerma   = Math.ceil(base * (1 + mermaPct / 100));
  const mermaUnits = conMerma - base;

  const resumen = __lang === 'en'
    ? `Wall area: ${areaM2} m² · ${tipoLabel} → ${bricksPerM2} bricks/m² · Base: ${base} bricks + ${mermaPct}% waste (${mermaUnits} units) = **${conMerma} bricks to order**.`
    : `Superficie: ${areaM2} m² · ${tipoLabel} → ${bricksPerM2} ladrillos/m² · Base: ${base} ladrillos + ${mermaPct}% merma (${mermaUnits} unidades) = **${conMerma} ladrillos a comprar**.`;

  const insight = __lang === 'en'
    ? {
        title: 'Order with waste margin',
        text: `Base count (no waste): **${base} bricks**. With **${mermaPct}% waste** for breakage and cuts: order **${conMerma} bricks**. Running out mid-job means an extra delivery and possibly a batch with a different shade — always buy with a margin.`,
        tone: 'warn',
        icon: '🧱',
      }
    : {
        title: 'Comprá con margen de merma',
        text: `Cantidad base (sin merma): **${base} ladrillos**. Con **${mermaPct}% de merma** por rotura y cortes: comprá **${conMerma} ladrillos**. Quedarte sin material a mitad de obra implica un flete extra y quizás un lote con tono distinto.`,
        tone: 'warn',
        icon: '🧱',
      };

  return {
    resultado: String(conMerma),
    base:      String(base),
    resumen,
    _insight: insight,
  };
}
