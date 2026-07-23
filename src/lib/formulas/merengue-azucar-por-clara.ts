/** Merengue: azúcar por clara según tipo (francés, suizo, italiano) */
export interface Inputs {
  modo?: string;
  claras?: number;
  gramosClara?: number;
  tipo?: string;
  __lang?: string;
}
export interface Outputs {
  azucar: number;
  pesoClaras: number;
  agua: number;
  rendimiento: number;
  temperatura: string;
  _insight?: any;
}

const CLARA_G = 33; // 1 clara de huevo mediano/grande ≈ 30-35 g
const RATIO_AZUCAR = 2; // 2:1 azúcar:clara en peso, los tres tipos

const TIPOS: Record<string, { temp: string; label: string; extraAgua: boolean; rendFactor: number }> = {
  frances: { temp: 'Sin cocción: azúcar en frío, de a poco, batiendo', label: 'francés (crudo)', extraAgua: false, rendFactor: 1 },
  suizo: { temp: 'Baño maría a 45-50 °C hasta disolver el azúcar, después batir', label: 'suizo', extraAgua: false, rendFactor: 1 },
  italiano: { temp: 'Almíbar a 118-121 °C en hilo sobre las claras batidas', label: 'italiano', extraAgua: true, rendFactor: 1.15 },
};

export function merengueAzucarPorClara(i: Inputs): Outputs {
  const modo = String(i.modo || 'claras');
  const claras = Number(i.claras) || 0;
  const gramosClara = Number(i.gramosClara) || 0;
  const tipo = String(i.tipo || 'frances');
  const cfg = TIPOS[tipo] || TIPOS['frances'];

  let pesoClaras = 0;
  if (modo === 'gramos') {
    if (gramosClara <= 0) throw new Error('Ingresá los gramos de clara (mayor a 0)');
    pesoClaras = gramosClara;
  } else {
    if (claras <= 0) throw new Error('Ingresá cuántas claras usás (mayor a 0)');
    pesoClaras = claras * CLARA_G;
  }

  const azucar = pesoClaras * RATIO_AZUCAR;
  const agua = cfg.extraAgua ? azucar / 3 : 0;
  // rendimiento aprox: claras + azúcar; el italiano suma ~15% del azúcar en agua retenida del almíbar
  const rendimiento = cfg.extraAgua ? pesoClaras + azucar * cfg.rendFactor : pesoClaras + azucar;

  const azucarR = Number(azucar.toFixed(0));
  const aguaR = Number(agua.toFixed(0));
  const rendR = Number(rendimiento.toFixed(0));

  return {
    azucar: azucarR,
    pesoClaras: Number(pesoClaras.toFixed(0)),
    agua: aguaR,
    rendimiento: rendR,
    temperatura: cfg.temp,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Para merengue ${cfg.label} con **${Number(pesoClaras.toFixed(0)).toLocaleString('es-AR')} g de claras** van **${azucarR.toLocaleString('es-AR')} g de azúcar** (proporción 2:1 en peso)${cfg.extraAgua ? ` y **${aguaR} ml de agua** para el almíbar` : ''}. Rinde ~${rendR.toLocaleString('es-AR')} g de merengue. ${cfg.temp}.`,
      tone: 'neutral',
      icon: '🥚',
    },
  };
}
