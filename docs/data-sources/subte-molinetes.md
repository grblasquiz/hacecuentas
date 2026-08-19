# Subte: viajes por molinetes

La página `/cuanta-gente-viaja-subte-buenos-aires` usa el dataset público
**Subte: Viajes Molinetes** de SBASE/Buenos Aires Data. La fuente declara una
frecuencia mensual; Hacé Cuentas la revisa trimestralmente para evitar cambios
editoriales demasiado frecuentes sobre un período todavía incompleto.

## Actualización

```bash
python3 scripts/update-subte-data.py
npm run sitemap
npm run build
```

El actualizador descarga los ZIP oficiales 2026 y 2025, detecta el último mes
disponible y usa el mismo corte en ambos años. Si no hay meses nuevos, no toca
el JSON. Cuando hay datos nuevos, reemplaza `src/data/subte-2026.json`; su mtime
y `generatedAt` hacen que el próximo sitemap publique un `lastmod` nuevo sólo
para esta URL.

## Calendario

La automatización corre a las 09:17 de Buenos Aires el día 5 de enero, abril,
julio y octubre. También se puede ejecutar manualmente desde GitHub Actions.
Después de una actualización con cambios corresponde revisar totales, publicar
y enviar únicamente esta URL por IndexNow.

Fuente: https://data.buenosaires.gob.ar/dataset/subte-viajes-molinetes
