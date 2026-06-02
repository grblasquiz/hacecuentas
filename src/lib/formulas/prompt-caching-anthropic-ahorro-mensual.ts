/** Ahorro mensual usando prompt caching de Anthropic según cache hit y volumen */
export interface Inputs { tokensInputDiarios: number; pctCacheHit: number; modelo: 'sonnet' | 'opus' | 'haiku'; diasPorMes: number; }
export interface Outputs { costoSinCacheUsd: number; costoConCacheUsd: number; ahorroMensualUsd: number; ahorroPct: number; explicacion: string; _insight?: any; _chart?: any; }
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

  const ahorroAnual = ahorro * 12;
  const hitPct = Math.round(hit * 100);
  const tone: 'good' | 'warn' | 'neutral' = ahorroPct >= 1 ? 'good' : ahorroPct <= -1 ? 'warn' : 'neutral';
  const texto = ahorroPct >= 1
    ? `Con **${hitPct}% de cache hit** en ${i.modelo} recortás **USD ${ahorro.toFixed(2)}/mes** (**${ahorroPct.toFixed(1)}%**), unos USD ${ahorroAnual.toFixed(0)} al año. Subir el hit rate aprieta aún más el costo.`
    : ahorroPct <= -1
      ? `Con apenas **${hitPct}% de cache hit** el caching te sale **USD ${Math.abs(ahorro).toFixed(2)}/mes más caro**: a hit bajo, el sobreprecio de escritura (1,25×) no se compensa. Cacheá solo prompts que se reusen mucho.`
      : `Con **${hitPct}% de cache hit** el ahorro es marginal (USD ${ahorro.toFixed(2)}/mes). El caching recién rinde fuerte cuando el mismo contexto se reutiliza muchas veces.`;

  const _insight = {
    title: 'Ahorro con prompt caching',
    text: texto,
    tone,
    icon: '💸',
  };

  // Donut solo si hay ahorro real: costo con cache + ahorro = costo sin cache
  const _chart = ahorro > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Costo con cache', value: Number(costoConCache.toFixed(2)) },
      { label: 'Ahorro', value: Number(ahorro.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: 'USD ' + costoSinCache.toFixed(2),
    centerLabel: 'Sin cache',
    ariaLabel: `Del costo sin cache de USD ${costoSinCache.toFixed(2)}, USD ${ahorro.toFixed(2)} se ahorran con caching`,
  } : undefined;

  return {
    costoSinCacheUsd: Number(costoSinCache.toFixed(2)),
    costoConCacheUsd: Number(costoConCache.toFixed(2)),
    ahorroMensualUsd: Number(ahorro.toFixed(2)),
    ahorroPct: Number(ahorroPct.toFixed(1)),
    explicacion: `Con ${(hit * 100).toFixed(0)}% de cache hit en ${i.modelo} ahorrás USD ${ahorro.toFixed(2)}/mes (${ahorroPct.toFixed(1)}%). Costo sin cache: USD ${costoSinCache.toFixed(2)}, con cache: USD ${costoConCache.toFixed(2)}.`,
    _insight,
    _chart,
  };
}
