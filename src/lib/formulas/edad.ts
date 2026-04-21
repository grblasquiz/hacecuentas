/**
 * Calculadora de edad
 * Calcula años, meses y días exactos desde fecha de nacimiento
 */

export interface EdadInputs {
  fechaNacimiento: string;
}

export interface EdadOutputs {
  edad: string;
  diasTotal: number;
  mesesTotal: number;
  horasTotal: string;
  proximoCumpleanios: string;
  diasHastaCumple: number;
}

export function edad(inputs: EdadInputs): EdadOutputs {
  if (!inputs.fechaNacimiento) throw new Error('Ingresá tu fecha de nacimiento');

  const parts = String(inputs.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const nacimiento = new Date(yy, mm - 1, dd);
  if (isNaN(nacimiento.getTime())) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  nacimiento.setHours(0, 0, 0, 0);

  if (nacimiento > hoy) throw new Error('La fecha no puede ser futura');

  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  let dias = hoy.getDate() - nacimiento.getDate();

  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diasTotal = Math.floor((hoy.getTime() - nacimiento.getTime()) / msPerDay);
  const mesesTotal = anios * 12 + meses;
  const horasTotal = (diasTotal * 24).toLocaleString('es-AR');

  // Próximo cumpleaños
  let proxCumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  if (proxCumple <= hoy) {
    proxCumple = new Date(hoy.getFullYear() + 1, nacimiento.getMonth(), nacimiento.getDate());
  }
  const diasHastaCumple = Math.round((proxCumple.getTime() - hoy.getTime()) / msPerDay);

  return {
    edad: `${anios} años, ${meses} meses y ${dias} días`,
    diasTotal,
    mesesTotal,
    horasTotal,
    proximoCumpleanios: `${proxCumple.getFullYear()}-${String(proxCumple.getMonth()+1).padStart(2,'0')}-${String(proxCumple.getDate()).padStart(2,'0')}`,
    diasHastaCumple,
  };
}
