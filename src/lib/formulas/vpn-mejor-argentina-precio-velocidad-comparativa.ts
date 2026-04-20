export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vpnMejorArgentinaPrecioVelocidadComparativa(i: Inputs): Outputs {
  const u=String(i.uso||'privacidad');
  const data={'privacidad':{v:'Mullvad o ProtonVPN',pr:'USD 60/año',f:'Sin logs, pagos anónimos, código abierto'},'streaming':{v:'NordVPN o ExpressVPN',pr:'USD 40-90/año',f:'Desbloquea Netflix, Disney+, HBO. Alta velocidad'},'torrents':{v:'Mullvad o Proton',pr:'USD 60/año',f:'P2P permitido, kill switch, port forwarding'},'viajes':{v:'ExpressVPN',pr:'USD 90/año',f:'Servidores en 90+ países, estable para trabajo remoto'}}[u];
  return { recomendacion:data.v, precioAnual:data.pr, features:data.f };
}
