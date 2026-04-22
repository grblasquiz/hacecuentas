/** Blox Fruits trade value calculator (Update 24, 2026) */
export interface Inputs {
  frutaDa: string;
  frutaRecibe: string;
}

export interface Outputs {
  valorDa: number;
  valorRecibe: number;
  diferencia: number;
  ratio: number;
  veredicto: string;
  resumen: string;
}

// Trade value points (community-based, Update 24 2026)
const VALORES: Record<string, { valor: number; tier: string; nombre: string }> = {
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

export function bloxFruitsTrade(i: Inputs): Outputs {
  const da = VALORES[String(i.frutaDa || '').toLowerCase()];
  const rec = VALORES[String(i.frutaRecibe || '').toLowerCase()];
  if (!da) throw new Error('Fruta que das no encontrada');
  if (!rec) throw new Error('Fruta que recibís no encontrada');

  const diff = rec.valor - da.valor;
  const ratio = da.valor > 0 ? rec.valor / da.valor : 0;
  let veredicto = '';
  if (ratio >= 1.15) veredicto = 'W trade (ganás bastante)';
  else if (ratio >= 1.03) veredicto = 'Slight W (leve ganancia)';
  else if (ratio >= 0.97) veredicto = 'Fair trade (parejo)';
  else if (ratio >= 0.85) veredicto = 'Slight L (leve pérdida)';
  else veredicto = 'L trade (perdés bastante)';

  return {
    valorDa: da.valor,
    valorRecibe: rec.valor,
    diferencia: diff,
    ratio: Number(ratio.toFixed(2)),
    veredicto,
    resumen: `Das **${da.nombre}** (${da.valor}) por **${rec.nombre}** (${rec.valor}). Ratio ${ratio.toFixed(2)}x → **${veredicto}**.`,
  };
}
