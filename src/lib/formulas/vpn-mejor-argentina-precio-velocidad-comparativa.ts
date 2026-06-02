export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vpnMejorArgentinaPrecioVelocidadComparativa(i: Inputs): Outputs {
  const u=String(i.uso||'privacidad');
  const data={'privacidad':{v:'Mullvad o ProtonVPN',pr:'USD 60/año',f:'Sin logs, pagos anónimos, código abierto'},'streaming':{v:'NordVPN o ExpressVPN',pr:'USD 40-90/año',f:'Desbloquea Netflix, Disney+, HBO. Alta velocidad'},'torrents':{v:'Mullvad o Proton',pr:'USD 60/año',f:'P2P permitido, kill switch, port forwarding'},'viajes':{v:'ExpressVPN',pr:'USD 90/año',f:'Servidores en 90+ países, estable para trabajo remoto'}}[u];
  return { recomendacion:data.v, precioAnual:data.pr, features:data.f,
    _insight: {
      title: 'La que más te conviene',
      text: `Para **${u}** la mejor opción es **${data.v}** (~${data.pr}). Destaca por: ${data.f.charAt(0).toLowerCase() + data.f.slice(1)}.`,
      tone: 'good',
      icon: '🔒',
    },
  };
}
