export interface Inputs { personas: number; pisos?: string; extras?: string; }
export interface Outputs { litrosRecomendados: number; consumoDiario: number; tanqueComercial: string; reservaHoras: number; _insight?: any; _chart?: any; }
export function capacidadTanqueAguaLitros(i: Inputs): Outputs {
  const pers = Number(i.personas); if (!pers) throw new Error('Ingresá la cantidad de personas');
  const pisos = Number(i.pisos) || 1; const extras = String(i.extras || 'ninguno');
  let consumo = pers * 200; // 200 L/persona/día promedio
  if (extras === 'jardin') consumo += 150; if (extras === 'pileta') consumo += 100;
  if (extras === 'ambos') consumo += 250;
  const reserva = consumo * 1.5 * pisos * 0.7; // 1.5 días, ajuste pisos
  const tanques = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000];
  const tanque = tanques.find(t => t >= reserva) || 3000;
  const horas = (tanque / consumo) * 24;
  const horasR = Math.round(horas);
  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n);

  const tone: 'good' | 'warn' | 'neutral' = horasR < 24 ? 'warn' : horasR >= 36 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu reserva de agua',
    text: `Para **${pers}** persona${pers === 1 ? '' : 's'} consumiendo **${fmt(consumo)} L/día**, conviene un **tanque de ${fmt(tanque)} L**: te da **${horasR} horas** (${(horas / 24).toFixed(1)} días) de autonomía si se corta el suministro.${horasR < 24 ? ' Es menos de un día completo; considerá el tanque siguiente.' : ''}`,
    tone,
    icon: '💧',
  };

  const _chart = {
    type: 'scale',
    marker: horasR,
    markerLabel: `${horasR} h`,
    min: 0,
    segments: [
      { nombre: 'Justa (<24h)', max: 24, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Adecuada (24-36h)', max: 36, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Holgada (36h+)', max: Math.max(48, horasR + 6), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Autonomía de ${horasR} horas con un tanque de ${fmt(tanque)} litros.`,
  };

  return { litrosRecomendados: tanque, consumoDiario: consumo, tanqueComercial: `Tanque de ${tanque} L`, reservaHoras: horasR, _insight, _chart };
}