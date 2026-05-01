# Contributing

Gracias por considerar contribuir 🙏

## Cómo agregar una fórmula nueva

1. **Citá la fuente legal/oficial**: link directo a Infoleg, AFIP, BCRA, ANSES o INDEC.
2. **Tipá entrada/salida** con interfaces (TypeScript).
3. **Documentá la fórmula** en el JSDoc:
   - Fórmula matemática
   - Fuente legal con link
   - Ejemplos numéricos
   - Edge cases (qué pasa con 0, negativos, fechas inválidas)
4. **Tests** en `tests/` con casos reales (al menos 3 casos: típico, edge, error).

Ejemplo: ver `src/sueldo/aguinaldo-sac.ts`.

## Cómo reportar un error en una fórmula

Abrí un Issue con:
- Cálculo actual del repo
- Cálculo esperado (con fuente)
- Snippet de código que reproduce
- Link a la fuente legal/oficial donde está el cálculo correcto

## Cómo correr tests

```bash
npm install
npm test
```

## Style

- TypeScript strict
- Sin abreviaciones crípticas (`acc` ok, `r` no)
- Comentarios en español (es un proyecto sobre legislación AR)
- Variables del cálculo en español también (`mejorSueldoSemestre` no `bestSemesterSalary`)

## License

Al contribuir, aceptás que tu código será publicado bajo MIT (igual que el resto del repo).
