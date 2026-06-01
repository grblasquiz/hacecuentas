/** Carga máxima estimada de una columna de hormigón */
export interface CargaColumnaInputs {
  ladoCm: number;
  alturaM: number;
  resistenciaHormigon?: string;
}
export interface CargaColumnaOutputs {
  cargaMaximaKg: number;
  cargaMaximaTon: number;
  factorSeguridad: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const RESISTENCIAS: Record<string, { fc: number; nombre: string }> = {
  h13: { fc: 130, nombre: 'H13 (130 kg/cm²)' },
  h17: { fc: 170, nombre: 'H17 (170 kg/cm²)' },
  h21: { fc: 210, nombre: 'H21 (210 kg/cm²)' },
  h25: { fc: 250, nombre: 'H25 (250 kg/cm²)' },
  h30: { fc: 300, nombre: 'H30 (300 kg/cm²)' },
};

const FACTOR_SEGURIDAD = 3;

export function cargaColumna(inputs: CargaColumnaInputs): CargaColumnaOutputs {
  const lado = Number(inputs.ladoCm);
  const altura = Number(inputs.alturaM);
  const hormigon = String(inputs.resistenciaHormigon || 'h21');

  if (!lado || lado <= 0) throw new Error('Ingresá el lado de la columna en cm');
  if (!altura || altura <= 0) throw new Error('Ingresá la altura de la columna en metros');
  if (!RESISTENCIAS[hormigon]) throw new Error('Resistencia de hormigón no válida');

  const r = RESISTENCIAS[hormigon];
  const seccion = lado * lado; // cm²
  const cargaRotura = seccion * r.fc; // kg
  const cargaAdmisible = cargaRotura / FACTOR_SEGURIDAD;
  const cargaTon = Number((cargaAdmisible / 1000).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const reservaSeguridad = cargaRotura - cargaAdmisible; // kg que quedan como margen frente a la rotura
  const cargaAdmisibleKg = Math.round(cargaAdmisible);

  return {
    cargaMaximaKg: cargaAdmisibleKg,
    cargaMaximaTon: cargaTon,
    factorSeguridad: FACTOR_SEGURIDAD,
    detalle: `Columna de ${lado}×${lado} cm (${fmt.format(seccion)} cm²), ${r.nombre}, altura ${fmt.format(altura)} m → carga de rotura ${fmt.format(cargaRotura)} kg / factor ${FACTOR_SEGURIDAD} = carga admisible ~${fmt.format(cargaTon)} toneladas. Este cálculo no incluye pandeo ni armadura; consultá un ingeniero.`,
    _insight: {
      title: 'Carga admisible estimada',
      text: `Esta columna soporta con seguridad **${fmt.format(cargaTon)} t** (${fmt.format(cargaAdmisibleKg)} kg): es la rotura de ${fmt.format(cargaRotura)} kg dividida por un factor de seguridad de **${FACTOR_SEGURIDAD}**. No contempla pandeo ni armadura, así que tomalo como orientativo y validá con un ingeniero.`,
      tone: 'warn',
      icon: '🏗️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Carga admisible', value: cargaAdmisibleKg },
        { label: 'Reserva de seguridad', value: Math.round(reservaSeguridad) },
      ],
      prefix: '',
      centerValue: `${fmt.format(Math.round(cargaRotura))} kg`,
      centerLabel: 'Carga de rotura',
      ariaLabel: `De ${fmt.format(Math.round(cargaRotura))} kg de carga de rotura, ${fmt.format(cargaAdmisibleKg)} kg son admisibles y el resto es reserva de seguridad`,
    },
  };
}
