# Hacé Cuentas — Calculadoras (plugin de WordPress)

Insertá cualquiera de los **cientos de hubs de cálculo** de [Hacé Cuentas](https://hacecuentas.com)
en tus posts y páginas de WordPress con un bloque o un shortcode. Gratis, sin registro y sin código:
el visitante obtiene el resultado sin salir de tu sitio.

> Sueldo en mano, monotributo, aguinaldo, indemnización, préstamos, interés compuesto, plazo fijo,
> IMC, calorías, IVA, porcentajes, conversores y mucho más.

Ideal para **estudios contables, blogs de finanzas, consultoras de RRHH, inmobiliarias,
sitios de salud/fitness y medios**: agregás una herramienta interactiva que tus lectores usan
sin salir de tu página.

## Instalación

**Desde el directorio de WordPress** (recomendado, una vez publicado):
Plugins → Añadir nuevo → buscá **"Hacé Cuentas"** → Instalar → Activar.

**Manual (zip):**
1. Descargá el `.zip` desde [Releases](https://github.com/grblasquiz/hacecuentas-calculadoras/releases).
2. En WordPress: Plugins → Añadir nuevo → **Subir plugin** → elegí el zip → Instalar → Activar.

## Uso

### Bloque (editor de bloques / Gutenberg)
1. En una entrada o página, agregá el bloque **"Calculadora Hacé Cuentas"**.
2. Tocá una de las **más usadas** (un clic) o buscá en el catálogo.
3. Publicá. Listo.

### Shortcode (editor clásico, widgets)
```
[hacecuentas slug="impuestos/monotributo"]
```
Con alto inicial opcional:
```
[hacecuentas slug="salud/peso-ideal-imc" height="700"]
```
El atributo `slug` acepta toda la ruta después del dominio
(`https://hacecuentas.com/salud/peso-ideal-imc` → `salud/peso-ideal-imc`).
Los shortcodes ya publicados con slugs viejos siguen funcionando por sus 301.

### Auto-embed pegando la URL
En el editor de bloques, pegá la URL completa de una calculadora en una línea sola
(ej: `https://hacecuentas.com/trabajo/sueldo-bruto-y-neto`) y WordPress la convierte en
un embed automáticamente (vía oEmbed).

## Cómo funciona

- La herramienta se muestra en un **iframe liviano** servido desde `hacecuentas.com`.
- El iframe aísla la parte interactiva del hub canónico: usa la misma fórmula y los mismos datos que la web.
- El iframe **se autoajusta de alto** según la calculadora.
- Lo único que el plugin agrega a tu página es un script de ajuste de altura de unos pocos KB.
- **Enlace a la fuente: opcional y opt-in.** Por defecto el plugin **no inserta ningún enlace** en tu
  sitio público. Podés activar un crédito a Hacé Cuentas (toggle "Enlazar a la fuente" en el bloque,
  o `credit="yes"` en el shortcode).

## Privacidad

El plugin no guarda los valores ingresados ni crea cuentas. Consulta el catálogo público
(`/api/embed-calcs.json`) para llenar el selector, cacheado 12 h. El iframe se sirve desde
Hacé Cuentas y aplica su política de privacidad, analítica y consentimiento.

## Desarrollo

Plugin en JavaScript vanilla, **sin paso de build**:

| Archivo | Qué hace |
|---|---|
| `hacecuentas-calculadoras.php` | Bloque dinámico (render en PHP), shortcode, oEmbed provider, aviso de bienvenida |
| `block.js` | Editor del bloque (populares + buscador + preview en vivo) |
| `block.json` | Metadatos del bloque |
| `frontend.js` | Auto-resize del iframe |
| `uninstall.php` | Limpieza al desinstalar |
| `readme.txt` | Ficha de wordpress.org |

## Licencia

[GPL-2.0-or-later](LICENSE) — la misma que WordPress.

---

Hecho por **[Hacé Cuentas](https://hacecuentas.com)** · [Buscar calculadoras](https://hacecuentas.com/buscar)
