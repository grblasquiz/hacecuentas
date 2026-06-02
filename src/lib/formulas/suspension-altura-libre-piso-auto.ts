export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function suspensionAlturaLibrePisoAuto(i: Inputs): Outputs {
  const t=String(i.tipo||'sedan');
  const r:Record<string,string>={sedan:'12-15 cm',suv:'18-22 cm',pickup:'20-25 cm',off:'25-30 cm'};
  const nombres:Record<string,string>={sedan:'un sedán',suv:'una SUV',pickup:'una pickup',off:'un 4x4 off-road'};
  const altura=r[t]||'15 cm';
  const nombre=nombres[t]||'tu vehículo';
  const baja=t==='sedan';
  return {
    altura,
    categoria:t,
    resumen:`${t}: altura libre típica ${altura}.`,
    _insight:{
      title:'Qué esperar de esta altura',
      text:`Para ${nombre} la altura libre al piso típica es de **${altura}**.${baja?' Es un valor bajo: cuidá lomos de burro, cordones y rampas de cochera para no raspar los bajos.':' Esa luz te da margen para caminos de ripio y badenes sin tocar los bajos.'}`,
      tone:baja?'warn':'good',
      icon:'🚗',
    },
  };
}
