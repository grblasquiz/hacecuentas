# Newsletter — stack recomendado (post-MVP)

Hoy: form + endpoint + D1 ya implementados. **2 subs históricas**.
Falta: copy mejorada (✅ deployada), proveedor de envío, automatización editorial.

## Provider — recomendación: **Resend**

| Provider | Free tier | Pago | Pros | Contras |
|---|---|---|---|---|
| **Resend** ⭐ | 3K/mes, 100/día | $20/mo 50K | API limpia, CF-friendly, archives + RSS auto | UI simple |
| Buttondown | 100 subs free | $9/mo 1K | Markdown nativo, archivo público SEO | Caro al crecer |
| Mailgun | 1K/mes free | $35/mo 50K | Maduro, scalable | UX dev-only |
| ConvertKit | 1K subs free | $25/mo 1K | Mejor para creators | Caro |
| Mailchimp | 500 subs free | $13/mo 500 | Marketing-friendly | Slow API, deliverability mid |

**Por qué Resend:**
1. Free tier (3K/mes) cubre los primeros 6-12 meses sin gasto.
2. API muy parecida a Anthropic (RESTful, fácil): `POST /emails`.
3. Integra nativo con Cloudflare Workers (que ya usás).
4. Click tracking + open rate built-in.
5. RSS-to-email (autopublica un newsletter desde el RSS del blog).

## Setup técnico (4-5 días dev total)

### Día 1: Domain verification (10 min) + setup
1. Crear cuenta resend.com (free)
2. Add domain `hacecuentas.com`
3. Setear DNS records SPF/DKIM/DMARC en CF DNS:
   ```
   send.hacecuentas.com  TXT  "v=spf1 include:_spf.resend.com ~all"
   resend._domainkey.hacecuentas.com  TXT  <DKIM key from Resend>
   _dmarc.hacecuentas.com  TXT  "v=DMARC1; p=none; rua=mailto:martin@hacecuentas.com"
   ```
4. Wait 24h propagación
5. Verify domain en Resend

### Día 2: Endpoint integration

`src/pages/api/newsletter.ts` ya guarda en D1. Agregar:

```typescript
// Después de INSERT exitoso
import { Resend } from 'resend';
const resend = new Resend(env.RESEND_API_KEY);
await resend.contacts.create({
  email,
  firstName: '',
  audienceId: env.RESEND_AUDIENCE_ID,
});
// Y mandar welcome email transaccional
await resend.emails.send({
  from: 'Hacé Cuentas <hola@hacecuentas.com>',
  to: email,
  subject: '👋 Bienvenido a Hacé Cuentas',
  html: '<welcome template>',
});
```

Secrets en wrangler:
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_AUDIENCE_ID
```

### Día 3: Cron Trigger semanal

Cloudflare Cron en `wrangler.jsonc`:
```jsonc
"triggers": {
  "crons": ["0 12 * * MON"]   // lunes 12 UTC = 9 AR
}
```

`src/pages/api/cron.ts` (handler):
```typescript
export const onSchedule = async ({ env }) => {
  // 1. Pull "número de la semana" (IPC, dólar, etc)
  // 2. Pick "calc del lunes" del top trending de GSC
  // 3. Render HTML template con Markdown
  // 4. Send broadcast via Resend
  await resend.broadcasts.send({
    audienceId: env.RESEND_AUDIENCE_ID,
    from: 'Martín de Hacé Cuentas <martin@hacecuentas.com>',
    subject: `📊 ${dato_de_la_semana}`,
    html: renderTemplate({...}),
  });
};
```

### Día 4: Editorial automation

Plantilla del newsletter — 5 secciones fijas:
1. **Dato de la semana** (auto-pulled de BCRA/INDEC API o manual)
2. **Calc destacada** (la trending de GSC últimos 7 días)
3. **Vencimiento próximo** (de un calendar fijo: monotributo, ganancias, paritarias)
4. **Tip de la semana** (manual, ~50 palabras)
5. **3 calcs recientes** (auto-pulled de los últimos 7 días en repo)

3 son auto, 2 son manuales (15 min de Martín cada lunes a la mañana).

### Día 5: Setup tracking + lanzamiento

- UTM params en cada link del newsletter (`?utm_source=newsletter&utm_campaign=2026-W18`)
- Welcome series de 3 mails (drip): día 0 welcome, día 3 calcs top, día 7 dato
- Test con 5-10 personas conocidas antes de abrir flow público
- Anuncio en home: agregar "✨ Newsletter: 1 dato económico cada lunes"

## Captura mejorada (UI)

El newsletter form actual está en home + 9 páginas. Sumar:
- **Modal contextual**: después de calcular un resultado en una calc, popup "¿Te mando newsletter con datos como este?". Solo 1 vez por sesión.
- **Sticky bottom banner** en mobile (cerrable). Scroll-trigger al 60% de profundidad.
- **Inline en explanation**: en calcs YMYL (impuestos, salud, finanzas) agregar después del 2do H2: "📩 Esto cambia cada año. ¿Querés que te avise? [form]".

Estos boost conversion 5-15% según industria benchmarks.

## Métricas a seguir

| Métrica | Target 30d | Target 90d | Target 180d |
|---|---|---|---|
| Subs totales | 200 | 1500 | 5000 |
| Open rate | 35-50% | 35-45% | 30-40% |
| Click rate | 5-10% | 4-8% | 3-7% |
| Unsubscribe | <0.5%/issue | <0.5% | <0.5% |
| Tráfico desde NL | 50/sem | 500/sem | 2K/sem |

## Costo

- 0-3K subs: **gratis** (Resend free tier)
- 3K-50K: **$20/mo** (Resend Pro)
- 50K-100K: **$75-90/mo**

Comparado con Mailchimp ($299/mo a 50K) o ConvertKit ($79/mo a 5K), Resend es 3-4x más barato.

## Action items

- [ ] Decidir provider (recomiendo Resend)
- [ ] Crear cuenta + domain verification (10 min + 24h DNS)
- [ ] Días 2-5: setup técnico (yo lo puedo hacer si me das luz verde)
- [ ] Lanzar primer newsletter: lunes próximo + 7 días = 2 lunes después del setup
