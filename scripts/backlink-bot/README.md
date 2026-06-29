# Backlink Bot autónomo

Genera backlinks a hacecuentas.com **solo**: elige temas reales del site, escribe una nota única,
la publica en plataformas con API abierta (sin login, sin CAPTCHA), arma un hub crawlable para que
se indexe, y se verifica. Sin humano.

## Comandos

```bash
cd scripts/backlink-bot
python3 bot.py run          # un ciclo (lo que corre el cron)
python3 bot.py run --dry    # simula, no publica (test)
python3 bot.py verify       # re-chequea links vivos/caídos
python3 bot.py report       # estado del pipeline
```

## Cómo funciona

1. **Topics** (`config.json` → `topics_source: auto`): baja 400 slugs reales de
   `https://hacecuentas.com/api/calcs-slim.json`. Cae al `topics_seed` si no hay red.
2. **Spinner** (`spinner.py`): nota corta y única (template + variación), 1 link contextual,
   **anchor rotado** (~40% marca / 30% URL desnuda / 30% genérico — anti-footprint).
3. **Publishers** (`publishers/`): cada uno postea vía API y devuelve la URL viva.
   - `telegraph` (telegra.ph, **tier 1**) — API oficial, sin login. ✅ `<a>` real dofollow indexable.
   - `graphorg` (graph.org, tier 2) — mismo motor, dominio distinto. ✅ idem.
   - `writeas` — **OFF**: devuelve el markdown sin renderizar (link en texto plano, no es backlink).
   - `rentry` — **OFF**: la página es `noindex` (el link no pasa nada).

   > **27 plataformas sin-login probadas** (`probe_platforms.py`): solo Telegraph (telegra.ph +
   > graph.org) da `<a>` real + dofollow + indexable. El resto = texto plano, nofollow, noindex,
   > o exige login. Es el techo real del canal autónomo. El probe es reusable para sumar candidatas.
4. **Tiers**: tier1 apunta a hacecuentas; tier2 apunta a los tier1 vivos (les pasa jugo y los
   empuja a indexar sin ensuciar el perfil directo del site).
5. **Indexer** (`indexer.py`): reconstruye un hub en Telegraph que enlaza todo lo publicado →
   los crawlers lo siguen. (Los pings de Google/Bing están muertos desde 2024; el hub es la
   palanca real.)
6. **Verify** (`verify.py`): confirma que el `<a>` al target sigue vivo + dofollow/nofollow.
7. **DB** (`backlinks.db`, SQLite): una fila por link, estados
   `published → verified_live | dead | failed`.

## Seguridad (en código, no opcional)

`config.json → caps`: **velocidad creciente** desde `install_date`. Mes 1: 1 tier1 + 4 tier2 por
día; sube 50%/mes con techo (6 tier1 / 25 tier2 por día). El bot **no publica por encima del cap**
— clave para no disparar la bandera de spam en un dominio joven.

> Nota honesta: estos links (Web 2.0 sin login) son de **bajo valor SEO** por sí solos; Google los
> descuenta. El valor está en el **volumen controlado + estructura en capas + indexación**, no en
> cada link suelto. Es complemento, no reemplazo de los links editoriales ganados.

## Activar el modo autónomo (cron diario)

```bash
cp scripts/backlink-bot/com.hacecuentas.backlink-bot.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.hacecuentas.backlink-bot.plist
# correr ya mismo una vez:
launchctl start com.hacecuentas.backlink-bot
# ver el log:
tail -f scripts/backlink-bot/bot.log
# desactivar:
launchctl unload ~/Library/LaunchAgents/com.hacecuentas.backlink-bot.plist
```

Una vez cargado corre 1x/día a las 11:00 para siempre. El cap interno limita el volumen.

## Estado actual (primer test)

5 backlinks verificados vivos: 1 telegra.ph (tier1→hacecuentas) + 2 graph.org + 2 write.as
(tier2→tier1). Hub: telegra.ph/Calculadoras-y-finanzas--índice-de-notas.
