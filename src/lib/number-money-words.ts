const units=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
const tens=['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
const hundreds=['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
export function under1000(n:number,apocope=false):string {
 if(!n)return '';if(n===100)return 'cien';const h=Math.floor(n/100),r=n%100;
 let low=!r?'':r<30?units[r]:tens[Math.floor(r/10)]+(r%10?' y '+units[r%10]:'');
 if(apocope)low=low.replace(/veintiuno$/,'veintiún').replace(/uno$/,'un');
 return [h?hundreds[h]:'',low].filter(Boolean).join(' ');
}
export function words(n:number,apocope=false):string {
 if(!Number.isSafeInteger(n)||n<0||n>999999999)throw new Error('Usá un entero entre 0 y 999.999.999.');
 if(!n)return 'cero';const million=Math.floor(n/1e6),th=Math.floor(n%1e6/1000),u=n%1000;
 return [million?(million===1?'un millón':under1000(million,true)+' millones'):'',th?(th===1?'mil':under1000(th,true)+' mil'):'',u?under1000(u,apocope):''].filter(Boolean).join(' ');
}
/** Coma decimal o punto decimal de 1–2 cifras; punto de 3 cifras es agrupador. */
export function moneyInput(raw:string):{i:number;c:number} {
 let t=raw.trim().replace(/^(?:ARS|USD|US\$|\$|€)\s*/i,'').replace(/\s/g,'');
 if(/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(t))t=t.replace(/\./g,'').replace(',','.');
 else if(/^\d+(?:,\d{1,2})?$/.test(t))t=t.replace(',','.');
 else if(!/^\d+\.\d{1,2}$/.test(t))throw new Error('Formato inválido. Usá 1.250,50 o 1250.50; sin negativos y con hasta dos decimales.');
 const [whole,decimal='']=t.split('.'),i=Number(whole),c=Number(decimal.padEnd(2,'0'));
 if(!Number.isSafeInteger(i)||i>999999999)throw new Error('El máximo es 999.999.999,99.');
 return {i,c};
}
export function moneyWords(i:number,c:number,currency='PESOS'):string {
 const singular:Record<string,string>={PESOS:'peso','DÓLARES':'dólar',EUROS:'euro'};
 if(!singular[currency]||!Number.isInteger(c)||c<0||c>99)throw new Error('Moneda o centavos inválidos.');
 const base=words(i,true);return (base+(/mill(?:ón|ones)$/.test(base)?' de ':' ')+(i===1?singular[currency]:currency.toLowerCase())+' con '+String(c).padStart(2,'0')+'/100').toUpperCase();
}
export const MONEY_EXAMPLES=['1,00','21,50','100,00','200,00','1.250,50','21.000,00','1.000.000,00'].map(value=>{const {i,c}=moneyInput(value);return {value,text:moneyWords(i,c)};});
