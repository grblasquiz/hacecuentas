import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué número necesito para mi juego?"
 *
 * Arquetipo RAMIFICADO: cada `case` es un juego con su propia matemática. Las
 * cuatro ramas comparten la misma pregunta de fondo — "el juego me tira un
 * número y no sé qué hacer con él" — pero cada una usa sus propios campos.
 * El panel de campos los muestra todos con el juego adelante en la etiqueta;
 * la rama elegida decide cuáles entran al cálculo.
 *
 * Absorbe 4 calculadoras (ver `replaces`):
 *   - portal-nether-overworld       → coordenadas de portal Minecraft (÷8 / ×8)
 *   - iv-pokemon-go                 → IV estimado por CP, HP y polvo estelar
 *   - rankeo-elo-puntos             → variación de ELO tras una partida
 *   - blox-fruits-trade             → valor de trade (W / fair / L)
 *
 * EXTENSIONES sobre las fórmulas originales (documentadas en el reporte):
 *   1. Minecraft: además de la conversión, el gráfico ubica la Y del portal en
 *      la escala de alturas seguras del Nether (bedrock, mar de lava, zona
 *      recomendada, techo) — el error clásico es construir a Y=30.
 *   2. Minecraft: se muestra el radio de enlace (128 bloques en el Nether) y
 *      cuánto camino del Overworld te ahorra el viaje.
 *   3. Blox Fruits: valor del trade en puntos por cada 100 que entregás, para
 *      comparar propuestas de tamaños distintos.
 *   La matemática de las cuatro fórmulas originales queda intacta.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata en ninguna rama. El resultado declara `format:'plain'` y
 *    TODAS las filas declaran el suyo: el runtime hace Object.assign y una fila
 *    sin `format` propio se imprime en pesos.
 *  - Gráfico `scale` posicional: cada rama devuelve sus propias franjas con
 *    `from`/`to`, más `position` (0-100) y `positionLabel`.
 *  - Los valores de trade de Blox Fruits son copia fiel de la tabla de
 *    `src/lib/formulas/blox-fruits-trade.ts` (Update 24). Son valores de
 *    comunidad, no oficiales del juego: caducan con cada update.
 */

/** Tabla de valores de trade. Copia fiel de blox-fruits-trade.ts (Update 24). */
export const FRUTAS: Record<string, { valor: number; tier: string; nombre: string }> = {
  'kitsune': { valor: 5000, tier: 'Mythical', nombre: 'Kitsune' },
  'dragon-true': { valor: 4500, tier: 'Mythical', nombre: 'Dragon (True Form)' },
  'leopard': { valor: 3700, tier: 'Mythical', nombre: 'Leopard' },
  'dough': { valor: 3200, tier: 'Mythical', nombre: 'Dough' },
  'dragon-east': { valor: 2400, tier: 'Legendary', nombre: 'Dragon (East)' },
  'venom': { valor: 2100, tier: 'Mythical', nombre: 'Venom' },
  'shadow': { valor: 1900, tier: 'Legendary', nombre: 'Shadow' },
  'control': { valor: 1700, tier: 'Mythical', nombre: 'Control' },
  'spirit': { valor: 1500, tier: 'Mythical', nombre: 'Spirit' },
  'gravity': { valor: 1100, tier: 'Legendary', nombre: 'Gravity' },
  'mammoth': { valor: 950, tier: 'Legendary', nombre: 'Mammoth' },
  'phoenix': { valor: 900, tier: 'Legendary', nombre: 'Phoenix' },
  'rumble': { valor: 850, tier: 'Legendary', nombre: 'Rumble' },
  'portal': { valor: 850, tier: 'Legendary', nombre: 'Portal' },
  'pain': { valor: 800, tier: 'Legendary', nombre: 'Pain' },
  'blizzard': { valor: 780, tier: 'Legendary', nombre: 'Blizzard' },
  'sound': { valor: 720, tier: 'Legendary', nombre: 'Sound' },
  'buddha': { valor: 650, tier: 'Legendary', nombre: 'Buddha' },
  'quake': { valor: 620, tier: 'Legendary', nombre: 'Quake' },
  'love': { valor: 580, tier: 'Legendary', nombre: 'Love' },
  'spider': { valor: 500, tier: 'Rare', nombre: 'Spider' },
  'magma': { valor: 460, tier: 'Rare', nombre: 'Magma' },
  'ghost': { valor: 400, tier: 'Rare', nombre: 'Ghost' },
  'door': { valor: 350, tier: 'Rare', nombre: 'Door' },
  'light': { valor: 280, tier: 'Rare', nombre: 'Light' },
  'diamond': { valor: 200, tier: 'Rare', nombre: 'Diamond' },
  'dark': { valor: 180, tier: 'Rare', nombre: 'Dark' },
  'ice': { valor: 150, tier: 'Rare', nombre: 'Ice' },
  'sand': { valor: 140, tier: 'Rare', nombre: 'Sand' },
  'revive': { valor: 130, tier: 'Rare', nombre: 'Revive' },
  'flame': { valor: 90, tier: 'Uncommon', nombre: 'Flame' },
  'smoke': { valor: 80, tier: 'Uncommon', nombre: 'Smoke' },
  'bomb': { valor: 70, tier: 'Uncommon', nombre: 'Bomb' },
  'spike': { valor: 60, tier: 'Uncommon', nombre: 'Spike' },
  'spring': { valor: 50, tier: 'Common', nombre: 'Spring' },
  'chop': { valor: 40, tier: 'Common', nombre: 'Chop' },
  'bomba': { valor: 35, tier: 'Common', nombre: 'Bomba' },
  'blade': { valor: 30, tier: 'Common', nombre: 'Blade' },
  'rocket': { valor: 25, tier: 'Common', nombre: 'Rocket' },
  'spin': { valor: 20, tier: 'Common', nombre: 'Spin' },
};

/** Polvo estelar → rango de niveles. Copia fiel de iv-pokemon-go.ts. */
export const DUST_LEVELS: Array<{ dust: number; min: number; max: number }> = [
  { dust: 200, min: 1, max: 2.5 }, { dust: 400, min: 3, max: 4.5 },
  { dust: 600, min: 5, max: 6.5 }, { dust: 800, min: 7, max: 8.5 },
  { dust: 1000, min: 9, max: 10.5 }, { dust: 1300, min: 11, max: 12.5 },
  { dust: 1600, min: 13, max: 14.5 }, { dust: 1900, min: 15, max: 16.5 },
  { dust: 2200, min: 17, max: 18.5 }, { dust: 2500, min: 19, max: 20.5 },
  { dust: 3000, min: 21, max: 22.5 }, { dust: 3500, min: 23, max: 24.5 },
  { dust: 4000, min: 25, max: 26.5 }, { dust: 4500, min: 27, max: 28.5 },
  { dust: 5000, min: 29, max: 30.5 }, { dust: 6000, min: 31, max: 32.5 },
  { dust: 7000, min: 33, max: 34.5 }, { dust: 8000, min: 35, max: 36.5 },
  { dust: 9000, min: 37, max: 38.5 }, { dust: 10000, min: 39, max: 40 },
];

/** Multiplicadores CPM conocidos. Copia fiel de iv-pokemon-go.ts. */
export const CPM: Record<string, number> = {
  '1': 0.094, '5': 0.29024988, '10': 0.4225, '15': 0.51739395, '20': 0.5974,
  '25': 0.667934, '30': 0.7317, '35': 0.76156384, '40': 0.7903,
};

/** Relación de escala entre dimensiones y radio de enlace de portales. */
export const MC = { ratio: 8, radioNether: 128, radioOverworld: 1024, techoNether: 128 };

const OPCIONES_FRUTAS = Object.entries(FRUTAS).map(([value, f]) => ({
  value,
  label: `${f.nombre} (${f.tier}) — ${f.valor}`,
}));

export const hub: HubData = {
  slug: 'ocio/numeros-de-videojuegos',
  title: 'Calculadoras de videojuegos: portal Nether, IV de Pokémon GO, ELO y trades',
  description:
    'Los cuatro números que el juego no te da masticados: coordenadas para alinear un portal del Nether, IV estimado de un Pokémon GO, cuánto ELO ganás o perdés en una partida y si un trade de Blox Fruits es W o L.',
  silo: 'Ocio',
  siloHref: '/ocio',

  eyebrow: 'Ocio · Números de videojuegos',
  h1: '¿Qué número necesito para mi juego?',
  lede:
    'Todos estos juegos te muestran un número crudo y te dejan solo: coordenadas que no coinciden, un CP que no dice si el Pokémon sirve, un rating que sube o baja sin explicación, un trade que no sabés si te conviene. Elegí el juego y sacá la cuenta con la fórmula real, no con la intuición.',
  stamps: [
    'Minecraft · Pokémon GO · ajedrez y gaming · Blox Fruits',
    'Fórmulas oficiales del juego donde existen',
    'Reemplaza 4 calculadoras sueltas',
  ],

  resultLabel: 'El número que buscabas',

  cases: {
    title: '¿En qué juego estás?',
    intro:
      'Cada juego usa su propia matemática. Elegí el tuyo y completá abajo sólo los campos que llevan su nombre: los demás quedan ignorados.',
    items: [
      {
        id: 'minecraft',
        label: 'Minecraft — alinear un portal del Nether',
        hint: 'Tenés unas coordenadas y querés que los dos portales se enlacen.',
        answer: 'Dividí X y Z entre 8 para bajar al Nether, multiplicá por 8 para subir',
        yes: [
          'La relación es 1:8 en X y en Z: un bloque del Nether son ocho del Overworld.',
          'La Y no se escala: se conserva, pero conviene construir entre Y=70 y Y=120.',
          'Construí los DOS portales en las coordenadas calculadas para que se enlacen sin sorpresas.',
          'Si un portal ya existe a menos de 128 bloques (Nether) del punto de llegada, el juego te manda a ese.',
        ],
        warn: [
          'Si sólo encendés el portal de un lado, el juego te genera el otro donde quiere. Por eso se construyen los dos a mano.',
          'Construir el portal del Nether abajo de Y=31 te deja en el mar de lava o pegado al bedrock.',
          'La conversión Overworld → Nether redondea hacia abajo: −801 ÷ 8 da −101, no −100.',
        ],
        plazo: 'Antes de encender el portal, anotá las cuatro coordenadas: X, Y, Z del origen y X, Z del destino.',
      },
      {
        id: 'pokemon',
        label: 'Pokémon GO — estimar el IV de un Pokémon',
        hint: 'Querés saber si conviene potenciarlo o transferirlo.',
        answer: 'El IV se estima con CP, HP y el polvo estelar de potenciación',
        yes: [
          'El polvo estelar acota el nivel del Pokémon; el HP acota el IV de estamina; el CP cierra el resto.',
          'El IV va de 0 a 45 (tres valores de 0 a 15). 45/45 es el "hundo", el 100 %.',
          'Arriba de 82 % ya sirve para Liga Súper o Ultra; arriba de 96 % es candidato a PvE de incursiones.',
          'El appraisal del propio juego confirma el rango exacto: usá esta cuenta para filtrar antes de abrirlo uno por uno.',
        ],
        warn: [
          'Es una estimación con rango, no el IV exacto: con un solo CP hay varias combinaciones posibles.',
          'Para PvP de Liga Súper el IV alto NO es lo mejor: conviene ataque bajo y defensa/estamina altos.',
          'Los stats base son de la especie, no de tu Pokémon: buscalos en la Pokédex antes de calcular.',
        ],
        plazo: 'Revisalo antes de gastar polvo estelar: potenciar un Pokémon de IV bajo es la forma más común de tirar recursos.',
      },
      {
        id: 'elo',
        label: 'Ajedrez y gaming — cuánto ELO gano o pierdo',
        hint: 'Querés saber cuántos puntos mueve una partida antes de jugarla.',
        answer: 'Ganás K × (resultado − probabilidad esperada)',
        yes: [
          'La probabilidad esperada sale sólo de la diferencia de rating: E = 1 / (1 + 10^((rival − vos)/400)).',
          '400 puntos de diferencia significan 10 a 1 de probabilidad: el favorito gana 10 de cada 11.',
          'Ganarle a alguien mucho peor casi no suma; perder contra alguien mucho peor cuesta caro.',
          'El factor K decide la volatilidad: 32 es el estándar de Lichess y Chess.com para partidas rated.',
        ],
        warn: [
          'El ELO es de suma cero entre los dos jugadores sólo si ambos usan el mismo K.',
          'Glicko (el que usa Lichess de verdad) agrega una desviación de rating: los números reales pueden diferir en las primeras partidas.',
          'K=40 para menores de 18 o con menos de 30 partidas; K=10 para élite FIDE.',
        ],
        plazo: 'Mirá la probabilidad esperada ANTES de la partida: es la que te dice si vale la pena arriesgar el rating.',
      },
      {
        id: 'bloxfruits',
        label: 'Blox Fruits — ¿este trade es W o L?',
        hint: 'Te ofrecen una fruta por la tuya y querés saber si salís ganando.',
        answer: 'Compará el valor de comunidad de las dos frutas y mirá el ratio',
        yes: [
          'El ratio es lo que recibís dividido lo que das: arriba de 1,15 es W claro, abajo de 0,85 es L claro.',
          'Entre 0,97 y 1,03 el trade es parejo: la diferencia está dentro del ruido de la tabla.',
          'Los valores son de comunidad y se mueven con cada update: usalos como referencia, no como precio fijo.',
          'Permanent vale bastante más que la fruta física de la misma especie.',
        ],
        warn: [
          'Los valores cambian con cada update del juego. Si pasó una actualización grande, la tabla puede estar desfasada.',
          'La demanda importa tanto como el valor: una fruta cara pero que nadie quiere es difícil de mover.',
          'Cuidado con los scams de "confía y te la paso después": el juego no tiene sistema de custodia.',
        ],
        plazo: 'Chequeá el valor de las dos frutas antes de aceptar: los trades no se pueden deshacer.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu partida',
  inputsIntro:
    'Completá sólo los campos del juego que elegiste arriba: cada etiqueta lleva el nombre del juego adelante. Los demás quedan afuera del cálculo.',
  fields: [
    {
      id: 'mcDireccion',
      label: 'Minecraft — dirección de la conversión',
      type: 'select',
      value: 'overworld-to-nether',
      options: [
        { value: 'overworld-to-nether', label: 'Overworld → Nether (÷ 8)' },
        { value: 'nether-to-overworld', label: 'Nether → Overworld (× 8)' },
      ],
    },
    { id: 'mcX', label: 'Minecraft — coordenada X', type: 'number', value: 1500, step: 1 },
    {
      id: 'mcY',
      label: 'Minecraft — coordenada Y (altura)',
      type: 'number',
      value: 64,
      step: 1,
      help: 'En el Nether conviene Y=70 a 120 para quedar sobre el mar de lava.',
    },
    { id: 'mcZ', label: 'Minecraft — coordenada Z', type: 'number', value: -800, step: 1 },

    { id: 'pgCp', label: 'Pokémon GO — CP del Pokémon', type: 'number', value: 1823, min: 10, max: 10000, step: 1 },
    { id: 'pgHp', label: 'Pokémon GO — HP máximo', type: 'number', value: 115, min: 1, max: 999, step: 1 },
    {
      id: 'pgPolvo',
      label: 'Pokémon GO — polvo estelar para potenciar',
      type: 'number',
      value: 4000,
      min: 200,
      max: 10000,
      step: 100,
      help: 'Es el costo que muestra el botón de potenciar. Acota el nivel del Pokémon.',
    },
    {
      id: 'pgAtkBase',
      label: 'Pokémon GO — ataque base de la especie',
      type: 'number',
      value: 263,
      min: 10,
      max: 400,
      step: 1,
      help: 'Los tres stats base son de la especie, no de tu Pokémon. Buscalos en la Pokédex o en PokémonGO Hub.',
    },
    { id: 'pgDefBase', label: 'Pokémon GO — defensa base de la especie', type: 'number', value: 198, min: 10, max: 400, step: 1 },
    { id: 'pgHpBase', label: 'Pokémon GO — estamina (HP) base de la especie', type: 'number', value: 209, min: 10, max: 400, step: 1 },

    { id: 'eloPropio', label: 'ELO — tu rating actual', type: 'number', value: 1200, min: 0, max: 5000, step: 1 },
    { id: 'eloRival', label: 'ELO — rating del rival', type: 'number', value: 1350, min: 0, max: 5000, step: 1 },
    {
      id: 'eloResultado',
      label: 'ELO — resultado de la partida',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Victoria' },
        { value: '0.5', label: 'Empate' },
        { value: '0', label: 'Derrota' },
      ],
    },
    {
      id: 'eloK',
      label: 'ELO — factor K',
      type: 'number',
      value: 32,
      min: 1,
      max: 128,
      step: 1,
      help: 'K=32 es el estándar de Lichess y Chess.com. K=40 para sub-18 o menos de 30 partidas; K=20 arriba de 2400; K=10 élite FIDE.',
    },

    { id: 'bfDoy', label: 'Blox Fruits — fruta que DAS', type: 'select', value: 'dragon-east', options: OPCIONES_FRUTAS },
    { id: 'bfRecibo', label: 'Blox Fruits — fruta que RECIBÍS', type: 'select', value: 'leopard', options: OPCIONES_FRUTAS },
  ],
  fineprint:
    'Los valores de trade de Blox Fruits son de comunidad y caducan con cada update del juego. El IV de Pokémon GO es una estimación con rango: el appraisal del juego es la fuente definitiva. Las fórmulas de Minecraft y de ELO son exactas.',

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La escala cambia con el juego: la altura segura del portal en Minecraft, la calidad del IV en Pokémon GO, tu probabilidad de ganar en ELO y el ratio del trade en Blox Fruits.',
  },
  breakdownTitle: 'El detalle de la cuenta',
  breakdownIntro:
    'Cada rama muestra sus propios números: los intermedios arriba y el resultado destacado. Si cambiaste de juego y ves valores raros, revisá que hayas completado los campos de ESE juego.',

  faq: [
    {
      q: '¿Cómo se calculan las coordenadas de un portal del Nether?',
      a: 'Para bajar al Nether, dividís X y Z entre 8 y redondeás hacia abajo; la Y se conserva. Para subir al Overworld, multiplicás X y Z por 8. Si estás en X=1500, Z=−800 del Overworld, el portal del Nether va en X=187, Z=−100. Construí los dos a mano en esas coordenadas.',
    },
    {
      q: '¿Por qué mi portal del Nether me deja en otro lado?',
      a: 'Porque encendiste sólo uno de los dos. Cuando entrás a un portal y del otro lado no hay ninguno dentro del radio de búsqueda (128 bloques en el Nether, 1024 en el Overworld), el juego te genera uno donde puede. Construí ambos portales vos en las coordenadas calculadas y el enlace queda fijo.',
    },
    {
      q: '¿A qué altura conviene construir el portal en el Nether?',
      a: 'Entre Y=70 y Y=120. Abajo de Y=31 estás en el mar de lava o pegado al bedrock, y arriba de Y=127 no podés construir porque es el techo del Nether. La Y no se divide entre 8: se conserva tal cual, así que si tu portal del Overworld está en Y=64, en el Nether te conviene subirlo a mano.',
    },
    {
      q: '¿Cuánto camino ahorra viajar por el Nether?',
      a: 'Siete octavos. Como cada bloque del Nether vale ocho del Overworld, recorrer 1.000 bloques arriba equivale a caminar 125 abajo. Por eso las autopistas de Nether son el transporte estándar en cualquier mundo grande: reducen el viaje al 12,5 % de la distancia.',
    },
    {
      q: '¿Qué es el IV en Pokémon GO y cómo se calcula?',
      a: 'Son tres valores ocultos de 0 a 15 (ataque, defensa y estamina) que suman hasta 45. Se estiman al revés: el polvo estelar acota el nivel, el nivel da el multiplicador CPM, el HP visible despeja el IV de estamina y el CP cierra el resto. Como una misma combinación de CP y HP puede salir de varios IV, el resultado siempre es un rango.',
    },
    {
      q: '¿A partir de qué porcentaje de IV vale la pena potenciar un Pokémon?',
      a: 'Para PvE de incursiones, arriba de 82 % ya rinde y arriba de 96 % es candidato a potenciar a tope. Para PvP de Liga Súper la lógica se invierte: conviene ataque BAJO con defensa y estamina altas, así que un 100 % suele ser peor que un IV mediocre bien repartido.',
    },
    {
      q: '¿Cómo se calcula cuánto ELO gano o pierdo en una partida?',
      a: 'Con la fórmula de Arpad Elo: primero la probabilidad esperada E = 1 / (1 + 10^((rating del rival − tu rating) / 400)), después el cambio = K × (resultado − E), donde el resultado vale 1 por victoria, 0,5 por empate y 0 por derrota. Con K=32, ganarle a un rival 150 puntos mejor te da unos +22.',
    },
    {
      q: '¿Qué significa el factor K del ELO?',
      a: 'Es cuánto se mueve el rating por partida. K alto hace que el sistema reaccione rápido pero el rating oscile; K bajo lo estabiliza pero tarda en reflejar una mejora real. El estándar es 32 en Lichess y Chess.com, 40 para jugadores nuevos o sub-18, 20 arriba de 2400 y 10 para la élite FIDE.',
    },
    {
      q: '¿Por qué gano tan pocos puntos cuando le gano a alguien peor?',
      a: 'Porque el sistema ya esperaba que ganaras. Si tu probabilidad esperada es 90 %, ganar te suma K × (1 − 0,9) = 3,2 puntos con K=32, pero perder te resta K × (0 − 0,9) = 28,8. La asimetría es el corazón del ELO: premia lo improbable y castiga lo que no debía pasar.',
    },
    {
      q: '¿Cómo sé si un trade de Blox Fruits es W o L?',
      a: 'Dividí el valor de lo que recibís por el valor de lo que das. Arriba de 1,15 es W claro, entre 1,03 y 1,15 es una leve ganancia, entre 0,97 y 1,03 es parejo, y abajo de 0,85 es L claro. Los valores de referencia son de comunidad, no oficiales, así que sirven como orientación.',
    },
    {
      q: '¿Cada cuánto cambian los valores de trade de Blox Fruits?',
      a: 'Con cada update grande. Una fruta que entra al meta puede duplicar su valor en semanas, y una que recibe un nerf se desploma. Los valores de esta tabla corresponden al Update 24: si el juego ya pasó a uno nuevo, tomalos como referencia histórica y contrastá con la comunidad.',
    },
    {
      q: '¿Sirve la misma fórmula de ELO para juegos que no son ajedrez?',
      a: 'La base sí. Sistemas de matchmaking de shooters, de juegos de pelea y de deportes online arrancan del mismo modelo logístico. La diferencia está en los agregados: Glicko suma una desviación de rating para los jugadores nuevos, y TrueSkill de Xbox extiende la idea a equipos. Para una estimación rápida, el ELO clásico alcanza.',
    },
  ],

  sources: [
    { name: 'Nether portal — mecánica de enlace y relación 1:8', url: 'https://minecraft.wiki/w/Nether_portal', publisher: 'Minecraft Wiki' },
    { name: 'The Nether — dimensión, altura y techo', url: 'https://minecraft.wiki/w/The_Nether', publisher: 'Minecraft Wiki' },
    { name: 'Individual values (IV) y CP multiplier en Pokémon GO', url: 'https://bulbapedia.bulbagarden.net/wiki/Individual_values', publisher: 'Bulbapedia' },
    { name: 'Appraisal system — cómo el juego informa el IV', url: 'https://pokemongolive.com/', publisher: 'Niantic — Pokémon GO' },
    { name: 'FIDE Handbook — Rating Regulations (fórmula de Elo y factor K)', url: 'https://handbook.fide.com/chapter/B022022', publisher: 'FIDE' },
    { name: 'Lichess rating system (Glicko-2) — documentación', url: 'https://lichess.org/faq#ratings', publisher: 'Lichess' },
    { name: 'Blox Fruits — frutas y sistema de trade', url: 'https://blox-fruits.fandom.com/wiki/Blox_Fruits_Wiki', publisher: 'Blox Fruits Wiki' },
  ],

  replaces: [
    '/calculadora-portal-nether-overworld-minecraft',
    '/calculadora-iv-pokemon-go-cp-nivel',
    '/calculadora-rankeo-elo-puntos',
    '/calculadora-blox-fruits-valor-trade',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};
