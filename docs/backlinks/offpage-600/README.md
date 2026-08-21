# Programa editorial: 600 hubs × 5 notas

Objetivo: desarrollar cinco notas útiles y diferenciadas alrededor de cada hub activo de Hacé Cuentas —guía práctica, errores frecuentes, caso práctico, comparación y actualización— para reforzar descubrimiento, contexto y autoridad temática.

## Estado de partida

- 600 hubs activos, según `src/lib/current-tools-index.json`.
- 150 notas ya producidas para 30 hubs en [`../offpage-150/`](../offpage-150/).
- Meta total: 3.000 notas.
- Producción generada: 570 hubs y 2.850 notas nuevas en 57 lotes de 10 hubs.
- Cobertura total del programa: 600 hubs y 3.000 notas.
- Extensión revisada: promedio de 1.091 palabras por nota; mínimo 950.

La cola auditable se regenera con:

```bash
node scripts/build-offpage-600-queue.mjs
```

El resultado queda en `work/offpage-600/queue.json` y `queue.tsv`, con el estado por hub y los cinco títulos propuestos.

Las notas generadas están en [`batches/`](batches/) y su inventario completo en [`batches/manifest.json`](batches/manifest.json). La cobertura se valida con:

```bash
node scripts/audit-offpage-600-notes.mjs
```

## Criterio editorial

Cada nota debe aportar información propia, enlazar al hub principal y usar fuentes primarias cuando trate temas fiscales, laborales, de salud, legales o datos vigentes. La actualización anual no debe inventar cifras: primero se verifica la fuente oficial y se registra la fecha de revisión. Los casos prácticos son ilustrativos y no deben presentarse como testimonios reales si no existe autorización y documentación.

La generación no inventa cifras ni testimonios: los casos están marcados como ilustrativos y las notas remiten a fuentes oficiales. Antes de distribuir cada lote hay que revisar originalidad, enlaces, fuentes y riesgo YMYL; la auditoría estructural no reemplaza esa revisión editorial.
