/**
 * Bolívares ↔ Pesos colombianos (frontera Táchira / Cúcuta y remesas a la
 * diáspora en Colombia). No hay un mercado directo Bs/COP líquido, así que la
 * conversión se hace con el DÓLAR como puente:
 *
 *   Bs → COP:  usd = montoBs / tasaBs   →   cop = usd × tasaCop
 *   COP → Bs:  usd = montoCop / tasaCop →   bs  = usd × tasaBs
 *
 * tasaBs = bolívares por dólar (por defecto, el paralelo en vivo del lado
 * venezolano). tasaCop = pesos por dólar (por defecto, la TRM en vivo de
 * Colombia). Ambas son editables porque cambian a diario.
 *
 * Fuentes: BCV / mercado paralelo (Bs.), TRM Superintendencia Financiera de
 * Colombia (COP).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';
import coLive from '../../data/live/colombia.json';

export interface Inputs {
  monto?: number;
  direccion?: string;  // 'bs_a_cop' | 'cop_a_bs'
  tasaBs?: number;     // Bs. por USD (default paralelo en vivo)
  tasaCop?: number;    // COP por USD (default TRM en vivo)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const TRM_FALLBACK = 3233.91; // COP/USD — fallback si el live viene vacío (datos.gov.co, 16-jul-2026)

const fmtCOP = (n: number): string =>
  '$ ' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' COP';

export function compute(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const trmLive = Number((coLive as any)?.trm?.valor) || TRM_FALLBACK;

  const monto = Math.max(0, Number(i.monto) || 0);
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const direccion = String(i.direccion ?? 'bs_a_cop') === 'cop_a_bs' ? 'cop_a_bs' : 'bs_a_cop';
  const tasaBs = i.tasaBs != null && Number(i.tasaBs) > 0 ? Number(i.tasaBs) : fx.paralelo;
  const tasaCop = i.tasaCop != null && Number(i.tasaCop) > 0 ? Number(i.tasaCop) : trmLive;

  // Tasa cruzada directa (informativa).
  const copPorBs = tasaCop / tasaBs;  // cuántos pesos vale 1 bolívar
  const bsPorCop = tasaBs / tasaCop;  // cuántos bolívares vale 1 peso

  let resultado: number;
  let usdPuente: number;
  let narrativa: string;
  let comunes: number[];
  let rows: (string | number)[][];

  if (direccion === 'bs_a_cop') {
    usdPuente = monto / tasaBs;
    resultado = usdPuente * tasaCop;
    narrativa = `${fmtVES(monto)} equivalen a ${fmtCOP(resultado)}, pasando por ${'$ ' + usdPuente.toLocaleString('de-DE', { maximumFractionDigits: 2 })} como puente (tasa ${fmtVES(tasaBs)}/USD, TRM ${tasaCop.toLocaleString('es-CO')} COP/USD). En corto: 1 Bs. ≈ ${copPorBs.toLocaleString('es-CO', { maximumFractionDigits: 2 })} COP.`;
    comunes = [100, 500, 1000, 5000, 10000, 50000];
    rows = comunes.map((b) => [fmtVES(b), fmtCOP((b / tasaBs) * tasaCop)]);
  } else {
    usdPuente = monto / tasaCop;
    resultado = usdPuente * tasaBs;
    narrativa = `${fmtCOP(monto)} equivalen a ${fmtVES(resultado)}, pasando por ${'$ ' + usdPuente.toLocaleString('de-DE', { maximumFractionDigits: 2 })} como puente (TRM ${tasaCop.toLocaleString('es-CO')} COP/USD, tasa ${fmtVES(tasaBs)}/USD). En corto: 1.000 COP ≈ ${(bsPorCop * 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 })} Bs.`;
    comunes = [10000, 20000, 50000, 100000, 200000, 500000];
    rows = comunes.map((c) => [fmtCOP(c), fmtVES((c / tasaCop) * tasaBs)]);
  }

  return {
    resultado: Number(resultado.toFixed(2)),
    montoUsdPuente: Number(usdPuente.toFixed(2)),
    copPorBolivar: Number(copPorBs.toFixed(4)),
    bolivaresPorMilCop: Number((bsPorCop * 1000).toFixed(2)),
    detalle: direccion === 'bs_a_cop'
      ? `${fmtVES(monto)} = ${fmtCOP(resultado)} (vía USD)`
      : `${fmtCOP(monto)} = ${fmtVES(resultado)} (vía USD)`,
    _insight: { type: 'highlight', icon: '🇻🇪🇨🇴', text: narrativa },
    _table: {
      title: direccion === 'bs_a_cop' ? 'Bolívares a pesos colombianos hoy' : 'Pesos colombianos a bolívares hoy',
      headers: direccion === 'bs_a_cop' ? ['Bolívares (Bs.)', 'Pesos (COP)'] : ['Pesos (COP)', 'Bolívares (Bs.)'],
      rows,
      note: `Conversión con el dólar como puente: tasa ${fmtVES(tasaBs)}/USD y TRM ${tasaCop.toLocaleString('es-CO')} COP/USD. Ambas tasas cambian a diario; en la frontera la tasa real puede diferir un poco de la del puente en dólares.`,
    },
  };
}
