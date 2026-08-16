# Pruning audit vs GSC — 2026-08-04

Periodo: **2026-07-05 → 2026-08-01** (28 dias).
Threshold impressions: **50/periodo**.

- **GONE_410**: 4604 URLs (0 impr + 0 clicks, candidatas a 410 Gone para fast desindex)
- **PROTECTED_YOUNG**: 394 URLs excluidas del 410 (locale joven /es,/mx,/co,/cl o calc <6m — NO se emiten a gone-410.ts)
- **DESPRUNE recomendado**: 7 URLs (≈ **603 impressions/periodo recuperables**)
- **REVIEW manual**: 0 URLs
- **KEEP** (target funciona): 0 URLs

## GONE_410 — devolver 410 (acelera desindex vs 301)

URLs con verdadero 0-trafico. Al pasar a `src/lib/gone-410.ts` y deployar,
el middleware devuelve **HTTP 410 Gone**, lo que le dice a Google: 
*'esta URL fue eliminada permanentemente, sacala del index ya'*.
Mas rapido que 301 (que mantiene la URL en queue de re-crawl).

Total: 4604 URLs. Para aplicar: corre `--emit-gone-410`.

## PROTECTED_YOUNG — excluidas del 410 por el guard

URLs que tendrian 0 impr/0 clicks pero NO se 410'ean: pertenecen a un
locale joven/secundario (/es, /mx, /co, /cl, ...) o a una calc publicada
hace menos de 6 meses. "0 impresiones" no implica zombie si la URL no
tuvo tiempo de indexarse en un mercado con autoridad. Falso positivo del
2026-05-27 (60 calcs-es). Override con `--no-guard` (peligroso).

Total: 394 URLs.

| URL | Motivo guard |
|-----|--------------|
| `/cl/calculadora-aguinaldo-fiestas-patrias-Navidad-chile-2026` | locale-secundario:cl |
| `/cl/calculadora-aporte-empleador-empleado-chile-total-costo-laboral` | locale-secundario:cl |
| `/cl/calculadora-aporte-mutual-empresa-chile-trabajador-tasa-base` | locale-secundario:cl |
| `/cl/calculadora-aporte-previsional-solidario-aps-chile` | locale-secundario:cl |
| `/cl/calculadora-aporte-trabajador-honorarios-chile-cotizacion-obligatoria` | locale-secundario:cl |
| `/cl/calculadora-apv-beneficio-tributario-chile-regimen-a-b` | locale-secundario:cl |
| `/cl/calculadora-arriendo-santiago-vina-concepcion-precio-promedio` | locale-secundario:cl |
| `/cl/calculadora-asignacion-familiar-chile-2026-tramos-renta` | locale-secundario:cl |
| `/cl/calculadora-asignacion-zona-extrema-chile-aysen-magallanes-arica` | locale-secundario:cl |
| `/cl/calculadora-aumento-pension-reforma-seguro-social-chile-2026` | locale-secundario:cl |
| `/cl/calculadora-bebidas-por-invitado-evento-chile` | locale-secundario:cl |
| `/cl/calculadora-bonos-tesoro-chile-bcu-bce-rendimiento` | locale-secundario:cl |
| `/cl/calculadora-cae-credito-aval-estado-chile-vs-becas` | locale-secundario:cl |
| `/cl/calculadora-carne-asado-kg-por-persona-chile` | locale-secundario:cl |
| `/cl/calculadora-cobre-precio-bolsa-chile-impacto-fiscal-codelco` | locale-secundario:cl |
| `/cl/calculadora-compensacion-corte-luz-sec-chile` | locale-secundario:cl |
| `/cl/calculadora-contribuciones-morosas-tgr-chile-intereses-reajuste` | locale-secundario:cl |
| `/cl/calculadora-copago-bonificacion-fonasa-chile` | locale-secundario:cl |
| `/cl/calculadora-coste-funeral-promedio-chile-2026-cremacion-sepelio` | locale-secundario:cl |
| `/cl/calculadora-coste-inscripcion-conservador-bienes-raices-chile` | locale-secundario:cl |
| `/cl/calculadora-costo-construccion-m2-chile` | locale-secundario:cl |
| `/cl/calculadora-credito-automotriz-chile-cuota-cae-2026` | locale-secundario:cl |
| `/cl/calculadora-credito-aval-cae-chile-deuda-final-promedio` | locale-secundario:cl |
| `/cl/calculadora-credito-consumo-bci-chile-cuota-cae` | locale-secundario:cl |
| `/cl/calculadora-credito-hipotecario-chile-uf-cmf-2026` | locale-secundario:cl |
| `/cl/calculadora-crefacile-financiar-electrodomesticos-chile-cuota-cae` | locale-secundario:cl |
| `/cl/calculadora-dividir-gastos-cuenta-amigos-chile` | locale-secundario:cl |
| `/cl/calculadora-emol-uf-pesos-chile` | locale-secundario:cl |
| `/cl/calculadora-finiquito-renuncia-voluntaria-chile-vacaciones-proporcionales` | locale-secundario:cl |
| `/cl/calculadora-fondos-mutuos-chile-rentabilidad-comparativa-2026` | locale-secundario:cl |
| `/cl/calculadora-gratificacion-legal-chile-25-porcentaje-4-75-utm` | locale-secundario:cl |
| `/cl/calculadora-gratuidad-educacion-superior-chile-deciles-1-6` | locale-secundario:cl |
| `/cl/calculadora-honorarios-vs-contrato-chile-conveniencia-tributaria` | locale-secundario:cl |
| `/cl/calculadora-horas-extras-chile-recargo-50-ley-40-horas` | locale-secundario:cl |
| `/cl/calculadora-impuesto-aerolinea-chile-tasa-embarque-internacional` | locale-secundario:cl |
| `/cl/calculadora-impuesto-mayor-valor-venta-propiedad-chile-8000-uf` | locale-secundario:cl |
| `/cl/calculadora-impuesto-primera-categoria-chile-empresas-2026` | locale-secundario:cl |
| `/cl/calculadora-impuesto-renta-arrendamiento-arrendador-chile` | locale-secundario:cl |
| `/cl/calculadora-impuesto-territorial-contribuciones-bienes-raices-chile` | locale-secundario:cl |
| `/cl/calculadora-impuesto-territorial-residencial-2026-tabla-bienes-raices` | locale-secundario:cl |
| `/cl/calculadora-impuesto-timbres-estampillas-chile-credito-hipotecario` | locale-secundario:cl |
| `/cl/calculadora-impuesto-verde-vehiculo-nuevo-chile-sii` | locale-secundario:cl |
| `/cl/calculadora-indemnizacion-anos-servicio-chile-despido` | locale-secundario:cl |
| `/cl/calculadora-internet-fibra-chile-claro-vtr-mundo-mejor-precio` | locale-secundario:cl |
| `/cl/calculadora-inversion-departamento-arriendo-chile-yield-rentabilidad` | locale-secundario:cl |
| `/cl/calculadora-isapre-cotizacion-chile-7-porcentaje-plan` | locale-secundario:cl |
| `/cl/calculadora-iva-chile-19-porciento-tarifa-general` | locale-secundario:cl |
| `/cl/calculadora-iva-honorarios-chile-10-porciento-retencion` | locale-secundario:cl |
| `/cl/calculadora-jornada-42-horas-chile-2026-sueldo-hora` | locale-secundario:cl |
| `/cl/calculadora-licencia-conducir-chile-renovacion-precio-vencimiento` | locale-secundario:cl |
| `/cl/calculadora-licencia-medica-chile-pago-subsidio-isapre-fonasa` | locale-secundario:cl |
| `/cl/calculadora-millas-latam-pass-acumulacion-valor-chile` | locale-secundario:cl |
| `/cl/calculadora-nem-ranking-puntaje-demre-chile-2026` | locale-secundario:cl |
| `/cl/calculadora-pago-anticipado-credito-hipotecario-chile-ahorro-uf` | locale-secundario:cl |
| `/cl/calculadora-pago-electronico-chile-transbank-comisiones-onepay-mach` | locale-secundario:cl |
| `/cl/calculadora-pase-escolar-tne-chile-precio-2026-recargo` | locale-secundario:cl |
| `/cl/calculadora-patente-comercial-municipal-chile-capital-propio` | locale-secundario:cl |
| `/cl/calculadora-pension-alimenticia-chile-padre-tribunal-familia` | locale-secundario:cl |
| `/cl/calculadora-pension-asignacion-zona-extrema-aporte-extra-chile` | locale-secundario:cl |
| `/cl/calculadora-pension-jubilacion-chile-edad-aportes-2026` | locale-secundario:cl |
| `/cl/calculadora-permiso-circulacion-chile-vehiculo-2026-comuna` | locale-secundario:cl |
| `/cl/calculadora-permiso-postnatal-chile-12-semanas-extension` | locale-secundario:cl |
| `/cl/calculadora-postnatal-prenatal-padre-chile-traspaso-6-semanas` | locale-secundario:cl |
| `/cl/calculadora-puntaje-ponderado-paes-universidad-de-chile` | locale-secundario:cl |
| `/cl/calculadora-pyme-chile-regimen-14d-tributacion-simplificada` | locale-secundario:cl |
| `/cl/calculadora-reajuste-arriendo-ipc-chile` | locale-secundario:cl |
| `/cl/calculadora-reajuste-sueldo-minimo-chile-2026-imm` | locale-secundario:cl |
| `/cl/calculadora-recibo-gas-chile-metrogas-lipigas-cilindro-vs-red` | locale-secundario:cl |
| `/cl/calculadora-recibo-luz-chile-enel-cge-saesa-tarifa-bt1` | locale-secundario:cl |
| `/cl/calculadora-retiro-seguro-cesantia-cic-afc-chile-giros` | locale-secundario:cl |
| `/cl/calculadora-salario-por-hora-chile` | locale-secundario:cl |
| `/cl/calculadora-saldo-afp-rentabilidad-multifondos-chile-2026` | locale-secundario:cl |
| `/cl/calculadora-seguro-cesantia-chile-afc-cuota-fondo` | locale-secundario:cl |
| `/cl/calculadora-semana-corrida-chile-remuneracion-variable` | locale-secundario:cl |
| `/cl/calculadora-sueldo-proporcional-dias-trabajados-chile` | locale-secundario:cl |
| `/cl/calculadora-tarifa-vuelo-domestico-chile-impuestos-tasas-aeropuerto` | locale-secundario:cl |
| `/cl/calculadora-tipo-cambio-dolar-peso-chile-clp-banco-central` | locale-secundario:cl |
| `/cl/calculadora-tope-imponible-cotizaciones-chile-2026` | locale-secundario:cl |
| `/cl/calculadora-uf-uta-utm-chile-conversion-pesos-2026` | locale-secundario:cl |
| `/cl/conversor-tazas-a-gramos-cocina-chile` | locale-secundario:cl |
| `/cl/decidir/arrendar-o-comprar` | locale-secundario:cl |
| `/cl/decidir/como-salir-de-deudas` | locale-secundario:cl |
| `/cl/decidir/cuando-alcanzo-mi-meta-de-ahorro` | locale-secundario:cl |
| `/cl/decidir/cuanto-arriendo-puedo-pagar` | locale-secundario:cl |
| `/cl/decidir/cuanto-cobrar-por-hora-freelance` | locale-secundario:cl |
| `/cl/decidir/cuanto-fondo-de-emergencia-necesito` | locale-secundario:cl |
| `/cl/decidir/cuanto-puedo-gastar-al-mes` | locale-secundario:cl |
| `/cl/decidir/prepagar-deuda-o-invertir` | locale-secundario:cl |
| `/cl/decidir/puedo-pagar-este-credito` | locale-secundario:cl |
| `/cl/vida/separarse-en-chile` | locale-secundario:cl |
| `/co/calculadora-ahorro-comisiones-bre-b-vs-transferencia-colombia` | locale-secundario:co |
| `/co/calculadora-ahorro-en-pesos-vs-cdt-vs-fic-vs-tes-colombia` | locale-secundario:co |
| `/co/calculadora-antiguedad-laboral-colombia` | locale-secundario:co |
| `/co/calculadora-aporte-caja-compensacion-colombia-2026-subsidio-familiar` | locale-secundario:co |
| `/co/calculadora-aporte-cesantias-empleador-empleado-colombia-fondo` | locale-secundario:co |
| `/co/calculadora-aporte-eps-pension-empleado-colombia-2026` | locale-secundario:co |
| `/co/calculadora-aporte-fic-fomento-investigacion-cientifica-colombia` | locale-secundario:co |
| `/co/calculadora-aporte-fondo-solidaridad-pension-fsp-colombia` | locale-secundario:co |
| `/co/calculadora-aportes-arl-colombia-empleador-empleado-riesgo` | locale-secundario:co |
| `/co/calculadora-aumento-mesada-pensional-colombia-2026-ipc` | locale-secundario:co |
| `/co/calculadora-auxilio-transporte-colombia-2026` | locale-secundario:co |
| `/co/calculadora-becas-icetex-colombia-credito-monto-2026` | locale-secundario:co |
| `/co/calculadora-beps-colpensiones-colombia-2026` | locale-secundario:co |
| `/co/calculadora-bicicleta-electrica-vs-moto-vs-carro-colombia` | locale-secundario:co |
| `/co/calculadora-bono-hambre-cero-colombia-renta-ciudadana` | locale-secundario:co |
| `/co/calculadora-canon-arrendamiento-comercial-colombia-comerciante` | locale-secundario:co |
| `/co/calculadora-canon-arrendamiento-vivienda-aumento-anual-colombia-ipc` | locale-secundario:co |
| `/co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias` | locale-secundario:co |
| `/co/calculadora-cesantias-colombia-12-porciento-anual` | locale-secundario:co |
| `/co/calculadora-cesantias-colombia-2026` | locale-secundario:co |
| `/co/calculadora-cesantias-traslado-fondo-rendimiento-colombia` | locale-secundario:co |
| `/co/calculadora-comparativa-banco-comisiones-colombia-2026` | locale-secundario:co |
| `/co/calculadora-comparendos-transito-colombia-2026` | locale-secundario:co |
| `/co/calculadora-contribucion-valorizacion-colombia` | locale-secundario:co |
| `/co/calculadora-coste-arriendo-vs-comprar-colombia-10-anos` | locale-secundario:co |
| `/co/calculadora-coste-vida-mensual-colombia-soltero-pareja` | locale-secundario:co |
| `/co/calculadora-costo-anual-moto-colombia-2026-soat-tecnomecanica` | locale-secundario:co |
| `/co/calculadora-costo-despido-empleador-colombia-2026` | locale-secundario:co |
| `/co/calculadora-costo-hora-empleado-empresa-colombia-2026` | locale-secundario:co |
| `/co/calculadora-costo-matricula-vehiculo-nuevo-colombia-2026` | locale-secundario:co |
| `/co/calculadora-costo-pasaporte-colombia-2026-departamento` | locale-secundario:co |
| `/co/calculadora-costo-real-pauta-exterior-impuestos-colombia` | locale-secundario:co |
| `/co/calculadora-costo-vender-online-colombia-2026` | locale-secundario:co |
| `/co/calculadora-credito-hipotecario-colombia-2026-uvr-pesos` | locale-secundario:co |
| `/co/calculadora-credito-hipotecario-davivienda-cuota` | locale-secundario:co |
| `/co/calculadora-credito-libranza-colombia-empleado-cuota-tasa` | locale-secundario:co |
| `/co/calculadora-credito-vehiculos-colombia-leasing-vs-credito` | locale-secundario:co |
| `/co/calculadora-cripto-colombia-impuestos-renta-trader-2026` | locale-secundario:co |
| `/co/calculadora-cuanto-me-presta-banco-vivienda-sueldo-colombia` | locale-secundario:co |
| `/co/calculadora-cuota-administracion-copropiedad-colombia` | locale-secundario:co |
| `/co/calculadora-cuota-compensacion-militar-libreta-2026` | locale-secundario:co |
| `/co/calculadora-cuota-inicial-vivienda-colombia-vis-no-vis` | locale-secundario:co |
| `/co/calculadora-cuota-moderadora-copago-eps-colombia-2026` | locale-secundario:co |
| `/co/calculadora-curp-colombia-cedula-ciudadania-extranjeria-validez` | locale-secundario:co |
| `/co/calculadora-de-propinas-colombia` | locale-secundario:co |
| `/co/calculadora-deduccion-dependientes-colombia-renta-2026` | locale-secundario:co |
| `/co/calculadora-devolucion-iva-dps-colombia-2026-ciclos` | locale-secundario:co |
| `/co/calculadora-digito-verificacion-nit-dian-colombia` | locale-secundario:co |
| `/co/calculadora-divorcio-cuota-litis-honorarios-abogado-colombia` | locale-secundario:co |
| `/co/calculadora-divorcio-particion-bienes-colombia-sociedad-conyugal` | locale-secundario:co |
| `/co/calculadora-dotacion-laboral-colombia-2026` | locale-secundario:co |
| `/co/calculadora-edad-escolar-simat-colombia` | locale-secundario:co |
| `/co/calculadora-embargo-salario-colombia` | locale-secundario:co |
| `/co/calculadora-fecha-declaracion-renta-2026-colombia-cedula` | locale-secundario:co |
| `/co/calculadora-fecha-limite-secop-dias-habiles` | locale-secundario:co |
| `/co/calculadora-festivos-colombia-2026-calendario-puentes` | locale-secundario:co |
| `/co/calculadora-fna-cesantias-colombia-vivienda-rentabilidad` | locale-secundario:co |
| `/co/calculadora-fondo-emergencia-colombia-meses-gastos` | locale-secundario:co |
| `/co/calculadora-fopep-pension-publica-colombia-cuantia` | locale-secundario:co |
| `/co/calculadora-ganancia-ocasional-venta-casa-colombia` | locale-secundario:co |
| `/co/calculadora-ganancia-repartidor-apps-colombia-2026` | locale-secundario:co |
| `/co/calculadora-gastos-notariales-registro-compraventa-2026` | locale-secundario:co |
| `/co/calculadora-gravamen-movimientos-financieros-4-1000-colombia` | locale-secundario:co |
| `/co/calculadora-hora-fin-programa-rcn` | locale-secundario:co |
| `/co/calculadora-ibc-independientes-contratista-colombia-2026-40-porciento` | locale-secundario:co |
| `/co/calculadora-impoconsumo-restaurantes-bares-colombia-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-bebidas-azucaradas-ibua-colombia-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-cardo-tarjeta-credito-internacional-colombia` | locale-secundario:co |
| `/co/calculadora-impuesto-cervezas-licores-tabaco-colombia-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-circulacion-vehiculo-electrico-colombia` | locale-secundario:co |
| `/co/calculadora-impuesto-consumo-licores-colombia-cerveza-vino` | locale-secundario:co |
| `/co/calculadora-impuesto-departamento-loterias-vehiculos-cigarrillos` | locale-secundario:co |
| `/co/calculadora-impuesto-patrimonio-colombia-personas-naturales-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-predial-medellin-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-renta-empresas-colombia-35-porcentaje-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-sucesiones-herencia-colombia-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-timbre-nacional-colombia-2026` | locale-secundario:co |
| `/co/calculadora-impuesto-vehiculos-bogota-2026-tabla` | locale-secundario:co |
| `/co/calculadora-impuesto-vehiculos-colombia-2026-departamento` | locale-secundario:co |
| `/co/calculadora-impuestos-compras-internacionales-colombia-aliexpress-temu` | locale-secundario:co |
| `/co/calculadora-incapacidad-medica-eps-colombia` | locale-secundario:co |
| `/co/calculadora-indemnizacion-despido-sin-justa-causa-colombia-2026` | locale-secundario:co |
| `/co/calculadora-indemnizacion-sustitutiva-colpensiones-colombia-2026` | locale-secundario:co |
| `/co/calculadora-ingresos-no-constitutivos-renta-colombia-vivienda` | locale-secundario:co |
| `/co/calculadora-interes-mora-dian-colombia-2026` | locale-secundario:co |
| `/co/calculadora-internet-fibra-claro-etb-tigo-colombia-mejor-precio` | locale-secundario:co |
| `/co/calculadora-isr-anual-colombia-personas-naturales-cedulas` | locale-secundario:co |
| `/co/calculadora-isr-arrendamiento-arrendador-colombia-deducciones` | locale-secundario:co |
| `/co/calculadora-isr-rentas-de-capital-dividendos-intereses-colombia` | locale-secundario:co |
| `/co/calculadora-iva-bienes-exentos-excluidos-colombia-2026` | locale-secundario:co |
| `/co/calculadora-iva-colombia-19-porciento-tarifa-general` | locale-secundario:co |
| `/co/calculadora-iva-frontera-paso-fronterizo-colombia-zonas-especiales` | locale-secundario:co |
| `/co/calculadora-licencia-maternidad-colombia-18-semanas` | locale-secundario:co |
| `/co/calculadora-licencia-paternidad-colombia-2-semanas` | locale-secundario:co |
| `/co/calculadora-limites-retiro-recarga-nequi` | locale-secundario:co |
| `/co/calculadora-liquidacion-contrato-termino-fijo-colombia-2026` | locale-secundario:co |
| `/co/calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026` | locale-secundario:co |
| `/co/calculadora-liquidacion-laboral-colombia-completa-cesantias` | locale-secundario:co |
| `/co/calculadora-millas-lifemiles-avianca-colombia-2026` | locale-secundario:co |
| `/co/calculadora-monotributo-colombia-pequenos-comercios` | locale-secundario:co |
| `/co/calculadora-nomina-vs-prestacion-servicios-colombia-2026` | locale-secundario:co |
| `/co/calculadora-notas-colombia` | locale-secundario:co |
| `/co/calculadora-obligado-declarar-renta-2026` | locale-secundario:co |
| `/co/calculadora-pago-anticipado-credito-hipotecario-colombia-ahorro-intereses` | locale-secundario:co |
| `/co/calculadora-pcs-prestaciones-sociales-colombia-percent-salario` | locale-secundario:co |
| `/co/calculadora-peajes-combustible-ruta-colombia-2026` | locale-secundario:co |
| `/co/calculadora-pension-alimentos-colombia-padre-divorcio-tabla` | locale-secundario:co |
| `/co/calculadora-pension-colombia-2026-edad-semanas-cotizadas` | locale-secundario:co |
| `/co/calculadora-pension-rais-vs-prima-media-colombia` | locale-secundario:co |
| `/co/calculadora-pico-placa-solidario-bogota-2026` | locale-secundario:co |
| `/co/calculadora-pico-y-placa-hoy-colombia-bogota-medellin-cali` | locale-secundario:co |
| `/co/calculadora-pila-independientes-colombia-2026` | locale-secundario:co |
| `/co/calculadora-precio-gasolina-acpm-galon-colombia-2026` | locale-secundario:co |
| `/co/calculadora-precio-internet-fibra-tigo-claro-etb-2026-promo` | locale-secundario:co |
| `/co/calculadora-prestaciones-empleada-domestica-colombia-2026` | locale-secundario:co |
| `/co/calculadora-prestamo-nequi-colombia-cuota-salvavidas-bajo-monto` | locale-secundario:co |
| `/co/calculadora-presuncion-costos-ugpp-colombia-2026` | locale-secundario:co |
| `/co/calculadora-prima-legal-colombia-30-dias-junio-diciembre` | locale-secundario:co |
| `/co/calculadora-provision-prestaciones-sociales-mensual-empleador-colombia-2026` | locale-secundario:co |
| `/co/calculadora-pse-comision-ventas-colombia` | locale-secundario:co |
| `/co/calculadora-puntaje-saber-11-icfes-colombia` | locale-secundario:co |
| `/co/calculadora-recargo-nocturno-colombia-2026` | locale-secundario:co |
| `/co/calculadora-recibo-agua-bogota-eaab-2026` | locale-secundario:co |
| `/co/calculadora-recibo-luz-codensa-epm-colombia-estrato` | locale-secundario:co |
| `/co/calculadora-redam-cuotas-alimentarias-mora` | locale-secundario:co |
| `/co/calculadora-reforma-pensional-colombia-2025-pilares-ahorro` | locale-secundario:co |
| `/co/calculadora-rendimiento-cajitas-nu-nequi-bolsillos-colombia` | locale-secundario:co |
| `/co/calculadora-renta-pensionados-colombia-2026` | locale-secundario:co |
| `/co/calculadora-rentabilidad-finca-raiz-colombia-renta-fija-comparada` | locale-secundario:co |
| `/co/calculadora-rentabilidad-fondo-inversion-colectiva-fic-colombia` | locale-secundario:co |
| `/co/calculadora-retefuente-colombia-2026-empleado-tabla` | locale-secundario:co |
| `/co/calculadora-retencion-fuente-arrendamientos-colombia-2026` | locale-secundario:co |
| `/co/calculadora-retencion-fuente-compras-servicios-2026` | locale-secundario:co |
| `/co/calculadora-retencion-procedimiento-2-colombia-2026` | locale-secundario:co |
| `/co/calculadora-retencion-salarios-procedimiento-1-colombia-2026` | locale-secundario:co |
| `/co/calculadora-retiro-cesantias-porvenir` | locale-secundario:co |
| `/co/calculadora-salario-aprendiz-sena-2026` | locale-secundario:co |
| `/co/calculadora-salario-neto-colombia-2026-bruto-a-neto` | locale-secundario:co |
| `/co/calculadora-salario-por-hora-colombia` | locale-secundario:co |
| `/co/calculadora-salarios-minimos-a-pesos-colombia-2026` | locale-secundario:co |
| `/co/calculadora-sancion-correccion-declaracion-dian-colombia-2026` | locale-secundario:co |
| `/co/calculadora-sancion-extemporaneidad-dian-2026` | locale-secundario:co |
| `/co/calculadora-sancion-minima-dian-colombia-2026-10-uvt` | locale-secundario:co |
| `/co/calculadora-sancion-moratoria-no-pago-liquidacion-colombia` | locale-secundario:co |
| `/co/calculadora-soat-colombia-precio-2026-vehiculo` | locale-secundario:co |
| `/co/calculadora-subsidio-desempleo-proteccion-cesante-colombia` | locale-secundario:co |
| `/co/calculadora-subsidio-vivienda-mi-casa-ya-colombia-2026` | locale-secundario:co |
| `/co/calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026` | locale-secundario:co |
| `/co/calculadora-tarifa-taxi-bogota-2026-unidades-recargos` | locale-secundario:co |
| `/co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo` | locale-secundario:co |
| `/co/calculadora-tasa-de-cambio-paralelo-colombia-dolar-blue` | locale-secundario:co |
| `/co/calculadora-tasa-impuesto-renta-fictop-paraisos-fiscales-colombia` | locale-secundario:co |
| `/co/calculadora-tasa-interes-mora-colombia-tarjeta-credito-2026` | locale-secundario:co |
| `/co/calculadora-traspaso-vehiculo-colombia-2026` | locale-secundario:co |
| `/co/calculadora-trm-dolar-hoy-pesos-colombianos` | locale-secundario:co |
| `/co/calculadora-universidad-publica-vs-privada-colombia-coste-2026` | locale-secundario:co |
| `/co/decidir/arrendar-o-comprar` | locale-secundario:co |
| `/co/decidir/como-salir-de-deudas` | locale-secundario:co |
| `/co/decidir/cuando-alcanzo-mi-meta-de-ahorro` | locale-secundario:co |
| `/co/decidir/cuanto-arriendo-puedo-pagar` | locale-secundario:co |
| `/co/decidir/cuanto-cobrar-por-hora-independiente` | locale-secundario:co |
| `/co/decidir/cuanto-fondo-de-emergencia-necesito` | locale-secundario:co |
| `/co/decidir/cuanto-puedo-gastar-al-mes` | locale-secundario:co |
| `/co/decidir/cuotas-o-de-contado` | locale-secundario:co |
| `/co/decidir/pagar-deuda-o-invertir` | locale-secundario:co |
| `/co/decidir/puedo-pagar-este-credito` | locale-secundario:co |
| `/co/trabajo/costo-de-contrata` | locale-secundario:co |
| `/es/calculadora-autonomo-cuota-2026-espana-rendimiento-neto` | locale-secundario:es |
| `/es/calculadora-baja-laboral-incapacidad-temporal-espana-cuantia` | locale-secundario:es |
| `/es/calculadora-bebidas-por-invitado-evento-espana` | locale-secundario:es |
| `/es/calculadora-bomba-calor-aerotermia-espana-coste-instalacion` | locale-secundario:es |
| `/es/calculadora-bonos-estado-espana-rentabilidad-vencimiento` | locale-secundario:es |
| `/es/calculadora-carne-asado-kg-por-persona-espana` | locale-secundario:es |
| `/es/calculadora-cheque-guarderia-0-3-anos-espana-deduccion` | locale-secundario:es |
| `/es/calculadora-complemento-brecha-genero-pension-espana-2026` | locale-secundario:es |
| `/es/calculadora-comprar-vs-alquilar-vivienda-espana-10-anos` | locale-secundario:es |
| `/es/calculadora-comunidad-vecinos-gastos-mensuales-espana` | locale-secundario:es |
| `/es/calculadora-coste-km-coche-espana-peajes-vs-alternativa` | locale-secundario:es |
| `/es/calculadora-coste-reforma-piso-cocina-bano-espana-m2` | locale-secundario:es |
| `/es/calculadora-costo-construccion-m2-espana` | locale-secundario:es |
| `/es/calculadora-cuanto-tarda-ver-serie-espana` | locale-secundario:es |
| `/es/calculadora-cuenta-remunerada-espana-rentabilidad-comparativa` | locale-secundario:es |
| `/es/calculadora-de-propinas-espana` | locale-secundario:es |
| `/es/calculadora-devolucion-renta-2025-cuanto-tarda` | locale-secundario:es |
| `/es/calculadora-diesel-vs-gasolina-rentabilidad-km-ano-espana` | locale-secundario:es |
| `/es/calculadora-dividir-gastos-cuenta-amigos-espana` | locale-secundario:es |
| `/es/calculadora-etiqueta-dgt-coche-espana-eco-cero-b-c` | locale-secundario:es |
| `/es/calculadora-evau-nota-media-ponderaciones-grado-espana` | locale-secundario:es |
| `/es/calculadora-factura-luz-pvpc-vs-mercado-libre-espana-2026` | locale-secundario:es |
| `/es/calculadora-fibra-movil-mejor-precio-comparador-espana-2026` | locale-secundario:es |
| `/es/calculadora-hipoteca-fija-vs-variable-euribor-espana-2026` | locale-secundario:es |
| `/es/calculadora-hipoteca-inversa-mayores-65-espana` | locale-secundario:es |
| `/es/calculadora-ibi-cuota-anual-espana-valor-catastral-municipio` | locale-secundario:es |
| `/es/calculadora-impuesto-circulacion-vehiculos-espana-municipio` | locale-secundario:es |
| `/es/calculadora-irpf-capital-mobiliario-intereses-dividendos-espana` | locale-secundario:es |
| `/es/calculadora-itp-actos-juridicos-documentados-espana-vivienda` | locale-secundario:es |
| `/es/calculadora-iva-espana-21-10-4` | locale-secundario:es |
| `/es/calculadora-jubilacion-espana-2026-pension-anos-cotizados` | locale-secundario:es |
| `/es/calculadora-letras-tesoro-espana-3-6-12-meses-rentabilidad` | locale-secundario:es |
| `/es/calculadora-master-oficial-titulo-propio-precio-espana` | locale-secundario:es |
| `/es/calculadora-mibor-euribor-historico-hipoteca-revision` | locale-secundario:es |
| `/es/calculadora-modelo-130-pago-fraccionado-autonomo-espana` | locale-secundario:es |
| `/es/calculadora-nomina-espana-bruto-neto` | locale-secundario:es |
| `/es/calculadora-nota-media-expediente-universitario-espana` | locale-secundario:es |
| `/es/calculadora-paro-prestacion-desempleo-espana-2026-meses` | locale-secundario:es |
| `/es/calculadora-pension-viudedad-cuantia-espana-2026` | locale-secundario:es |
| `/es/calculadora-permiso-paternidad-maternidad-espana-2026-semanas` | locale-secundario:es |
| `/es/calculadora-plusvalia-municipal-iivtnu-espana` | locale-secundario:es |
| `/es/calculadora-precio-itv-espana-2026-comunidad-tipo-vehiculo` | locale-secundario:es |
| `/es/calculadora-recargo-equivalencia-comerciantes-espana` | locale-secundario:es |
| `/es/calculadora-renta-bruta-neta-espana-2026-irpf-ss` | locale-secundario:es |
| `/es/calculadora-renta-disponible-mensual-espana-gastos-fijos-30-30-30-10` | locale-secundario:es |
| `/es/calculadora-renta-vitalicia-mayores-65-espana-fiscalidad` | locale-secundario:es |
| `/es/calculadora-reunificacion-deudas-espana-cuota-unificada` | locale-secundario:es |
| `/es/calculadora-smi-2026-espana-neto-14-pagas-media-jornada` | locale-secundario:es |
| `/es/calculadora-subida-sueldo-funcionarios-2026-espana` | locale-secundario:es |
| `/es/calculadora-tarjeta-credito-interes-espana-tin-revolving` | locale-secundario:es |
| `/es/conversor-tazas-a-gramos-cocina-espana` | locale-secundario:es |
| `/mx/calculadora-aguinaldo-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-aguinaldo-mexico-2026-15-dias-tope-30` | locale-secundario:mx |
| `/mx/calculadora-aguinaldo-proporcional-renuncia-mexico` | locale-secundario:mx |
| `/mx/calculadora-ahorro-voluntario-afore-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-aumento-salario-inflacion-mx` | locale-secundario:mx |
| `/mx/calculadora-auto-contado-vs-financiado-mexico` | locale-secundario:mx |
| `/mx/calculadora-autonomo-cuota-2026-espana-rendimiento-neto` | locale-secundario:mx |
| `/mx/calculadora-bebidas-por-invitado-evento-mexico` | locale-secundario:mx |
| `/mx/calculadora-becas-elisa-acuna-conahcyt-mexico-monto` | locale-secundario:mx |
| `/mx/calculadora-carne-asado-kg-por-persona-mexico` | locale-secundario:mx |
| `/mx/calculadora-casetas-gasolina-viaje-carretera-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias` | locale-secundario:mx |
| `/mx/calculadora-colegiaturas-deducibles-sat-mexico` | locale-secundario:mx |
| `/mx/calculadora-comisiones-afore-2026-cuanto-te-cobran-mexico` | locale-secundario:mx |
| `/mx/calculadora-comparativa-banco-comisiones-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-coste-funeral-mexico-promedio-2026-paquetes` | locale-secundario:mx |
| `/mx/calculadora-coste-vida-mensual-mexico-soltero-pareja-familia` | locale-secundario:mx |
| `/mx/calculadora-costo-construccion-m2-mexico` | locale-secundario:mx |
| `/mx/calculadora-costo-licencia-conducir-mexico-por-estado` | locale-secundario:mx |
| `/mx/calculadora-costo-pasaporte-mexicano-2026` | locale-secundario:mx |
| `/mx/calculadora-credito-infonavit-descuento` | locale-secundario:mx |
| `/mx/calculadora-cuenta-remunerada-espana-rentabilidad-comparativa` | locale-secundario:mx |
| `/mx/calculadora-cuotas-imss-obrero-patron` | locale-secundario:mx |
| `/mx/calculadora-curp-validacion-estructura-mexico` | locale-secundario:mx |
| `/mx/calculadora-depreciacion-valor-auto-usado-mexico` | locale-secundario:mx |
| `/mx/calculadora-descuento-pension-alimenticia-nomina-mexico` | locale-secundario:mx |
| `/mx/calculadora-devolucion-impuestos-declaracion-anual` | locale-secundario:mx |
| `/mx/calculadora-factor-integracion-salarial-imss-mexico` | locale-secundario:mx |
| `/mx/calculadora-finiquito-mexico-completo-rescision-relacion` | locale-secundario:mx |
| `/mx/calculadora-finiquito-vs-liquidacion-comparador-mexico` | locale-secundario:mx |
| `/mx/calculadora-gas-lp-llenar-tanque-estacionario-cilindro-mexico` | locale-secundario:mx |
| `/mx/calculadora-horas-extras-doble-triple-mexico` | locale-secundario:mx |
| `/mx/calculadora-impuesto-cedular-arrendamiento-mexico` | locale-secundario:mx |
| `/mx/calculadora-impuestos-herencia-donacion-inmueble-mexico` | locale-secundario:mx |
| `/mx/calculadora-imss-cuotas-empleado-patron-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-incapacidad-imss-enfermedad-general` | locale-secundario:mx |
| `/mx/calculadora-ine-renovacion-costo` | locale-secundario:mx |
| `/mx/calculadora-infonavit-credito-mexico-puntaje-monto-2026` | locale-secundario:mx |
| `/mx/calculadora-irnr-no-residentes-alquiler-vivienda-espana` | locale-secundario:mx |
| `/mx/calculadora-isn-impuesto-sobre-nominas-estado` | locale-secundario:mx |
| `/mx/calculadora-isr-acciones-bolsa-mexico-10-por-ciento` | locale-secundario:mx |
| `/mx/calculadora-isr-aguinaldo-exento-gravado-mexico` | locale-secundario:mx |
| `/mx/calculadora-isr-arrendamiento-deduccion-ciega-mexico` | locale-secundario:mx |
| `/mx/calculadora-isr-finiquito-liquidacion-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-isr-honorarios-persona-fisica` | locale-secundario:mx |
| `/mx/calculadora-isr-honorarios-personas-fisicas-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-isr-intereses-bancarios-inversion-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-isr-mensual-empleados-subsidio-empleo-mexico` | locale-secundario:mx |
| `/mx/calculadora-isr-retiro-ppr-afore-voluntario-anticipado-mexico` | locale-secundario:mx |
| `/mx/calculadora-isr-venta-auto-usado-persona-fisica-mexico` | locale-secundario:mx |
| `/mx/calculadora-isr-venta-terreno-inmueble-comercial-mexico` | locale-secundario:mx |
| `/mx/calculadora-iva-mexico-trasladado-acreditable` | locale-secundario:mx |
| `/mx/calculadora-jovenes-construyendo-futuro-monto-2026` | locale-secundario:mx |
| `/mx/calculadora-licencia-maternidad-mexico-imss-12-semanas` | locale-secundario:mx |
| `/mx/calculadora-luz-cfe-tarifa-domestica-bimestral-mexico` | locale-secundario:mx |
| `/mx/calculadora-pagos-hipoteca-infonavit` | locale-secundario:mx |
| `/mx/calculadora-pension-alimenticia-mexico-padre-divorcio` | locale-secundario:mx |
| `/mx/calculadora-pension-bienestar-2026-monto` | locale-secundario:mx |
| `/mx/calculadora-pension-imss-modalidad-40-mexico-aportacion` | locale-secundario:mx |
| `/mx/calculadora-pension-mujeres-bienestar-2026-elegibilidad-monto` | locale-secundario:mx |
| `/mx/calculadora-peso-dolar-tipo-cambio-mexico` | locale-secundario:mx |
| `/mx/calculadora-prestamo-coppel-abonos-quincenales-interes` | locale-secundario:mx |
| `/mx/calculadora-prima-antiguedad-mexico` | locale-secundario:mx |
| `/mx/calculadora-prima-antiguedad-mexico-12-dias-2-smg` | locale-secundario:mx |
| `/mx/calculadora-prima-riesgo-trabajo-imss-siniestralidad` | locale-secundario:mx |
| `/mx/calculadora-recargos-actualizacion-sat-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-recibo-nomina-percepciones-deducciones-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-retencion-plataformas-digitales-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-salario-minimo-mexico-2026` | locale-secundario:mx |
| `/mx/calculadora-salario-por-hora-mensual-diario-mexico` | locale-secundario:mx |
| `/mx/calculadora-sueldo-neto-mexico-isr-imss` | locale-secundario:mx |
| `/mx/calculadora-tarjeta-credito-interes-cat-mexico` | locale-secundario:mx |
| `/mx/calculadora-tope-deducciones-personales-2026-mexico` | locale-secundario:mx |
| `/mx/calculadora-vacaciones-dias-antiguedad-mexico` | locale-secundario:mx |
| `/mx/calculadora-verificacion-vehicular-costo` | locale-secundario:mx |
| `/mx/conversor-tazas-a-gramos-cocina-mexico` | locale-secundario:mx |
| `/mx/decidir/como-salir-de-deudas` | locale-secundario:mx |
| `/mx/decidir/cuando-alcanzo-mi-meta-de-ahorro` | locale-secundario:mx |
| `/mx/decidir/cuanta-renta-puedo-pagar` | locale-secundario:mx |
| `/mx/decidir/cuanto-cobrar-por-hora-freelance` | locale-secundario:mx |
| `/mx/decidir/cuanto-fondo-de-emergencia-necesito` | locale-secundario:mx |
| `/mx/decidir/cuanto-puedo-gastar-al-mes` | locale-secundario:mx |
| `/mx/decidir/liquidar-deuda-o-invertir` | locale-secundario:mx |
| `/mx/decidir/meses-sin-intereses-o-contado` | locale-secundario:mx |
| `/mx/decidir/puedo-pagar-este-credito` | locale-secundario:mx |
| `/mx/decidir/rentar-o-comprar` | locale-secundario:mx |

## DESPRUNE — orden por impressions desc

| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |
|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|
| /glosario/mcm | /matematica | 193 | 0 | 0.0% | 58.3 | 0 | 0 | DESPRUNE |
| /en/adolescent-final-height-prediction | /en/screen-time-recommendations-by-age | 94 | 0 | 0.0% | 6.1 | 0 | 0 | DESPRUNE |
| /calculadora-playlist-duracion-canciones | /eventos/logistica | 88 | 0 | 0.0% | 8.7 | 0 | 0 | DESPRUNE |
| /en/pnl-futures-long-short-perpetual | /en/aguinaldo-calculator-argentina | 61 | 0 | 0.0% | 3.3 | 0 | 0 | DESPRUNE |
| /en/porciones-sushi-por-persona-promedio | /en/sushi-per-person-calculator | 58 | 0 | 0.0% | 3.3 | 0 | 0 | DESPRUNE |
| /en/costo-servidor-cloud-aws-ec2-mensual | /en/cloud-aws-gcp-azure-ec2-monthly-on-demand | 57 | 0 | 0.0% | 5.5 | 37 | 0 | DESPRUNE |
| /calculadora-actualizacion-alquiler-icl | /alquiler/aumento-de-alquiler | 52 | 0 | 0.0% | 72.5 | 0 | 0 | DESPRUNE |

## REVIEW — decision manual

| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |
|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|

## Como aplicar el desprune

1. Editar `src/lib/pruning-redirects.ts` y eliminar las entradas marcadas DESPRUNE.
2. Restaurar el JSON original de la calc si fue eliminado (revisar git history).
3. Si la calc nunca existio, hay que generarla (formula + JSON + assets OG).
4. Build local: `npm run build` para regenerar `dist/client/*.html`.
5. Deploy normal + ritual CF cache: `bash scripts/cf-purge-cache.sh` x2.
6. Verificar con curl que devuelven 200 OK con title del CTR rescue.

## Como aplicar el GONE_410

1. Re-correr el audit con `--emit-gone-410` para actualizar `src/lib/gone-410.ts`.
2. Build local: `npm run build`.
3. Deploy: `wrangler deploy` o git push.
4. CF purge x2 si hay assets HTML cacheados de esas URLs.
5. Verificar con curl que devuelven 410.
