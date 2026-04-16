/** Descongelado: tiempo según peso y método */
export interface Inputs { pesoKg: number; metodo: string; tipoAlimento?: string; }
export interface Outputs { tiempoTotal: string; horaIniciar: string; seguridad: string; consejo: string; }

const HORAS_POR_KG: Record<string, number> = { heladera: 10, agua_fria: 2.5, microondas: 0.15 };
const FACTOR_ALIM: Record<string, number> = { carne: 1, pollo: 1.2, pescado: 0.7, pan: 0.5, verdura: 0.3 };

export function tiempoDescongeladoPeso(i: Inputs): Outputs {
  const peso = Number(i.pesoKg); if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  const metodo = String(i.metodo || 'heladera');
  const tipo = String(i.tipoAlimento || 'carne');
  const baseH = HORAS_POR_KG[metodo] || 10;
  const factor = FACTOR_ALIM[tipo] || 1;
  const horas = peso * baseH * factor;

  let tiempo = '';
  if (horas < 1) tiempo = `${Math.round(horas * 60)} minutos`;
  else if (horas < 24) tiempo = `${Math.round(horas)} horas`;
  else tiempo = `${Math.round(horas / 24)} día(s) y ${Math.round(horas % 24)} horas`;

  const ahora = new Date();
  const cenaHora = 20;
  const inicioHora = cenaHora - Math.ceil(horas);
  const horaInicio = inicioHora >= 0 ? `${inicioHora}:00 del mismo día` : `${24 + inicioHora}:00 del día anterior`;

  const seg = metodo === 'heladera' ? 'Método más seguro. Mantené a 4°C o menos. Consumir dentro de 48 hs.' :
    metodo === 'agua_fria' ? 'Mantené en bolsa hermética. Cambiá el agua cada 30 min. Cociná inmediatamente.' :
    'Cociná inmediatamente después. No guardes en heladera sin cocinar.';

  return { tiempoTotal: tiempo, horaIniciar: `Para cenar a las 20hs: empezá a las ${horaInicio}`, seguridad: seg,
    consejo: tipo === 'pollo' ? 'El pollo entero tarda más por su densidad. Sacá menudos si están adentro.' :
      tipo === 'pescado' ? 'Pescado es más delicado: descongelá en heladera para preservar textura.' : 'Dejá el alimento en su envase original o bolsa hermética.' };
}
