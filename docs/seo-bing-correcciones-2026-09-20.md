# Correcciones SEO Bing y vigencia — 2026-09-20

## Cambios
- Monotributo: respuesta inicial con valores de la fuente compartida, accesos a tabla/cálculo/comparación y revisión visible consistente; ajuste móvil de tarjetas.
- Colombia: aclaración de auxilio condicionado y enlaces a neto, múltiplos SMLMV y sueldo.
- Generaciones: encabezado descriptivo y acceso a tabla. Conserva rangos y URL.
- NFL: acceso a próxima jornada; semanas antes que juegos internacionales. Fetch por semana en lugar de rangos rechazados por ESPN; exige272 partidos y32 equipos antes de escribir, y reporta fallo si conserva snapshot. Datos actualizados.
- UMA: accesos a valor y múltiplos existentes, conservando título y contenido.
- Alquiler: ICL actualizado del16ago al20sep (36,30), encabezado descriptivo y refresco diario conectado.
- Sueldo: septiembre ANSES257/2026, base4.691.748,47; cálculo, fecha, description y fuente usan el mismo registro SIPA.
- Datos diarios: dispatch explícito del deploy tras commit del bot; GITHUB_TOKEN no dispara otro workflow por push.
- Bloqueo previo de build: cuatro relatedCalcs retiradas en inflación agosto, reparadas en artículo y generador.

## Evidencia y alcance
No cambiar títulos de las páginas Bing ya alineadas ni podar blog. Mantener URLs ganadoras: salario Colombia, jubilación, salario mínimo México2027, Ganancias2026, informe financiero agosto. Comparar GSC y Bing por separado y sumar aliases migrados con sus destinos. Los4cortes Bing21ago/28ago/4sep/11sep son baseline por URL, no el mismo período diario21ago–17sep.

## Validación
682 pruebas existentes pasaron,3 omitidas por configuración.3 pruebas nuevas de seguridad de refresh pasaron. Build completo validó sitemap1129URLs,1122estáticas y7runtime; integridad613URLs/href y hreflang1166páginas. Navegador: monotributo20M→C; sueldo5M→3.983.765 con tope septiembre; alquilerICL20sep; NFL enlace semana2; generaciones1997→Z,28/29años. Revisión móvil390px.

Fuentes: ANSES https://www.argentina.gob.ar/normativa/nacional/norma-429456/texto ; ARCA https://www.arca.gob.ar/monotributo/categorias.asp ; BCRA API monetarias serie40 ; ESPN scoreboard2026 por semana.
