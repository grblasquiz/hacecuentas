/**
 * Diésel vs gasolina — ¿a partir de cuántos km al año compensa el diésel? (España)
 * El diésel suele costar más al comprar pero gasta menos por km. Punto de equilibrio:
 * km que igualan el sobreprecio con el ahorro en combustible durante los años de posesión.
 * Fórmula pura en euros (es-ES).
 */

const fmtEur = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)) + ' €';
const fmtNum = (n: number, dec = 0): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec));

export interface Inputs {
  sobreprecioDiesel: number | string;   // € que cuesta más el diésel al comprar
  consumoDiesel: number | string;        // L/100 km
  consumoGasolina: number | string;      // L/100 km
  precioDiesel?: number | string;        // €/L
  precioGasolina?: number | string;      // €/L
  kmAnuales: number | string;
  aniosPosesion?: number | string;
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sobreprecio = Number(i.sobreprecioDiesel) || 0;
  const consDiesel = Number(i.consumoDiesel) || 0;
  const consGasolina = Number(i.consumoGasolina) || 0;
  const pDiesel = Number(i.precioDiesel) || 1.45;
  const pGasolina = Number(i.precioGasolina) || 1.55;
  const kmAnuales = Number(i.kmAnuales) || 0;
  const anios = Number(i.aniosPosesion) || 5;

  if (consDiesel <= 0 || consGasolina <= 0) throw new Error('Introduce el consumo de ambos coches (L/100 km)');
  if (kmAnuales <= 0) throw new Error('Introduce los kilómetros que haces al año');

  const costeKmDiesel = (consDiesel / 100) * pDiesel;
  const costeKmGasolina = (consGasolina / 100) * pGasolina;
  const ahorroPorKm = costeKmGasolina - costeKmDiesel; // > 0 si el diésel gasta menos

  const kmTotales = kmAnuales * anios;
  const ahorroCombustiblePeriodo = ahorroPorKm * kmTotales;
  const balance = ahorroCombustiblePeriodo - sobreprecio; // > 0 → el diésel compensa

  let kmBreakEvenTotal = Infinity;
  let kmBreakEvenAnual = Infinity;
  if (ahorroPorKm > 0) {
    kmBreakEvenTotal = sobreprecio / ahorroPorKm;
    kmBreakEvenAnual = kmBreakEvenTotal / anios;
  }

  const compensa = ahorroPorKm > 0 && kmAnuales >= kmBreakEvenAnual;
  const veredicto = ahorroPorKm <= 0
    ? 'El gasolina cuesta lo mismo o menos por km con estos datos: no hay ahorro que recupere el sobreprecio del diésel.'
    : compensa
      ? `Con ${fmtNum(kmAnuales)} km/año el diésel SÍ compensa: recuperas el sobreprecio y ahorras ${fmtEur(balance)} en ${fmtNum(anios)} años.`
      : `Con ${fmtNum(kmAnuales)} km/año el diésel NO compensa: necesitarías al menos ${fmtNum(kmBreakEvenAnual)} km/año para amortizar el sobreprecio en ${fmtNum(anios)} años.`;

  const _insight = {
    title: 'Punto de equilibrio diésel vs gasolina',
    text: ahorroPorKm <= 0
      ? `Con tus precios y consumos, el diésel no ahorra por km, así que **el gasolina sale más a cuenta**. El diésel solo compensa cuando su menor consumo cubre el sobreprecio de compra.`
      : `El diésel ahorra **${fmtEur(ahorroPorKm, 3)}/km**. Para recuperar los ${fmtEur(sobreprecio)} de sobreprecio hacen falta **${fmtNum(kmBreakEvenTotal)} km** en total, es decir **${fmtNum(kmBreakEvenAnual)} km/año** durante ${fmtNum(anios)} años. Tú haces ${fmtNum(kmAnuales)} km/año: ${compensa ? 'por encima del umbral, compensa.' : 'por debajo del umbral, no compensa.'}`,
    tone: compensa ? 'good' : 'warn',
    icon: '⛽',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Ahorro combustible', value: Math.round(ahorroCombustiblePeriodo) },
      { label: 'Sobreprecio diésel', value: Math.round(sobreprecio) },
    ],
    ariaLabel: `En ${fmtNum(anios)} años: ahorro en combustible ${fmtEur(ahorroCombustiblePeriodo)} frente a sobreprecio ${fmtEur(sobreprecio)}.`,
  };

  return {
    costeKmDiesel: fmtEur(costeKmDiesel, 3) + '/km',
    costeKmGasolina: fmtEur(costeKmGasolina, 3) + '/km',
    kmBreakEvenAnual: isFinite(kmBreakEvenAnual) ? fmtNum(kmBreakEvenAnual) + ' km/año' : 'No compensa',
    kmBreakEvenTotal: isFinite(kmBreakEvenTotal) ? fmtNum(kmBreakEvenTotal) + ' km' : 'No compensa',
    balancePeriodo: fmtEur(balance),
    veredicto,
    detalle: `Coste diésel ${fmtEur(costeKmDiesel, 3)}/km vs gasolina ${fmtEur(costeKmGasolina, 3)}/km → ahorro ${fmtEur(ahorroPorKm, 3)}/km. Umbral: ${isFinite(kmBreakEvenAnual) ? fmtNum(kmBreakEvenAnual) + ' km/año' : 'no se alcanza'}. En ${fmtNum(anios)} años a ${fmtNum(kmAnuales)} km/año, balance ${fmtEur(balance)}.`,
    _insight,
    _chart,
  };
}
