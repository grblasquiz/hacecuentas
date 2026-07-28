# Hubs con datos pero sin página

Los escribieron agentes que murieron antes de crear su `.astro`. Un hub sin
página igual lo levanta el glob del registry y aparece listado en el índice de
su silo — con un link a un 404. Por eso salen de `src/lib/hubs/`.

Para recuperarlos: mover el `.ts` de vuelta a `src/lib/hubs/<locale>/` y escribir
`src/pages/<slug>.astro` copiando el patrón de cualquier hub vivo del mismo silo
(el `compute()` va inline en el `<script>` de la página).

- `impuestos-de-mi-propiedad.ts`      → slug `cl/impuestos/impuestos-de-mi-propiedad`
- `self-employed-rates-and-taxes.ts`  → slug `en/money/self-employed-rates-and-taxes`
