# Cooperativa de datos anónimos — pasos de deploy

Feature: aporte OPT-IN de datos anónimos tras ciertos resultados → índices propios
(sueldo neto, relación alquiler/ingreso, TNA ofrecida). Privacidad: nunca se asocia
al email; el endpoint de aporte ni lee la sesión. Ver `/cooperativa-de-datos` y
`src/lib/coop/datasets.ts`.

## Qué hay que hacer al deployar (además del deploy normal del sitio)

1. **Aplicar el schema a D1** (crea `coop_contributions` + `coop_aggregates`; es
   idempotente, `CREATE TABLE IF NOT EXISTS`):

   ```bash
   npx wrangler d1 execute hacecuentas-forms --remote --file=db/schema.sql
   ```

2. **Deployar el worker cron de agregación** (recalcula percentiles a diario y poda
   los datos detallados viejos):

   ```bash
   cd workers/coop-aggregate && npx wrangler deploy --config ./wrangler.toml
   ```

3. **Deploy del sitio** como siempre: incluye la página `/cooperativa-de-datos`, los
   endpoints `/api/coop/*` y el bloque de aporte en `Calculator.astro`.

## Verificación post-deploy

```bash
# Worker arriba + status
curl -s "https://hacecuentas-coop-aggregate.<subdominio>.workers.dev/" | jq

# Forzar una pasada de agregación a mano (sin esperar al cron)
curl -s "https://hacecuentas-coop-aggregate.<subdominio>.workers.dev/?run=hc-coop-4Rp9zK" | jq

# Lectura pública de índices (vacío hasta que haya 30+ aportes por segmento)
curl -s "https://hacecuentas.com/api/coop/stats" | jq
```

El cron corre 15:00 UTC (12:00 ART), después de `alerts-recompute` (11:30). Hasta que
un segmento junte 30 aportes no se muestra ningún número (k-anonymity).
