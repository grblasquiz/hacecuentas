export interface PersonalizedCalcUx {
  tone: 'business' | 'labor' | 'health' | 'family' | 'tax' | 'food' | 'travel' | 'energy' | 'tech' | 'auto';
  eyebrow: string;
  title: string;
  description: string;
  inputLabel: string;
  resultLabel: string;
  calculateLabel: string;
  highlights: [string, string, string];
  presets?: {
    title: string;
    items: Array<{ label: string; note: string; values: Record<string, string | number> }>;
  };
}

export const UX: Record<string, PersonalizedCalcUx> = {
  'calculadora-edad-exacta': {
    tone: 'family', eyebrow: 'Tu tiempo vivido', title: 'Descubrí tu edad con precisión de calendario',
    description: 'No se queda en los años: separa meses, días y el próximo cumpleaños.',
    inputLabel: 'Tu fecha de nacimiento', resultLabel: 'Tu edad exacta', calculateLabel: 'Calcular mi edad',
    highlights: ['Años, meses y días', 'Días vividos', 'Próximo cumpleaños'],
  },
  'calculadora-interes-compuesto': {
    tone: 'business', eyebrow: 'Crecimiento del ahorro', title: 'Proyectá el patrimonio, no sólo los intereses',
    description: 'Separá capital aportado, rendimiento y poder de compra para decidir cuánto ahorrar cada mes.',
    inputLabel: 'Tu plan de inversión', resultLabel: 'Patrimonio proyectado', calculateLabel: 'Proyectar ahorro',
    highlights: ['Saldo final', 'Ganancia acumulada', 'Valor real'],
    presets: { title: 'Planes para comparar', items: [
      { label: 'Empezar hoy', note: '$50.000 por mes', values: { capitalInicial: 0, aporteMensual: 50000, tasaAnual: 10, plazoAnios: 10, frecuenciaCapitalizacion: 'mensual' } },
      { label: 'Capital + aportes', note: '$1 M inicial a 15 años', values: { capitalInicial: 1000000, aporteMensual: 100000, tasaAnual: 12, plazoAnios: 15, frecuenciaCapitalizacion: 'mensual' } },
    ] },
  },
  'calculadora-conversor-fahrenheit-a-celsius-horno': {
    tone: 'food', eyebrow: 'Temperatura de horno', title: 'Convertí la receta sin arruinar la cocción',
    description: 'Pasá entre °F, °C y gas mark con referencias útiles para horno bajo, medio y fuerte.',
    inputLabel: 'Temperatura de la receta', resultLabel: 'Temperatura equivalente', calculateLabel: 'Convertir temperatura',
    highlights: ['Grados Celsius', 'Grados Fahrenheit', 'Tipo de horno'],
    presets: { title: 'Temperaturas de receta', items: [
      { label: 'Horno medio', note: '350 °F', values: { valor: 350, direccion: 'ida' } },
      { label: 'Horno fuerte', note: '220 °C', values: { valor: 220, direccion: 'vuelta' } },
    ] },
  },
  'calculadora-resistencia-codigo-colores-4-5-bandas': {
    tone: 'tech', eyebrow: 'Electrónica práctica', title: 'Leé la resistencia antes de soldarla',
    description: 'Armá las bandas en el mismo orden del componente y verificá valor, multiplicador y tolerancia.',
    inputLabel: 'Bandas de colores', resultLabel: 'Valor de la resistencia', calculateLabel: 'Leer resistencia',
    highlights: ['Ohmios totales', 'Tolerancia', 'Rango posible'],
    presets: { title: 'Resistencias comunes', items: [
      { label: '220 Ω', note: 'Rojo · rojo · marrón', values: { tipo: '4', banda1: 'rojo', banda2: 'rojo', banda3: 'marron', banda4: 'dorado' } },
      { label: '1 kΩ', note: 'Marrón · negro · rojo', values: { tipo: '4', banda1: 'marron', banda2: 'negro', banda3: 'rojo', banda4: 'dorado' } },
    ] },
  },
  'calculadora-edad-perro-anos-humanos': {
    tone: 'family', eyebrow: 'Etapa de vida canina', title: 'Entendé la edad de tu perro según su tamaño',
    description: 'La equivalencia cambia entre perros pequeños, medianos y grandes; también mostramos su etapa vital.',
    inputLabel: 'Edad y tamaño', resultLabel: 'Edad humana equivalente', calculateLabel: 'Calcular edad perruna',
    highlights: ['Años humanos', 'Etapa vital', 'Ritmo de envejecimiento'],
    presets: { title: 'Perfiles de perro', items: [
      { label: 'Pequeño joven', note: '2 años', values: { anos: 2, tamano: 'pequeno' } },
      { label: 'Grande adulto', note: '8 años', values: { anos: 8, tamano: 'grande' } },
    ] },
  },
  'calculadora-edad-gato-humano-formula-anos': {
    tone: 'family', eyebrow: 'Etapa de vida felina', title: 'Traducí la edad de tu gato a su etapa real',
    description: 'Los primeros dos años avanzan mucho más rápido; después la equivalencia se estabiliza.',
    inputLabel: 'Edad de tu gato', resultLabel: 'Edad humana equivalente', calculateLabel: 'Calcular edad felina',
    highlights: ['Años humanos', 'Etapa vital', 'Equivalencia anual'],
  },
  'calculadora-fecha-probable-parto': {
    tone: 'health', eyebrow: 'Calendario del embarazo', title: 'Ubicá la fecha probable y las semanas clave',
    description: 'Calculá por última menstruación o ecografía y mirá el rango probable, no sólo un día aislado.',
    inputLabel: 'Fecha de referencia', resultLabel: 'Fecha probable de parto', calculateLabel: 'Calcular fecha probable',
    highlights: ['Fecha estimada', 'Semana actual', 'Ventana probable'],
  },
  'calculadora-pintura-paredes-habitacion-litros': {
    tone: 'business', eyebrow: 'Planificación de pintura', title: 'Comprá la pintura justa para la habitación',
    description: 'Descuenta puertas y ventanas, suma el techo y contempla manos y rendimiento real.',
    inputLabel: 'Medidas y terminación', resultLabel: 'Pintura necesaria', calculateLabel: 'Calcular litros',
    highlights: ['Litros totales', 'Superficie neta', 'Latas sugeridas'],
    presets: { title: 'Ambientes frecuentes', items: [
      { label: 'Dormitorio', note: '4 × 3 m · dos manos', values: { largo: 4, ancho: 3, alto: 2.6, manos: '2', rendimiento: 10, puertas: 1, ventanas: 1, pintarTecho: 'si' } },
      { label: 'Living grande', note: '6 × 4 m · sin techo', values: { largo: 6, ancho: 4, alto: 2.8, manos: '2', rendimiento: 10, puertas: 2, ventanas: 2, pintarTecho: 'no' } },
    ] },
  },
  'calculadora-contador-de-palabras-y-caracteres': {
    tone: 'tech', eyebrow: 'Edición de texto', title: 'Medí el texto según el límite que importa',
    description: 'Contá palabras, caracteres con y sin espacios y tiempo de lectura mientras escribís.',
    inputLabel: 'Pegá o escribí tu texto', resultLabel: 'Métricas del texto', calculateLabel: 'Analizar texto',
    highlights: ['Palabras', 'Caracteres', 'Tiempo de lectura'],
  },
  'calculadora-talla-sosten-corpino': {
    tone: 'health', eyebrow: 'Ajuste y comodidad', title: 'Encontrá una talla de partida en tu sistema',
    description: 'Combiná contorno bajo busto y busto para obtener banda, copa y equivalencias internacionales.',
    inputLabel: 'Tus dos medidas', resultLabel: 'Talla orientativa', calculateLabel: 'Calcular talla',
    highlights: ['Banda y copa', 'Equivalencia local', 'Ajuste recomendado'],
    presets: { title: 'Ejemplos de medición', items: [
      { label: 'Sistema AR', note: '78 / 94 cm', values: { contornoBajo: 78, contornoPecho: 94, unidad: 'cm', sistema: 'ar' } },
      { label: 'Sistema EU', note: '83 / 101 cm', values: { contornoBajo: 83, contornoPecho: 101, unidad: 'cm', sistema: 'eu' } },
    ] },
  },
  'calculadora-ladrillos-por-m2-construccion': {
    tone: 'business', eyebrow: 'Cómputo de mampostería', title: 'Pedí los ladrillos con margen, no a ojo',
    description: 'Calculá unidades por pared según ladrillo, junta y desperdicio de obra.',
    inputLabel: 'Pared y tipo de ladrillo', resultLabel: 'Pedido de ladrillos', calculateLabel: 'Calcular materiales',
    highlights: ['Unidades totales', 'Ladrillos por m²', 'Margen de rotura'],
    presets: { title: 'Paños de referencia', items: [
      { label: 'Pared de 20 m²', note: 'Ladrillo común', values: { m2: 20, tipo: 'comun', desperdicio: 10 } },
      { label: 'Tabique de 35 m²', note: 'Hueco con 8% extra', values: { m2: 35, tipo: 'hueco_12', desperdicio: 8 } },
    ] },
  },
  'calculadora-aportes-arl-colombia-empleador-empleado-riesgo': {
    tone: 'labor', eyebrow: 'Seguridad social Colombia', title: 'Presupuestá la ARL según el riesgo real',
    description: 'Relacioná salario, cantidad de trabajadores y clase de riesgo para ver costo individual y total.',
    inputLabel: 'Nómina y actividad', resultLabel: 'Aporte ARL del empleador', calculateLabel: 'Calcular aporte ARL',
    highlights: ['Aporte mensual', 'Costo por trabajador', 'Tarifa de riesgo'],
    presets: { title: 'Niveles de riesgo', items: [
      { label: 'Oficina · clase I', note: '1 trabajador', values: { salario_mensual: 2500000, actividad_riesgo: 'manual', clase_riesgo: 'I', numero_trabajadores: 1 } },
      { label: 'Riesgo alto', note: '10 trabajadores', values: { salario_mensual: 3000000, actividad_riesgo: 'manual', clase_riesgo: 'V', numero_trabajadores: 10 } },
    ] },
  },
  'calculadora-salario-diario-integrado-sdi-mexico': {
    tone: 'labor', eyebrow: 'Nómina e IMSS', title: 'Integrá salario y prestaciones en un solo valor diario',
    description: 'Sumá aguinaldo, vacaciones, prima y prestaciones adicionales para obtener el SDI reportable.',
    inputLabel: 'Salario y prestaciones', resultLabel: 'Salario diario integrado', calculateLabel: 'Calcular SDI',
    highlights: ['SDI diario', 'Factor de integración', 'Base mensual IMSS'],
    presets: { title: 'Paquetes laborales', items: [
      { label: 'Prestaciones de ley', note: '$15.000 mensuales', values: { salario: 15000, periodo: 'mensual', aniosAntiguedad: 1, aguinaldoDias: 15, primaVacacionalPct: 25, prestacionesExtraMensual: 0 } },
      { label: 'Paquete superior', note: '30 días de aguinaldo', values: { salario: 30000, periodo: 'mensual', aniosAntiguedad: 5, aguinaldoDias: 30, primaVacacionalPct: 50, prestacionesExtraMensual: 2500 } },
    ] },
  },
  'conversor-numero-a-letras-cantidad': {
    tone: 'business', eyebrow: 'Documentos sin errores', title: 'Escribí el monto como debe aparecer en el documento',
    description: 'Convertí números a letras con moneda, centavos y formato listo para cheque, factura o contrato.',
    inputLabel: 'Número y formato', resultLabel: 'Cantidad en letras', calculateLabel: 'Convertir a letras',
    highlights: ['Texto completo', 'Centavos', 'Formato documental'],
    presets: { title: 'Documentos frecuentes', items: [
      { label: 'Cheque', note: '$1.250,50', values: { numero: 1250.5, formato: 'moneda', ivaPct: '0', moneda: 'ARS' } },
      { label: 'Factura MXN', note: '$48.900', values: { numero: 48900, formato: 'moneda', ivaPct: '0', moneda: 'MXN' } },
    ] },
  },
  'calculadora-interes-judicial-tasa': {
    tone: 'tax', eyebrow: 'Actualización judicial', title: 'Separá capital, período e intereses reclamables',
    description: 'Elegí tasa y fechas para ver días transcurridos, interés acumulado y monto actualizado.',
    inputLabel: 'Capital, tasa y período', resultLabel: 'Monto judicial actualizado', calculateLabel: 'Calcular intereses',
    highlights: ['Interés acumulado', 'Total actualizado', 'Días computados'],
  },
  'salario-minimo-paraguay-2026': {
    tone: 'labor', eyebrow: 'Referencia salarial Paraguay', title: 'Pasá el mínimo mensual a jornal y hora',
    description: 'Adaptá el salario mínimo a jornada diurna o nocturna y a los días efectivamente trabajados.',
    inputLabel: 'Jornada y días', resultLabel: 'Pago mínimo proporcional', calculateLabel: 'Calcular salario mínimo',
    highlights: ['Monto del período', 'Jornal mínimo', 'Valor por hora'],
    presets: { title: 'Jornadas frecuentes', items: [
      { label: 'Mes completo', note: '30 días diurnos', values: { jornada: 'diurna', dias: 30 } },
      { label: 'Quincena nocturna', note: '15 días', values: { jornada: 'nocturna', dias: 15 } },
    ] },
  },
  'calculadora-gastos-notariales-registro-compraventa-2026': {
    tone: 'tax', eyebrow: 'Cierre inmobiliario Colombia', title: 'Separá lo que paga comprador y vendedor',
    description: 'Desglosá notaría, registro, retenciones e impuestos antes de firmar la compraventa.',
    inputLabel: 'Valor y partes de la operación', resultLabel: 'Costos de cierre', calculateLabel: 'Calcular gastos notariales',
    highlights: ['Total comprador', 'Total vendedor', 'Costo global'],
    presets: { title: 'Operaciones de referencia', items: [
      { label: 'Vivienda $400 M', note: 'Gastos notariales por mitades', values: { valorInmueble: 400000000, quienPagaNotaria: 'mitades', tipoVendedor: 'natural' } },
      { label: 'Inmueble $800 M', note: 'Vendedor jurídico', values: { valorInmueble: 800000000, quienPagaNotaria: 'mitades', tipoVendedor: 'juridica' } },
    ] },
  },
  'calculadora-impuesto-ganancias-sueldo': {
    tone: 'tax', eyebrow: 'Sueldo y Ganancias', title: 'Estimá cuánto cambia tu sueldo de bolsillo',
    description: 'Partí del bruto y tus cargas familiares para distinguir impuesto mensual y neto estimado.',
    inputLabel: 'Sueldo y deducciones', resultLabel: 'Ganancias estimada', calculateLabel: 'Calcular Ganancias',
    highlights: ['Impuesto mensual', 'Sueldo neto', 'Tasa efectiva'],
    presets: { title: 'Perfiles salariales', items: [
      { label: 'Soltero', note: '$2,5 M brutos', values: { brutoMensual: 2500000, conyuge: 'no', hijos: 0, otrasDeducciones: 0 } },
      { label: 'Familia con 2 hijos', note: '$4 M brutos', values: { brutoMensual: 4000000, conyuge: 'si', hijos: 2, otrasDeducciones: 100000 } },
    ] },
  },
  'calculadora-prima-antiguedad-mexico': {
    tone: 'labor', eyebrow: 'Terminación laboral México', title: 'Calculá los 12 días por año con el tope correcto',
    description: 'Aplicá antigüedad, motivo de salida y límite salarial para estimar la prima legal.',
    inputLabel: 'Salario y antigüedad', resultLabel: 'Prima de antigüedad', calculateLabel: 'Calcular prima',
    highlights: ['Prima total', 'Salario topado', 'Años reconocidos'],
    presets: { title: 'Casos laborales', items: [
      { label: 'Despido · 20 años', note: '$700 diarios', values: { salarioDiario: 700, aniosAntiguedad: 20, motivo: 'despido-injustificado', smgDiario: 315.04 } },
      { label: 'Renuncia · 16 años', note: '$500 diarios', values: { salarioDiario: 500, aniosAntiguedad: 16, motivo: 'renuncia', smgDiario: 315.04 } },
    ] },
  },
  'calculadora-antiguedad-laboral': {
    tone: 'labor', eyebrow: 'Historia laboral', title: 'Contá tu antigüedad sin aproximar meses',
    description: 'Calculá años, meses y días exactos entre el ingreso y la fecha de liquidación.',
    inputLabel: 'Fechas laborales', resultLabel: 'Antigüedad exacta', calculateLabel: 'Calcular antigüedad',
    highlights: ['Años completos', 'Meses adicionales', 'Días trabajados'],
  },
  'calculadora-generacion-perteneces': {
    tone: 'family', eyebrow: 'Generaciones', title: 'Ubicá tu año en su contexto generacional',
    description: 'Identificá la generación, sus años de referencia y la edad aproximada actual.',
    inputLabel: 'Año de nacimiento', resultLabel: 'Tu generación', calculateLabel: 'Descubrir generación',
    highlights: ['Generación', 'Rango de años', 'Edad aproximada'],
    presets: { title: 'Años para explorar', items: [
      { label: '1990', note: 'Millennials', values: { anioNacimiento: 1990 } },
      { label: '2002', note: 'Generación Z', values: { anioNacimiento: 2002 } },
    ] },
  },
  'calculadora-horas-extras-colombia-2026': {
    tone: 'labor', eyebrow: 'Nómina Colombia', title: 'Desglosá cada hora extra que te deben',
    description: 'Separá diurnas y nocturnas y aplicá el divisor correcto antes o después del cambio a 42 horas.',
    inputLabel: 'Salario y horas trabajadas', resultLabel: 'Pago extra del mes', calculateLabel: 'Liquidar horas extra',
    highlights: ['Extras diurnas', 'Extras nocturnas', 'Total adicional'],
    presets: { title: 'Meses de trabajo', items: [
      { label: '10 diurnas + 4 nocturnas', note: 'Salario $2 M', values: { salarioMensual: 2000000, horasExtraDiurnas: 10, horasExtraNocturnas: 4, periodo: 'desde-15-jul' } },
      { label: 'Turno intensivo', note: '20 + 15 horas', values: { salarioMensual: 3500000, horasExtraDiurnas: 20, horasExtraNocturnas: 15, periodo: 'desde-15-jul' } },
    ] },
  },
  'calculadora-millas-latam-destino': {
    tone: 'travel', eyebrow: 'Canje LATAM Pass', title: 'Compará millas contra precio en efectivo',
    description: 'Elegí destino y cabina para medir millas requeridas, tasas y valor obtenido por cada milla.',
    inputLabel: 'Viaje y cotización', resultLabel: 'Conveniencia del canje', calculateLabel: 'Evaluar canje',
    highlights: ['Millas necesarias', 'Valor por milla', 'Ahorro vs. efectivo'],
    presets: { title: 'Canjes para comparar', items: [
      { label: 'Buenos Aires ida y vuelta', note: 'Economy', values: { destino: 'buenos-aires', cabina: 'economy', tipoViaje: 'ida-vuelta', millasCotizadas: 50000, precioPasajeUsd: 780, tasasUsd: 190 } },
      { label: 'Canje premium', note: 'Business ida y vuelta', values: { destino: 'miami', cabina: 'business', tipoViaje: 'ida-vuelta', millasCotizadas: 140000, precioPasajeUsd: 3200, tasasUsd: 260 } },
    ] },
  },
  'calculadora-impuesto-renta-colombia-persona-natural-2026': {
    tone: 'tax', eyebrow: 'Declaración de renta Colombia', title: 'Pasá de ingresos brutos a impuesto neto',
    description: 'Separá deducciones, rentas exentas y retenciones para estimar saldo a pagar.',
    inputLabel: 'Ingresos y beneficios fiscales', resultLabel: 'Impuesto de renta', calculateLabel: 'Estimar renta',
    highlights: ['Impuesto estimado', 'Saldo por pagar', 'Tasa efectiva'],
    presets: { title: 'Declaraciones de ejemplo', items: [
      { label: 'Ingreso $80 M', note: 'Con deducciones y retenciones', values: { ingresoAnualCop: 80000000, deduccionesAnuales: 5000000, rentasExentas: 10000000, retencionesAnuales: 3000000 } },
      { label: 'Ingreso $180 M', note: 'Perfil profesional', values: { ingresoAnualCop: 180000000, deduccionesAnuales: 15000000, rentasExentas: 25000000, retencionesAnuales: 12000000 } },
    ] },
  },
  'calculadora-combustible-viaje-auto': {
    tone: 'travel', eyebrow: 'Presupuesto de ruta', title: 'Sabé cuánto cuesta el viaje antes de salir',
    description: 'Combiná distancia, consumo y precio del combustible; después repartí el gasto entre pasajeros.',
    inputLabel: 'Ruta, auto y pasajeros', resultLabel: 'Costo del viaje', calculateLabel: 'Calcular combustible',
    highlights: ['Litros necesarios', 'Costo total', 'Costo por persona'],
    presets: { title: 'Viajes de referencia', items: [
      { label: 'Escapada de 400 km', note: 'Ida y vuelta · 1 pasajero', values: { distanciaKm: 400, ida: 'ida-vuelta', consumo: 8, precioLitro: 1600, pasajeros: 1 } },
      { label: 'Ruta compartida', note: '1.200 km · 4 pasajeros', values: { distanciaKm: 1200, ida: 'ida', consumo: 7, precioLitro: 1600, pasajeros: 4 } },
    ] },
  },
  'calculadora-soat-peru-precio': {
    tone: 'auto', eyebrow: 'Seguro obligatorio Perú', title: 'Ubicá el rango de SOAT para tu vehículo',
    description: 'Compará categoría, región y antigüedad para llegar a una referencia de precio más útil.',
    inputLabel: 'Vehículo y región', resultLabel: 'Precio estimado del SOAT', calculateLabel: 'Estimar SOAT',
    highlights: ['Rango de precio', 'Categoría vehicular', 'Referencia regional'],
    presets: { title: 'Vehículos frecuentes', items: [
      { label: 'Auto en Lima', note: 'Uso particular', values: { categoria: 'auto', region: 'lima', antiguedad: 3 } },
      { label: 'Moto en provincia', note: '5 años', values: { categoria: 'moto', region: 'provincia', antiguedad: 5 } },
    ] },
  },
  'calculadora-impuesto-industria-comercio-ica-colombia-municipios': {
    tone: 'tax', eyebrow: 'ICA municipal Colombia', title: 'Aplicá la tarifa de tu municipio y actividad',
    description: 'Convertí ingresos brutos en impuesto mensual o bimestral según actividad y condición tributaria.',
    inputLabel: 'Ingresos, municipio y CIIU', resultLabel: 'ICA estimado', calculateLabel: 'Calcular ICA',
    highlights: ['Impuesto del período', 'Tarifa por mil', 'Retención aplicable'],
    presets: { title: 'Negocios de ejemplo', items: [
      { label: 'Comercio en Bogotá', note: '$10 M mensuales', values: { ingresos_brutos: 10000000, municipio: 'bogota', actividad_economica: 'comercio_general', es_gran_contribuyente: 'no', periodicidad: 'mensual' } },
      { label: 'Servicios en Medellín', note: '$40 M mensuales', values: { ingresos_brutos: 40000000, municipio: 'medellin', actividad_economica: 'servicios_profesionales', es_gran_contribuyente: 'no', periodicidad: 'mensual' } },
    ] },
  },
  'calculadora-presion-atmosferica-altitud-barometrica': {
    tone: 'tech', eyebrow: 'Atmósfera y altitud', title: 'Mirá cómo cae la presión al subir',
    description: 'Convertí metros de altitud en presión estimada y porcentaje respecto del nivel del mar.',
    inputLabel: 'Altitud de referencia', resultLabel: 'Presión atmosférica', calculateLabel: 'Calcular presión',
    highlights: ['Presión en hPa', 'Porcentaje del nivel del mar', 'Diferencia barométrica'],
    presets: { title: 'Altitudes conocidas', items: [
      { label: 'Nivel del mar', note: '0 metros', values: { altitud: 0, presionMar: 1013.25 } },
      { label: 'Ciudad alta', note: '2.500 metros', values: { altitud: 2500, presionMar: 1013.25 } },
    ] },
  },
  'calculadora-convenio-hosteleria-espana-sueldo-2026-categoria': {
    tone: 'labor', eyebrow: 'Convenio de hostelería España', title: 'Armá el sueldo según categoría y provincia',
    description: 'Sumá jornada, nocturnidad, festivos, antigüedad y pagas extra sobre la tabla aplicable.',
    inputLabel: 'Puesto y condiciones', resultLabel: 'Sueldo de convenio', calculateLabel: 'Calcular sueldo',
    highlights: ['Salario mensual', 'Complementos', 'Total anual'],
    presets: { title: 'Puestos de hostelería', items: [
      { label: 'Camarero en Madrid', note: 'Jornada completa', values: { categoria_profesional: 'camarero', provincia: 'madrid', tipo_jornada: 'completa', tiene_nocturnidad: 'false', trabajados_festivos_mes: 0, antiguedad_anos: 0, pagas_extraordinarias: 'true' } },
      { label: 'Turno nocturno', note: '4 festivos al mes', values: { categoria_profesional: 'camarero', provincia: 'barcelona', tipo_jornada: 'completa', tiene_nocturnidad: 'true', trabajados_festivos_mes: 4, antiguedad_anos: 5, pagas_extraordinarias: 'true' } },
    ] },
  },
  'calculadora-retencion-ganancias-rg-830': {
    tone: 'tax', eyebrow: 'Retenciones RG 830', title: 'Calculá la retención acumulando pagos previos',
    description: 'Elegí concepto y condición fiscal para aplicar mínimo, escala y retenciones ya practicadas.',
    inputLabel: 'Pago y situación fiscal', resultLabel: 'Retención a practicar', calculateLabel: 'Calcular retención',
    highlights: ['Retención actual', 'Base acumulada', 'Pago neto'],
    presets: { title: 'Pagos frecuentes', items: [
      { label: 'Honorarios inscripto', note: '$500.000', values: { concepto: 'honorarios-profesionales', condicion: 'inscripto', montoPago: 500000, pagosAnteriores: 0, retencionesAnteriores: 0 } },
      { label: 'Pago acumulado', note: 'Con anticipos previos', values: { concepto: 'honorarios-profesionales', condicion: 'inscripto', montoPago: 900000, pagosAnteriores: 1200000, retencionesAnteriores: 70000 } },
    ] },
  },
  'calculadora-credito-infonavit-descuento': {
    tone: 'labor', eyebrow: 'Descuento Infonavit', title: 'Anticipá cuánto baja tu nómina por el crédito',
    description: 'Compará descuento porcentual o cuota fija contra sueldo mensual y límite disponible.',
    inputLabel: 'Sueldo y aviso de retención', resultLabel: 'Descuento Infonavit', calculateLabel: 'Calcular descuento',
    highlights: ['Descuento mensual', 'Sueldo disponible', 'Porcentaje efectivo'],
    presets: { title: 'Avisos de retención', items: [
      { label: '30% del sueldo', note: '$20.000 mensuales', values: { sueldoMensual: 20000, tipoCredito: 'pesos', porcentajeDescuento: 30, cuotaFijaVSM: 3.5 } },
      { label: 'Sueldo $35.000', note: '20% de descuento', values: { sueldoMensual: 35000, tipoCredito: 'pesos', porcentajeDescuento: 20, cuotaFijaVSM: 3.5 } },
    ] },
  },
  'calculadora-sancion-extemporaneidad-dian-2026': {
    tone: 'tax', eyebrow: 'Declaración tardía DIAN', title: 'Medí el costo de cada mes de retraso',
    description: 'Compará sanción calculada, sanción mínima y efecto de un emplazamiento.',
    inputLabel: 'Impuesto y demora', resultLabel: 'Sanción por extemporaneidad', calculateLabel: 'Calcular sanción',
    highlights: ['Sanción aplicable', 'Meses computados', 'Mínimo DIAN'],
    presets: { title: 'Retrasos de referencia', items: [
      { label: '3 meses tarde', note: 'Impuesto de $10 M', values: { impuestoACargo: 10000000, mesesRetraso: 3, emplazamiento: 'no' } },
      { label: 'Con emplazamiento', note: '6 meses tarde', values: { impuestoACargo: 25000000, mesesRetraso: 6, emplazamiento: 'si' } },
    ] },
  },
  'calculadora-recibo-luz-codensa-epm-colombia-estrato': {
    tone: 'energy', eyebrow: 'Consumo eléctrico Colombia', title: 'Entendé cuánto del recibo viene del consumo',
    description: 'Aplicá ciudad, estrato y kWh para estimar energía, subsidio o contribución y total.',
    inputLabel: 'Hogar y consumo', resultLabel: 'Recibo de luz estimado', calculateLabel: 'Calcular recibo',
    highlights: ['Costo de energía', 'Subsidio o aporte', 'Total estimado'],
    presets: { title: 'Hogares de ejemplo', items: [
      { label: 'Bogotá · estrato 3', note: '150 kWh', values: { estrato: 3, consumo_kwh: 150, ciudad: 'bogota' } },
      { label: 'Medellín · estrato 4', note: '250 kWh', values: { estrato: 4, consumo_kwh: 250, ciudad: 'medellin' } },
    ] },
  },
  'calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026': {
    tone: 'labor', eyebrow: 'Cierre laboral doméstico', title: 'Liquidá cada prestación sin mezclar conceptos',
    description: 'Calculá cesantías, intereses, prima y vacaciones según días semanales y período trabajado.',
    inputLabel: 'Relación laboral y pagos', resultLabel: 'Liquidación final', calculateLabel: 'Calcular liquidación',
    highlights: ['Prestaciones pendientes', 'Vacaciones', 'Total a pagar'],
  },
  'calculadora-placas-auto-costo-mexico': {
    tone: 'auto', eyebrow: 'Trámite vehicular México', title: 'Presupuestá placas, alta o refrendo por estado',
    description: 'Elegí entidad, trámite y valor del auto para ver derechos y costo total estimado.',
    inputLabel: 'Estado y vehículo', resultLabel: 'Costo del trámite', calculateLabel: 'Calcular placas',
    highlights: ['Derechos estatales', 'Costo adicional', 'Total estimado'],
    presets: { title: 'Trámites frecuentes', items: [
      { label: 'Refrendo CDMX', note: 'Auto de $300.000', values: { estado: 'cdmx', tipoTramite: 'refrendo', valorAuto: 300000 } },
      { label: 'Alta en Jalisco', note: 'Auto de $500.000', values: { estado: 'jalisco', tipoTramite: 'alta-nuevo', valorAuto: 500000 } },
    ] },
  },
  'calculadora-isn-impuesto-sobre-nominas-estado': {
    tone: 'tax', eyebrow: 'Nómina estatal México', title: 'Aplicá la tasa ISN correcta a tu nómina',
    description: 'Elegí el estado para convertir la nómina mensual en impuesto y costo laboral total.',
    inputLabel: 'Estado y nómina', resultLabel: 'ISN mensual', calculateLabel: 'Calcular ISN',
    highlights: ['Impuesto estatal', 'Tasa aplicable', 'Costo anual'],
    presets: { title: 'Nóminas de referencia', items: [
      { label: 'CDMX · $500.000', note: 'Nómina mensual', values: { estado: 'CDMX', totalNominaMensual: 500000 } },
      { label: 'Nuevo León · $1 M', note: 'Nómina mensual', values: { estado: 'NL', totalNominaMensual: 1000000 } },
    ] },
  },
  'calculadora-sueldo-por-hora': {
    tone: 'labor', eyebrow: 'Valor de tu tiempo', title: 'Convertí el sueldo mensual en hora, día y semana',
    description: 'Usá tu jornada real para comparar trabajos, presupuestar horas o revisar una oferta.',
    inputLabel: 'Sueldo y jornada', resultLabel: 'Valor por hora', calculateLabel: 'Calcular valor hora',
    highlights: ['Pago por hora', 'Pago diario', 'Pago semanal'],
    presets: { title: 'Jornadas frecuentes', items: [
      { label: '40 horas semanales', note: '$1,5 M mensuales', values: { sueldoMensual: 1500000, horasSemana: 40 } },
      { label: 'Media jornada', note: '$900.000 · 20 horas', values: { sueldoMensual: 900000, horasSemana: 20 } },
    ] },
  },
  'calculadora-empleada-domestica-dias-colombia-2026': {
    tone: 'labor', eyebrow: 'Trabajo doméstico por días', title: 'Calculá el costo completo por día trabajado',
    description: 'Sumá pago directo, seguridad social y prestaciones para conocer el costo mensual real.',
    inputLabel: 'Días y pago acordado', resultLabel: 'Costo mensual completo', calculateLabel: 'Calcular pago por días',
    highlights: ['Pago directo', 'Aportes PILA', 'Prestaciones'],
    presets: { title: 'Frecuencias de trabajo', items: [
      { label: '2 días por semana', note: '$80.000 por día', values: { diasSemana: '2', pagoDia: 80000 } },
      { label: '4 días por semana', note: '$90.000 por día', values: { diasSemana: '4', pagoDia: 90000 } },
    ] },
  },
  'calculadora-patente-municipal-ecuador': {
    tone: 'business', eyebrow: 'Negocio y municipio', title: 'Estimá tu patente antes de declarar',
    description: 'Elegí el régimen del cantón y compará el valor anual con los límites legales.',
    inputLabel: 'Datos del negocio', resultLabel: 'Patente estimada', calculateLabel: 'Calcular patente',
    highlights: ['Monto anual', 'Tasa efectiva', 'Régimen aplicado'],
    presets: { title: 'Probá un caso frecuente', items: [
      { label: 'Negocio pequeño', note: '$15.000 de patrimonio', values: { patrimonio: 15000, canton: 'tabla', obligadoContabilidad: 'si' } },
      { label: 'Quito · no obligado', note: 'Tarifa simplificada', values: { patrimonio: 30000, canton: 'quito', obligadoContabilidad: 'no' } },
    ] },
  },
  'calculadora-recargo-nocturno-colombia-2026': {
    tone: 'labor', eyebrow: 'Trabajo nocturno', title: 'Separá tu salario del recargo real',
    description: 'Ingresá únicamente las horas nocturnas y distinguí las nuevas horas de 7 a 9 p. m.',
    inputLabel: 'Tu turno y salario', resultLabel: 'Adicional del mes', calculateLabel: 'Calcular recargo',
    highlights: ['Recargo del mes', 'Valor por hora', 'Impacto Ley 2466'],
    presets: { title: 'Escenarios de turno', items: [
      { label: 'Turno parcial', note: '20 horas nocturnas', values: { salarioMensual: 2000000, horasNocturnas: 20, horasNuevas19a21: 10, periodo: 'desde-15-jul' } },
      { label: 'Turno completo', note: '80 horas nocturnas', values: { salarioMensual: 2800000, horasNocturnas: 80, horasNuevas19a21: 30, periodo: 'desde-15-jul' } },
    ] },
  },
  'calculadora-reduccion-jornada-42-horas-colombia-2026': {
    tone: 'labor', eyebrow: 'Reforma laboral', title: 'Mirá cuánto vale tu hora con la jornada de 42 horas',
    description: 'Compará el valor horario anterior con el nuevo sin modificar tu salario mensual.',
    inputLabel: 'Tu jornada actual', resultLabel: 'Nueva hora laboral', calculateLabel: 'Comparar jornadas',
    highlights: ['Hora nueva', 'Aumento por hora', 'Tiempo liberado'],
    presets: { title: 'Comparaciones rápidas', items: [
      { label: 'De 44 a 42 horas', note: 'Semana laboral vigente', values: { salarioMensual: 2000000, jornadaActual: '44', distribucion: '5' } },
      { label: 'De 48 a 42 horas', note: 'Cambio completo', values: { salarioMensual: 3000000, jornadaActual: '48', distribucion: '6' } },
    ] },
  },
  'calculadora-incapacidad-medica-eps-colombia': {
    tone: 'health', eyebrow: 'Incapacidad laboral', title: 'Entendé quién paga cada día de incapacidad',
    description: 'Visualizá por separado el pago del empleador, el de la EPS y la diferencia frente a tu salario.',
    inputLabel: 'Salario y duración', resultLabel: 'Total a recibir', calculateLabel: 'Estimar incapacidad',
    highlights: ['Pago empleador', 'Pago EPS', 'Ingreso no percibido'],
    presets: { title: 'Duraciones frecuentes', items: [
      { label: '3 días', note: 'Incapacidad corta', values: { salario: 2000000, dias: 3 } },
      { label: '30 días', note: 'Un mes de incapacidad', values: { salario: 3000000, dias: 30 } },
    ] },
  },
  'calculadora-pension-alimenticia-ecuador': {
    tone: 'family', eyebrow: 'Familia y alimentos', title: 'Estimá el mínimo según ingreso, hijos y edad',
    description: 'La pantalla prioriza el total familiar y muestra cuánto corresponde por cada hijo.',
    inputLabel: 'Datos del alimentante', resultLabel: 'Pensión mínima', calculateLabel: 'Estimar pensión',
    highlights: ['Total mínimo', 'Monto por hijo', 'Nivel de tabla'],
    presets: { title: 'Composiciones familiares', items: [
      { label: '1 hijo menor', note: 'Ingreso mensual de $1.200', values: { ingresoMensual: 1200, cantidadHijos: 1, edadBeneficiario: 5 } },
      { label: '2 hijos', note: 'Beneficiario mayor de 12', values: { ingresoMensual: 1800, cantidadHijos: 2, edadBeneficiario: 14 } },
    ] },
  },
  'calculadora-impuesto-timbre-nacional-colombia-2026': {
    tone: 'tax', eyebrow: 'Documento e impuesto', title: 'Confirmá primero si el documento paga timbre',
    description: 'El flujo empieza por aplicabilidad y exención antes de mostrar impuesto y valor total.',
    inputLabel: 'Documento y valor', resultLabel: 'Impuesto de timbre', calculateLabel: 'Revisar impuesto',
    highlights: ['¿Aplica?', 'Tarifa vigente', 'Total con timbre'],
    presets: { title: 'Documentos de ejemplo', items: [
      { label: 'Contrato mercantil', note: '$500 millones', values: { tipo_documento: 'acto_contrato_mercantil', valor_documento: 500000000, exento_timbre: 'false' } },
      { label: 'Escritura pública', note: '$900 millones', values: { tipo_documento: 'escritura_publica', valor_documento: 900000000, exento_timbre: 'false' } },
    ] },
  },
  'calculadora-isr-honorarios-persona-fisica': {
    tone: 'tax', eyebrow: 'Factura de honorarios', title: 'Pasá del honorario bruto al neto que recibís',
    description: 'Separá IVA e ISR según el tipo de cliente y tu régimen fiscal.',
    inputLabel: 'Tu factura', resultLabel: 'Neto depositado', calculateLabel: 'Calcular neto',
    highlights: ['Neto a recibir', 'ISR retenido', 'IVA trasladado'],
    presets: { title: 'Facturas típicas', items: [
      { label: 'Empresa · AEP', note: '$20.000 de honorarios', values: { montoHonorarios: 20000, tipoCliente: 'persona-moral', regimen: 'aep' } },
      { label: 'Persona física · RESICO', note: '$35.000 de honorarios', values: { montoHonorarios: 35000, tipoCliente: 'persona-fisica', regimen: 'resico' } },
    ] },
  },
  'calculadora-porcion-arroz-gramos-personas': {
    tone: 'food', eyebrow: 'Porciones de cocina', title: 'Comprá la cantidad justa de arroz',
    description: 'Elegí el tipo de plato: no requiere la misma porción una guarnición que un risotto o sushi.',
    inputLabel: 'Tu comida', resultLabel: 'Arroz a preparar', calculateLabel: 'Calcular porciones',
    highlights: ['Gramos en crudo', 'Tazas de arroz', 'Agua necesaria'],
    presets: { title: 'Mesas frecuentes', items: [
      { label: 'Cena para 4', note: 'Como guarnición', values: { personas: 4, tipo: 'guarnicion', ninos: 'no' } },
      { label: 'Paella para 10', note: 'Plato principal', values: { personas: 10, tipo: 'principal', ninos: 'no' } },
      { label: 'Familia con niños', note: '6 personas', values: { personas: 6, tipo: 'guarnicion', ninos: 'si' } },
    ] },
  },
  'calculadora-bebidas-evento-litros-por-persona': {
    tone: 'food', eyebrow: 'Organización de eventos', title: 'Armá la compra de bebidas sin quedarte corto',
    description: 'La cantidad se ajusta por duración, clima y tipo principal de bebida.',
    inputLabel: 'Tu evento', resultLabel: 'Lista de compra', calculateLabel: 'Armar compra',
    highlights: ['Litros totales', 'Cerveza y vino', 'Sin alcohol'],
    presets: { title: 'Eventos frecuentes', items: [
      { label: 'Cumple de 30', note: '5 horas · mixto', values: { personas: 30, duracionHoras: 5, tipoBebida: 'mixto', temporada: 'intermedia' } },
      { label: 'Fiesta de 100', note: 'Verano · 8 horas', values: { personas: 100, duracionHoras: 8, tipoBebida: 'mixto', temporada: 'verano' } },
      { label: 'Evento sin alcohol', note: '50 personas', values: { personas: 50, duracionHoras: 4, tipoBebida: 'sin_alcohol', temporada: 'intermedia' } },
    ] },
  },
  'calculadora-semanas-embarazo': {
    tone: 'health', eyebrow: 'Seguimiento del embarazo', title: 'Ubicá tu embarazo en semanas, días y trimestre',
    description: 'Ingresá la fecha de última menstruación para ver edad gestacional, progreso y fecha probable de parto.',
    inputLabel: 'Fecha de referencia', resultLabel: 'Tu etapa actual', calculateLabel: 'Ver mi semana',
    highlights: ['Semanas + días', 'Trimestre actual', 'Fecha probable de parto'],
  },
  'calculadora-horario-llegada-zona-horaria': {
    tone: 'travel', eyebrow: 'Planificación de vuelos', title: 'Convertí el vuelo a la hora local de destino',
    description: 'Sumá duración y diferencia horaria para saber el día y la hora exactos de llegada.',
    inputLabel: 'Datos del vuelo', resultLabel: 'Llegada local', calculateLabel: 'Calcular llegada',
    highlights: ['Hora de destino', 'Cambio de día', 'Duración real'],
    presets: { title: 'Rutas de ejemplo', items: [
      { label: 'Vuelo nocturno', note: '23:00 · 11,5 h · +4', values: { horaSalida: '23:00', duracionVueloHoras: 11.5, diferenciaHorariaDestino: 4 } },
      { label: 'Hacia el oeste', note: '10:00 · 8 h · −5', values: { horaSalida: '10:00', duracionVueloHoras: 8, diferenciaHorariaDestino: -5 } },
    ] },
  },
  'calculadora-tarifa-electrica-distribuidoras-chile-bt1-bt2-bt3': {
    tone: 'energy', eyebrow: 'Cuenta de electricidad', title: 'Compará tarifa, potencia y consumo en una sola factura',
    description: 'El resultado prioriza el total mensual y muestra si otra opción tarifaria sería más conveniente.',
    inputLabel: 'Tu suministro', resultLabel: 'Factura proyectada', calculateLabel: 'Proyectar cuenta',
    highlights: ['Total mensual', 'Costo por kWh', 'Opción conveniente'],
    presets: { title: 'Perfiles de consumo', items: [
      { label: 'Hogar BT1', note: '300 kWh mensuales', values: { opcion_tarifa: 'bt1', consumo_kwh_mes: 300, potencia_contratada_kw: 3, distribuidor: 'enel', mes_comparacion: 'promedio' } },
      { label: 'Comercio BT2', note: '1.200 kWh mensuales', values: { opcion_tarifa: 'bt2', consumo_kwh_mes: 1200, potencia_contratada_kw: 10, distribuidor: 'chilectra', mes_comparacion: 'promedio' } },
    ] },
  },
  'calculadora-duracion-bateria-mah-consumo': {
    tone: 'tech', eyebrow: 'Autonomía electrónica', title: 'Convertí mAh y consumo en horas de uso real',
    description: 'Incluí la pérdida de eficiencia para evitar una autonomía teórica demasiado optimista.',
    inputLabel: 'Batería y dispositivo', resultLabel: 'Autonomía estimada', calculateLabel: 'Estimar duración',
    highlights: ['Horas de uso', 'Minutos totales', 'Energía disponible'],
    presets: { title: 'Dispositivos de ejemplo', items: [
      { label: 'Power bank', note: '5.000 mAh · 500 mA', values: { capacidadMah: 5000, consumoMa: 500, eficiencia: 85 } },
      { label: 'Sensor IoT', note: '2.000 mAh · 50 mA', values: { capacidadMah: 2000, consumoMa: 50, eficiencia: 90 } },
    ] },
  },
  'calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026': {
    tone: 'tax', eyebrow: 'Renta personas naturales', title: 'Ubicá tu renta líquida dentro de la tabla 2026',
    description: 'Convertimos el valor a UVT y distinguimos tarifa marginal de tarifa efectiva.',
    inputLabel: 'Renta líquida anual', resultLabel: 'Impuesto estimado', calculateLabel: 'Calcular renta',
    highlights: ['Impuesto a cargo', 'Tarifa marginal', 'Tarifa efectiva'],
    presets: { title: 'Rentas de ejemplo', items: [
      { label: '$80 millones', note: 'Renta líquida anual', values: { renta_liquida: 80000000 } },
      { label: '$180 millones', note: 'Renta líquida anual', values: { renta_liquida: 180000000 } },
    ] },
  },
  'calculadora-canasta-basica-mexico-costo-mensual-familia': {
    tone: 'family', eyebrow: 'Presupuesto familiar', title: 'Armá una canasta según tu familia y tu región',
    description: 'Compará perfiles de consumo y cadenas para ver el gasto mensual y diario por persona.',
    inputLabel: 'Tu hogar', resultLabel: 'Presupuesto de alimentos', calculateLabel: 'Estimar canasta',
    highlights: ['Costo mensual', 'Costo por persona', '% del salario mínimo'],
    presets: { title: 'Tipos de hogar', items: [
      { label: 'Pareja', note: '2 adultos · perfil equilibrado', values: { adultos: 2, ninos: 0, perfil: 'equilibrado', region: 'centro', cadena: 'promedio' } },
      { label: 'Familia de 4', note: '2 adultos + 2 niños', values: { adultos: 2, ninos: 2, perfil: 'saludable', region: 'centro', cadena: 'aurrera' } },
    ] },
  },
  'calculadora-imss-cuotas-empleado-patron-mexico-2026': {
    tone: 'labor', eyebrow: 'Costo de nómina', title: 'Separá lo que paga el empleado de lo que aporta el patrón',
    description: 'El total combina ambas partes sin esconder el descuento de nómina ni el gasto empresarial.',
    inputLabel: 'Salario base de cotización', resultLabel: 'Costo IMSS completo', calculateLabel: 'Calcular cuotas',
    highlights: ['Cuota empleado', 'Cuota patrón', 'Costo total'],
    presets: { title: 'Salarios de referencia', items: [
      { label: 'SBC $10.000', note: 'Mensual', values: { sbc_empleado: 10000 } },
      { label: 'SBC $30.000', note: 'Mensual', values: { sbc_empleado: 30000 } },
    ] },
  },
  'calculadora-consumo-nafta-litros-100km': {
    tone: 'auto', eyebrow: 'Rendimiento del auto', title: 'Medí el consumo real entre dos cargas',
    description: 'Usá kilómetros recorridos y litros repuestos: el resultado muestra L/100 km y km/L.',
    inputLabel: 'Datos del tanque', resultLabel: 'Consumo real', calculateLabel: 'Calcular consumo',
    highlights: ['L/100 km', 'Kilómetros por litro', 'Comparación inmediata'],
    presets: { title: 'Rendimientos de ejemplo', items: [
      { label: 'Uso urbano', note: '350 km con 40 litros', values: { kmRecorridos: 350, litrosCargados: 40 } },
      { label: 'Uso en ruta', note: '650 km con 45 litros', values: { kmRecorridos: 650, litrosCargados: 45 } },
    ] },
  },
  'calculadora-impuesto-sellos-inmueble-contrato': {
    tone: 'tax', eyebrow: 'Contrato e inmueble', title: 'Calculá el sello y cuánto paga cada parte',
    description: 'Elegí provincia y operación; podés reemplazar la alícuota cuando tengas el dato oficial.',
    inputLabel: 'Datos del contrato', resultLabel: 'Impuesto y reparto', calculateLabel: 'Calcular sellos',
    highlights: ['Impuesto total', 'Monto por parte', 'Alícuota aplicada'],
    presets: { title: 'Operaciones frecuentes', items: [
      { label: 'Compraventa PBA', note: '$30 millones', values: { montoContrato: 30000000, provincia: 'buenos-aires', tipoOperacion: 'compraventa', alicuota: 0, partesQuePagan: 'mitades' } },
      { label: 'Alquiler CABA', note: '$12 millones de contrato', values: { montoContrato: 12000000, provincia: 'caba', tipoOperacion: 'alquiler', alicuota: 0, partesQuePagan: 'mitades' } },
    ] },
  },
  'calculadora-pago-provisional-isr-arrendamiento-mexico-2026': {
    tone: 'tax', eyebrow: 'Renta de inmuebles', title: 'Estimá el ISR mensual que enterás al SAT',
    description: 'Compará deducción ciega y gastos reales, incluyendo predial y retención del inquilino.',
    inputLabel: 'Ingresos y deducciones', resultLabel: 'Pago provisional', calculateLabel: 'Calcular ISR',
    highlights: ['Pago mensual', 'Base gravable', 'Tasa efectiva'],
    presets: { title: 'Casos de arrendamiento', items: [
      { label: 'Deducción ciega', note: 'Renta de $18.000', values: { rentaMensual: 18000, tipoDeduccion: 'ciega', predialAnual: 3600, gastosRealesMensuales: 0, tipoInquilino: 'fisica' } },
      { label: 'Renta a empresa', note: 'Con retención del 10%', values: { rentaMensual: 30000, tipoDeduccion: 'reales', predialAnual: 6000, gastosRealesMensuales: 5000, tipoInquilino: 'moral' } },
    ] },
  },
};

export function getPersonalizedCalcUx(slug: string): PersonalizedCalcUx | undefined {
  return UX[slug];
}
