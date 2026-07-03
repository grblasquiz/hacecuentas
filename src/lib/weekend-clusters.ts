/**
 * Config central de clusters temáticos de FIN DE SEMANA (Fase 12 del plan finde).
 *
 * Cada cluster agrupa calcs de una misma intención de ocio. `master` es la
 * herramienta ancla (la que conviene destacar/ampliar); `members` son las
 * satélite/complementarias. El script `scripts/apply-weekend-links.ts` usa esto
 * para poblar `relatedSlugs` de cada calc de forma que:
 *   - el master enlaza a todos sus members (inbound para las huérfanas),
 *   - cada member enlaza al master + hermanos (cohesión temática).
 *
 * TODOS los valores son el campo `slug` (NO el filename — en este cluster
 * filename ≠ slug ≠ formulaId). Validado contra la colección viva.
 *
 * También es la fuente de verdad para el hub /calculadoras-fin-de-semana y para
 * el módulo WeekendRecommendations. No agregar slugs sin verificar que existan.
 */

export type WeekendCluster = {
  /** id estable del cluster */
  key: string;
  /** slug de la herramienta ancla (destacada en el hub) */
  master: string;
  /** slugs de las calcs complementarias */
  members: string[];
};

export const WEEKEND_CLUSTERS: WeekendCluster[] = [
  { key: 'asado', master: 'calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo', members: [
    'calculadora-chorizos-por-invitado-asado',
    'calculadora-empanadas-por-persona-evento-asado-cumple',
    'calculadora-tamano-parrilla-personas-m2',
    'calculadora-cantidad-hamburguesas-parrilla-cumpleanos',
  ] },
  { key: 'bebidas-evento', master: 'calculadora-cerveza-invitado-evento', members: [
    'calculadora-vino-por-invitado-horas-evento',
    'calculadora-vino-por-invitado-cena',
    'calculadora-agua-por-invitado-fiesta',
    'calculadora-fernet-cola-por-invitado-juntada',
    'calculadora-whisky-por-invitado-evento',
    'calculadora-bebidas-evento-litros-por-persona',
    'calculadora-gaseosa-por-invitado-cumple-infantil',
  ] },
  { key: 'presupuesto-evento', master: 'calculadora-presupuesto-cumpleanos', members: [
    'calculadora-costo-fiesta-cumpleanos-infantil-invitados',
    'calculadora-cumpleanos-invitados-gastar-torta-regalos',
    'calculadora-presupuesto-cumple-15-quinceanera',
    'calculadora-presupuesto-graduacion',
    'calculadora-costo-boda-argentina',
    'calculadora-presupuesto-casamiento-por-invitado',
    'calculadora-meseros-necesarios-invitados',
    'calculadora-vajilla-alquiler-invitados',
    'calculadora-sillas-mesas-invitados',
    'calculadora-invitaciones-cumple-numero',
    'calculadora-cotillon-cumple-personas',
    'calculadora-regalos-invitado-souvenir',
  ] },
  { key: 'comida-invitados', master: 'calculadora-pizza-por-invitado-porciones', members: [
    'calculadora-empanadas-por-persona-evento-asado-cumple',
    'calculadora-canape-por-invitado-coctel',
    'calculadora-fiambre-queso-por-invitado-picada',
    'calculadora-torta-personas-kg-porciones',
    'calculadora-helado-litros-por-evento-invitados-tipos',
    'calculadora-bocadillos-por-invitado-evento-coffee-break',
    'calculadora-sushi-piezas-por-persona-evento-cumpleanos',
  ] },
  { key: 'cocina-conversores', master: 'calculadora-conversion-medidas-cocina-tazas-gramos', members: [
    'calculadora-conversor-tazas-a-mililitros',
    'calculadora-conversion-peso-volumen-ingredientes-cocina',
    'calculadora-conversion-cucharaditas-gramos-especias-sal',
    'calculadora-equivalencia-huevos-tamano-gramos-claras',
    'calculadora-huevos-por-receta-comensales',
    'calculadora-sustitucion-ingredientes-cocina',
    'calculadora-multiplicar-dividir-receta-porciones',
  ] },
  { key: 'cocina-cafe', master: 'calculadora-cafe-ratio-agua-gramos-metodo-preparacion', members: [
    'calculadora-cafe-french-press-ratio',
    'calculadora-proporcion-cafe-agua-metodo-preparacion',
    'calculadora-cafe-molido-taza-metodo-preparacion',
    'calculadora-moka-pot-agua-cafe',
    'calculadora-cold-brew-ratio',
    'calculadora-espresso-tds-yield',
  ] },
  { key: 'cocina-horno', master: 'calculadora-temperatura-horno-celsius-fahrenheit-gas', members: [
    'calculadora-conversor-fahrenheit-a-celsius-horno',
    'calculadora-conversion-temperaturas-horno-gas-electrico',
    'calculadora-leudado-pan-levadura-tiempo-temperatura',
    'calculadora-tiempo-fermentacion-masa-temperatura',
  ] },
  { key: 'cocina-porciones', master: 'calculadora-multiplicar-dividir-receta-porciones', members: [
    'calculadora-porciones-arroz-por-persona-guarnicion',
    'calculadora-porcion-arroz-gramos-personas',
    'calculadora-porciones-pasta-seca-persona-hambre',
    'calculadora-porciones-sushi-por-persona-promedio',
  ] },
  { key: 'viajes-combustible', master: 'calculadora-costo-viaje-combustible-kilometros', members: [
    'calculadora-costo-por-kilometro-auto',
    'calculadora-consumo-nafta-litros-100km',
    'calculadora-autonomia-tanque-combustible',
    'calculadora-consumo-combustible-km-litro',
    'calculadora-autonomia-tanque-lleno-kilometros',
    'calculadora-costo-peaje-ruta',
    'calculadora-comparar-nafta-vs-gnc-ahorro',
    'calculadora-emision-co2-auto-combustible',
  ] },
  { key: 'viajes-presupuesto', master: 'calculadora-presupuesto-viaje', members: [
    'calculadora-presupuesto-viaje-madrid',
    'calculadora-presupuesto-viaje-rio-janeiro',
    'calculadora-presupuesto-viaje-dubai',
    'calculadora-presupuesto-viaje-lima-peru',
    'calculadora-presupuesto-viaje-santiago-chile',
    'calculadora-vacaciones-bariloche-presupuesto-7-dias-familia',
    'calculadora-presupuesto-diario-mochilero-ciudad',
    'calculadora-dias-ideales-viaje-destino',
  ] },
  { key: 'hogar-pintura', master: 'calculadora-pintura-por-m2-litros-latas', members: [
    'calculadora-conversor-litros-pintura-por-metro-cuadrado',
    'calculadora-m2-pared-descontando-aberturas-pintura',
    'calculadora-rollos-empapelado-papel-pared',
  ] },
  { key: 'hogar-pisos', master: 'calculadora-piso-flotante-m2-tablas', members: [
    'calculadora-pisos-ceramicos-porcellanato-cajas',
    'calculadora-ceramicos-m2-cajas',
    'calculadora-azulejos-baldosas-metros-cuadrados-cantidad',
    'calculadora-pegamento-ceramicas-bolsas-m2-area',
    'calculadora-zocalo-metros-lineal',
    'calculadora-deck-madera-tablas-tornillos',
    'calculadora-madera-necesaria-mueble',
  ] },
  { key: 'hogar-jardin', master: 'calculadora-siembra-calendario-argentina-zona', members: [
    'calculadora-calendario-siembra-hemisferio-norte',
    'calculadora-calendario-siembra-hemisferio-sur',
    'calculadora-cesped-semillas-kg-m2',
    'calculadora-pasto-semilla-kg-m2-cesped-sembrar',
    'calculadora-semillas-por-m2-huerta',
    'calculadora-cosecha-esperada-huerta-kg',
    'calculadora-distancia-entre-plantas-espaciado',
    'calculadora-riego-goteo-litros-hora-planta',
    'calculadora-agua-riego-plantas-dia',
  ] },
  { key: 'hogar-pileta', master: 'calculadora-costo-mensual-pileta', members: [
    'calculadora-piscina-cloro-mantenimiento-mensual-litros-tamano',
    'calculadora-tiempo-evaporacion-piscina-litros-dia',
    'calculadora-pileta-natacion-litros-m3',
  ] },
  { key: 'entretenimiento-ocio', master: 'calculadora-maraton-serie-tiempo', members: [
    'calculadora-anime-tiempo-bingear-temporadas-episodios-horas',
    'calculadora-horas-peliculas-serie-inmersion-idioma',
    'calculadora-playlist-duracion-canciones',
    'calculadora-karaoke-canciones-por-hora',
    'calculadora-puzzle-1000-piezas-tiempo-promedio-dificultad',
    'calculadora-tiempo-completar-juego-horas',
    'calculadora-lectura-velocidad-paginas-hora-wpm',
  ] },
  { key: 'mascotas-presupuesto', master: 'calculadora-comida-perro-diaria-gramos', members: [
    'calculadora-comida-gato-diaria-gramos',
    'calculadora-costo-mensual-mascota-perro-gato',
    'calculadora-minutos-paseo-perro-raza-edad',
    'calculadora-paseos-perro-minutos-raza-energia',
    'calculadora-tamano-cucha-perro-medidas',
    'calculadora-arena-sanitaria-gato-kg-mes',
    'calculadora-edad-perro-humano',
  ] },
];
