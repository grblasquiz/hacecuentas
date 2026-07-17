export interface Inputs { fechaNacimiento: string; nacionalidad: string; inhabilitado: string }
export interface Outputs { edad: number; cumpleEdad: string; resultado: string; detalle: string; _insight?: any }
export function compute(i: Inputs): Outputs {
  const nacimiento = new Date(`${i.fechaNacimiento}T12:00:00`), hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const antesCumple = hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (antesCumple) edad--;
  const mayor = edad >= 18, chileno = i.nacionalidad === 'chilena', sinInhabilidad = i.inhabilitado !== 'si';
  const orientacion = mayor && chileno && sinInhabilidad;
  const resultado = orientacion ? 'Cumplís las condiciones generales de edad y nacionalidad' : 'Revisá las condiciones indicadas';
  const detalle = orientacion ? `Tenés ${edad} años. La inscripción y habilitación concreta se confirman en la consulta oficial de Servel.` : `Tenés ${edad} años. Esta herramienta no reemplaza la consulta del padrón electoral ni evalúa todas las inhabilidades legales.`;
  return { edad: Math.max(0, edad), cumpleEdad: mayor ? 'Sí, 18 años o más' : 'No, menor de 18 años', resultado, detalle, _insight: { title: resultado, text: detalle, tone: orientacion ? 'good' : 'warn', icon: '🗳️' } };
}
