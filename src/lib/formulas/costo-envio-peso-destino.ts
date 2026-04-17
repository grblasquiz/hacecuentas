/** Costo envio peso destino */
export interface Inputs { pesoReal: number; largo: number; ancho: number; alto: number; destino: string; servicio: string; }
export interface Outputs { costoEstimado: number; pesoFacturable: number; pesoVolumetrico: number; tiempoEstimado: string; }
export function costoEnvioPesoDestino(i: Inputs): Outputs {
  const real = Number(i.pesoReal);
  const l = Number(i.largo);
  const a = Number(i.ancho);
  const h = Number(i.alto);
  const dest = String(i.destino || 'nacional');
  const serv = String(i.servicio || 'correo');
  if (!real || real <= 0) throw new Error('Peso inválido');
  const volum = (l * a * h) / 5000;
  const fact = Math.max(real, volum);
  const tarifas: Record<string, Record<string, number>> = {
    nacional: { correo: 4, courier: 8, express: 16 },
    regional: { correo: 20, courier: 32, express: 55 },
    usa: { correo: 28, courier: 50, express: 95 },
    europa: { correo: 35, courier: 65, express: 120 }
  };
  const tarifa = tarifas[dest]?.[serv] || 10;
  const costo = tarifa * fact;
  const tiempos: Record<string, string> = {
    correo: dest === 'nacional' ? '3-7 días' : '15-30 días',
    courier: dest === 'nacional' ? '2-4 días' : '5-10 días',
    express: dest === 'nacional' ? '1-2 días' : '2-4 días'
  };
  return {
    costoEstimado: Math.round(costo),
    pesoFacturable: Number(fact.toFixed(2)),
    pesoVolumetrico: Number(volum.toFixed(2)),
    tiempoEstimado: tiempos[serv] || '3-7 días'
  };
}
