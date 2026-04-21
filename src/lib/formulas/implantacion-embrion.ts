/** Ventana de implantación del embrión */
export interface Inputs { fechaReferencia: string; tipoCalculo?: string; }
export interface Outputs { ventanaImplantacion: string; diaMasProbable: string; primerTestConfiable: string; sintomas: string; }

export function implantacionEmbrion(i: Inputs): Outputs {
  const parts = String(i.fechaReferencia || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const ref = new Date(yy, mm - 1, dd);
  if (isNaN(ref.getTime())) throw new Error('Ingresá una fecha válida');
  const tipo = String(i.tipoCalculo || 'ovulacion');
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // Ajustar DPO según tipo
  let offsetInicio = 6, offsetPico = 9, offsetFin = 12;
  if (tipo === 'transferencia-d3') {
    offsetInicio = 3; offsetPico = 5; offsetFin = 8;
  } else if (tipo === 'transferencia-d5') {
    offsetInicio = 1; offsetPico = 3; offsetFin = 5;
  }

  const inicio = new Date(ref.getTime()); inicio.setDate(inicio.getDate() + offsetInicio);
  const pico = new Date(ref.getTime()); pico.setDate(pico.getDate() + offsetPico);
  const fin = new Date(ref.getTime()); fin.setDate(fin.getDate() + offsetFin);

  // Primer test: ~4 días post implantación promedio
  const test = new Date(pico.getTime()); test.setDate(test.getDate() + 5);

  return {
    ventanaImplantacion: `Del ${fmt(inicio)} al ${fmt(fin)}`,
    diaMasProbable: fmt(pico),
    primerTestConfiable: fmt(test),
    sintomas: 'Posibles síntomas post-implantación (1-3 días después): manchado leve rosado/marrón, cólicos suaves, sensibilidad mamaria, fatiga. No todas las mujeres los tienen.',
  };
}
