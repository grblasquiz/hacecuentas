# Provincial Expansion Queue

## Estado actual (completo)

96 páginas generadas — 24 provincias × 4 calcs:
- `/argentina/[provincia]/calculadora-ingresos-brutos-provincial` ✅
- `/argentina/[provincia]/calculadora-patente-auto-provincia` ✅
- `/argentina/[provincia]/calculadora-impuesto-sellos-inmueble-contrato` ✅
- `/argentina/[provincia]/calculadora-costo-m2-construccion-argentina` ✅

Data: `src/content/argentina/*.json` tiene `provinceData` completo para las 24 provincias.

## Oportunidades futuras (requieren research)

Calcs que varían por provincia y tienen search demand, pero todavía no implementadas:

### Prioridad ALTA (alto search volume)

1. **Impuesto Inmobiliario Provincial** (ABL / Inmobiliario urbano rural)
   - Alícuotas 2026 por provincia
   - Base imponible = valor fiscal
   - Slug: `calculadora-impuesto-inmobiliario-provincial`
   - Volumen: 24 × 1 = 24 páginas nuevas

2. **Sellos sobre compraventa inmobiliaria** (distinto del sellos actual)
   - Escribanos y propietarios buscan esto
   - Slug: `calculadora-sellos-compraventa-inmueble-provincia`

3. **Impuesto de Sellos a contratos de alquiler**
   - Varía 0.3% – 1.2% por provincia
   - Slug: `calculadora-sellos-alquiler-contrato-provincial`

### Prioridad MEDIA

4. **Tarifa eléctrica residencial** (kWh por provincia)
   - Varía por distribuidora y zona
   - EDELAP, EDENOR, EDESUR, EPEC, EPE, EDEMSA...

5. **Costo combustible nafta/gasoil** (precio litro por provincia)
   - Impuesto provincial a los combustibles

6. **Boleto de transporte público** (SUBE vs boleto provincial)
   - AMBA vs interior

### Prioridad BAJA

7. **IVA mínimo coparticipable** (calculos muy técnicos de contaduría)
8. **Impuesto al cheque** (aplica nacional pero uso regional)

## Data sources recomendadas para el research

- **ARBA, ATER, ATM, API**: cada agencia tributaria provincial publica alícuotas
- **AFIP**: consolidation nacional
- **ERAS, ERNES, ENRE**: agencias reguladoras de servicios
- **CEFEPE**: combustibles por provincia

## Por qué no automaticé ahora

Generar datos financieros incorrectos por provincia podría:
- Generar demandas judiciales (calc legal/fiscal errónea)
- Bajar E-E-A-T (Google detecta datos desactualizados)
- Erosionar confianza de usuarios AR

La calc debería:
1. Tener alícuotas reales actualizadas 2026
2. Citar fuente oficial por provincia
3. Incluir notas sobre bonificaciones / descuentos

**Esto requiere research humana o LLM con verificación fuente-por-fuente.**
