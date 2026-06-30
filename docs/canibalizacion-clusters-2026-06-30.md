# Auditoría de canibalización — hacecuentas.com

**Fuente:** GA4 (sesiones, 90 días: 2026-04-01 → 2026-06-29) + catálogo de calcs en `src/content/`.
**Método:** clustering por intención de búsqueda DENTRO de cada locale (tokens de slug+title+h1, Jaccard≥0.6 + mismo formulaId). Anti-encadenamiento: cada cluster exige ≥1 token significativo común a todos los miembros.

## Números globales
- Calcs en el catálogo: **4.411** (todas las colecciones: AR + 13 locales)
- Sesiones totales del sitio (90d): **72.599** · mapeadas a páginas de calc: **60.120**
- Clusters de canibalización detectados: **167** (408 calcs involucradas, ~9% del catálogo)
- Sesiones que viven dentro de clusters canibalizando: **2.535** (90d)
- Clusters con tráfico >0: 119 · con 0 sesiones (cola pura): 48

## TIER A — Fusión prioritaria (≥40 sesiones)
_Ganador claro + variantes que le roban clics de la misma query. Mayor retorno._

**[ar] 263 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-fahrenheit-a-celsius-horno` (259)
  - 301 ← `/calculadora-conversor-fahrenheit-a-celsius` (2)
  - 301 ← `/calculadora-conversor-celsius-a-fahrenheit` (2)

**[ar] 196 sesiones · 7 calcs** → fusionar en `/calculadora-sueldo-neto-chile-2026` (171)
  - 301 ← `/calculadora-presupuesto-50-30-20` (13)
  - 301 ← `/calculadora-presupuesto-viaje` (6)
  - 301 ← `/calculadora-sueldo-neto-colombia-2026` (3)
  - 301 ← `/calculadora-presupuesto-regla-50-30-20` (2)
  - 301 ← `/calculadora-presupuesto-viaje-madrid` (1)
  - 301 ← `/calculadora-presupuesto-viaje-europa-30-dias-total` (0)

**[mx] 187 sesiones · 2 calcs** → fusionar en `/mx/calculadora-finiquito-liquidacion-mexico` (180)
  - 301 ← `/mx/calculadora-isr-finiquito-liquidacion-mexico-2026` (7)

**[ar] 173 sesiones · 2 calcs** → fusionar en `/calculadora-peso-ideal-bebe-mes-percentil` (99)
  - 301 ← `/calculadora-percentil-bebe-oms` (74)

**[es] 168 sesiones · 2 calcs** → fusionar en `/es/calculadora-convenio-hosteleria-espana-sueldo-2026-categoria` (130)
  - 301 ← `/es/calculadora-convenio-comercio-espana-sueldo-categoria-2026` (38)

**[ar] 160 sesiones · 2 calcs** → fusionar en `/calculadora-peso-ideal` (160)
  - 301 ← `/calculadora-peso-ideal-formulas-comparativa-broca-devine-robinson` (0)

**[ar] 132 sesiones · 3 calcs** → fusionar en `/calculadora-semanas-embarazo` (124)
  - 301 ← `/calculadora-semanas-meses-trimestres-embarazo` (7)
  - 301 ← `/calculadora-trimestre-embarazo` (1)

**[ar] 126 sesiones · 4 calcs** → fusionar en `/calculadora-edad-perro-humano` (92)
  - 301 ← `/calculadora-envejecer-mascota-humano-tabla-raza-tamano` (24)
  - 301 ← `/calculadora-edad-cachorro-humano` (10)
  - 301 ← `/calculadora-edad-perro-humano-raza-tamano` (0)

**[ar] 115 sesiones · 3 calcs** → fusionar en `/calculadora-edad-gato-humano-formula-anos` (87)
  - 301 ← `/calculadora-edad-gato-anos-humanos` (28)
  - 301 ← `/calculadora-edad-perro-gato-anos-humanos-tabla-2026-actualizada` (0)

**[ar] 104 sesiones · 2 calcs** → fusionar en `/calculadora-ganancia-neta-uber-conductor-argentina` (87)
  - 301 ← `/calculadora-uber-driver-chile-ganancia-neta` (17)

**[ar] 53 sesiones · 2 calcs** → fusionar en `/calculadora-edad-corregida-prematuro` (53)
  - 301 ← `/calculadora-edad-gestacional-corregida-prematuro` (0)

**[ar] 47 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-milimetros-a-pulgadas` (29)
  - 301 ← `/calculadora-conversor-kw-a-hp` (17)
  - 301 ← `/calculadora-conversor-dias-a-horas` (1)

**[ar] 42 sesiones · 2 calcs** → fusionar en `/calculadora-embargo-sueldo-porcentaje-maximo` (29)
  - 301 ← `/calculadora-embargo-sueldo-maximo` (13)

## TIER B — Fusión recomendada (10–39 sesiones)
**[ar] 37 sesiones · 2 calcs** → fusionar en `/calculadora-frecuencia-cardiaca-zonas-entrenamiento` (25)
  - 301 ← `/calculadora-zonas-frecuencia-cardiaca-entrenamiento` (12)

**[ar] 34 sesiones · 4 calcs** → fusionar en `/calculadora-calorias-caminando` (20)
  - 301 ← `/calculadora-calorias-quemadas-ejercicio` (13)
  - 301 ← `/calculadora-calorias-quemadas-yoga-pilates` (1)
  - 301 ← `/calculadora-calorias-quemadas-caminando` (0)

**[ar] 27 sesiones · 2 calcs** → fusionar en `/calculadora-cupos-copa-libertadores-pais-conmebol` (20)
  - 301 ← `/calculadora-cupos-copa-sudamericana-pais-conmebol` (7)

**[ar] 26 sesiones · 2 calcs** → fusionar en `/calculadora-factura-luz-estimada` (18)
  - 301 ← `/calculadora-factura-gas-estimada` (8)

**[ar] 25 sesiones · 3 calcs** → fusionar en `/conversor-kilogramos-libras-onzas` (25)
  - 301 ← `/calculadora-conversor-libras-a-gramos` (0)
  - 301 ← `/calculadora-conversor-libras-a-onzas` (0)

**[ar] 24 sesiones · 2 calcs** → fusionar en `/calculadora-ahorro-meta-mensual` (20)
  - 301 ← `/calculadora-ahorro-objetivo-mensual` (4)

**[ar] 24 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-gramos-a-onzas` (17)
  - 301 ← `/calculadora-conversor-onzas-a-gramos` (7)

**[ar] 23 sesiones · 2 calcs** → fusionar en `/calculadora-escalera-huella-contrahuella-ley-blondel` (16)
  - 301 ← `/calculadora-escalera-madera-huella-contrahuella` (7)

**[ar] 22 sesiones · 3 calcs** → fusionar en `/calculadora-sueno-bebe-horas` (17)
  - 301 ← `/calculadora-tiempo-sueno-bebe-horas-edad` (5)
  - 301 ← `/calculadora-horas-sueno-bebe-por-edad-tabla-recomendada` (0)

**[ar] 21 sesiones · 2 calcs** → fusionar en `/calculadora-vtv-costo-provincia-2026` (18)
  - 301 ← `/calculadora-vtv-costo-provincias-2026` (3)

**[ar] 20 sesiones · 2 calcs** → fusionar en `/calculadora-tanque-agua-litros-personas` (18)
  - 301 ← `/calculadora-tanque-agua-capacidad-personas` (2)

**[co] 19 sesiones · 2 calcs** → fusionar en `/co/calculadora-impuesto-vehiculos-bogota-2026-tabla` (16)
  - 301 ← `/co/calculadora-impuesto-vehiculos-colombia-2026-departamento` (3)

**[ar] 18 sesiones · 2 calcs** → fusionar en `/calculadora-comida-perro-diaria-gramos` (15)
  - 301 ← `/calculadora-comida-gato-diaria-gramos` (3)

**[ar] 18 sesiones · 6 calcs** → fusionar en `/calculadora-conversion-millas-kilometros-nudos-velocidad` (16)
  - 301 ← `/calculadora-conversor-kilometros-a-millas` (2)
  - 301 ← `/calculadora-conversor-kilometros-cuadrados-a-millas-cuadradas` (0)
  - 301 ← `/calculadora-conversor-millas-a-kilometros` (0)
  - 301 ← `/calculadora-conversor-anos-luz-a-kilometros` (0)
  - 301 ← `/calculadora-conversor-millas-nauticas-a-kilometros` (0)

**[ar] 16 sesiones · 2 calcs** → fusionar en `/calculadora-cable-awg-amperaje-seccion` (13)
  - 301 ← `/calculadora-fusible-amperaje-cable-seccion` (3)

**[ar] 15 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-kilogramos-a-libras` (15)
  - 301 ← `/calculadora-conversor-libras-a-kilogramos` (0)

**[ar] 14 sesiones · 3 calcs** → fusionar en `/calculadora-valor-hora-trabajo` (7)
  - 301 ← `/calculadora-cuanto-vale-mi-tiempo-hora-anual-salario` (5)
  - 301 ← `/calculadora-cuanto-vale-mi-tiempo` (2)

**[ar] 14 sesiones · 2 calcs** → fusionar en `/conversor-metros-cuadrados-hectareas-acres` (13)
  - 301 ← `/calculadora-conversor-hectareas-a-metros-cuadrados` (1)

**[ar] 14 sesiones · 2 calcs** → fusionar en `/calculadora-creatina-dosis-peso-carga-mantenimiento` (13)
  - 301 ← `/calculadora-creatina-carga-mantenimiento-peso` (1)

**[ar] 14 sesiones · 2 calcs** → fusionar en `/calculadora-indemnizacion-despido-improcedente-espana-33-dias` (12)
  - 301 ← `/calculadora-indemnizacion-despido-objetivo-espana-20-dias` (2)

**[ar] 13 sesiones · 2 calcs** → fusionar en `/calculadora-saturacion-oxigeno-evaluacion` (13)
  - 301 ← `/calculadora-saturacion-oxigeno-spo2-altitud-normal` (0)

**[ar] 12 sesiones · 2 calcs** → fusionar en `/calculadora-almacenamiento-bytes-kb-mb-gb-tb` (12)
  - 301 ← `/calculadora-conversor-bytes-a-kilobytes` (0)

**[ar] 11 sesiones · 2 calcs** → fusionar en `/calculadora-sueno-ideal-edad` (11)
  - 301 ← `/calculadora-horas-sueno-necesarias-edad-adulto` (0)

**[co] 11 sesiones · 2 calcs** → fusionar en `/co/calculadora-retencion-procedimiento-2-colombia-2026` (10)
  - 301 ← `/co/calculadora-retencion-salarios-procedimiento-1-colombia-2026` (1)

**[ar] 10 sesiones · 10 calcs** → fusionar en `/calculadora-conversor-pies-a-metros` (5)
  - 301 ← `/calculadora-conversor-varas-a-metros` (2)
  - 301 ← `/calculadora-conversor-acres-a-metros-cuadrados` (1)
  - 301 ← `/calculadora-conversor-pies-a-pulgadas` (1)
  - 301 ← `/calculadora-conversor-brazas-a-metros` (1)
  - 301 ← `/calculadora-conversor-metros-a-pies` (0)
  - 301 ← `/calculadora-conversor-metros-a-yardas` (0)
  - 301 ← `/calculadora-conversor-yardas-a-metros` (0)
  - 301 ← `/calculadora-conversor-pies-cuadrados-a-metros-cuadrados` (0)
  - 301 ← `/calculadora-conversor-cuadras-a-metros` (0)

**[ar] 10 sesiones · 2 calcs** → fusionar en `/calculadora-impermeabilizante-membrana-m2-techo` (6)
  - 301 ← `/calculadora-impermeabilizante-techo-kg-m2` (4)

**[ar] 10 sesiones · 2 calcs** → fusionar en `/calculadora-ahorro-compuesto-tiempo-duplicar-regla-72` (8)
  - 301 ← `/calculadora-regla-72-duplicar-dinero` (2)

## TIER C — Fusión / limpieza (1–9 sesiones)
_Cola con algo de tráfico; consolidar para no diluir._

**[ar] 9 sesiones · 3 calcs** → fusionar en `/calculadora-nota-necesaria-aprobar` (7)
  - 301 ← `/calculadora-nota-minima-aprobar-final-parcial-promedio` (2)
  - 301 ← `/calculadora-nota-final-necesaria-universidad` (0)

**[ar] 9 sesiones · 2 calcs** → fusionar en `/calculadora-costo-por-lead-cpl-marketing` (9)
  - 301 ← `/calculadora-costo-por-lead-cpl-campana` (0)

**[ve] 9 sesiones · 2 calcs** → fusionar en `/ve/calculadora-prestaciones-sociales-venezuela` (9)
  - 301 ← `/ve/calculadora-intereses-prestaciones-sociales-venezuela` (0)

**[ar] 8 sesiones · 5 calcs** → fusionar en `/calculadora-peso-ideal-gato-raza` (4)
  - 301 ← `/calculadora-peso-ideal-ragdoll` (3)
  - 301 ← `/calculadora-peso-ideal-gato-siames` (1)
  - 301 ← `/calculadora-peso-ideal-gato-britanico` (0)
  - 301 ← `/calculadora-peso-ideal-maine-coon` (0)

**[ar] 8 sesiones · 2 calcs** → fusionar en `/calculadora-interes-simple` (7)
  - 301 ← `/calculadora-interes-simple-prestamo` (1)

**[ar] 8 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-gb-a-mb` (4)
  - 301 ← `/calculadora-conversor-tb-a-gb` (4)

**[ar] 7 sesiones · 2 calcs** → fusionar en `/calculadora-ley-ohm-voltaje-resistencia` (6)
  - 301 ← `/calculadora-ley-ohm-voltaje-corriente-resistencia` (1)

**[co] 7 sesiones · 2 calcs** → fusionar en `/co/calculadora-internet-fibra-claro-etb-tigo-colombia-mejor-precio` (7)
  - 301 ← `/co/calculadora-precio-internet-fibra-tigo-claro-etb-2026-promo` (0)

**[ar] 6 sesiones · 2 calcs** → fusionar en `/calculadora-fecha-ovulacion-ventana-fertil` (4)
  - 301 ← `/calculadora-ovulacion-dia-fertil-ciclo-regular` (2)

**[ar] 6 sesiones · 2 calcs** → fusionar en `/calculadora-costo-carrera-privada` (5)
  - 301 ← `/calculadora-costo-carrera-total` (1)

**[ar] 6 sesiones · 3 calcs** → fusionar en `/calculadora-agua-diaria-recomendada` (6)
  - 301 ← `/calculadora-agua-diaria-litros-segun-peso` (0)
  - 301 ← `/calculadora-agua-ingesta-diaria-peso-actividad` (0)

**[ar] 6 sesiones · 2 calcs** → fusionar en `/calculadora-luz-solar-horas-planta` (3)
  - 301 ← `/calculadora-horas-luz-solar-planta-necesarias` (3)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-cantidad-panales-bebe-por-mes-edad` (3)
  - 301 ← `/calculadora-panales-mes-bebe-talle-gasto-anual` (2)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-conversion-celsius-fahrenheit-kelvin-rankine-temperatura` (3)
  - 301 ← `/calculadora-conversion-celsius-fahrenheit-kelvin` (2)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-volumen-cilindro-radio-altura` (4)
  - 301 ← `/calculadora-volumen-cono-radio-altura` (1)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-vacunas-perro-calendario-cachorro` (3)
  - 301 ← `/calculadora-vacunas-perro-cachorro-adulto-calendario` (2)

**[ar] 5 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-celsius-a-kelvin` (4)
  - 301 ← `/calculadora-conversor-kelvin-a-celsius` (1)
  - 301 ← `/calculadora-conversor-fahrenheit-a-kelvin` (0)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-aguinaldo-mexico-2026` (5)
  - 301 ← `/calculadora-aguinaldo-neto-mexico-isr-2026` (0)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-carga-capacitor-constante-rc` (3)
  - 301 ← `/calculadora-capacitor-carga-descarga-rc` (2)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-superavit-calorico-masa-muscular` (5)
  - 301 ← `/calculadora-superavit-calorico-volumen` (0)

**[ar] 5 sesiones · 2 calcs** → fusionar en `/calculadora-calorias-ciclismo-intensidad` (4)
  - 301 ← `/calculadora-calorias-ciclismo-watts` (1)

**[pe] 5 sesiones · 2 calcs** → fusionar en `/pe/calculadora-credito-hipotecario-peru` (3)
  - 301 ← `/pe/calculadora-credito-vehicular-peru` (2)

**[pt] 5 sesiones · 2 calcs** → fusionar en `/pt/salario-liquido-com-pensao-alimenticia-br` (4)
  - 301 ← `/pt/pensao-alimenticia-percentual-salario-filho` (1)

**[uy] 5 sesiones · 2 calcs** → fusionar en `/uy/salario-liquido-uruguay` (4)
  - 301 ← `/uy/sueldo-nominal-a-liquido-uruguay` (1)

**[ar] 4 sesiones · 2 calcs** → fusionar en `/calculadora-propina-por-pais-viaje` (4)
  - 301 ← `/calculadora-propina-costumbre-por-pais` (0)

**[ar] 4 sesiones · 9 calcs** → fusionar en `/calculadora-presupuesto-viaje-dubai` (3)
  - 301 ← `/calculadora-presupuesto-viaje-santiago-chile` (1)
  - 301 ← `/calculadora-presupuesto-viaje-barcelona` (0)
  - 301 ← `/calculadora-presupuesto-viaje-paris` (0)
  - 301 ← `/calculadora-presupuesto-viaje-londres` (0)
  - 301 ← `/calculadora-presupuesto-viaje-tokio` (0)
  - 301 ← `/calculadora-presupuesto-viaje-vacaciones` (0)
  - 301 ← `/calculadora-presupuesto-viaje-bali-indonesia` (0)
  - 301 ← `/calculadora-presupuesto-viaje-nueva-york` (0)

**[ar] 4 sesiones · 3 calcs** → fusionar en `/calculadora-lente-distancia-focal` (3)
  - 301 ← `/calculadora-distancia-hiperfocal-lente` (1)
  - 301 ← `/calculadora-distancia-focal-lente-delgada` (0)

**[ar] 4 sesiones · 3 calcs** → fusionar en `/calculadora-plan-entrenamiento-maraton-42k-semanas` (3)
  - 301 ← `/calculadora-plan-entrenamiento-5k-semanas` (1)
  - 301 ← `/calculadora-plan-entrenamiento-10k-semanas` (0)

**[ar] 4 sesiones · 3 calcs** → fusionar en `/calculadora-costo-suscripciones-mensual` (2)
  - 301 ← `/calculadora-cuanto-gasto-en-delivery` (1)
  - 301 ← `/calculadora-sube-argentina-costo-viaje-gasto-mensual` (1)

**[ar] 4 sesiones · 2 calcs** → fusionar en `/calculadora-vacunas-bebe-calendario-2026-argentina-edad` (3)
  - 301 ← `/calculadora-vacunas-bebe-calendario` (1)

**[pt-pt] 4 sesiones · 3 calcs** → fusionar en `/pt-pt/calculadora-subsidio-ferias-portugal` (4)
  - 301 ← `/pt-pt/calculadora-subsidio-natal-portugal` (0)
  - 301 ← `/pt-pt/calculadora-subsidio-desemprego-portugal` (0)

**[ve] 4 sesiones · 2 calcs** → fusionar en `/ve/cuanto-es-bolivares-en-dolares` (2)
  - 301 ← `/ve/cuanto-es-dolares-en-bolivares` (2)

**[do] 4 sesiones · 4 calcs** → fusionar en `/do/regalia-pascual-republica-dominicana` (2)
  - 301 ← `/do/regalia-pascual-proporcional-republica-dominicana` (1)
  - 301 ← `/do/sueldo-bruto-a-neto-republica-dominicana` (1)
  - 301 ← `/do/calculadora-doble-sueldo-republica-dominicana` (0)

**[ar] 3 sesiones · 6 calcs** → fusionar en `/calculadora-costo-mensual-raza-gato` (2)
  - 301 ← `/calculadora-costo-mensual-mascota-perro-gato` (1)
  - 301 ← `/calculadora-costo-anual-mascota-perro-gato-ar-completo` (0)
  - 301 ← `/calculadora-costo-mascota-mensual` (0)
  - 301 ← `/calculadora-costo-mascota-primer-ano` (0)
  - 301 ← `/calculadora-costo-mensual-raza-perro` (0)

**[ar] 3 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-anos-a-dias` (2)
  - 301 ← `/calculadora-conversor-semanas-a-dias` (1)

**[ar] 3 sesiones · 2 calcs** → fusionar en `/calculadora-calorias-embarazo-trimestre` (3)
  - 301 ← `/calculadora-calorias-embarazo-extra-trimestre` (0)

**[ar] 3 sesiones · 3 calcs** → fusionar en `/calculadora-peso-ideal-rottweiler` (2)
  - 301 ← `/calculadora-peso-ideal-pitbull` (1)
  - 301 ← `/calculadora-peso-ideal-chihuahua` (0)

**[ar] 3 sesiones · 3 calcs** → fusionar en `/calculadora-resolucion-pantalla-ppi` (2)
  - 301 ← `/calculadora-densidad-pixeles-pantalla-ppi-retina` (1)
  - 301 ← `/calculadora-resolucion-pantalla-ppi-densidad` (0)

**[ar] 3 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-calorias-a-joules` (2)
  - 301 ← `/calculadora-conversor-joules-a-calorias` (1)

**[ar] 3 sesiones · 2 calcs** → fusionar en `/calculadora-caida-libre-tiempo-altura` (3)
  - 301 ← `/calculadora-velocidad-caida-libre-tiempo` (0)

**[en] 3 sesiones · 3 calcs** → fusionar en `/en/one-rep-max-calculator` (3)
  - 301 ← `/en/one-rep-max-epley-brzycki-calculator` (0)
  - 301 ← `/en/1rm-calculator` (0)

**[en] 3 sesiones · 3 calcs** → fusionar en `/en/loan-payment-calculator` (3)
  - 301 ← `/en/mortgage-payment-monthly-calculator` (0)
  - 301 ← `/en/car-loan-monthly-payment-calculator` (0)

**[en] 3 sesiones · 2 calcs** → fusionar en `/en/bricks-per-square-meter-wall` (2)
  - 301 ← `/en/bricks-per-m2-wall` (1)

**[py] 3 sesiones · 2 calcs** → fusionar en `/py/descuento-ips-9-salario` (2)
  - 301 ← `/py/calculadora-salario-neto-paraguay` (1)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-flashcards-por-dia` (1)
  - 301 ← `/calculadora-anki-flashcards-dia-aprender-palabras` (1)

**[ar] 2 sesiones · 3 calcs** → fusionar en `/calculadora-aire-acondicionado-frigorias-ambiente` (2)
  - 301 ← `/calculadora-aire-acondicionado-frigorias-m2-ambiente` (0)
  - 301 ← `/calculadora-aire-acondicionado-frigorias-btu-habitacion` (0)

**[ar] 2 sesiones · 3 calcs** → fusionar en `/calculadora-cuotas-sin-interes-precio` (2)
  - 301 ← `/calculadora-hot-sale-cuotas-sin-interes-vs-contado` (0)
  - 301 ← `/calculadora-cyber-monday-cuotas-sin-interes-vs-contado` (0)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-acres-a-hectareas` (2)
  - 301 ← `/calculadora-conversor-manzanas-a-hectareas` (0)

**[ar] 2 sesiones · 3 calcs** → fusionar en `/calculadora-vocabulario-nivel-mcer-a1-c2-palabras` (2)
  - 301 ← `/calculadora-vocabulario-idioma-palabras-nivel-conocido` (0)
  - 301 ← `/calculadora-vocabulario-nivel-idioma` (0)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-claude-gemini-tokens-comparativa-precio-uso` (2)
  - 301 ← `/calculadora-gpt-5-vs-claude-37-vs-gemini-25-precio-uso` (0)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-conversor-kwh-a-joules` (1)
  - 301 ← `/calculadora-conversor-btu-a-joules` (1)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-tiempo-fermentacion-masa-temperatura` (2)
  - 301 ← `/calculadora-kombucha-fermentacion-tiempo` (0)

**[ar] 2 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-pulgadas-a-centimetros` (1)
  - 301 ← `/calculadora-conversor-pulgadas-cuadradas-a-centimetros-cuadrados` (1)
  - 301 ← `/calculadora-conversor-centimetros-a-pulgadas` (0)

**[ar] 2 sesiones · 3 calcs** → fusionar en `/calculadora-costo-hijo-mensual` (2)
  - 301 ← `/calculadora-costo-mensual-pileta` (0)
  - 301 ← `/calculadora-costo-mensual-pez-acuario` (0)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-paseos-perro-minutos-raza-energia` (1)
  - 301 ← `/calculadora-minutos-paseo-perro-raza-edad` (1)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-costo-hora-consultor-marketing` (1)
  - 301 ← `/calculadora-costo-hora-redactor-copywriter` (1)

**[ar] 2 sesiones · 2 calcs** → fusionar en `/calculadora-presion-hidrostatica` (2)
  - 301 ← `/calculadora-presion-hidrostatica-profundidad` (0)

**[en] 2 sesiones · 2 calcs** → fusionar en `/en/price-to-book-ratio` (2)
  - 301 ← `/en/pe-ratio-calculator` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-progresion-aritmetica` (1)
  - 301 ← `/calculadora-progresion-aritmetica-suma-termino` (0)

**[ar] 1 sesiones · 3 calcs** → fusionar en `/calculadora-fernet-cola-por-invitado-juntada` (1)
  - 301 ← `/calculadora-pisco-por-invitado-previa` (0)
  - 301 ← `/calculadora-snacks-por-invitado-juntada` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-propina-restaurante` (1)
  - 301 ← `/calculadora-propina-restaurante-pais-porcentaje` (0)

**[ar] 1 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-galones-a-litros` (1)
  - 301 ← `/calculadora-conversor-litros-a-galones` (0)
  - 301 ← `/calculadora-conversor-pintas-a-litros` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-cuna-colecho-edad-transicion-cama` (1)
  - 301 ← `/calculadora-cuna-colecho-edad-transicion-cama-ninos` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-uptime-servidor-nueve-nueves-minutos` (1)
  - 301 ← `/calculadora-uptime-porcentaje-minutos-caida` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-prestamo-personal-cuota-mensual` (1)
  - 301 ← `/calculadora-prestamo-personal-galicia-vs-santander-cuota` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-cap-rate-rentabilidad-alquiler-inmobiliario` (1)
  - 301 ← `/calculadora-rentabilidad-alquiler-cap-rate` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-progresion-geometrica-suma-termino` (1)
  - 301 ← `/calculadora-progresion-geometrica` (0)

**[ar] 1 sesiones · 3 calcs** → fusionar en `/calculadora-expectativa-vida-raza-perro` (1)
  - 301 ← `/calculadora-expectativa-vida-conejo-raza` (0)
  - 301 ← `/calculadora-esperanza-vida-perro-raza` (0)

**[ar] 1 sesiones · 3 calcs** → fusionar en `/calculadora-conversor-radianes-a-grados` (1)
  - 301 ← `/calculadora-conversor-grados-a-gradianes` (0)
  - 301 ← `/calculadora-conversor-grados-a-radianes` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-indice-glucemico-carga-alimento-porcion` (1)
  - 301 ← `/calculadora-indice-glucemico-alimentos` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-impermanent-loss-defi-2026` (1)
  - 301 ← `/calculadora-yield-farming-impermanent-loss-pool` (0)

**[ar] 1 sesiones · 2 calcs** → fusionar en `/calculadora-emigrar-espana-presupuesto-primer-ano-familia` (1)
  - 301 ← `/calculadora-emigrar-uruguay-presupuesto-primer-ano-familia` (0)

**[en] 1 sesiones · 2 calcs** → fusionar en `/en/simple-interest-calculator` (1)
  - 301 ← `/en/simple-interest-vs-compound-comparison` (0)

**[en] 1 sesiones · 2 calcs** → fusionar en `/en/1rm-squat-estimator` (1)
  - 301 ← `/en/1rm-deadlift-estimator` (0)

**[en] 1 sesiones · 2 calcs** → fusionar en `/en/water-turtle-diet-weight-age` (1)
  - 301 ← `/en/baby-feeding-amount-by-age-calculator` (0)

**[en] 1 sesiones · 2 calcs** → fusionar en `/en/debt-snowball-payoff-calculator` (1)
  - 301 ← `/en/debt-avalanche-payoff-calculator` (0)

**[pt] 1 sesiones · 3 calcs** → fusionar en `/pt/simples-nacional-anexo-v-profissional-liberal` (1)
  - 301 ← `/pt/simples-nacional-anexo-iii-servicos` (0)
  - 301 ← `/pt/fator-r-simples-nacional-anexo-iii-vs-v` (0)

**[pt-pt] 1 sesiones · 2 calcs** → fusionar en `/pt-pt/calculadora-salario-liquido-portugal` (1)
  - 301 ← `/pt-pt/calculadora-salario-anual-14-meses-portugal` (0)

**[do] 1 sesiones · 2 calcs** → fusionar en `/do/calculadora-costo-vida-republica-dominicana` (1)
  - 301 ← `/do/costo-empleador-republica-dominicana` (0)

## TIER D — Cola sin tráfico (0 sesiones): 48 clusters / 105 calcs
_Candidatas a fusión o a dejar como long-tail pSEO. No urgen (no hay autoridad que perder), pero suman thin-content si son gemelas exactas._

- [ar] 3 calcs: calculadora-hidratacion-ejercicio-electrolitos-isotonica, calculadora-hidratacion-ejercicio-ml, calculadora-hidratacion-agua-durante-ejercicio
- [ar] 2 calcs: calculadora-tiktok-mejor-hora-publicar, calculadora-instagram-mejor-hora-publicar
- [ar] 2 calcs: calculadora-roi-marketing-influencer-campana, calculadora-roi-email-marketing-campana
- [ar] 2 calcs: calculadora-jardinera-tierra-m3-por-superficie, calculadora-tierra-cantero-m3-litros
- [ar] 3 calcs: calculadora-watts-ciclismo-ftp-umbral-test, calculadora-zonas-potencia-ciclismo-watts-kg, calculadora-ftp-watts-ciclismo
- [ar] 2 calcs: calculadora-prediccion-tiempo-maraton-riegel, calculadora-prediccion-tiempo-5k-10k-21k
- [ar] 2 calcs: calculadora-reembolso-iva-turista-extranjero-tax-free-uruguay-chile, calculadora-reintegro-iva-turistas-extranjeros-argentina
- [ar] 2 calcs: calculadora-conversor-arrobas-a-kilogramos, calculadora-conversor-stones-a-kilogramos
- [ar] 2 calcs: calculadora-conversor-quilates-a-gramos, calculadora-conversor-kilogramos-a-gramos
- [ar] 2 calcs: calculadora-conversor-kmh-a-ms, calculadora-conversor-ms-a-kmh
- [ar] 2 calcs: calculadora-ahorro-futuro-hijo-universidad-18-anos, calculadora-ahorro-universidad-hijo-18-anios-cuota
- [ar] 2 calcs: calculadora-vitamina-b12-dosis-vegano-mensual, calculadora-vitamina-b12-vegano
- [ar] 2 calcs: calculadora-cupcakes-por-invitado-cumple, calculadora-fruta-por-invitado-cumple
- [ar] 2 calcs: calculadora-dilucion-whisky-abv-objetivo, calculadora-dilucion-cerveza-alcohol-objetivo
- [ar] 2 calcs: calculadora-proyeccion-21k-desde-10k-cameron, calculadora-proyeccion-10k-desde-5k-riegel
- [ar] 2 calcs: calculadora-regla-de-tres-compuesta-directa-inversa, calculadora-regla-de-tres-inversa
- [en] 2 calcs: daily-water-intake-by-weight-calculator, daily-water-intake-calculator
- [en] 2 calcs: vocabulary-active-words-language-level, vocabulary-level-calculator
- [en] 2 calcs: annual-salary-to-hourly-rate-converter, hourly-to-annual-salary-converter
- [en] 2 calcs: daily-dietary-fiber-intake-calculator, daily-protein-intake-by-goal-calculator
- [en] 3 calcs: ivf-due-date-calculator, conception-date-from-due-date-calculator, due-date-from-conception-date
- [en] 2 calcs: compost-maturation-time, book-reading-time
- [en] 2 calcs: compound-interest-calculator-long-term, compound-interest-calculator
- [en] 2 calcs: hydration-exercise-ml, sports-hydration-electrolytes-exercise
- [en] 2 calcs: boxing-calories-burned, swimming-calories-calculator
- [en] 2 calcs: aws-ec2-monthly-cost-calculator, llm-token-cost-calculator
- [en] 3 calcs: bbq-meat-portions-per-person, rice-grams-per-person, rice-portions-per-person-side-dish
- [en] 2 calcs: planting-calendar-northern-hemisphere, planting-calendar-southern-hemisphere
- [en] 2 calcs: radians-to-degrees-angle, conversion-degrees-radians-gradians
- [en] 2 calcs: vo2-max-cooper-12min-calculator, vo2-max-cooper-test-calculator
- [en] 2 calcs: weekly-hypertrophy-volume, weekly-volume-muscle-group
- [en] 2 calcs: trip-fuel-cost-calculator, gas-trip-cost-calculator
- [en] 2 calcs: fish-tank-water-calculator, water-heater-capacity-calculator
- [en] 2 calcs: cone-volume-radius-height, cylinder-volume-radius-height
- [en] 2 calcs: hydrostatic-pressure-depth, hydrostatic-pressure
- [en] 2 calcs: rule-of-three-simple-direct-inverse, rule-of-three-calculator
- [en] 2 calcs: 5k-training-plan-weeks, 10k-training-plan-weeks
- [en] 2 calcs: baby-sleep-hours-by-age-chart, recommended-sleep-hours-by-age
- [en] 2 calcs: body-composition-fat-vs-lean, lean-body-mass-calculator
- [en] 2 calcs: ph-soil-correction-lime-sulfur, soil-ph-correction-lime
- [en] 2 calcs: adolescent-final-height-prediction, child-height-prediction
- [en] 2 calcs: dog-age-by-breed, pet-age-calculator-human-years-breed-size
- [en] 3 calcs: vat-calculator, sales-tax-calculator, vat-tax-calculator
- [en] 2 calcs: daily-steps-calculator, daily-calcium-intake
- [pt] 4 calcs: salario-liquido-clt-inss-irrf-2026, salario-bruto-a-partir-liquido-br, salario-liquido-com-dependentes-br, calculadora-13-salario-liquido-bruto-clt
- [pt] 4 calcs: aposentadoria-inss-transicao-pontos, aposentadoria-inss-transicao-pedagio-100, aposentadoria-inss-transicao-pedagio-50, aposentadoria-inss-transicao-idade-progressiva
- [pt] 2 calcs: calculadora-fgts-multa-40-rescisao, fgts-saque-rescisao-multa-40
- [pt] 2 calcs: aposentadoria-inss-professor-redutor-5-anos, aposentadoria-inss-especial-insalubridade