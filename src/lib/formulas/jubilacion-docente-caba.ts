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
  const cumple = cumpleEdad && cumpleServicios;
  const estado = cumple
    ? 'Cumple requisitos — jubilación docente CABA.'
    : `Faltan requisitos: edad mínima ${edadRequerida}, servicios mínimos ${serviciosRequeridos}.`;

  const haberFinal = cumple ? haber : haberProporcional;
  const faltaServicios = Math.max(0, serviciosRequeridos - aniosAporte);
  const faltaEdad = Math.max(0, edadRequerida - edad);
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (cumple) {
    insightText = `Cumplís edad y servicios: tu haber es el **82%** del promedio de tus 120 mejores remuneraciones, **${fmt(haber)}** por mes.`;
    insightTone = 'good';
  } else {
    const partes: string[] = [];
    if (faltaEdad > 0) partes.push(`**${faltaEdad} año${faltaEdad === 1 ? '' : 's'}** de edad`);
    if (faltaServicios > 0) partes.push(`**${faltaServicios} año${faltaServicios === 1 ? '' : 's'}** de aportes`);
    insightText = `Todavía no llegás al beneficio pleno: te falta${partes.length > 1 ? 'n' : ''} ${partes.join(' y ')} (mínimos del régimen: ${edadRequerida} años y ${serviciosRequeridos} de servicio). El haber mostrado es proporcional: **${fmt(haberFinal)}**.`;
    insightTone = 'warn';
  }
  const _insight = {
    title: cumple ? 'Te jubilás con haber pleno' : 'Te faltan requisitos',
    text: insightText,
    tone: insightTone,
    icon: '👩‍🏫',
  };

  return {
    haberMensual: fmt(haberFinal),
    promedio120: fmt(promedio120),
    aniosFaltantes: faltaServicios,
    edadFaltante: faltaEdad,
    estado,
    formula: '82% del promedio de las 120 mejores remuneraciones de los últimos 10 años (régimen docente CABA).',
    _insight,
  } as Outputs;
}
