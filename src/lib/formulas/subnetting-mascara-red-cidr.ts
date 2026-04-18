export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function subnettingMascaraRedCidr(i: Inputs): Outputs {
  const n=Math.floor(Number(i.cidr)||24);
  if (n<0||n>32) return { hosts:'—', mascara:'—', subredes:'—', resumen:'CIDR válido: 0-32.' };
  const hosts=Math.max(0, Math.pow(2,32-n)-2);
  const bits=Array(32).fill(0).map((_,k)=>k<n?1:0);
  const octs=[0,8,16,24].map(o=>parseInt(bits.slice(o,o+8).join(''),2)).join('.');
  const subredes24=n>=24?Math.pow(2,n-24):0;
  return { hosts:hosts.toLocaleString(), mascara:octs, subredes:subredes24.toString(), resumen:`/${n}: ${hosts.toLocaleString()} hosts, máscara ${octs}.` };
}
