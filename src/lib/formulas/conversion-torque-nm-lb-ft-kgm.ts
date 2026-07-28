/** Conversión de torque entre N·m, lb·ft (libra-fuerza pie) y kg·m (kilogramo-fuerza metro).
 *
 *  FACTORES EXACTOS (no redondeados). Definiciones del SI / NIST SP 811:
 *    1 lb (avoirdupois) = 0,45359237 kg          (exacta, por definición)
 *    g_n               = 9,80665 m/s²            (exacta, CGPM 1901 / BIPM)
 *    1 ft              = 0,3048 m                (exacta, por definición)
 *
 *    1 lbf     = 0,45359237 × 9,80665      = 4,4482216152605 N        (exacta)
 *    1 lbf·ft  = 4,4482216152605 × 0,3048  = 1,3558179483314004 N·m   (exacta)
 *    1 kgf·m   = 1 kg × g_n × 1 m          = 9,80665 N·m              (exacta)
 *
 *  ANTES (incorrecto): se usaban cuatro constantes redondeadas e INDEPENDIENTES
 *  —1,356 / 9,807 para ir y 0,738 / 0,102 para volver— que no eran recíprocas
 *  entre sí. Resultado: el round-trip no cerraba. 150 lb·ft → 203,40 N·m →
 *  150,11 lb·ft (error de +0,11 lb·ft, 0,073%). Ahora las inversas se DERIVAN
 *  por división del factor exacto, así que el round-trip cierra siempre.
 */

/** 1 lbf·ft expresado en N·m. Exacto. */
export const NM_POR_LBFT = 1.3558179483314004;
/** 1 kgf·m expresado en N·m. Exacto (g_n = 9,80665 m/s²). */
export const NM_POR_KGFM = 9.80665;

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function conversionTorqueNmLbFtKgm(i: Inputs): Outputs {
  const raw = Number(i.v);
  const v = Number.isFinite(raw) ? raw : 0;
  const d = String(i.de || 'nm');

  let nm: number;
  if (d === 'lbft') nm = v * NM_POR_LBFT;
  else if (d === 'kgm') nm = v * NM_POR_KGFM;
  else nm = v;

  // Inversas DERIVADAS del factor exacto, nunca como constante aparte.
  const lbft = nm / NM_POR_LBFT;
  const kgm = nm / NM_POR_KGFM;

  const insight = {
    title: 'Torque equivalente',
    text: `**${nm.toFixed(1)} Nm** equivalen a **${lbft.toFixed(1)} lb·ft** y **${kgm.toFixed(2)} kg·m**. Respetá el valor de torque del fabricante: apretar de más estría el tornillo y de menos lo afloja.`,
    tone: 'neutral',
    icon: '🔧',
  };

  return {
    nm: `${nm.toFixed(2)} Nm`,
    lbft: `${lbft.toFixed(2)} lb·ft`,
    kgm: `${kgm.toFixed(2)} kg·m`,
    resumen: `${v} ${d} = ${nm.toFixed(1)} Nm.`,
    _insight: insight,
  };
}
