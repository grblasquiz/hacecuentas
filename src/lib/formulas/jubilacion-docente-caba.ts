/**
 * Jubilación Docente CABA — ObSBA / ANSES docente según cargo.
 * Haber: 82% del promedio de las 120 mejores remuneraciones (últimos 10 años).
 * Requisitos: 25 años de aporte docente + 57 (mujer) / 60 (varón).
 * Cargos docentes al frente de alumnos reducen edad y servicio.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function jubilacionDocenteCaba(i: Inputs): Outputs {
  const promedio120 = Math.max(0, Number(i.promedio120) || 0);
  const aniosAporte = Math.max(0, Number(i.aniosAporte) || 0);
  const edad = Math.max(0, Number(i.edad) || 0);
  const sexo = String(i.sexo || 'm');
  const frenteAlumno = String(i.frenteAlumno || 'si') === 'si';

  if (promedio120 <= 0) throw new Error('Ingresá el promedio histórico');

  const edadRequerida = (sexo === 'f' ? 57 : 60) - (frenteAlumno ? 5 : 0);
  const serviciosRequeridos = 25 - (frenteAlumno ? 5 : 0);

  const cumpleEdad = edad >= edadRequerida;
  const cumpleServicios = aniosAporte >= serviciosRequeridos;

  const haber = promedio120 * 0.82;
  let haberProporcional = haber;
  if (!cumpleServicios && aniosAporte >= 10) {
    haberProporcional = haber * (aniosAporte / serviciosRequeridos);
  }

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  const estado = (cumpleEdad && cumpleServicios)
    ? 'Cumple requisitos — jubilación docente CABA.'
    : `Faltan requisitos: edad mínima ${edadRequerida}, servicios mínimos ${serviciosRequeridos}.`;

  return {
    haberMensual: fmt(cumpleEdad && cumpleServicios ? haber : haberProporcional),
    promedio120: fmt(promedio120),
    aniosFaltantes: Math.max(0, serviciosRequeridos - aniosAporte),
    edadFaltante: Math.max(0, edadRequerida - edad),
    estado,
    formula: '82% del promedio de las 120 mejores remuneraciones de los últimos 10 años (régimen docente CABA).',
  };
}
