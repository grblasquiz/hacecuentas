# Backlink Bot autónomo — spec

Bot que **crea backlinks a hacecuentas.com solo**, sin humano, sin contactar a nadie.
Corre en cron (launchd), una vez configurado no pide nada. Publica en plataformas que aceptan
contenido **vía API o POST abierto (sin login, sin CAPTCHA)**, indexa lo que publica y se mide solo.

```
scripts/backlink-bot/
├── bot.py            # loop principal (cron): genera → publica → indexa → guarda
├── spinner.py        # genera el artículo + el/los links + rota anchors
├── publishers/       # un módulo por plataforma (cada uno: publish(article) -> url_viva)
│   ├── telegraph.py  # Telegraph API (telegra.ph) — oficial, programático
│   ├── graphorg.py   # graph.org (mismo motor, dominio distinto = link nuevo)
│   ├── writeas.py    # write.as API
│   ├── rentry.py     # rentry.co API
│   ├── pasteee.py    # paste.ee API (key)
│   └── dpaste.py     # dpaste / 0x0 API
├── indexer.py        # pingea las URLs nuevas a IndexNow/Bing + ping services
├── db.py             # SQLite: links publicados + estado + verificación
├── verify.py         # crawlea las URLs y confirma que el link sigue vivo + dofollow/nofollow
└── config.yml        # caps, plataformas activas, slugs/temas objetivo, anchors
```

---

## Cómo funciona (loop, 100% solo)

1. **Elige tema** (un calc/página-dato de hacecuentas, rotando de una lista en `config.yml`).
2. **`spinner.py` genera el contenido**: artículo corto y único (template + variación de
   sinónimos/orden, no copia-pega) que explica el tema y mete **1–2 links contextuales** a la
   URL objetivo, con **anchor rotado** (~70% marca/URL desnuda, ~30% temático).
3. **`publishers/*` lo publican** en las plataformas activas vía API. Cada publisher devuelve
   la URL viva. Sin login ni CAPTCHA (por eso es 100% autónomo).
4. **`indexer.py` pingea** las URLs nuevas (IndexNow + Bing submit + ping services) — un link que
   nunca se crawlea = invisible, este paso es lo que hace que el link cuente.
5. **`db.py` guarda** todo; **`verify.py`** confirma horas/días después que siguen vivos.
6. **Cron** repite con el cap de velocidad.

---

## Plataformas que permiten esto (sin humano)

Las que tienen **API real o POST abierto** y aceptan links — verificado que se postea sin login:

- **Telegraph** (`telegra.ph`) — API HTTP oficial: `createAccount` + `createPage` con HTML que
  incluye `<a>`. El backbone del bot. graph.org = mismo motor, dominio distinto = 2º canal.
- **write.as** — API de publicación, markdown con links.
- **rentry.co** — API, markdown.
- **paste.ee / dpaste / 0x0.st** — pastebins con API (auto-linkean URLs).

> Nota dura: estas son exactamente las de "valor SEO ~nulo" que ya tengo documentadas. El bot las
> usa por **volumen y diversidad de capa baja**, no como link money. El valor real lo da la
> **estructura en capas** (abajo).

---

## Estructura en capas (lo que hace que un bot así no sea inútil)

- **Tier 1** → links directos a hacecuentas (pocos, contenido más cuidado).
- **Tier 2** → links del bot apuntando a los Tier 1 (les pasan "jugo", los empujan a indexar y
  ganar peso sin ensuciar el perfil directo del money site).

Así el ruido de bajo valor queda **a un salto de distancia** del dominio principal — protege el
perfil de hacecuentas mientras el volumen empuja igual. `config.yml` define qué publisher es Tier 1
vs Tier 2.

---

## Seguridad embebida (en código, no opcional)

- **Cap de velocidad creciente** en `config.yml`: mes 1 ≤ X/día, sube gradual. El bot no publica
  por encima del cap (un dominio de 2,5 meses con un pico de links = bandera).
- **Anchors rotados** (sin anchor-money repetido).
- **Contenido único por post** (el spinner varía; nunca el mismo texto dos veces).
- **Diversidad de plataforma/horario** (no todo el mismo día/plataforma).
- **Verificación + auto-pausa**: si `verify.py` ve que una plataforma borra todo o nos banea, la
  desactiva sola.

---

## Throughput

Mecánicamente el bot puede postear **decenas/día**, pero el **cap de seguridad** lo limita a una
curva creciente y lenta (arranca en ~3–5/día Tier 2, ~1/día Tier 1, sube gradual). Realista:
cientos de links Tier 2 + decenas de Tier 1 por mes, sin disparar la bandera del dominio joven.

---

## Setup que necesita una sola vez (después corre solo para siempre)

- Keys de API donde aplique (paste.ee). Telegraph/rentry/write.as no necesitan login.
- (Opcional) un token de GitHub si querés sumar gists/repos como Tier 1 de más autoridad.
- Cron de launchd. Listo — de ahí en más no pide nada.

---

## Plan de build

1. `db.py` + `config.yml` + `bot.py` (esqueleto del loop).
2. `publishers/telegraph.py` (el primero, API oficial) → primer link automático real.
3. `spinner.py` (generación de contenido + rotación de anchors).
4. `indexer.py` (reusa la lógica de IndexNow/Bing que ya hay en `scripts/`).
5. Resto de publishers (graph.org, write.as, rentry, pastebins).
6. `verify.py` + auto-pausa.
7. Tiers + cron launchd.

Paso 1–4 ya te da un bot que publica e indexa links solo. El resto es escalar canales y blindar.
