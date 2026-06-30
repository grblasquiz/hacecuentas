# Partner Studio — `<hace-cuentas>` web component

Evolución del embed por iframe (`/embed.js`) hacia un **producto de distribución**.
En lugar de "copiá y pegá este iframe", el partner declara un custom element con
marca, prefill, eventos y callback a su sistema.

- Script: `https://hacecuentas.com/hc.js`
- Landing pública: `https://hacecuentas.com/partners`
- Iframe simple (back-compat): `https://hacecuentas.com/embeber` + `/embed.js`

## Instalación

```html
<script async src="https://hacecuentas.com/hc.js"></script>

<hace-cuentas calculator="calculadora-sueldo-en-mano-argentina"></hace-cuentas>
```

El script se pega **una vez**. El tag, las veces que quieras.

## Atributos

| Atributo          | Tipo    | Descripción |
|-------------------|---------|-------------|
| `calculator`      | string  | **Requerido.** Slug de la calc (el de la URL). Alias: `slug`. |
| `accent`          | hex     | Color de acento. Ej. `#d2122e`. Alias: `theme`. |
| `logo`            | https   | Logo del partner en el encabezado. |
| `title`           | string  | Título personalizado del widget. |
| `country`         | string  | País/moneda (advisory). Ej. `AR`. |
| `prefill`         | JSON    | `{"campo":"valor"}` para precargar inputs. Si los requeridos quedan completos, calcula solo. |
| `f-<campo>`       | string  | Alternativa a `prefill`: `f-sueldoBruto="1500000"`. |
| `cta-label`       | string  | Texto del CTA propio bajo el resultado. |
| `cta-url`         | https   | URL del CTA propio. |
| `partner-id`      | string  | Identificador del partner (config en `/partners/<id>.json`). |
| `no-attribution`  | boolean | Oculta el crédito. **Sólo** si el partner está autorizado (ver abajo). |
| `analytics`       | boolean | Si está, empuja eventos `hc_*` al `gtag`/`dataLayer` del partner. |
| `height`          | number  | Alto inicial del iframe (px). Luego se auto-ajusta. |

> Claves reservadas (no usar como nombre de campo en `prefill`): `accent`, `theme`,
> `logo`, `title`, `cta`, `ctaurl`, `partner`, `noattr`, `country`, `autocalc`.

## Eventos

El elemento emite eventos DOM nativos (bubbles + composed):

| Evento         | Cuándo                                   | `detail`            |
|----------------|------------------------------------------|---------------------|
| `hc:ready`     | El iframe cargó.                         | `{ slug }`          |
| `hc:calculate` | El usuario calculó.                      | `{ primary, slug }` |
| `hc:share`     | Compartió/copió el resultado.            | `{ action }`        |
| `hc:complete`  | Tocó el CTA del partner.                 | `{ cta }`           |

```js
document.querySelector('hace-cuentas')
  .addEventListener('hc:calculate', (e) => {
    console.log('resultado', e.detail.primary);
  });
```

También respeta handlers como propiedad (`el.oncalculate = fn`) y, best-effort
según CSP, atributos inline (`oncalculate="..."`).

## API imperativa

```js
const el = document.querySelector('hace-cuentas');
el.recalculate({ sueldoBruto: '2000000' }); // actualiza prefill y recalcula
```

## React / Next / Vue

Los web components son estándar del navegador. En React:

```jsx
const ref = useRef(null);
useEffect(() => {
  const el = ref.current;
  const onCalc = (e) => track(e.detail.primary);
  el.addEventListener('hc:calculate', onCalc);
  return () => el.removeEventListener('hc:calculate', onCalc);
}, []);
return <hace-cuentas ref={ref} calculator="calculadora-imc" accent="#7c3aed" />;
```

## Atribución y modo sin atribución

Por defecto el crédito **"Powered by Hacé Cuentas"** se inyecta en la página
anfitriona (fuera del iframe = backlink real, followable para SEO).

`no-attribution` sólo se aplica si **todas** estas condiciones se cumplen:

1. Hay `partner-id`.
2. `/partners/<id>.json` devuelve `attributionWaived: true`.
3. El `hostname` actual coincide con `authorizedDomains` (o `["*"]`).

El registro vive en `src/data/partners.json` y se sirve prerenderizado desde
`src/pages/partners/[id].json.ts`. Para dar de alta un partner:

```json
{
  "tu-medio": {
    "name": "Tu Medio",
    "accent": "#d2122e",
    "logo": "https://tu-medio.com/logo.svg",
    "attributionWaived": true,
    "authorizedDomains": ["tu-medio.com", ".tu-medio.com"],
    "plan": "partner"
  }
}
```

> **Nota de seguridad:** la validación de dominio es del lado del cliente
> (advisory). Es suficiente para el caso de negocio (un partner no gana nada
> falsificándola en su propio sitio), pero **no** es un control de acceso duro.
> Si en el futuro se quiere enforcement real, hay que mover la decisión a un
> worker que valide el `Referer`/`Origin` y sirva el `/embed` con o sin crédito.

## Arquitectura

```
hc.js (web component)
  └─ <iframe> → /embed/<slug>?accent=…&logo=…&title=…&cta=…&<campo>=<valor>&noattr=1
        ├─ Calculator.astro corre el cálculo (local, client-side)
        ├─ script de embed aplica tema/logo/título/CTA desde la query
        └─ postMessage al parent: hc-embed-height | hc-embed-meta | hc-embed-event
  └─ window 'message' listener → CustomEvent hc:ready|calculate|share|complete
```

El prefill reusa el mecanismo existente de "link con datos": el `<input name>`
de cada campo se completa desde el query param homónimo y, si todos los
requeridos quedan llenos, se dispara `form.requestSubmit()`.
