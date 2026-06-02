export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function subnettingMascaraRedCidr(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCidr: 'CIDR válido: 0-32.',
      resumen: (n: number, hosts: string, octs: string) => `/${n}: ${hosts} hosts, máscara ${octs}.`,
      insightTitle: 'Qué te deja esta máscara',
      insightText: (n: number, hosts: string, octs: string) => `Un prefijo **/${n}** (máscara **${octs}**) reserva ${32 - n} bit(s) para hosts y te da **${hosts} direcciones asignables** por subred (se descuentan la de red y la de broadcast). Cuantos más bits de host, más dispositivos por subred pero menos subredes.`,
    },
    en: {
      errorCidr: 'Valid CIDR: 0-32.',
      resumen: (n: number, hosts: string, octs: string) => `/${n}: ${hosts} hosts, mask ${octs}.`,
      insightTitle: 'What this mask gives you',
      insightText: (n: number, hosts: string, octs: string) => `A **/${n}** prefix (mask **${octs}**) reserves ${32 - n} host bit(s) and gives you **${hosts} usable addresses** per subnet (network and broadcast addresses excluded). More host bits means more devices per subnet but fewer subnets.`,
    },
  } as const)[__lang];
  const n=Math.floor(Number(i.cidr)||24);
  if (n<0||n>32) return { hosts:'—', mascara:'—', subredes:'—', resumen: T.errorCidr };
  const hosts=Math.max(0, Math.pow(2,32-n)-2);
  const bits=Array(32).fill(0).map((_,k)=>k<n?1:0);
  const octs=[0,8,16,24].map(o=>parseInt(bits.slice(o,o+8).join(''),2)).join('.');
  const subredes24=n>=24?Math.pow(2,n-24):0;
  const hostsStr=hosts.toLocaleString();
  const _insight = { title: T.insightTitle, text: T.insightText(n, hostsStr, octs), tone: 'neutral', icon: '🌐' };
  return { hosts:hostsStr, mascara:octs, subredes:subredes24.toString(), resumen: T.resumen(n, hostsStr, octs), _insight };
}
