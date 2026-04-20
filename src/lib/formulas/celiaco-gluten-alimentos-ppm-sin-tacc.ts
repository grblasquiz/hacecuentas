export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function celiacoGlutenAlimentosPpmSinTacc(i: Inputs): Outputs {
  const a=String(i.alimento||'arroz');
  const data={'harina_trigo':{t:'Sí',p:30000,alt:'Harina de arroz, mandioca, almendra'},'arroz':{t:'No',p:0,alt:'—'},'maiz':{t:'No',p:0,alt:'—'},'cebada':{t:'Sí',p:25000,alt:'Arroz, mijo'},'avena':{t:'Posible (contam.)',p:'100-300',alt:'Avena certificada sin TACC'},'quinoa':{t:'No',p:0,alt:'—'},'papa':{t:'No',p:0,alt:'—'},'queso_duro':{t:'No',p:0,alt:'—'},'yogur':{t:'No (natural)',p:'<20',alt:'Verificar marcas'}};
  const d=data[a];
  return { contieneTacc:d.t, ppm:`${d.p}${typeof d.p==='number'?' ppm':''}`, alternativa:d.alt };
}
