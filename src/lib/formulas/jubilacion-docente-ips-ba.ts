/**
 * Jubilación Docente IPS Buenos Aires — Ley 11.758.
 * Haber = 80% del mejor sueldo histórico (últimos 10 años) × 82% móvil.
 * Requisitos: 30 años servicio docente + 60 años (varón) / 55 (mujer).
 * Tareas frente al aula penosas: reducción 5 años edad y servicio.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function jubilacionDocenteIpsBa(i: Inputs): Outputs {
  const mejorSueldo = Math.max(0, Number(i.mejorSueldo) || 0);
  const aniosServicio = Math.max(0, Number(i.aniosServicio) || 0);
  const edad = Math.max(0, Number(i.edad) || 0);
  const sexo = String(i.sexo || 'm'); // m | f
  const frenteAlumno = String(i.frenteAlumno || 'si') === 'si';

  if (mejorSueldo <= 0) throw new Error('Ingresá el mejor sueldo histórico');

  const edadRequerida = (sexo === 'f' ? 55 : 60) - (frenteAlumno ? 5 : 0);
  const serviciosRequeridos = 30 - (frenteAlumno ? 5 : 0);

  const cumpleEdad = edad >= edadRequerida;
  const cumpleServicios = aniosServicio >= serviciosRequeridos;

  // Base 80% del mejor sueldo × 82% móvil
  const base = mejorSueldo * 0.80;
  const haber = base * 0.82;

  // Proporcional si no alcanza 30 años (caso jubilación reducida):
  let haberProporcional = haber;
  if (!cumpleServicios && aniosServicio >= 10) {
    haberProporcional = haber * (aniosServicio / serviciosRequeridos);
  }

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  const estado = (cumpleEdad && cumpleServicios)
    ? 'Cumple requisitos — jubilación ordinaria IPS BA.'
    : `Faltan requisitos: edad mínima ${edadRequerida}, servicios mínimos ${serviciosRequeridos}.`;

  return {
    haberMensual: fmt(cumpleEdad && cumpleServicios ? haber : haberProporcional),
    base80: fmt(base),
    aniosFaltantes: Math.max(0, serviciosRequeridos - aniosServicio),
    edadFaltante: Math.max(0, edadRequerida - edad),
    estado,
    formula: '82% móvil × 80% del mejor sueldo últimos 10 años (Ley 11.758).',
  };
}
