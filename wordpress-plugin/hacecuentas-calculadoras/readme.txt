=== Hacé Cuentas — Calculadoras ===
Contributors: Rambiss
Tags: calculadora, calculator, embed, finanzas, shortcode
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Insertá calculadoras interactivas (sueldo, monotributo, aguinaldo, IMC, préstamos, IVA y +2700 más) en tus posts y páginas con un bloque o un shortcode.

== Description ==

**Hacé Cuentas — Calculadoras** te deja embeber cualquiera de las más de 2700 calculadoras de [hacecuentas.com](https://hacecuentas.com) directamente en tu sitio de WordPress, sin tocar código.

Ideal para estudios contables, blogs de finanzas personales, consultoras de RRHH, inmobiliarias, sitios de salud/fitness y medios: agregás una herramienta interactiva que tus lectores usan **sin salir de tu página**.

= Características =

* **Bloque de Gutenberg** con botones de las calculadoras más usadas (un clic para insertarlas), buscador de las más de 2700 y vista previa en vivo en el editor.
* **Shortcode** `[hacecuentas slug="calculadora-monotributo-2026"]` para el editor clásico o widgets.
* **Auto-embed por URL**: pegás el link de una calculadora en el editor de bloques y aparece sola (vía oEmbed).
* **Responsive**: el embed se adapta al ancho de tu contenido y ajusta su alto automáticamente.
* **Enlace a la fuente opcional**: si querés, activás un crédito a Hacé Cuentas debajo de la calculadora. Apagado por defecto — vos decidís.
* **Privado y liviano**: los cálculos corren en el navegador del visitante. No se envían datos a ningún servidor y no carga librerías pesadas en tu sitio.
* **Gratis y sin registro.**

= Algunas calculadoras populares =

* Sueldo en mano (Argentina)
* Monotributo 2026
* Aguinaldo (SAC)
* Indemnización por despido
* Préstamos y cuota
* Interés compuesto y plazo fijo
* IMC, calorías (TDEE), embarazo
* IVA, porcentajes, regla de tres
* Conversores de unidades y monedas

== Installation ==

1. En tu panel de WordPress, andá a **Plugins → Añadir nuevo** y buscá "Hacé Cuentas".
2. Instalá y activá el plugin.
3. En cualquier post o página, agregá el bloque **"Calculadora Hacé Cuentas"** y elegí la calculadora que querés mostrar.

= Con shortcode =

Pegá esto en el contenido (editor clásico, widgets de texto, etc.):

`[hacecuentas slug="calculadora-monotributo-2026"]`

Podés ajustar el alto inicial:

`[hacecuentas slug="calculadora-imc" height="700"]`

El `slug` es la última parte de la URL de la calculadora. Por ejemplo, para `https://hacecuentas.com/calculadora-imc` el slug es `calculadora-imc`.

= Auto-embed pegando la URL =

En el editor de bloques, pegá la URL completa de una calculadora (por ejemplo `https://hacecuentas.com/sueldo-en-mano-argentina`) en una línea sola y WordPress la convierte en un embed automáticamente.

== Frequently Asked Questions ==

= ¿Es gratis? =

Sí. El plugin y las calculadoras son 100% gratuitas y no requieren registro.

= ¿Carga scripts pesados en mi sitio? =

No. La calculadora se muestra dentro de un iframe liviano y los cálculos corren en el navegador del visitante. El único script que el plugin agrega a tu página es un ajuste de altura mínimo (unos pocos KB).

= ¿Se envían datos de mis visitantes a algún lado? =

No. Los cálculos se hacen del lado del cliente. El visitante ingresa sus datos y el resultado se computa en su propio navegador.

= ¿El plugin agrega enlaces a mi sitio sin permiso? =

No. Por defecto sólo se muestra la calculadora. Si querés, podés activar un enlace de crédito a Hacé Cuentas debajo de la calculadora (opción "Enlazar a la fuente" en el bloque, o `credit="yes"` en el shortcode). Está apagado por defecto.

= ¿Cómo encuentro el slug de una calculadora? =

Es la última parte de la URL. En `https://hacecuentas.com/calculadora-aguinaldo-sac`, el slug es `calculadora-aguinaldo-sac`. El bloque de Gutenberg además trae un buscador con todas.

= ¿El embed es responsive? =

Sí. Se adapta al ancho de tu contenido (hasta 720px) y ajusta su alto automáticamente según la calculadora.

= ¿Funciona con el editor clásico? =

Sí, con el shortcode `[hacecuentas slug="..."]`.

= ¿Qué pasa si desinstalo el plugin? =

Se limpia la caché temporal que crea el plugin. No deja datos residuales.

== Screenshots ==

1. El bloque "Calculadora Hacé Cuentas": botones de las calculadoras más usadas (un clic) y buscador de las más de 2700, en el editor.
2. Una calculadora embebida, lista para que el lector la use — con el crédito enlazado a Hacé Cuentas.

== Changelog ==

= 1.0.0 =
* Versión inicial: bloque de Gutenberg, shortcode y auto-embed por oEmbed.

== Upgrade Notice ==

= 1.0.0 =
Versión inicial.
