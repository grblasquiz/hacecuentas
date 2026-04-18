# Content Expansion Queue

Lista priorizada de calcs con contenido débil según audit SEO. **No auto-expandir** sin revisión (Google penaliza contenido genérico de IA en YMYL).

Generado: 2026-04-18

## Thin content (< 1.000 chars en `explanation`)

Target: llevar a 1.500-3.000 chars con contexto, ejemplos, casuística.

### Negocios (35) — prioridad ALTA (conversion keywords)

Estas tienen potencial comercial alto. El explanation debería incluir:
- Fórmula con variables explicadas
- Tabla con benchmarks típicos
- 2-3 casos reales (bueno/malo/promedio)
- Cuándo aplica y cuándo no

Sample slugs:
- calculadora-seo-trafico-potencial-keyword
- calculadora-conversion-rate-ecommerce-benchmark
- calculadora-costo-hora-desarrollador-senior
- calculadora-costo-hora-ilustrador-digital
- calculadora-hora-freelance-por-pais-mercado

### Marketing (6)
- calculadora-tiktok-spark-ads-costo
- (5 más — correr script para lista completa)

### Salud (10) — prioridad ALTA (YMYL, estándar E-E-A-T)

Cada una necesita:
- Explicación del cálculo con fuente científica citada
- Rango normal y patológico
- Cuándo consultar profesional
- Limitaciones de la calc

### Deportes (9)
Incluir MET values, pace benchmarks, referencias a Compendium of Physical Activities.

### Educación (7)
Explicar metodología + tabla de equivalencias + ejemplo numérico.

### Mascotas, Vida, Entretenimiento (3)
Baja prioridad — revisar caso a caso.

---

## FAQ pobres (< 5 preguntas)

Target: 7+ preguntas por calc, cubriendo long-tail keywords ("cómo se calcula X", "cuándo usar X", "X vs Y", errores comunes).

### Educación (38) — prioridad ALTA

Casi todas las calcs educativas tienen este problema. Template de preguntas que aplica a la mayoría:

1. ¿Cómo se calcula [topic]?
2. ¿Qué significa un resultado de X?
3. ¿Cómo mejorar mi [topic]?
4. ¿Por qué varía el resultado entre personas?
5. ¿Es esta calculadora oficial?
6. ¿Qué diferencia con [calc alternativa]?
7. ¿Puedo usar esta calc para [edge case]?

### Marketing (1)

---

## Comando para generar lista completa

```bash
python3 -c "
import json, os
for f in os.listdir('src/content/calcs'):
    if f.endswith('.json'):
        d = json.load(open(f'src/content/calcs/{f}'))
        if len(d.get('explanation','')) < 1000:
            print(f\"{d['category']} | {d['slug']}\")
" | sort > /tmp/thin-content.txt
```

## Plan sugerido de expansión

- **Semana 1**: 35 calcs de negocios (~2h por calc escrita = 70h, pero muchas se pueden batchear por similitud)
- **Semana 2**: 10 salud + 9 deportes (requieren fuentes oficiales)
- **Semana 3**: 38 educación FAQ (más rápido — solo completar preguntas existentes)
- **Semana 4**: resto

**Alternativa batch con LLM**: usar prompts estructurados con review manual. Puede hacerse 10-15 calcs por hora en modo "LLM propone, humano aprueba".
