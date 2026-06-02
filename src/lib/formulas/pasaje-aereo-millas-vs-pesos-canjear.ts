export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function pasajeAereoMillasVsPesosCanjear(i: Inputs): Outputs {
  const p=Number(i.pasajePesos)||0; const m=Number(i.millasRequeridas)||1;
  const valor=p/m;
  let conv='', rec='', tone='neutral', icon='✈️';
  if(valor>12){conv='Muy buen valor';rec='Canjealo. Milla mejor uso.';tone='good';icon='🎯'}
  else if(valor>8){conv='Buen valor';rec='Canjear conviene.';tone='good';icon='✅'}
  else if(valor>5){conv='Valor medio';rec='Considerar si no necesitás millas para otro viaje.';tone='neutral';icon='⚖️'}
  else {conv='Mal valor';rec='Paga en efectivo, guardá millas para pasajes más caros.';tone='warn';icon='⚠️'}

  const valorFmt=`$${valor.toFixed(2)}`;
  const insight={
    title:'Cuánto vale cada milla en este canje',
    text: valor>8
      ? `Cada milla te rinde **${valorFmt}** al canjearla por este pasaje: es **${conv.toLowerCase()}**, está por encima del umbral típico de canje conveniente.`
      : valor>5
        ? `Cada milla te rinde **${valorFmt}** en este canje (**${conv.toLowerCase()}**). Está en zona gris: conviene sólo si no pensás usar esas millas para un pasaje más caro.`
        : `Cada milla te rinde apenas **${valorFmt}** acá (**${conv.toLowerCase()}**). Te conviene **pagar en efectivo** y reservar las millas para vuelos donde rindan más.`,
    tone,
    icon,
  };

  const chart={
    type:'scale',
    marker: Number(valor.toFixed(2)),
    markerLabel: `${valorFmt}/milla`,
    min: 0,
    segments:[
      { nombre:'Mal valor', max:5, color:'#ef4444', colorDark:'#b91c1c' },
      { nombre:'Valor medio', max:8, color:'#f59e0b', colorDark:'#b45309' },
      { nombre:'Buen valor', max:12, color:'#84cc16', colorDark:'#4d7c0f' },
      { nombre:'Muy buen valor', max: Math.max(15, Math.ceil(valor)+1), color:'#22c55e', colorDark:'#15803d' },
    ],
    ariaLabel:`Valor por milla de ${valorFmt}, ubicado en la zona "${conv}".`,
  };

  return { valorMilla:`$${valor.toFixed(2)}/milla`, conviene:conv, recomendacion:rec, _insight:insight, _chart:chart };
}
