/**
 * "Mi Hacé Cuentas" — vocabulario canónico del perfil numérico del usuario.
 *
 * Idea: hoy cada calc le vuelve a pedir al usuario datos que el sitio ya
 * conoce localmente (sueldo, provincia, hijos, alquiler...). Este módulo define
 * el VOCABULARIO COMPARTIDO de variables reutilizables. Cada campo de un calc
 * declara, en su JSON, a qué clave canónica mapea (`profileKey`), y así un dato
 * cargado en una herramienta precarga el campo equivalente en cualquier otra.
 *
 *   calc A: field id "sueldo"        -> profileKey "trabajo.sueldoBruto"
 *   calc B: field id "salarioBruto"  -> profileKey "trabajo.sueldoBruto"
 *   => el usuario lo carga una vez, ambas lo reutilizan.
 *
 * CONTRATO DE ALMACENAMIENTO (compartido entre features, NO romper):
 *   localStorage 'hc_profile' = JSON
 *     {
 *       v: PROFILE_VERSION,                    // versión de esquema (migraciones)
 *       fields: {                              // PLANO por clave canónica (dotted)
 *         "trabajo.sueldoBruto": { value, at, src },
 *         ...
 *       }
 *     }
 *   - Almacenamiento PLANO por clave (no anidado): simplifica get/set por
 *     `data-profile-key` y el render de procedencia. Los "namespaces" del spec
 *     (trabajo, vivienda, familia...) son sólo el `group` = key.split('.')[0],
 *     usado para AGRUPAR en la pantalla /mi-hacecuentas.
 *   - Local y privado por defecto: nunca se envía al servidor. La sync cifrada
 *     opcional es un paso posterior, no parte del MVP.
 *
 * Este archivo es TS puro, sin DOM ni imports de runtime: se consume en build
 * (render de atributos `data-profile-key`, validación, pantalla del perfil) y
 * como fuente de verdad para el store inline del cliente.
 */

/** Versión del esquema de `hc_profile`. Bump => migración en el store. */
export const PROFILE_VERSION = 1 as const;

/** Clave de localStorage del perfil. Una sola, global por dispositivo. */
export const PROFILE_KEY = 'hc_profile' as const;

/** Tipo de dato de un campo del perfil (gobierna parse y UI de edición). */
export type ProfileFieldType =
  | 'number' // montos, cantidades (se guardan como Number)
  | 'string' // texto libre corto
  | 'enum' // una opción de `options`
  | 'date' // ISO 'YYYY-MM-DD'
  | 'boolean'; // sí/no

/** Grupo conceptual (namespace) — ordena y titula la pantalla del perfil. */
export type ProfileGroup =
  | 'ubicacion'
  | 'moneda'
  | 'trabajo'
  | 'familia'
  | 'vivienda'
  | 'gastos'
  | 'vehiculo'
  | 'finanzas';

/** Definición de una variable canónica reutilizable. */
export interface ProfileFieldDef {
  /** Clave canónica dotted: `<group>.<nombre>`. Es lo que va en `profileKey`. */
  key: string;
  /** Grupo (namespace). Debe ser el prefijo de `key`. */
  group: ProfileGroup;
  /** Etiqueta legible para la pantalla /mi-hacecuentas. */
  label: string;
  /** Tipo de dato. */
  type: ProfileFieldType;
  /** Unidad/sufijo opcional para mostrar (ej. '$', 'meses'). */
  unit?: string;
  /** Opciones cuando `type === 'enum'`. */
  options?: { value: string; label: string }[];
  /**
   * Dato sensible (sueldo, ahorros, deudas). Se trata con más cuidado en la UI
   * (no se prellena sin que se note, copy de privacidad reforzado). NO cambia
   * dónde se guarda: todo es local igual.
   */
  sensitive?: boolean;
  /** Ayuda corta opcional para la pantalla del perfil. */
  help?: string;
}

/** Metadatos de cada grupo para titular/ordenar la pantalla del perfil. */
export const PROFILE_GROUPS: { id: ProfileGroup; label: string; icon: string }[] = [
  { id: 'ubicacion', label: 'Ubicación', icon: '📍' },
  { id: 'moneda', label: 'Moneda', icon: '💱' },
  { id: 'trabajo', label: 'Trabajo e ingresos', icon: '💼' },
  { id: 'familia', label: 'Grupo familiar', icon: '👨‍👩‍👧' },
  { id: 'vivienda', label: 'Vivienda', icon: '🏠' },
  { id: 'gastos', label: 'Gastos', icon: '🧾' },
  { id: 'vehiculo', label: 'Vehículo', icon: '🚗' },
  { id: 'finanzas', label: 'Ahorros y deudas', icon: '🏦' },
];

/**
 * Vocabulario canónico del MVP (AR · finanzas / empleo / vivienda).
 *
 * Arrancamos acotado a propósito: sólo las variables que de verdad se REUSAN
 * entre las ~20 calcs del MVP. Se amplía cuando entran nuevas familias.
 */
export const PROFILE_FIELDS: ProfileFieldDef[] = [
  // — Ubicación —
  {
    key: 'ubicacion.pais',
    group: 'ubicacion',
    label: 'País',
    type: 'enum',
    options: [
      { value: 'AR', label: 'Argentina' },
      { value: 'MX', label: 'México' },
      { value: 'ES', label: 'España' },
      { value: 'CO', label: 'Colombia' },
      { value: 'CL', label: 'Chile' },
      { value: 'PE', label: 'Perú' },
      { value: 'EC', label: 'Ecuador' },
    ],
  },
  {
    key: 'ubicacion.provincia',
    group: 'ubicacion',
    label: 'Provincia / jurisdicción',
    type: 'string',
    help: 'Define alícuotas de IIBB, sellos y mínimos según jurisdicción.',
  },

  // — Moneda —
  {
    key: 'moneda.principal',
    group: 'moneda',
    label: 'Moneda principal',
    type: 'enum',
    options: [
      { value: 'ARS', label: 'Peso argentino (ARS)' },
      { value: 'USD', label: 'Dólar (USD)' },
      { value: 'MXN', label: 'Peso mexicano (MXN)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'COP', label: 'Peso colombiano (COP)' },
      { value: 'CLP', label: 'Peso chileno (CLP)' },
      { value: 'PEN', label: 'Sol peruano (PEN)' },
    ],
  },

  // — Trabajo e ingresos —
  {
    key: 'trabajo.situacionLaboral',
    group: 'trabajo',
    label: 'Situación laboral',
    type: 'enum',
    options: [
      { value: 'dependencia', label: 'Relación de dependencia' },
      { value: 'monotributo', label: 'Monotributista' },
      { value: 'autonomo', label: 'Autónomo' },
      { value: 'mixto', label: 'Mixto' },
      { value: 'desempleado', label: 'Sin empleo' },
    ],
  },
  {
    key: 'trabajo.sueldoBruto',
    group: 'trabajo',
    label: 'Sueldo bruto mensual',
    type: 'number',
    unit: '$',
    sensitive: true,
  },
  {
    key: 'trabajo.sueldoNeto',
    group: 'trabajo',
    label: 'Sueldo neto (de bolsillo)',
    type: 'number',
    unit: '$',
    sensitive: true,
  },
  {
    key: 'trabajo.tipoContratacion',
    group: 'trabajo',
    label: 'Tipo de contratación',
    type: 'enum',
    options: [
      { value: 'indeterminado', label: 'Tiempo indeterminado' },
      { value: 'plazo-fijo', label: 'Plazo fijo' },
      { value: 'eventual', label: 'Eventual / temporada' },
      { value: 'parttime', label: 'Jornada parcial' },
    ],
  },
  {
    key: 'trabajo.fechaIngreso',
    group: 'trabajo',
    label: 'Fecha de ingreso',
    type: 'date',
    help: 'De acá sale la antigüedad para aguinaldo, vacaciones e indemnización.',
  },
  {
    key: 'trabajo.antiguedadAnios',
    group: 'trabajo',
    label: 'Antigüedad (años)',
    type: 'number',
    unit: 'años',
    help: 'La mayoría de las calcs laborales piden la antigüedad en años directo.',
  },
  {
    key: 'trabajo.convenio',
    group: 'trabajo',
    label: 'Convenio (CCT)',
    type: 'string',
    help: 'Ej. Comercio (130/75), Construcción (76/75).',
  },

  // — Grupo familiar —
  {
    key: 'familia.dependientes',
    group: 'familia',
    label: 'Hijos / personas a cargo',
    type: 'number',
  },
  {
    key: 'familia.conyugeACargo',
    group: 'familia',
    label: 'Cónyuge a cargo',
    type: 'boolean',
  },

  // — Vivienda —
  {
    key: 'vivienda.tipo',
    group: 'vivienda',
    label: 'Situación de vivienda',
    type: 'enum',
    options: [
      { value: 'propia', label: 'Propia' },
      { value: 'alquila', label: 'Alquila' },
      { value: 'familiar', label: 'Familiar / prestada' },
    ],
  },
  {
    key: 'vivienda.alquilerMensual',
    group: 'vivienda',
    label: 'Alquiler mensual',
    type: 'number',
    unit: '$',
    sensitive: true,
  },

  // — Gastos —
  {
    key: 'gastos.recurrentesMensual',
    group: 'gastos',
    label: 'Gastos fijos mensuales',
    type: 'number',
    unit: '$',
    sensitive: true,
  },

  // — Vehículo —
  {
    key: 'vehiculo.tiene',
    group: 'vehiculo',
    label: 'Tenés vehículo',
    type: 'boolean',
  },
  {
    key: 'vehiculo.valor',
    group: 'vehiculo',
    label: 'Valor del vehículo',
    type: 'number',
    unit: '$',
    sensitive: true,
  },

  // — Ahorros y deudas —
  {
    key: 'finanzas.ahorros',
    group: 'finanzas',
    label: 'Ahorros disponibles',
    type: 'number',
    unit: '$',
    sensitive: true,
  },
  {
    key: 'finanzas.deudas',
    group: 'finanzas',
    label: 'Deudas totales',
    type: 'number',
    unit: '$',
    sensitive: true,
  },
];

/**
 * Moneda principal sugerida por país (ISO). Al elegir país en el perfil, si
 * todavía no hay moneda elegida, se autocompleta con esta. Editable después.
 */
export const CURRENCY_BY_COUNTRY: Record<string, string> = {
  AR: 'ARS',
  MX: 'MXN',
  ES: 'EUR',
  CO: 'COP',
  CL: 'CLP',
  PE: 'PEN',
  EC: 'USD',
};

/**
 * Jurisdicciones (provincia / estado / departamento / región / CCAA) por país.
 * `ubicacion.provincia` se renderiza como desplegable dependiente del país
 * elegido. El value guardado es el nombre legible (compat con el texto libre
 * previo). Si el país no está acá, el campo cae a texto libre.
 */
export const PROVINCES_BY_COUNTRY: Record<string, string[]> = {
  AR: [
    'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ],
  MX: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  ],
  ES: [
    'Andalucía', 'Aragón', 'Asturias', 'Islas Baleares', 'Canarias', 'Cantabria',
    'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Comunidad Valenciana',
    'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarra', 'País Vasco',
    'Ceuta', 'Melilla',
  ],
  CO: [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
    'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
    'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
  ],
  CL: [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso',
    'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble',
    'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
  ],
  PE: [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao',
    'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque',
    'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín',
    'Tacna', 'Tumbes', 'Ucayali',
  ],
  EC: [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
    'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago',
    'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena',
    'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
  ],
};

/** Índice por clave para lookups O(1) en build y en la pantalla del perfil. */
export const PROFILE_FIELD_BY_KEY: Record<string, ProfileFieldDef> = Object.fromEntries(
  PROFILE_FIELDS.map((f) => [f.key, f]),
);

/** Set de claves válidas — para validar `profileKey` de los JSON en build. */
export const PROFILE_KEYS: ReadonlySet<string> = new Set(PROFILE_FIELDS.map((f) => f.key));

/** True si `k` es una clave canónica conocida. */
export function isProfileKey(k: string): boolean {
  return PROFILE_KEYS.has(k);
}

/** Definición de un campo por su clave canónica (o undefined si no existe). */
export function getProfileFieldDef(k: string): ProfileFieldDef | undefined {
  return PROFILE_FIELD_BY_KEY[k];
}

// — Tipos del valor almacenado (los consume el store inline del cliente) —

/** Una entrada del perfil: el valor + cuándo y de dónde vino (procedencia). */
export interface ProfileEntry {
  /** Valor crudo (number | string | boolean según el tipo del campo). */
  value: number | string | boolean;
  /** ISO date de última escritura. Para "actualizado hace X" y staleness. */
  at: string;
  /**
   * Procedencia: de dónde salió el dato. Habilita el "📌 de tu perfil" con
   * origen claro y el writeback trazable.
   *   'calc:<slug>'  cargado/confirmado desde una calc
   *   'profile'      editado a mano en /mi-hacecuentas
   */
  src: string;
}

/** Forma del objeto `hc_profile` en localStorage. */
export interface StoredProfile {
  v: number;
  fields: Record<string, ProfileEntry>;
}
