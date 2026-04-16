export interface Inputs { ambiente: string; personas: number; mascotas?: string; }
export interface Outputs { frecuencia: string; tiempoEstimado: string; tareas: string; consejo: string; }
interface LimpData { freq: string; minutos: number; tareas: string; }
const AMB: Record<string, LimpData> = {
  cocina: { freq: 'Diaria (superficies) + semanal (profunda)', minutos: 20, tareas: 'Mesada, anafe, pisos, rejilla pileta, heladera (semanal), horno (quincenal)' },
  bano: { freq: '2-3 veces/semana + semanal profunda', minutos: 15, tareas: 'Inodoro, pileta, espejo, pisos, ducha/bañera, rejilla' },
  dormitorio: { freq: 'Semanal', minutos: 20, tareas: 'Cambiar sábanas, aspirar/barrer, limpiar superficies, ventilar 15 min' },
  living: { freq: 'Semanal', minutos: 25, tareas: 'Aspirar/barrer, limpiar muebles, ordenar, limpiar vidrios (quincenal)' },
  pisos: { freq: '2-3 veces/semana', minutos: 30, tareas: 'Barrer + pasar trapo húmedo. Aspirar alfombras. Baldeado profundo semanal' },
  ventanas: { freq: 'Mensual (interior) + trimestral (exterior)', minutos: 40, tareas: 'Vidrios interior/exterior, marcos, persianas, mosquiteros (trimestral)' },
};
export function limpiezaFrecuenciaAmbiente(i: Inputs): Outputs {
  const amb = String(i.ambiente || 'cocina');
  const pers = Number(i.personas) || 3;
  const mascota = String(i.mascotas || 'no');
  const data = AMB[amb]; if (!data) throw new Error('Ambiente no encontrado');
  const factorPers = pers > 3 ? 1.3 : 1;
  const factorMasc = mascota === 'si' ? 1.4 : 1;
  const min = Math.round(data.minutos * factorPers * factorMasc);
  const consejo = mascota === 'si' ? 'Con mascotas, aspirá más seguido y limpiá pelos de tapizados 2x/semana.' : 'Ventilá 10-15 min/día cada ambiente para reducir humedad y polvo.';
  return { frecuencia: data.freq, tiempoEstimado: `~${min} minutos por sesión`, tareas: data.tareas, consejo };
}