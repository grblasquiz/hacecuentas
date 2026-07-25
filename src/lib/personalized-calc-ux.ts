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

const UX: Record<string, PersonalizedCalcUx> = {
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
