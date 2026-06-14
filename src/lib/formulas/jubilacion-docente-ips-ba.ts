/**
 * Jubilación Docente IPS Buenos Aires — Decreto-Ley 9650/80 (régimen previsional PBA).
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
  const cumple = cumpleEdad && cumpleServicios;
  const estado = cumple
    ? 'Cumple requisitos — jubilación ordinaria IPS BA.'
    : `Faltan requisitos: edad mínima ${edadRequerida}, servicios mínimos ${serviciosRequeridos}.`;

  const haberFinal = cumple ? haber : haberProporcional;
  const faltaServicios = Math.max(0, serviciosRequeridos - aniosServicio);
  const faltaEdad = Math.max(0, edadRequerida - edad);
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (cumple) {
    insightText = `Cumplís edad y servicios: tu haber es el **82% móvil** sobre el **80%** de tu mejor sueldo, **${fmt(haber)}** por mes.`;
    insightTone = 'good';
  } else {
    const partes: string[] = [];
    if (faltaEdad > 0) partes.push(`**${faltaEdad} año${faltaEdad === 1 ? '' : 's'}** de edad`);
    if (faltaServicios > 0) partes.push(`**${faltaServicios} año${faltaServicios === 1 ? '' : 's'}** de servicio`);
    insightText = `Todavía no llegás al beneficio ordinario: te falta${partes.length > 1 ? 'n' : ''} ${partes.join(' y ')} (mínimos Dto-Ley 9650/80: ${edadRequerida} años y ${serviciosRequeridos} de servicio). El haber mostrado es proporcional: **${fmt(haberFinal)}**.`;
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
    base80: fmt(base),
    aniosFaltantes: faltaServicios,
    edadFaltante: faltaEdad,
    estado,
    formula: '82% móvil × 80% del mejor sueldo últimos 10 años (Dto-Ley 9650/80).',
    _insight,
  } as Outputs;
}
