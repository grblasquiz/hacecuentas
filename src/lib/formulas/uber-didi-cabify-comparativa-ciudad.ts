export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function uberDidiCabifyComparativaCiudad(i: Inputs): Outputs {
  const k=Number(i.distanciaKm)||0; const m=Number(i.minutos)||0; const hp=String(i.horaPico||'no');
  const mult=hp==='si'?1.4:1;
  const uber=Math.round((500+k*350+m*25)*mult);
  const didi=Math.round(uber*0.85);
  const cabify=Math.round(uber*1.2);

  const apps: Array<[string, number]> = [['DiDi', didi], ['Uber', uber], ['Cabify', cabify]];
  apps.sort((a, b) => a[1] - b[1]);
  const [barato, , caro] = apps;
  const ahorro = caro[1] - barato[1];
  const ahorroPct = caro[1] > 0 ? Math.round((ahorro / caro[1]) * 100) : 0;
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
  const pico = hp === 'si' ? ' (con recargo de hora pico ya aplicado)' : '';
  const _insight = {
    title: 'La opción más barata',
    text: `Para **${k} km** en **${m} min**${pico}, **${barato[0]}** es la más económica a **${fmt(barato[1])}**, frente a ${fmt(caro[1])} de ${caro[0]}: ahorrás **${fmt(ahorro)}** (**${ahorroPct}%**) eligiendo bien.`,
    tone: 'good',
    icon: '🚕',
  };

  return { uber:uber, didi:didi, cabify:cabify, _insight };
}
