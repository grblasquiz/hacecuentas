/** Referencia mensual oficial; los snapshots históricos permanecen separados. */
import snapshot from '../../data/live/anses.json' with { type: 'json' };
export const ANSES_VIGENTE = Object.freeze(snapshot);
