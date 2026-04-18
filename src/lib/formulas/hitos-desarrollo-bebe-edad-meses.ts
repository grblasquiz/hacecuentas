export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hitosDesarrolloBebeEdadMeses(i: Inputs): Outputs {
  const m=Number(i.mes)||0;
  const h:Record<number,[string,string,string]>={
    2:['Sostiene cabeza','Sonríe reactivo','Mira rostros'],
    4:['Se apoya en brazos','Balbuceos','Ríe fuerte'],
    6:['Se sienta con apoyo','Consonantes','Juego espejo'],
    9:['Gatea','Primera palabra','Extraña'],
    12:['Se para solo','3-5 palabras','Saluda chau'],
    18:['Camina, sube escalera','10+ palabras','Imita'],
    24:['Corre, patea','2 palabras juntas','Juego simbólico']
  };
  const keys=Object.keys(h).map(Number).sort((a,b)=>a-b);
  let cercano=keys[0]; for (const k of keys) if (k<=m) cercano=k;
  const [mo,la,so]=h[cercano];
  return { motores:mo, lenguaje:la, social:so, resumen:`A los ~${cercano}m: motor ${mo}; lenguaje ${la}; social ${so}.` };
}
