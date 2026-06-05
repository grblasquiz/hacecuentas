/**
 * category-layout — rediseño de las páginas /categoria/<cat>.
 *
 * Aporta 3 cosas, todas data-driven y SIN tocar los JSON de calcs (el sitemap
 * NO se mueve, ver CLAUDE.md regla #3):
 *
 *   1. FEATURED  → fila "Más usadas" (calcs hero curadas por categoría).
 *   2. SUBGROUPS → agrupación de la grilla por sub-tema, con chips de salto.
 *   3. cleanDesc → saca el emoji redundante del arranque de la descripción
 *                  (ya está en el cuadradito de icono de la card).
 *
 * Categorías sin SUBGROUPS caen a grilla plana (comportamiento actual): nada
 * se rompe, sólo no reciben el agrupado todavía. Extender = agregar la entrada.
 */
import { CATEGORY_TITLES } from './category-guide-map';

export interface SubGroup {
  id: string;
  title: string;
  icon: string;
  /** tokens del slug que mandan la calc a este grupo (first-match-wins) */
  kw: string[];
}

/** "Más usadas" — slugs hero por categoría. Vacío/ausente = sin fila destacada. */
export const FEATURED: Record<string, string[]> = {
  viajes: [
    'calculadora-combustible-viaje-auto',
    'calculadora-presupuesto-viaje',
    'calculadora-dividir-gastos-viaje-amigos',
    'calculadora-equipaje-vuelo-kg-lb-limites',
  ],
  finanzas: [
    'calculadora-sueldo-neto-a-bruto',
    'calculadora-aguinaldo-sac',
    'calculadora-indemnizacion-despido',
    'calculadora-monotributo-2026',
  ],
  salud: [
    'calculadora-imc',
    'calculadora-calorias-diarias-tdee',
    'calculadora-semanas-embarazo',
    'calculadora-agua-diaria-recomendada',
  ],
  deportes: [
    'calculadora-descenso-futbol-argentino-promedios',
    'calculadora-maraton-pace-goal-time-split-kilometro',
    'calculadora-1rm-peso-maximo',
    'calculadora-calorias-quemadas-deporte',
  ],
  negocios: [
    'calculadora-margen-ganancia-markup',
    'calculadora-iva-agregar-discriminar',
    'calculadora-punto-equilibrio-break-even',
    'calculadora-costo-laboral-empleado',
  ],
  marketing: [
    'calculadora-roas-retorno-inversion-publicitaria',
    'calculadora-tasa-de-conversion',
    'calculadora-cpc-costo-por-click',
    'calculadora-engagement-rate-redes-sociales',
  ],
  mascotas: [
    'calculadora-edad-perro-anos-humanos',
    'calculadora-alimento-diario-perro',
    'calculadora-peso-ideal-perro-raza',
    'calculadora-edad-gato-anos-humanos',
  ],
  matematica: [
    'calculadora-regla-de-tres-compuesta-directa-inversa',
    'calculadora-porcentaje-de-numero-calculadora',
    'calculadora-ecuacion-cuadratica-formula-resolvente',
    'calculadora-teorema-pitagoras-hipotenusa-cateto',
  ],
  vida: [
    'calculadora-edad-exacta',
    'calculadora-dias-entre-fechas-laborales-habiles-corridos',
    'calculadora-cuanto-falta-Navidad-ano-nuevo',
    'calculadora-dividir-cuenta-propina-amigos',
  ],
};

/** Sub-temas por categoría. Orden = prioridad (first match wins). Catch-all auto. */
export const SUBGROUPS: Record<string, SubGroup[]> = {
  viajes: [
    { id: 'vuelos', title: 'Vuelos y aeropuerto', icon: '✈️', kw: ['vuelo', 'aereo', 'aeropuerto', 'escala', 'conexion', 'check', 'equipaje', 'maletas', 'carry', 'upgrade', 'retraso', 'llegada', 'traslado', 'estacionamiento', 'pasaje', 'avion'] },
    { id: 'millas', title: 'Millas y puntos', icon: '🎟️', kw: ['millas', 'millaje', 'puntos', 'amex', 'skymiles', 'lifemiles', 'mileageplus', 'rewards', 'frecuente', 'canjear'] },
    { id: 'visas', title: 'Visas y trámites', icon: '🛂', kw: ['visa', 'esta', 'eta', 'pasaporte', 'vacuna', 'vacunas', 'requisitos', 'working'] },
    { id: 'combustible', title: 'Combustible y ruta', icon: '⛽', kw: ['combustible', 'gasolina', 'nafta', 'litros', 'peajes', 'autovia', 'remis', 'uber', 'cabify', 'didi', 'kilometros', 'carretera'] },
    { id: 'presupuesto', title: 'Presupuesto y alojamiento', icon: '💰', kw: ['presupuesto', 'mochilero', 'backpacker', 'hotel', 'airbnb', 'hostel', 'coliving', 'dividir', 'alquiler', 'iguazu', 'bariloche', 'mundial', 'lollapalooza', 'esqui', 'emigrar', 'seguro', 'roaming', 'prepaga', 'moneda', 'dolar', 'reembolso', 'reintegro', 'propina', 'transporte', 'impuesto', 'vacaciones'] },
    { id: 'jetlag', title: 'Jet lag, clima y equipaje', icon: '🧳', kw: ['jet', 'lag', 'horaria', 'zona', 'diferencia', 'clima', 'temperatura', 'epoca', 'ideales', 'ropa', 'mochila', 'adaptador', 'enchufe', 'itinerario', 'distancia', 'tiempo'] },
  ],
  finanzas: [
    { id: 'sueldo', title: 'Sueldo y trabajo', icon: '💼', kw: ['sueldo', 'salario', 'neto', 'bruto', 'aguinaldo', 'sac', 'indemnizacion', 'despido', 'preaviso', 'empleado', 'paritaria', 'antiguedad', 'liquidacion', 'licencia', 'extra'] },
    { id: 'impuestos', title: 'Impuestos y monotributo', icon: '🧾', kw: ['monotributo', 'ganancias', 'impuesto', 'iibb', 'iva', 'bienes', 'autonomo', 'autonomos', 'deduccion', 'retencion', 'sellos', 'categoria'] },
    { id: 'prestamos', title: 'Préstamos y créditos', icon: '🏦', kw: ['prestamo', 'credito', 'cuota', 'hipotecario', 'hipoteca', 'uva', 'prendario', 'refinanciacion', 'cft', 'tarjeta'] },
    { id: 'ahorro', title: 'Ahorro y metas', icon: '🐷', kw: ['ahorro', 'fondo', 'fire', 'retiro', 'meta', 'objetivo', 'emergencia', 'oportunidad', 'beca', 'becas', 'duplicar', 'presupuesto'] },
    { id: 'inversiones', title: 'Inversiones, cripto y trading', icon: '📈', kw: ['cripto', 'staking', 'yield', 'rendimiento', 'plazo', 'dolar', 'mep', 'ccl', 'bono', 'fci', 'accion', 'interes', 'bitcoin', 'ethereum', 'usdt', 'inflacion', 'apy', 'apr', 'defi', 'aave', 'compound', 'airdrop', 'mining', 'token', 'tokens', 'wallet', 'stablecoin', 'arbitraje', 'liquidation', 'margin', 'greeks', 'opcion', 'futuros', 'broker', 'trading', 'backtest', 'sharpe', 'drawdown', 'leverage', 'kelly', 'scholes', 'impermanent', 'portfolio', 'nft', 'etf'] },
    { id: 'anses', title: 'ANSES y jubilación', icon: '🏛️', kw: ['anses', 'jubilacion', 'jubilarse', 'auh', 'asignacion', 'moratoria', 'haber', 'pension', 'pnc', 'puam', 'subsidio'] },
    { id: 'inmuebles', title: 'Alquiler e inmuebles', icon: '🏠', kw: ['alquiler', 'inmueble', 'expensas', 'metros', 'propiedad', 'escritura', 'abl'] },
  ],
  salud: [
    { id: 'peso', title: 'Peso y composición corporal', icon: '⚖️', kw: ['imc', 'peso', 'grasa', 'corporal', 'indice', 'masa', 'cintura', 'sobrepeso'] },
    { id: 'nutricion', title: 'Nutrición y calorías', icon: '🥗', kw: ['caloria', 'calorias', 'macros', 'dieta', 'proteina', 'alimento', 'alimentos', 'agua', 'hidratacion', 'deficit', 'tdee', 'bmr', 'metabolismo', 'ayuno', 'vitamina', 'sodio', 'potasio', 'magnesio', 'hierro', 'omega', 'selenio', 'zinc', 'calcio', 'fibra', 'azucar', 'azucares', 'cafeina', 'creatina', 'bcaa', 'electrolitos', 'glucemica', 'carbohidratos', 'oxalatos', 'fructosa'] },
    { id: 'embarazo', title: 'Embarazo y bebé', icon: '🤰', kw: ['embarazo', 'bebe', 'parto', 'ovulacion', 'gestacion', 'fertil', 'semanas', 'lactancia', 'percentil', 'fpp', 'hcg'] },
    { id: 'vitales', title: 'Corazón y signos vitales', icon: '❤️', kw: ['cardiaca', 'frecuencia', 'arterial', 'presion', 'ritmo', 'colesterol', 'glucemia', 'oxigeno', 'creatinina', 'renal', 'glomerular', 'hemoglobina'] },
    { id: 'recuperacion', title: 'Recuperación y descanso', icon: '🛌', kw: ['recuperacion', 'lesion', 'fractura', 'isquiotibial', 'esguince', 'tendinitis', 'pubalgia', 'conmocion', 'sueno', 'dormir', 'acostarme', 'descanso', 'meditacion', 'pomodoro', 'sol'] },
    { id: 'medicacion', title: 'Medicación y dosis', icon: '💊', kw: ['dosis', 'medicamento', 'farmaco', 'insulina', 'paracetamol', 'ibuprofeno', 'alcohol'] },
    { id: 'riesgo', title: 'Tests y riesgo', icon: '🩺', kw: ['riesgo', 'score', 'test', 'diabetes', 'edad'] },
  ],
  deportes: [
    { id: 'futbol', title: 'Fútbol y Mundial', icon: '⚽', kw: ['mundial', 'futbol', 'goles', 'descenso', 'promedio', 'liga', 'league', 'partido', 'fase', 'cupos', 'seleccion', 'ranking', 'premios', 'copa', 'eliminatoria', 'fifa'] },
    { id: 'running', title: 'Running y resistencia', icon: '🏃', kw: ['maraton', 'pace', 'ritmo', 'velocidad', 'distancia', 'vo2', 'carrera', 'corredor', 'split'] },
    { id: 'ciclismo', title: 'Ciclismo y natación', icon: '🚴', kw: ['ciclismo', 'watts', 'natacion', 'ftp', 'potencia', 'pileta', 'bicicleta', 'nadar'] },
    { id: 'fuerza', title: 'Fuerza y gym', icon: '💪', kw: ['1rm', 'fuerza', 'repeticion', 'levantamiento', 'sentadilla', 'press', 'masa'] },
    { id: 'entreno', title: 'Calorías y entrenamiento', icon: '🔥', kw: ['caloria', 'calorias', 'quemadas', 'entrenamiento', 'frecuencia', 'zona', 'padel', 'tenis', 'crossfit'] },
  ],
  negocios: [
    { id: 'precios', title: 'Precios y márgenes', icon: '🏷️', kw: ['margen', 'markup', 'precio', 'iva', 'ganancia', 'costo', 'descuento'] },
    { id: 'metricas', title: 'Métricas y rentabilidad', icon: '📊', kw: ['roi', 'roas', 'break', 'equilibrio', 'churn', 'mrr', 'arr', 'nps', 'ltv', 'cac', 'dso', 'ratio', 'payback'] },
    { id: 'freelance', title: 'Freelance y comisiones', icon: '💼', kw: ['freelance', 'comision', 'deel', 'monotributo', 'factura', 'honorario', 'tarifa', 'uber'] },
    { id: 'operacion', title: 'Operación y equipo', icon: '👥', kw: ['empleado', 'inventario', 'rotacion', 'laboral', 'productividad', 'nomina', 'startup', 'ecommerce'] },
  ],
  marketing: [
    { id: 'creadores', title: 'Creadores y monetización', icon: '🎥', kw: ['youtube', 'instagram', 'tiktok', 'twitch', 'suscriptores', 'views', 'royalties', 'sponsor', 'nicho', 'fund', 'creator', 'patreon', 'blog'] },
    { id: 'ads', title: 'Publicidad y performance', icon: '📈', kw: ['cpm', 'cpc', 'cpa', 'roas', 'roi', 'ads', 'click', 'ctr', 'impresiones', 'alcance', 'presupuesto', 'pago'] },
    { id: 'engagement', title: 'Engagement y conversión', icon: '💬', kw: ['rate', 'tasa', 'conversion', 'engagement', 'open', 'frequency', 'organico', 'redes'] },
  ],
  mascotas: [
    { id: 'edad', title: 'Edad y años humanos', icon: '⏳', kw: ['edad', 'humano', 'humana', 'expectativa', 'senior'] },
    { id: 'comida', title: 'Alimentación y comida', icon: '🍖', kw: ['comida', 'alimento', 'racion', 'gramos', 'cantidad', 'porcion'] },
    { id: 'peso', title: 'Peso ideal y salud', icon: '⚖️', kw: ['peso', 'ideal', 'sobrepeso', 'condicion', 'vacuna', 'vacunas', 'dosis', 'salud', 'desparasitacion'] },
    { id: 'otras', title: 'Acuario y otras mascotas', icon: '🐠', kw: ['acuario', 'pez', 'litros', 'conejo', 'tortuga', 'hamster', 'ave', 'reptil', 'caballo', 'iguana'] },
  ],
  matematica: [
    { id: 'conversion', title: 'Conversión de unidades', icon: '📐', kw: ['conversion', 'convertir', 'metros', 'pulgadas', 'pies', 'kilometros', 'kilogramos', 'litros', 'onzas', 'millas', 'gramos', 'libras', 'celsius', 'fahrenheit', 'grados', 'kmh'] },
    { id: 'geometria', title: 'Geometría', icon: '📏', kw: ['area', 'radio', 'perimetro', 'volumen', 'triangulo', 'circulo', 'pitagoras', 'hipotenusa', 'cuadrado', 'rectangulo', 'cuadrados', 'diagonal'] },
    { id: 'estadistica', title: 'Estadística', icon: '📊', kw: ['mediana', 'moda', 'media', 'promedio', 'desviacion', 'varianza', 'percentil'] },
    { id: 'algebra', title: 'Álgebra y aritmética', icon: '➗', kw: ['regla', 'tres', 'porcentaje', 'ecuacion', 'cuadratica', 'factorial', 'combinatoria', 'mcd', 'mcm', 'progresion', 'interes', 'raiz', 'potencia', 'logaritmo', 'fraccion', 'suma'] },
    { id: 'trigonometria', title: 'Trigonometría', icon: '📐', kw: ['radianes', 'seno', 'coseno', 'tangente', 'angulo', 'trigonometr'] },
  ],
  vida: [
    { id: 'fechas', title: 'Fechas y edad', icon: '📅', kw: ['falta', 'fecha', 'fechas', 'edad', 'cumple', 'cumpleanos', 'dias', 'semana', 'navidad', 'regresiva', 'aniversario', 'antiguedad', 'horario'] },
    { id: 'eventos', title: 'Eventos y celebraciones', icon: '🎉', kw: ['invitado', 'invitados', 'boda', 'casamiento', 'fiesta', 'evento', 'pareja', 'luna', 'regalo', 'torta', 'bebida', 'quince', 'brindis', 'cotillon'] },
    { id: 'hogar', title: 'Hogar y consumo', icon: '🏠', kw: ['hogar', 'agua', 'gas', 'electricidad', 'consumo', 'litros', 'pintura', 'metros', 'ambiente', 'climatizacion', 'mudanza', 'muebles', 'tamano', 'limpieza'] },
    { id: 'plata', title: 'Ahorro y gastos', icon: '💵', kw: ['ahorro', 'presupuesto', 'gasto', 'meta', 'fondo', 'propina', 'dividir', 'cuenta', 'descuento'] },
    { id: 'auto', title: 'Auto y transporte', icon: '🚗', kw: ['auto', 'nafta', 'combustible', 'patente', 'seguro', 'peaje', 'moto', 'kilometros'] },
  ],
};

function norm(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** matchea por token del slug (cortos = igualdad/prefijo, largos = substring) */
function matchKw(slug: string, kw: string[]): boolean {
  const toks = slug.split('-');
  return kw.some((k) =>
    k.length >= 5 ? slug.includes(k) : toks.some((t) => t === k || t.startsWith(k))
  );
}

export interface RenderGroup {
  id: string;
  title: string;
  icon: string;
  calcs: any[];
}

/**
 * Agrupa los calcs de una página por sub-tema. Devuelve null si la categoría
 * no tiene SUBGROUPS o si todo cae en un solo grupo (no vale agrupar).
 */
export function groupCalcs(cat: string, calcs: any[]): RenderGroup[] | null {
  const defs = SUBGROUPS[cat];
  if (!defs || !defs.length) return null;
  const buckets: RenderGroup[] = defs.map((d) => ({ id: d.id, title: d.title, icon: d.icon, calcs: [] }));
  const rest: any[] = [];
  for (const c of calcs) {
    const slug = norm(c.slug || '');
    const hit = defs.findIndex((d) => matchKw(slug, d.kw));
    if (hit >= 0) buckets[hit].calcs.push(c);
    else rest.push(c);
  }
  const out = buckets.filter((b) => b.calcs.length);
  if (rest.length) out.push({ id: 'otras', title: `Más de ${CATEGORY_TITLES[cat] || cat}`, icon: '🧮', calcs: rest });
  return out.length >= 2 ? out : null;
}

/** Resuelve los calcs hero (Más usadas) a partir del catálogo de la categoría. */
export function featuredCalcs(cat: string, all: any[]): any[] {
  const slugs = FEATURED[cat];
  if (!slugs || !slugs.length) return [];
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  return slugs.map((s) => bySlug.get(s)).filter(Boolean);
}

/** Saca el emoji inicial de la descripción (redundante con el icono de la card). */
export function cleanDesc(desc: string): string {
  return (desc || '')
    .replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]+\s*/u, '')
    .trim();
}
