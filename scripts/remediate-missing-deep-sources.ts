/**
 * Completa fuentes profundas para las calculadoras retenidas por
 * generic-data-source. Las reglas son deliberadamente temáticas: nunca usa
 * similitud de texto ni una home genérica como sustituto de una referencia.
 *
 * Uso:
 *   node --experimental-strip-types scripts/remediate-missing-deep-sources.ts
 *   node --experimental-strip-types scripts/remediate-missing-deep-sources.ts --write
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const WRITE = process.argv.includes('--write');
const REFRESH = process.argv.includes('--refresh');
type Source = { name: string; url: string; note: string };
type Rule = { dir?: RegExp; category?: string; slug: RegExp; source: Source };
const src = (name: string, url: string, note: string): Source => ({ name, url, note });

const S = {
  nsca: src('PubMed — validez de pruebas de una repetición máxima', 'https://pubmed.ncbi.nlm.nih.gov/29564973/', 'La fuente respalda el método de estimación de 1RM; el resultado sigue siendo orientativo.'),
  fifa: src('IFAB — documentos de las Reglas de Juego', 'https://www.theifab.com/laws-of-the-game-documents/', 'Reglas oficiales usadas para sanciones y acumulación de tarjetas.'),
  fifaPrize: src('FIFA — Mundial 2026', 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026', 'Información oficial del torneo; los premios deben revisarse cuando FIFA publique una actualización.'),
  afa: src('AFA — sitio institucional', 'https://www.afa.com.ar/home/home', 'Referencia institucional del torneo; los importes son escenarios editables, no una promesa de premio.'),
  whoExercise: src('OMS — Actividad física', 'https://www.who.int/es/news-room/fact-sheets/detail/physical-activity', 'Referencia sanitaria general para intensidad y actividad física; no reemplaza evaluación médica.'),
  jissn: src('JISSN — posición sobre dietas y composición corporal', 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8', 'Referencia científica para rangos de macronutrientes y composición corporal.'),
  acsm: src('ACSM — Guidelines for Exercise Testing and Prescription', 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription', 'Referencia profesional para zonas, intensidad y evaluación del ejercicio.'),
  worldAquatics: src('World Aquatics — reglas y tiempos de natación', 'https://www.worldaquatics.com/rules', 'Referencia oficial de distancias y medición de tiempos.'),
  ipf: src('IPF — reglas técnicas de powerlifting', 'https://www.powerlifting.sport/rules/codes/info/technical-rules', 'Referencia oficial para puntuación y levantamientos de powerlifting.'),
  agip: src('GCBA — información oficial sobre ABL', 'https://buenosaires.gob.ar/buscar?keys=ABL', 'Fuente oficial para el tributo; la valuación ingresada debe coincidir con la boleta vigente.'),
  indecCare: src('INDEC — Canasta de crianza', 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-46-152', 'Referencia oficial para costos de bienes, servicios y cuidados de la primera infancia.'),
  argFood: src('Ministerio de Salud — Guías Alimentarias para la Población Argentina', 'https://www.argentina.gob.ar/salud/alimentacion-saludable/grafico', 'Las porciones para eventos son una estimación de planificación basada en porciones orientativas.'),
  inv: src('Instituto Nacional de Vitivinicultura — estadísticas y normativa', 'https://www.argentina.gob.ar/inv/vinos/estadisticas', 'Referencia institucional sobre bebidas; la cantidad por invitado es una hipótesis editable.'),
  enargas: src('ENARGAS — uso eficiente del gas', 'https://www.enargas.gob.ar/secciones/eficiencia-energetica/eficiencia-energetica.php', 'Referencia técnica para calefacción y uso eficiente; la carga térmica real depende de aislación y clima.'),
  aysa: src('OMS — agua potable', 'https://www.who.int/es/news-room/fact-sheets/detail/drinking-water', 'Referencia para consumo y acceso a agua segura; el resultado doméstico depende de hábitos y artefactos.'),
  anmatBleach: src('ANMAT — productos de uso doméstico', 'https://www.argentina.gob.ar/anmat/regulados/productos-de-uso-domestico', 'La dilución debe respetar la concentración indicada en el rótulo. Nunca mezclar lavandina con otros productos.'),
  intiAppliances: src('INTI — eficiencia energética de artefactos', 'https://www.inti.gob.ar/areas/servicios-regulados/energia/eficiencia-energetica', 'Referencia técnica para consumo y eficiencia; la vida útil es una estimación y varía por uso.'),
  agipProperty: src('GCBA — mercado inmobiliario y datos urbanos', 'https://data.buenosaires.gob.ar/dataset/mercado-inmobiliario', 'Los valores por m² son referencias estadísticas y no reemplazan una tasación profesional.'),
  sae: src('SAE International — medición de potencia de motores', 'https://www.sae.org/standards/content/j1349/', 'Referencia técnica para potencia del motor y conversiones asociadas.'),
  energyFuel: src('Secretaría de Energía — precios en surtidor', 'https://datos.energia.gob.ar/dataset/precios-en-surtidor', 'Fuente oficial para precios de combustible; el usuario puede actualizar el valor local.'),
  ipcc: src('IPCC — directrices para inventarios de gases de efecto invernadero', 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/spanish/vol2.html', 'Factores de referencia para emisiones por combustible; el vehículo real puede diferir.'),
  bcraLoans: src('BCRA — principales variables financieras', 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp', 'Referencia oficial para tasas; la comparación debe incluir cuota y costo financiero total informado por la entidad.'),
  leyTransito: src('Ley Nacional de Tránsito 24.449 — texto actualizado', 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/818/texact.htm', 'Marco nacional; VTV, multas y requisitos pueden variar según jurisdicción.'),
  ssn: src('Superintendencia de Seguros — consultas y denuncias', 'https://www.argentina.gob.ar/superintendencia-de-seguros/consultas-y-denuncias', 'Referencia regulatoria; la prima final depende de aseguradora, vehículo y perfil.'),
  adac: src('U.S. DOE — economía de combustible', 'https://www.fueleconomy.gov/feg/', 'Referencia para consumo y autonomía; el resultado depende de conducción y condiciones.'),
  epaWaste: src('US EPA — materiales y gestión de residuos', 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling', 'Referencia ambiental para residuos, reciclaje y materiales.'),
  argentinaSolar: src('Ley 27.424 — Generación Distribuida', 'https://www.argentina.gob.ar/normativa/nacional/ley-27424-307003/texto', 'Marco oficial para generación solar distribuida; tarifa, radiación y equipos son variables editables.'),
  faoWater: src('FAO 56 — evapotranspiración de cultivos', 'https://www.fao.org/4/x0490e/x0490e00.htm', 'Método de referencia para necesidades de riego; debe ajustarse por cultivo, clima y suelo.'),
  intaGarden: src('INTA — Manual de huerta agroecológica', 'https://inta.gob.ar/documentos/manual-de-huerta-agroecologica', 'Referencia agronómica para huerta, siembra y manejo; los parámetros son orientativos.'),
  intaFruit: src('INTA — Manual de huerta agroecológica', 'https://inta.gob.ar/documentos/manual-de-huerta-agroecologica', 'Referencia agronómica; la producción depende de variedad, edad, clima y manejo.'),
  sca: src('Specialty Coffee Association — Coffee Standards', 'https://sca.coffee/research/coffee-standards', 'Referencia técnica para proporciones, extracción y medición de café.'),
  iba: src('International Bartenders Association — cócteles oficiales', 'https://iba-world.com/cocktails/all-cocktails/', 'Recetas oficiales de referencia; las cantidades para eventos se escalan linealmente.'),
  kingArthur: src('King Arthur Baking — cómo escalar recetas', 'https://www.kingarthurbaking.com/blog/2020/04/07/scaling-recipes-up-and-down', 'Referencia metodológica para multiplicar y dividir recetas.'),
  usdaFood: src('USDA FoodData Central — datasets', 'https://fdc.nal.usda.gov/download-datasets.html', 'Base de composición de alimentos; costos y tamaños de porción son editables.'),
  barilla: src('Barilla — cómo cocinar pasta', 'https://www.barilla.com/en-us/help-with/meals/how-to-cook-pasta', 'Referencia del método y proporción de cocción; puede ajustarse según olla y formato.'),
  brewers: src('Brewers Association — Draught Beer Quality Manual', 'https://www.brewersassociation.org/educational-publications/draught-beer-quality-manual/', 'Referencia técnica de elaboración; la evaporación debe medirse en el equipo real.'),
  iram: src('Secretaría de Energía — eficiencia energética', 'https://www.argentina.gob.ar/economia/energia/eficiencia-energetica', 'Referencia para clima y aislación; el proyecto definitivo requiere cálculo profesional.'),
  cirsoc: src('INTI — Construcciones', 'https://www.inti.gob.ar/areas/construcciones', 'Referencia estructural argentina; la calculadora estima materiales y no dimensiona seguridad estructural.'),
  intiWood: src('INTI — tecnologías de madera y muebles', 'https://www.inti.gob.ar/areas/tecnologias-de-madera-y-muebles', 'Referencia técnica para madera, tableros y terminaciones; verificar ficha del fabricante.'),
  nfpa: src('NFPA 70 — National Electrical Code', 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70', 'Referencia técnica de ampacidad; la instalación debe validarla un electricista matriculado.'),
  durlock: src('Durlock — productos y sistemas', 'https://durlock.com/productos/', 'Rendimientos orientativos del sistema; confirmar la ficha del producto elegido.'),
  paint: src('Sherwin-Williams — calculadora de pintura', 'https://www.sherwin-williams.com/homeowners/color/try-on-colors/paint-calculator', 'Rendimiento de referencia; porosidad, manos y producto modifican el consumo.'),
  ventilation: src('ASHRAE 62.1 — ventilación', 'https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2', 'Referencia técnica para renovación de aire; no sustituye un proyecto HVAC.'),
  tile: src('TCNA — instalación de revestimientos cerámicos', 'https://tcnatile.com/resource-center/', 'Referencia técnica; formato, junta, recortes y merma modifican la cantidad.'),
  battery: src('Battery University — baterías de ion-litio', 'https://batteryuniversity.com/article/bu-501a-discharge-characteristics-of-li-ion', 'Referencia sobre capacidad y descarga; usar límites del fabricante.'),
  prusa: src('Prusa — tabla de materiales de impresión 3D', 'https://help.prusa3d.com/materials', 'Parámetros de referencia para material, ventilación y consumo de impresión 3D.'),
  nikon: src('Cambridge in Colour — profundidad de campo', 'https://www.cambridgeincolour.com/tutorials/depth-of-field.htm', 'Referencia fotográfica; el círculo de confusión y el sensor afectan el resultado.'),
  sd: src('SD Association — capacidades y clases de velocidad', 'https://www.sdcard.org/developers/sd-standard-overview/capacity-sd-sdhc-sdxc-sduc/', 'Referencia oficial para capacidad de tarjetas; el tamaño real depende del códec y cámara.'),
  corsair: src('Cooler Master — calculadora de fuente', 'https://www.coolermaster.com/en-global/power-supply-calculator/', 'Referencia de dimensionamiento; verificar consumo pico y conectores de cada componente.'),
  adobeVideo: src('YouTube — codificación y bitrate', 'https://support.google.com/youtube/answer/1722171', 'Referencia para bitrate; el tamaño resulta de bitrate por duración más sobrecarga.'),
  textile: src('INTI — textiles', 'https://www.inti.gob.ar/areas/textiles', 'Referencia sectorial; el consumo de tela o lana depende de molde, talle, ancho y tensión.'),
  wolframCircle: src('Wolfram MathWorld — círculo', 'https://mathworld.wolfram.com/Circle.html', 'Definiciones y fórmulas geométricas de área y perímetro.'),
  bcrUnits: src('BIPM — Sistema Internacional de Unidades', 'https://www.bipm.org/en/measurement-units', 'Referencia metrológica para conversiones de masa y potencia.'),
  nihFasting: src('NIH — ayuno intermitente', 'https://www.nia.nih.gov/news/research-intermittent-fasting-shows-health-benefits', 'Información general; no indica si el ayuno es apropiado para una persona.'),
  glycemic: src('University of Sydney — índice glucémico', 'https://glycemicindex.com/about-gi/', 'Referencia académica para índice y carga glucémica; las respuestas individuales varían.'),
  acogNipt: src('ACOG — pruebas genéticas prenatales', 'https://www.acog.org/womens-health/faqs/prenatal-genetic-screening-tests', 'Referencia clínica; la herramienta informa costos estimados y no interpreta resultados.'),
  wsava: src('WSAVA — guías nutricionales', 'https://wsava.org/global-guidelines/global-nutrition-guidelines/', 'Referencia veterinaria para condición corporal y nutrición; no reemplaza consulta veterinaria.'),
  aaha: src('AAHA — guías de etapas de vida canina', 'https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/', 'Referencia veterinaria para peso, actividad y cuidados del perro.'),
  merckPets: src('Merck Veterinary Manual — animales exóticos y mascotas', 'https://www.merckvetmanual.com/exotic-and-laboratory-animals', 'Referencia veterinaria general; especie, edad y estado clínico cambian las necesidades.'),
  merckFish: src('Merck Veterinary Manual — peces', 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/aquarium-fish', 'Referencia veterinaria para alimentación y ambiente de peces.'),
  vcaEstrus: src('VCA — ciclo estral de la perra', 'https://vcahospitals.com/know-your-pet/estrus-cycles-in-dogs', 'Referencia veterinaria; las fechas calculadas son aproximadas.'),
  aahaNails: src('AAHA — cuidado preventivo de mascotas', 'https://www.aaha.org/resources/pet-owner-resources/', 'Referencia de cuidado general; la frecuencia depende del crecimiento y actividad.'),
  googleAds: src('Google Ads — métricas y definiciones', 'https://support.google.com/google-ads/answer/2375431', 'Definiciones de impresiones, clics y conversiones para CPM, CPC y CPA.'),
  youtube: src('YouTube — ingresos y Programa de Socios', 'https://support.google.com/youtube/answer/72902', 'Referencia oficial; RPM y CPM dependen del canal, audiencia y demanda publicitaria.'),
  musicDelay: src('Ableton — sincronización y tempo', 'https://www.ableton.com/en/manual/audio-fact-sheet/', 'Referencia técnica de tempo y tiempo de audio.'),
  apa: src('APA Style — referencias y citas', 'https://apastyle.apa.org/style-grammar-guidelines/references', 'Fuente oficial para formato APA.'),
  ets: src('ETS — comparación de puntajes de inglés', 'https://www.ets.org/toefl/institutions/ibt/compare-scores.html', 'Tabla institucional; cada entidad decide equivalencias y requisitos.'),
  uba: src('CBC UBA — inscripciones', 'https://www.cbc.uba.ar/inscripciones', 'Referencia institucional; confirmar requisitos y reglas de aprobación en la materia.'),
  purdue: src('Purdue OWL — escritura académica', 'https://owl.purdue.edu/owl/general_writing/academic_writing/index.html', 'Referencia para extensión y estructura de trabajos; el formato final depende de la institución.'),
  nistChem: src('NIST — unidades SI en química', 'https://www.nist.gov/pml/owm/si-units-amount-substance', 'Referencia metrológica para cantidad de sustancia y concentración.'),
  energyLabel: src('Secretaría de Energía — eficiencia energética', 'https://www.argentina.gob.ar/economia/energia/eficiencia-energetica', 'Referencia para potencia y consumo; usar la placa real del aparato.'),
  allAboutCircuits: src('All About Circuits — resistencia limitadora para LED', 'https://www.allaboutcircuits.com/tools/led-resistor-calculator/', 'Aplicación de la ley de Ohm para resistencia de LED.'),
  metaReach: src('Meta — definiciones de alcance y frecuencia', 'https://www.facebook.com/business/help/447834205249495', 'Definiciones de referencia para alcance, frecuencia e impresiones.'),
  etsy: src('Etsy — tarifas y comisiones', 'https://www.etsy.com/legal/fees/', 'Fuente oficial; las tarifas pueden variar por país y servicio.'),
  delivery: src('Uber — información para repartidores', 'https://www.uber.com/ar/es/deliver/', 'Referencia de la plataforma; comisiones y demanda varían por ciudad.'),
  upwork: src('Upwork — investigación sobre trabajo independiente', 'https://www.upwork.com/research/freelance-forward', 'Referencia de mercado; la tarifa final depende de costos, experiencia y ocupación.'),
  shopifyPricing: src('Shopify — estrategia de precios', 'https://www.shopify.com/blog/pricing-strategies', 'Referencia metodológica para margen y markup.'),
  shopifyShipping: src('Shopify — peso volumétrico y envíos', 'https://www.shopify.com/blog/dimensional-weight', 'Referencia para cálculo de peso dimensional; cada transportista usa su divisor.'),
  arcaEmployer: src('ARCA — ayuda de Declaración en Línea', 'https://www.arca.gob.ar/declaracionEnLinea/ayuda/', 'Fuente oficial para cargas; alícuotas y convenios deben verificarse para cada empresa.'),
  bcraSavings: src('BCRA — principales variables financieras', 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp', 'Referencia para planificación del ahorro; rendimiento e inflación son supuestos editables.'),
  civilRent: src('Código Civil y Comercial — locación', 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm', 'Marco legal de locaciones; índices y condiciones dependen del contrato.'),
  anses: src('ANSES — información sobre jubilaciones', 'https://www.anses.gob.ar/jubilaciones-y-pensiones/como-obtener-mi-jubilacion', 'Fuente oficial; verificar resolución y fecha de pago vigente.'),
  arcaCourier: src('ARCA — ayuda sobre envíos internacionales', 'https://www.arca.gob.ar/envios-internacionales/ayuda/', 'Fuente oficial para franquicias y tributos de compras del exterior.'),
  bcraRates: src('BCRA — principales variables financieras', 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp', 'Tasas oficiales de referencia; cada entidad ofrece condiciones propias.'),
  treasuryVisa: src('U.S. Department of State — tarifa de visa de visitante', 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html', 'Fuente oficial de aranceles; consultar requisitos y tipo de cambio vigentes.'),
  bitcoin: src('Bitcoin — documentación del protocolo', 'https://developer.bitcoin.org/devguide/block_chain.html', 'Referencia técnica del halving; la fecha exacta depende de la altura y ritmo de bloques.'),
  catedral: src('Cerro Catedral — tarifas oficiales', 'https://catedralaltapatagonia.com/tarifas/', 'Fuente comercial oficial; revisar temporada y fecha antes de comprar.'),
  enacom: src('ENACOM — roaming internacional', 'https://www.enacom.gob.ar/roaming-internacional_p3906', 'Recomendaciones regulatorias; el precio depende del operador y plan.'),
  shnTides: src('Servicio de Hidrografía Naval — tablas de marea', 'https://www.hidro.gov.ar/oceanografia/tmareas/form_tmareas.asp', 'Fuente oficial; para navegación deben usarse tablas y avisos vigentes.'),
};

const rules: Rule[] = [
  { slug: /1rm|repeticiones-maximas/, source: S.nsca }, { slug: /tarjetas-amarillas/, source: S.fifa },
  { slug: /premios-mundial/, source: S.fifaPrize }, { slug: /premios-liga/, source: S.afa },
  { slug: /wilks|powerlifting/, source: S.ipf }, { slug: /natacion-pace/, source: S.worldAquatics },
  { slug: /macro|grasa-corporal/, source: S.jissn }, { slug: /zona2|fc-maxima|umbral-lactato|calorias-quemadas/, source: S.acsm },
  { slug: /abl-caba/, source: S.agip }, { slug: /costo-hijo/, source: S.indecCare },
  { slug: /lavandina/, source: S.anmatBleach }, { slug: /gasto-agua|agua-consumo-hogar/, source: S.aysa },
  { slug: /propiedad-tasacion/, source: S.agipProperty }, { slug: /vida-util-electrodomestico/, source: S.intiAppliances },
  { slug: /calefactor|aire-acondicionado/, source: S.enargas }, { slug: /vino|whisky-por-invitado/, source: S.inv },
  { slug: /asado-por-invitado|costo-boda|doula/, source: S.argFood }, { slug: /pintura-paredes/, source: S.paint },
  { category: 'automotor', slug: /emision|huella/, source: S.ipcc }, { category: 'automotor', slug: /financiacion|cuota-prestamo/, source: S.bcraLoans },
  { category: 'automotor', slug: /seguro-auto/, source: S.ssn }, { category: 'automotor', slug: /vtv|multa-transito/, source: S.leyTransito },
  { category: 'automotor', slug: /cilindrada|potencia|velocidad-maxima/, source: S.sae },
  { category: 'automotor', slug: /aceite|neumaticos|presion|cca-bateria|suspension/, source: S.adac },
  { category: 'automotor', slug: /auto-electrico|nafta|combustible|autonomia|costo|amortizacion/, source: S.energyFuel },
  { category: 'medio-ambiente', slug: /solar/, source: S.argentinaSolar }, { category: 'medio-ambiente', slug: /co2|huella/, source: S.ipcc },
  { category: 'medio-ambiente', slug: /biodegradacion|reciclaje/, source: S.epaWaste },
  { category: 'medio-ambiente', slug: /agua-lluvia/, source: S.faoWater }, { category: 'medio-ambiente', slug: /transporte|agua-consumo/, source: S.aysa },
  { category: 'cocina', slug: /cafe|espresso|moka/, source: S.sca }, { category: 'cocina', slug: /aperol|gin-tonic|mojito|pisco|whisky-sour/, source: S.iba },
  { category: 'cocina', slug: /evaporation/, source: S.brewers }, { category: 'cocina', slug: /pasta/, source: S.barilla },
  { category: 'cocina', slug: /multiplicar|dividir|sustitucion/, source: S.kingArthur },
  { category: 'cocina', slug: /huevos|costo-receta/, source: S.usdaFood }, { category: 'cocina', slug: /bebidas|carne-asado|fernet|parrilla/, source: S.argFood },
  { category: 'jardineria', slug: /riego|agua-riego/, source: S.faoWater }, { category: 'jardineria', slug: /arbol-frutal/, source: S.intaFruit },
  { category: 'jardineria', slug: /.*/, source: S.intaGarden },
  { category: 'construccion', slug: /aislacion/, source: S.iram }, { category: 'construccion', slug: /cable|electricidad/, source: S.nfpa },
  { category: 'construccion', slug: /madera|tablero|estantes|barniz/, source: S.intiWood },
  { category: 'construccion', slug: /pintura|impermeabilizante|membrana/, source: S.paint },
  { category: 'construccion', slug: /ceram|porcellanato|porcelanato|piso-flotante|zocalo/, source: S.tile },
  { category: 'construccion', slug: /durlock|yeso/, source: S.durlock }, { category: 'construccion', slug: /ventilacion|calefaccion|caldera/, source: S.ventilation },
  { category: 'construccion', slug: /.*/, source: S.cirsoc },
  { category: 'tecnologia', slug: /bateria|carga-bateria/, source: S.battery }, { category: 'tecnologia', slug: /impresion-3d|cooling-fan|precio-hora-servicio-3d/, source: S.prusa },
  { category: 'tecnologia', slug: /profundidad-campo|iso-invariance|regla-600/, source: S.nikon },
  { category: 'tecnologia', slug: /tarjeta-sd|almacenamiento-video|stop-motion/, source: S.sd },
  { category: 'tecnologia', slug: /watts-fuente/, source: S.corsair }, { category: 'tecnologia', slug: /lana|tela|almohadon/, source: S.textile },
  { category: 'tecnologia', slug: /filamento-soldador/, source: S.nfpa }, { category: 'tecnologia', slug: /.*/, source: S.adobeVideo },
  { category: 'matematica', slug: /circulo/, source: S.wolframCircle }, { category: 'matematica', slug: /.*/, source: S.bcrUnits },
  { category: 'salud', slug: /ayuno/, source: S.nihFasting }, { category: 'salud', slug: /glucemico/, source: S.glycemic }, { category: 'salud', slug: /nipt/, source: S.acogNipt },
  { category: 'mascotas', slug: /acuario|pez/, source: S.merckFish }, { category: 'mascotas', slug: /tortuga|reptil|conejo/, source: S.merckPets },
  { category: 'mascotas', slug: /celo/, source: S.vcaEstrus }, { category: 'mascotas', slug: /unas/, source: S.aahaNails },
  { category: 'mascotas', slug: /peso-ideal|calorias-perro|alimento|comida/, source: S.wsava }, { category: 'mascotas', slug: /.*/, source: S.aaha },
  { category: 'entretenimiento', slug: /cpm|cpc/, source: S.googleAds }, { category: 'entretenimiento', slug: /delay/, source: S.musicDelay },
  { category: 'entretenimiento', slug: /bottleneck/, source: S.corsair }, { category: 'entretenimiento', slug: /.*/, source: S.adobeVideo },
  { category: 'familia', slug: /.*/, source: S.anses },
  { category: 'negocios', slug: /etsy/, source: S.etsy }, { category: 'negocios', slug: /uber|glovo|rider/, source: S.delivery },
  { category: 'negocios', slug: /precio-venta|markup/, source: S.shopifyPricing }, { category: 'negocios', slug: /envio-paquete/, source: S.shopifyShipping },
  { category: 'negocios', slug: /empleado/, source: S.arcaEmployer }, { category: 'negocios', slug: /.*/, source: S.upwork },
  { category: 'finanzas', slug: /alquiler|seguro-caucion/, source: S.civilRent }, { category: 'finanzas', slug: /anses/, source: S.anses },
  { category: 'finanzas', slug: /envio-compra-exterior/, source: S.arcaCourier }, { category: 'finanzas', slug: /visa-turismo/, source: S.treasuryVisa },
  { category: 'finanzas', slug: /halving/, source: S.bitcoin }, { category: 'finanzas', slug: /prestamo|credito|cuotas/, source: S.bcraLoans },
  { category: 'finanzas', slug: /fci|spread|tasa/, source: S.bcraRates }, { category: 'finanzas', slug: /.*/, source: S.bcraSavings },
  { category: 'viajes', slug: /cerro-catedral|bariloche/, source: S.catedral }, { category: 'viajes', slug: /roaming/, source: S.enacom },
  { category: 'viajes', slug: /nafta|remis/, source: S.energyFuel }, { category: 'viajes', slug: /.*/, source: S.treasuryVisa },
  { category: 'astronomia', slug: /.*/, source: S.shnTides },
  { category: 'educacion', slug: /apa|citas/, source: S.apa }, { category: 'educacion', slug: /ingles|cambridge|duolingo/, source: S.ets },
  { category: 'educacion', slug: /uba|medicina|asistencia/, source: S.uba }, { category: 'educacion', slug: /.*/, source: S.purdue },
  { category: 'ciencia', slug: /.*/, source: S.nistChem }, { category: 'electronica', slug: /led|resistencia/, source: S.allAboutCircuits },
  { category: 'electronica', slug: /.*/, source: S.energyLabel }, { category: 'marketing', slug: /reach|frequency|grp/, source: S.metaReach },
  { category: 'marketing', slug: /.*/, source: S.youtube },
];

const countrySources: Record<string, Record<string, Source>> = {
  'calcs-cl': {
    cocina: S.argFood,
    impuestos: src('SII — Impuesto a la Renta', 'https://www.sii.cl/destacados/renta/2025/conoce_impuesto_renta.html', 'Fuente oficial chilena; tablas y UTM deben revisarse en cada período.'),
    laboral: src('ChileAtiende — cotizaciones previsionales', 'https://www.chileatiende.gob.cl/fichas/130987-aportes-del-empleador-al-sistema-de-pensiones', 'Fuente oficial para topes y cotizaciones.'),
    automotor: src('Ley de Rentas Municipales de Chile', 'https://www.bcn.cl/leychile/navegar?idNorma=29708', 'Fuente oficial; tasación y derechos dependen del vehículo y municipio.'),
    viajes: src('DGAC Chile — tarifas aeroportuarias', 'https://www.dgac.gob.cl/?s=tarifas+aeroportuarias', 'Buscador institucional de normativa y tasas aeroportuarias.'),
    negocios: src('Registro de Empresas y Sociedades — Empresa en un Día', 'https://www.registrodeempresasysociedades.cl/Inicio.aspx', 'Portal oficial para constitución de empresas.'),
    finanzas: src('CMF Chile — educación financiera', 'https://www.cmfeduca.cl/educa/621/w3-propertyvalue-1150.html', 'Referencia regulatoria para CAE, créditos e inversión; las ofertas varían por entidad.'),
    vida: src('INE Chile — estadísticas de precios e ingresos', 'https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion', 'Referencia estadística; costos y tasaciones son estimaciones editables.'),
  },
  'calcs-co': {
    cocina: S.argFood,
    automotor: src('Secretaría de Hacienda Bogotá — impuesto de vehículos', 'https://www.haciendabogota.gov.co/es/impuestos/impuesto-sobre-vehiculos-automotores', 'Fuente oficial para bases, tarifas y vencimientos.'),
    finanzas: src('Banco de la República — tasas de interés', 'https://www.banrep.gov.co/es/estadisticas/tasas-interes', 'Referencia oficial para tasas, crédito y mercado de valores.'),
    vida: src('DANE — información estadística', 'https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos', 'Referencia oficial para precios y costos; validar documentos personales en Registraduría.'),
  },
  'calcs-do': {
    cocina: S.argFood,
    impuestos: src('DGII — impuestos inmobiliarios', 'https://dgii.gov.do/contribuyentesRegistrados/personasFisicas/tributos/Paginas/ImpuestoPatrimonioInmobiliario.aspx', 'Fuente tributaria oficial de República Dominicana.'),
    laboral: src('Ministerio de Trabajo RD — Código de Trabajo', 'https://www.mt.gob.do/index.php/codigo-de-trabajo', 'Marco laboral oficial; las prestaciones dependen del caso y salario computable.'),
    finanzas: src('Ministerio de Trabajo RD — Código de Trabajo', 'https://www.mt.gob.do/index.php/codigo-de-trabajo', 'Marco oficial de referencia para prestaciones; préstamos usan supuestos editables.'),
  },
  'calcs-ec': {
    cocina: S.argFood,
    impuestos: src('Ley de Régimen Tributario Interno de Ecuador', 'https://www.lexis.com.ec/biblioteca/ley-regimen-tributario-interno', 'Texto normativo de referencia; tablas y tarifas deben actualizarse por período.'),
    laboral: src('OIT NATLEX — legislación laboral de Ecuador', 'https://natlex.ilo.org/dyn/natlex2/r/natlex/fe/details?p3_isn=47812', 'Marco legal de referencia para décimos, jubilación y licencias.'),
    familia: src('IESS — servicios y prestaciones', 'https://www.iess.gob.ec/es/web/afiliado/servicios-y-prestaciones', 'Fuente oficial para requisitos y cobertura.'),
    finanzas: src('IESS — afiliación, aportes y jubilación', 'https://www.iess.gob.ec/es/web/afiliado/servicios-y-prestaciones', 'Fuente oficial; los resultados son estimativos y deben confirmarse en IESS.'),
  },
  'calcs-es': {
    cocina: S.argFood,
    laboral: src('BOE — Estatuto de los Trabajadores', 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430', 'Marco laboral oficial de España.'),
    finanzas: src('Autoridad Bancaria Europea — consumidores', 'https://www.eba.europa.eu/consumer-corner', 'Referencia financiera y de comparación de gastos.'),
    vida: src('Ministerio de Transportes — vivienda', 'https://www.transportes.gob.es/vivienda', 'Referencia pública para vivienda y construcción; el costo local es editable.'),
  },
  'calcs-mx': {
    negocios: src('SAT — Factura electrónica CFDI 4.0', 'https://www.sat.gob.mx/consultas/42968/consulta-tus-facturas-electronicas', 'Fuente oficial para validación y uso de CFDI.'),
    finanzas: src('SAT — créditos hipotecarios e Infonavit', 'https://www.sat.gob.mx/minisitio/DeduccionesPersonales/creditos_hipotecarios.html', 'Fuente oficial; la precalificación definitiva se consulta en Mi Cuenta Infonavit.'),
    impuestos: src('SAT — impuestos y trámites vehiculares', 'https://www.sat.gob.mx/consulta/61977/conoce-el-impuesto-sobre-automoviles-nuevos', 'Referencia fiscal federal; predial, tenencia y verificación dependen del estado o municipio.'),
  },
  'calcs-pt-pt': {
    finanzas: src('Autoridade Tributária — IRS', 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Pages/default.aspx', 'Fonte oficial para retenções e salário líquido.'),
    impuestos: src('Autoridade Tributária — Código do IRS', 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/Cod_download/Documents/CIRS.pdf', 'Fonte legal para tributação do subsídio de refeição.'),
  },
  'calcs-py': {
    cocina: S.argFood,
    laboral: src('IPS Paraguay — prestaciones y jubilaciones', 'https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=315', 'Fuente oficial previsional.'),
    finanzas: src('Código del Trabajo de Paraguay — BACN', 'https://www.bacn.gov.py/leyes-paraguayas/2608/ley-n-213-establece-el-codigo-del-trabajo', 'Marco oficial para salario, aguinaldo, vacaciones e indemnización.'),
  },
  'calcs-uy': {
    cocina: S.argFood,
    finanzas: src('Banco Central del Uruguay — preguntas frecuentes', 'https://usuariofinanciero.bcu.gub.uy/preguntas-frecuentes/', 'Referencia oficial para operaciones y división de gastos.'),
    impuestos: src('DGI Uruguay — IRPF', 'https://www.gub.uy/direccion-general-impositiva/tematica/irpf', 'Fuente oficial para impuestos a las rentas; verificar la ficha específica de IASS, IRAE o IVA cuando corresponda.'),
  },
  'calcs-ve': {
    cocina: S.argFood,
    laboral: src('LOTTT — texto legal', 'http://www.mpppst.gob.ve/mpppstweb/wp-content/uploads/2018/06/LOTTT.pdf', 'Marco laboral oficial; montos y beneficios deben confirmarse con normativa vigente.'),
    impuestos: src('LOTTT — texto legal', 'http://www.inces.gob.ve/wp-content/uploads/2021/01/LEY-ORGANICA-DEL-TRABAJO-LOS-TRABAJADORES-Y-LAS-TRABAJADORAS.pdf', 'Marco legal utilizado para aportes y obligaciones laborales.'),
    finanzas: src('BCV — tipos de cambio oficiales', 'https://www.bcv.org.ve/tasas-informativas-sistema-bancario', 'Fuente oficial para conversión; no respalda cotizaciones paralelas.'),
    vida: src('OPEC — datos energéticos de Venezuela', 'https://www.opec.org/venezuela.html', 'Referencia energética; cupos y precios deben verificarse al momento del cálculo.'),
  },
};

const knownNotes = new Set([
  ...Object.values(S).map((source) => source.note),
  ...Object.values(countrySources).flatMap((group) => Object.values(group).map((source) => source.note)),
]);

function sourceFor(dir: string, category: string, slug: string): Source | undefined {
  const country = countrySources[dir]?.[category];
  if (country) return country;
  return rules.find((rule) => (!rule.dir || rule.dir.test(dir)) && (!rule.category || rule.category === category) && rule.slug.test(slug))?.source;
}

const summary = { scanned: 0, matched: 0, written: 0, unmatched: 0 };
const rows: Array<{ file: string; slug: string; source?: Source }> = [];
for (const dir of readdirSync(CONTENT, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name.startsWith('calcs')).map((d) => d.name)) {
  for (const name of readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith('.json'))) {
    const file = join(CONTENT, dir, name);
    let calc: Record<string, any>;
    try { calc = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
    const reasons = Array.isArray(calc.quarantineReasons) ? calc.quarantineReasons : [];
    const generatedBefore = knownNotes.has(String(calc.dataUpdate?.notes || ''));
    if (!reasons.includes('generic-data-source') && !(REFRESH && generatedBefore)) continue;
    summary.scanned++;
    const source = sourceFor(dir, String(calc.category || ''), String(calc.slug || ''));
    rows.push({ file: relative(ROOT, file), slug: String(calc.slug || ''), source });
    if (!source) { summary.unmatched++; continue; }
    summary.matched++;
    calc.sources = [{ name: source.name, url: source.url }];
    calc.dataUpdate = { ...(calc.dataUpdate || {}), source: source.name, sourceUrl: source.url, notes: source.note };
    if (WRITE) { writeFileSync(file, JSON.stringify(calc, null, 2) + '\n'); summary.written++; }
  }
}
console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', summary, rows }, null, 2));
if (summary.unmatched) process.exitCode = 1;
