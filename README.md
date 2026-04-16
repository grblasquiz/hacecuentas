# 🧮 Hacé Cuentas — Calculadoras Online Gratuitas

[![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange?logo=cloudflare)](https://hacecuentas.com)
[![Astro](https://img.shields.io/badge/Astro-6.x-blueviolet?logo=astro)](https://astro.build)
[![Calculadoras](https://img.shields.io/badge/calculadoras-535%2B-brightgreen)](https://hacecuentas.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**535+ calculadoras gratuitas, precisas y privadas en español. [**hacecuentas.com**](https://hacecuentas.com)**

---

## ¿Qué es Hacé Cuentas?

[Hacé Cuentas](https://hacecuentas.com) es un sitio de calculadoras online gratuitas orientado al mercado hispanohablante — especialmente Argentina. Cubre finanzas personales, impuestos, salud, matemáticas, conversiones y mucho más. Todo corre en el browser: sin servidores, sin cookies, sin tracking.

---

## Características

- **535+ calculadoras en español** — finanzas, impuestos, salud, matemáticas, conversiones y más
- **20 calculadoras en inglés** — para usuarios angloparlantes y SEO internacional
- **[Blog con guías paso a paso](https://hacecuentas.com/blog)** — artículos explicativos para cada calculadora
- **[Tablas de referencia](https://hacecuentas.com/tabla/tabla-imc-peso-altura)** — IMC, monotributo, ganancias, retenciones y más
- **[Comparadores](https://hacecuentas.com/comparar/plazo-fijo-vs-fci-vs-dolar)** — plazo fijo vs FCI, monotributo vs RI, etc.
- **[Páginas por provincia argentina](https://hacecuentas.com/argentina/buenos-aires/ingresos-brutos)** — IIBB, patente, sellos, costo del m²
- **Calculadoras LATAM** — México, Colombia, Chile
- **Schema.org completo** — FAQ, HowTo, BreadcrumbList, Dataset
- **Dark mode + responsive** — funciona en cualquier dispositivo
- **100% estático** — 0 dependencias de runtime, carga instantánea
- **Sin cookies, sin tracking** — procesamiento 100% local en el browser

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 6.x](https://astro.build) (SSG) |
| Lenguaje | TypeScript |
| Deploy | [Cloudflare Pages](https://pages.cloudflare.com) |
| Runtime deps | 0 — solo HTML/CSS/JS estático |
| Compresión | astro-compressor (Brotli/Gzip) |
| Sitemap | @astrojs/sitemap |

---

## Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/hacecuentas.git
cd hacecuentas

# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4321)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## Estructura del proyecto

```
hacecuentas/
├── src/
│   ├── content/
│   │   ├── calcs/          # 535 calculadoras en español (JSON)
│   │   ├── calcs-en/       # 20 calculadoras en inglés (JSON)
│   │   ├── blog/           # artículos del blog (JSON)
│   │   ├── tablas/         # tablas de referencia (JSON)
│   │   ├── comparaciones/  # comparadores (JSON)
│   │   └── argentina/      # páginas por provincia (JSON)
│   ├── components/         # Componentes Astro reutilizables
│   ├── layouts/            # Layouts base y de calculadora
│   ├── pages/              # Rutas del sitio
│   ├── lib/                # Utilidades y helpers
│   └── styles/             # CSS global y variables
├── public/                 # Assets estáticos (favicon, og images, sw.js)
└── astro.config.mjs        # Configuración de Astro
```

Cada calculadora en `src/content/calcs/` es un archivo JSON con metadatos (título, descripción, slug, fórmula, FAQ, schema.org). La lógica de cálculo se ejecuta 100% en el browser del usuario.

---

## Embebé una calculadora en tu sitio

Embebé cualquiera de las [535+ calculadoras de Hacé Cuentas](https://hacecuentas.com) en tu sitio web gratis. Ver instrucciones completas en [hacecuentas.com/embeber](https://hacecuentas.com/embeber).

```html
<iframe
  src="https://hacecuentas.com/calc/porcentaje"
  width="100%"
  height="500"
  frameborder="0"
  loading="lazy"
  title="Calculadora de porcentaje"
></iframe>
<p>Powered by <a href="https://hacecuentas.com">Hacé Cuentas</a></p>
```

Podés embeber cualquier calculadora reemplazando `porcentaje` en la URL por el slug de la que necesitás. Todas las calculadoras disponibles están listadas en [hacecuentas.com](https://hacecuentas.com).

---

## Contribuir

Las contribuciones son bienvenidas. Para agregar una calculadora:

1. Creá un archivo JSON en `src/content/calcs/` siguiendo la estructura de los existentes
2. Incluí título, descripción, slug, fórmula, FAQ (mínimo 7 preguntas) y schema.org
3. Abrí un Pull Request con una descripción clara de qué calcula y para qué sirve

Para bugs o mejoras, abrí un issue primero para discutir el cambio.

---

## Licencia

[MIT](LICENSE) — libre para usar, modificar y distribuir con atribución.

---

## Links

- 🌐 [hacecuentas.com](https://hacecuentas.com) — sitio principal
- 📊 [Blog](https://hacecuentas.com/blog) — guías y tutoriales
- 📋 [Tablas de referencia](https://hacecuentas.com/tabla/tabla-imc-peso-altura) — IMC, monotributo, ganancias
- ⚖️ [Comparadores](https://hacecuentas.com/comparar/plazo-fijo-vs-fci-vs-dolar) — plazo fijo vs FCI vs dólar
- 🇦🇷 [Calculadoras por provincia](https://hacecuentas.com/argentina/buenos-aires/ingresos-brutos) — IIBB, patente, sellos
- 🔗 [Embeber calculadoras](https://hacecuentas.com/embeber) — integrá gratis en tu sitio
