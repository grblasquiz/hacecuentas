export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

/**
 * Toy count recommendation by developmental stage
 *
 * Based on:
 * - University of Toledo (2017): toddlers with 4 toys vs. 16 — 4-toy group played
 *   twice as long and more creatively (Infant Behavior and Development).
 * - AAP "Selecting Appropriate Toys for Young Children in the Digital Era" (Pediatrics, 2019).
 * - NAEYC "Good Toys for Young Children by Age and Stage".
 * - Montessori toy-rotation consensus: 4–8 accessible toys at once with 2-4 week rotations.
 *
 * Method: for each developmental stage we define an evidence-based range of toys to have
 * accessible at once (min_toys, max_toys) and a rotation interval in weeks. The
 * "play_space" modifier adjusts slightly for available room (small bedroom vs. playroom).
 * The formula returns:
 *   - resultado: recommended accessible toy count (midpoint, adjusted)
 *   - min_toys / max_toys: research-backed range
 *   - rotacion_semanas: recommended rotation period
 *   - categorias_recomendadas: comma-separated list of toy categories for the stage
 *   - resumen: human-readable takeaway
 */

interface StageData {
  label_es: string;
  label_en: string;
  minToys: number;
  maxToys: number;
  rotationWeeks: number;
  categories_es: string[];
  categories_en: string[];
  insight_es: string;
  insight_en: string;
}

const STAGES: Record<string, StageData> = {
  '0_6': {
    label_es: '0–6 meses (bebé)',
    label_en: '0–6 months (infant)',
    minToys: 3,
    maxToys: 4,
    rotationWeeks: 2,
    categories_es: ['Sonajeros y mordillos', 'Móviles y juguetes de colgar', 'Libros de tela o baño', 'Pelotas blandas sensoriales'],
    categories_en: ['Rattles and teethers', 'Mobiles and hanging toys', 'Cloth/bath books', 'Soft sensory balls'],
    insight_es: 'Los bebés de 0–6 meses tienen un rango atencional de apenas 3–5 minutos por objeto. Con 3–4 juguetes accesibles a la vez evitás la sobreestimulación sensorial, que puede causar llanto y dificultad para dormirse.',
    insight_en: 'Babies 0–6 months have an attention span of just 3–5 minutes per object. With 3–4 accessible toys you avoid sensory overload, which can cause fussiness and trouble sleeping.',
  },
  '7_12': {
    label_es: '7–12 meses (gateador)',
    label_en: '7–12 months (crawler)',
    minToys: 4,
    maxToys: 6,
    rotationWeeks: 2,
    categories_es: ['Apiladores y encajables', 'Pelotas de distintas texturas', 'Libros de cartón grueso', 'Juguetes de arrastre y presión', 'Cucharas y recipientes de cocina'],
    categories_en: ['Stacking and nesting toys', 'Textured balls', 'Board books', 'Push-pull toys', 'Safe kitchen cups/spoons'],
    insight_es: 'A esta edad el juego exploratorio-sensoriomotor alcanza su pico. 4–6 juguetes permiten exploración sin agobio; la rotación cada 2 semanas mantiene la novedad sin gasto extra.',
    insight_en: 'Exploratory sensorimotor play peaks at this age. 4–6 toys allow exploration without overwhelm; rotating every 2 weeks maintains novelty without extra spending.',
  },
  '1_2': {
    label_es: '1–2 años (caminador)',
    label_en: '1–2 years (toddler walker)',
    minToys: 4,
    maxToys: 8,
    rotationWeeks: 2,
    categories_es: ['Bloques de construcción grandes', 'Juguetes de arrastre con ruedas', 'Encajables y rompecabezas de 2–4 piezas', 'Juguetes de empuje/equilibrio', 'Instrumentos musicales simples'],
    categories_en: ['Large building blocks', 'Pull/push ride-on toys', 'Shape sorters and 2–4 piece puzzles', 'Balance push toys', 'Simple musical instruments'],
    insight_es: 'El estudio de la Universidad de Toledo (2017) mostró que toddlers con 4 juguetes jugaban el doble de tiempo que con 16. Apuntá a 4–8 accesibles y rotá el resto.',
    insight_en: 'The University of Toledo study (2017) showed toddlers with 4 toys played twice as long as those with 16. Aim for 4–8 accessible and rotate the rest.',
  },
  '2_3': {
    label_es: '2–3 años (toddler)',
    label_en: '2–3 years (toddler)',
    minToys: 5,
    maxToys: 8,
    rotationWeeks: 3,
    categories_es: ['Juego simbólico (cocina, herramientas)', 'Plasticina y masa de modelar', 'Rompecabezas de 6–12 piezas', 'Libros ilustrados con rimas', 'Vehículos de empuje', 'Bloques de construcción medianos'],
    categories_en: ['Pretend play sets (kitchen, tools)', 'Play dough / modeling clay', '6–12 piece puzzles', 'Picture books with rhymes', 'Push vehicles', 'Medium building blocks'],
    insight_es: 'A los 2–3 años el juego simbólico explota: imitar cocinar, cuidar un bebé o "arreglar" cosas es clave para el lenguaje y la empatía. 5–8 juguetes cubren todas las categorías sin saturar.',
    insight_en: 'At 2–3 years pretend play explodes: imitating cooking, caring for a doll, or "fixing" things is key for language and empathy. 5–8 toys cover all categories without overwhelming.',
  },
  '3_5': {
    label_es: '3–5 años (preescolar)',
    label_en: '3–5 years (preschool)',
    minToys: 6,
    maxToys: 10,
    rotationWeeks: 3,
    categories_es: ['Juegos de roles y disfraz', 'LEGO DUPLO o bloques de construcción', 'Rompecabezas de 20–60 piezas', 'Arte y manualidades (pinturas, arcilla)', 'Juego al aire libre (pelota, aro)', 'Libros de cuentos'],
    categories_en: ['Role play and dress-up', 'LEGO DUPLO or building sets', '20–60 piece puzzles', 'Art and crafts (paints, clay)', 'Outdoor play (ball, hoop)', 'Storybooks'],
    insight_es: 'La AAP señala que en preescolar el juego libre con juguetes abiertos (bloques, arte, juego de roles) desarrolla habilidades ejecutivas más eficazmente que los juguetes electrónicos. 6–10 tipos cubren todas las áreas del desarrollo.',
    insight_en: 'The AAP notes that in preschool, free play with open-ended toys (blocks, art, role play) builds executive function more effectively than electronic toys. 6–10 types cover all developmental areas.',
  },
  '6_8': {
    label_es: '6–8 años (escolar temprano)',
    label_en: '6–8 years (early school age)',
    minToys: 6,
    maxToys: 10,
    rotationWeeks: 4,
    categories_es: ['Juegos de mesa cooperativos', 'Sets de LEGO o construcción', 'Arte y ciencia (kits de experimentos)', 'Deportes y movimiento (bicicleta, pelota)', 'Colecciones (cartas, figuras)', 'Libros de aventuras o humor'],
    categories_en: ['Cooperative board games', 'LEGO or construction sets', 'Art and science kits', 'Sports and movement (bike, ball)', 'Collections (cards, figures)', 'Adventure or humor books'],
    insight_es: 'A los 6–8 años los juegos de mesa cooperativos son especialmente valiosos: desarrollan turnos, estrategia, gestión de la frustración y trabajo en equipo. Rotá cada 4 semanas para mantener el interés.',
    insight_en: 'At 6–8 years, cooperative board games are especially valuable: they build turn-taking, strategy, frustration tolerance, and teamwork. Rotate every 4 weeks to maintain interest.',
  },
  '9_11': {
    label_es: '9–11 años (escolar tardío)',
    label_en: '9–11 years (late school age)',
    minToys: 5,
    maxToys: 10,
    rotationWeeks: 4,
    categories_es: ['Juegos de estrategia (ajedrez, Catan Junior)', 'Kits de ciencia y robótica', 'Sets de arte avanzado', 'Juegos de equipo al aire libre', 'Colecciones especializadas', 'Libros de aventura o no-ficción'],
    categories_en: ['Strategy games (chess, Catan Junior)', 'Science and robotics kits', 'Advanced art sets', 'Team outdoor games', 'Specialized collections', 'Adventure or non-fiction books'],
    insight_es: 'En esta etapa los niños empiezan a profundizar en intereses específicos. 5–10 elementos activos (según el hobby) con rotación mensual equilibra profundidad y variedad.',
    insight_en: 'At this stage children start deepening specific interests. 5–10 active items (depending on the hobby) with monthly rotation balances depth and variety.',
  },
  '12_plus': {
    label_es: '12+ años (preadolescente)',
    label_en: '12+ years (pre-teen)',
    minToys: 4,
    maxToys: 8,
    rotationWeeks: 6,
    categories_es: ['Hobbies especializados (manualidades, música, código)', 'Juegos de estrategia compleja', 'Deportes de equipo o individuales', 'Kits de ciencia avanzados', 'Libros y medios creativos'],
    categories_en: ['Specialized hobbies (crafts, music, coding)', 'Complex strategy games', 'Team or individual sports', 'Advanced science kits', 'Books and creative media'],
    insight_es: 'A los 12+ años los "juguetes" ceden paso a herramientas de hobby e intereses profundos. Menos objetos con mayor profundidad es más motivador que una colección amplia y superficial.',
    insight_en: 'At 12+ years "toys" give way to hobby tools and deep interests. Fewer objects with greater depth is more motivating than a broad, shallow collection.',
  },
};

// Space modifier: small bedroom reduces range by 1; playroom/shared space keeps midpoint; garden/outdoor adds 1
const SPACE_MODIFIER: Record<string, number> = {
  pequeno: -1,
  mediano: 0,
  grande: 1,
};

export function cuantosJuguetesNinoEdadDesarrollo(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');
  const isEs = __lang !== 'en';

  const etapa = String(i.etapa || '3_5');
  const espacio = String(i.espacio || 'mediano');
  const numNinos = Math.max(1, Math.min(5, Number(i.num_ninos) || 1));

  const stage = STAGES[etapa] || STAGES['3_5'];
  const spaceMod = SPACE_MODIFIER[espacio] ?? 0;

  // Adjust range for number of children: each additional child adds 1-2 toys to the accessible set
  const childBonus = numNinos > 1 ? Math.round((numNinos - 1) * 1.5) : 0;

  const minAdjusted = Math.max(2, stage.minToys + spaceMod + childBonus);
  const maxAdjusted = Math.max(minAdjusted + 1, stage.maxToys + spaceMod + childBonus);
  const midpoint = Math.round((minAdjusted + maxAdjusted) / 2);

  const categorias = isEs ? stage.categories_es : stage.categories_en;
  const categoriasStr = categorias.slice(0, Math.min(categorias.length, maxAdjusted)).join(', ');

  const stageLabel = isEs ? stage.label_es : stage.label_en;

  let resultado: string;
  let resumen: string;
  let insightText: string;

  if (isEs) {
    resultado = `${minAdjusted}–${maxAdjusted} juguetes accesibles a la vez`;
    resumen =
      `Para ${numNinos > 1 ? `${numNinos} niños` : 'tu hijo'} en la etapa ${stageLabel}, ` +
      `se recomiendan **${minAdjusted} a ${maxAdjusted} juguetes** accesibles al mismo tiempo, ` +
      `con una rotación cada **${stage.rotationWeeks} semanas**. ` +
      `Categorías prioritarias: ${categoriasStr}.`;
    insightText = stage.insight_es +
      ` Rotación cada ${stage.rotationWeeks} semanas renueva el interés sin comprar más.`;
  } else {
    resultado = `${minAdjusted}–${maxAdjusted} accessible toys at a time`;
    resumen =
      `For ${numNinos > 1 ? `${numNinos} children` : 'your child'} at the ${stageLabel} stage, ` +
      `we recommend **${minAdjusted} to ${maxAdjusted} accessible toys** at any one time, ` +
      `with rotation every **${stage.rotationWeeks} weeks**. ` +
      `Priority categories: ${categoriasStr}.`;
    insightText = stage.insight_en +
      ` Rotating every ${stage.rotationWeeks} weeks keeps interest fresh without buying more.`;
  }

  return {
    resultado,
    min_toys: minAdjusted,
    max_toys: maxAdjusted,
    rotacion_semanas: stage.rotationWeeks,
    categorias_recomendadas: categoriasStr,
    resumen,
    _insight: {
      title: isEs ? `Recomendación para ${stageLabel}` : `Recommendation for ${stageLabel}`,
      text: insightText,
      tone: 'positive',
      icon: '🧸',
    },
  };
}
