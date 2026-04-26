/** Ahorro mensual usando prompt caching de Anthropic según cache hit y volumen */
export interface Inputs { tokensInputDiarios: number; pctCacheHit: number; modelo: 'sonnet' | 'opus' | 'haiku'; diasPorMes: number; }
export interface Outputs { costoSinCacheUsd: number; costoConCacheUsd: number; ahorroMensualUsd: number; ahorroPct: number; explicacion: string; }
export function promptCachingAnthropicAhorroMensual(i: Inputs): Outputs {
  const tokens = Number(i.tokensInputDiarios);
  const hit = Number(i.pctCacheHit) / 100;
  const dias = Number(i.diasPorMes) || 30;
  if (!tokens || tokens <= 0) throw new Error('Ingresá tokens de input diarios');
  if (hit < 0 || hit > 1) throw new Error('Cache hit rate debe estar entre 0 y 100%');
  // Precios USD por millón tokens input (abril 2026)
  const precios = {
    sonnet: { base: 3, write: 3.75, read: 0.30 },
    opus: { base: 15, write: 18.75, read: 1.50 },
    haiku: { base: 0.80, write: 1.00, read: 0.08 },
  };
  const p = precios[i.modelo] || precios.sonnet;
  const tokensMes = tokens * dias;
  const costoSinCache = (tokensMes / 1_000_000) * p.base;
  // Con cache: write una vez por día (asumimos refresh diario), reads = hit*tokensMes
  const costoWrite = (tokens * dias / 1_000_000) * p.write * (1 - hit);
  const costoRead = (tokensMes * hit / 1_000_000) * p.read;
  const costoBase = (tokensMes * (1 - hit) / 1_000_000) * p.base * 0; // already in write
  const costoConCache = costoWrite + costoRead + costoBase + ((tokensMes * (1 - hit) / 1_000_000) * p.base);
  const ahorro = costoSinCache - costoConCache;
  const ahorroPct = (ahorro / costoSinCache) * 100;
  return {
    costoSinCacheUsd: Number(costoSinCache.toFixed(2)),
    costoConCacheUsd: Number(costoConCache.toFixed(2)),
    ahorroMensualUsd: Number(ahorro.toFixed(2)),
    ahorroPct: Number(ahorroPct.toFixed(1)),
    explicacion: `Con ${(hit * 100).toFixed(0)}% de cache hit en ${i.modelo} ahorrás USD ${ahorro.toFixed(2)}/mes (${ahorroPct.toFixed(1)}%). Costo sin cache: USD ${costoSinCache.toFixed(2)}, con cache: USD ${costoConCache.toFixed(2)}.`,
  };
}
