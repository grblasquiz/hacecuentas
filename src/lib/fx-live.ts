/**
 * Lectura del snapshot FX en vivo desde D1 (tabla `fx_live`), escrito por el
 * cron Worker `hacecuentas-fx-cron`. Lo usan las landings SSR
 * /dolar-hoy-{chile,colombia,mexico,peru}.
 *
 * Devuelve el JSON guardado (misma forma que src/data/live/<pais>.json) con
 * `_meta.fetchedAt` seteado al updated_at de D1, o `null` si no hay dato /
 * falla la lectura → el caller cae al snapshot de build importado.
 */
import { getEnv } from './api-utils';

export async function readFxLive(pais: string): Promise<any | null> {
  try {
    const db = getEnv().DB;
    if (!db) return null;
    const row: any = await db
      .prepare('SELECT data, updated_at FROM fx_live WHERE pais = ?')
      .bind(pais)
      .first();
    if (!row || !row.data) return null;
    const parsed = JSON.parse(row.data as string);
    if (parsed && typeof parsed === 'object') {
      parsed._meta = { ...(parsed._meta || {}), fetchedAt: row.updated_at || parsed._meta?.fetchedAt };
    }
    return parsed;
  } catch {
    return null;
  }
}
