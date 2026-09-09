# Recuperación orgánica — 9 de septiembre de 2026

## Diagnóstico y alcance

La caída observada entre las semanas del 13–19 de julio y 31 de agosto–6 de septiembre se concentra en Bing: 4.553 → 972 clics. GA4 organic search: 5.074 → 1.136 sesiones; Google: 20 → 8 clics. No confundir estas métricas ni sumar clics y sesiones.

La muestra estratificada de URL Inspection del 9 de septiembre tiene 90 URLs: blog 1/30 indexadas, regionales 20/30, otras 26/30. No representa una tasa extrapolable a todo el sitio. Los controles públicos no detectaron un bloqueo general: 1.107 URLs con HTML, código 200, una canonical propia y un H1. El blog ya había recuperado su navegación el 4 de septiembre.

Las antiguas entradas SDI México y ARL Colombia redirigían a hubs sin una herramienta explícita para esa tarea. Se recupera la función dentro del destino existente, preservando URLs y redirecciones. No se revierten los hubs en bloque ni se publican artículos masivos para compensar la caída.

## Cambios

- Sueldo neto México: cálculo y ejemplo inicial con tabla ISR 2026; subsidio limitado al ISR, sin crear pago en efectivo. IMSS identificado como aproximación usando bruto como SBC.
- SDI México: herramienta con salario diario/mensual, antigüedad, prestaciones y SBC topado. Salario mensual dividido por 30 según LSS art. 29; integración sin redondear el factor antes de tiempo.
- ARL Colombia: aporte por clase I–V, IBC y trabajadores. Explica que el dependiente no paga este aporte y que el IBC debe estar determinado previamente.
- Horas extras Colombia: fechas separadas para el dominical (1 de julio) y divisor de jornada (15 de julio); acumulación de extras y noche; comparación contra pago cero.
- Diez narraciones identificadas como ejemplos ilustrativos, sin atribuirles verificación inexistente; se conservan sus URLs. Informes mensuales con corte temporal coherente y generador corregido.
- Enlaces directos desde datos salariales a SDI/ARL y desde la guía IMC a la herramienta.

## Validación

Suite completa: 87 archivos, 679 pruebas. Incluye transiciones legales, casos mínimos, tope SBC, cinco riesgos y cálculo inverso. Validación adicional en navegador para recalcular SDI, ARL y los recargos. Las validaciones de build incluyen enlaces, canónicos, hreflang, duplicados y cobertura del blog.

## Medición posterior

`baseline-2026-09-09.json` conserva las mismas 90 URLs y estados. `scripts/gsc-recovery-cohort.py` las inspecciona sin escribir en Google, separando errores de API de páginas no indexadas. El workflow semanal existente guarda el resultado como artefacto `gsc-recovery-cohort.json`; no sustituye su informe de queries emergentes.

Comparar ventanas completas de 14 días, dejando tres días para consolidación: Google y Bing por separado, mismas URLs y suma de antigua entrada más destino del hub. Prioridades: SDI, ARL, horas extras/recargo dominical e IMC. En Google, medir además nuevas URLs indexadas de la muestra y fecha del último rastreo. Un cambio de posición o CTR aislado no demuestra recuperación causal; controlar demanda y cambios de mezcla.

Revisiones orientativas: 23 de septiembre y 7 de octubre. Si el contenido nuevo no fue rastreado, investigar descubrimiento/rastreo. Si fue rastreado pero sigue fuera del índice, priorizar calidad y diferenciación. Si está indexado y recibe impresiones sin clics, revisar consulta, posición y presentación en resultados. No prometer recuperación inmediata ni atribuir el resultado a una única corrección.
