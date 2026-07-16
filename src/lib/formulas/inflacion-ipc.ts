/** Actualización por IPC INDEC — cuánto valen hoy $X de fecha anterior */
import ipcSerieData from '../../data/ipc-indec-serie.json';
import inflacionLive from '../../data/live/inflacion.json';

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada?: number;
  /** Variación en puntos porcentuales para escenarios comparativos. */
  ajusteEscenario?: number;
  mesDesde?: string;
  mesHasta?: string;
}
export interface Outputs { montoActualizado: number; incremento: number; factorActualizacion: number; perdidaPoderAdquisitivo: number; _insight?: any; _chart?: any; }

// ── Serie mensual IPC Nacional (nivel general, INDEC) ──────────────────────
// Base: src/data/ipc-indec-serie.json (2017-01 en adelante, planilla oficial
// sh_ipc del INDEC). Los meses recientes se pisan con src/data/live/inflacion.json
// (cron diario → INDEC vía ArgentinaDatos) para que el último dato publicado
// esté siempre disponible aunque la serie estática no se haya regenerado.
const IPC_SERIE: Record<string, number> = {};
for (const r of (ipcSerieData as any).serie as Array<{ mes: string; pct: number }>) {
  if (r && typeof r.mes === 'string' && Number.isFinite(Number(r.pct))) IPC_SERIE[r.mes] = Number(r.pct);
}
for (const r of (((inflacionLive as any).last_12_months as Array<{ fecha: string; valor: number }>) || [])) {
  const key = String(r.fecha).slice(0, 7);
  if (/^\d{4}-\d{2}$/.test(key) && Number.isFinite(Number(r.valor))) IPC_SERIE[key] = Number(r.valor);
}
const IPC_KEYS = Object.keys(IPC_SERIE).sort();

const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function labelMes(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MESES_ES[(m || 1) - 1]} ${y}`;
}

// Inflación acumulada del período: compone los IPC mensuales desde `mesDesde`
// hasta `mesHasta`, ambos INCLUIDOS (misma semántica que la versión anterior
// del calc: enero→mayo 2026 compone ene+feb+mar+abr+may = 14,7%).
function inflationFromPeriod(mesDesde?: string, mesHasta?: string): { pct: number; label: string; meses: number } | null {
  if (!mesDesde || !mesHasta) return null;
  const from = IPC_KEYS.indexOf(mesDesde);
  const to = IPC_KEYS.indexOf(mesHasta);
  if (from === -1 || to === -1 || to < from) return null;

  const keys = IPC_KEYS.slice(from, to + 1);
  const factor = keys.reduce((acc, k) => acc * (1 + IPC_SERIE[k] / 100), 1);
  return {
    pct: (factor - 1) * 100,
    label: `${labelMes(mesDesde)} a ${labelMes(mesHasta)}`,
    meses: keys.length,
  };
}

export function inflacionIpc(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const periodo = inflationFromPeriod(i.mesDesde, i.mesHasta);
  const inflacionBase = periodo ? periodo.pct : Number(i.inflacionAcumulada);
  // Los escenarios tienen que partir del IPC del período seleccionado. Antes
  // modificaban `inflacionAcumulada`, un campo que se ignora cuando hay meses,
  // por lo que las tres tarjetas mostraban exactamente el mismo resultado.
  const ajusteEscenario = Number(i.ajusteEscenario || 0);
  const inflacion = inflacionBase + ajusteEscenario;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (i.mesDesde && i.mesHasta && i.mesDesde !== 'manual' && i.mesHasta !== 'manual' && !periodo) {
    throw new Error('El mes final tiene que ser igual o posterior al mes inicial');
  }
  if (!Number.isFinite(inflacion) || inflacion < 0) throw new Error('Ingresá la inflación acumulada o elegí un período válido');
  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: periodo ? `IPC acumulado: ${periodo.label}` : 'Cuánto valen hoy esos pesos',
    text: `Para igualar el poder de compra de **$${Math.round(monto).toLocaleString('es')}**, hoy necesitás **$${Math.round(actualizado).toLocaleString('es')}** (×${factor.toFixed(2)}). ${periodo ? (ajusteEscenario ? `El IPC INDEC del período seleccionado (${periodo.meses} ${periodo.meses === 1 ? 'mes' : 'meses'}) es **${inflacionBase.toFixed(1)}%**; este escenario aplica ${ajusteEscenario > 0 ? '+' : ''}${ajusteEscenario.toFixed(1)} puntos para comparar.` : `El período seleccionado (${periodo.meses} ${periodo.meses === 1 ? 'mes' : 'meses'}) acumula **${inflacion.toFixed(1)}%** de IPC INDEC (nivel general nacional).`) : 'Usá el IPC acumulado del período que querés medir.'} Quien guardó la plata en el colchón perdió **${perdida.toFixed(1)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto) },
      { label: 'Ajuste por inflación', value: Math.round(incremento) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(actualizado).toLocaleString('es')}`,
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman $${Math.round(actualizado).toLocaleString('es')}`,
  };

  return {
    montoActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    factorActualizacion: Number(factor.toFixed(2)),
    perdidaPoderAdquisitivo: Number(perdida.toFixed(2)),
    _insight,
    _chart,
  };
}
