export interface Inputs { [k: string]: number | string; }
export interface Outputs { _insight?: any; [k: string]: string | number | undefined; }
export function vacunasFaltantesBebeEdadMeses(i: Inputs): Outputs {
  const m=Number(i.mes)||0;
  const cal:Record<number,string>={0:'BCG, Hep B',2:'Pentavalente, OPV, Rotavirus, Neumo, Meningo',4:'Pentavalente, OPV, Rotavirus, Neumo',6:'Pentavalente, OPV, Neumo, Antigripal',12:'Triple Viral, Hep A, Neumo, Meningo refuerzo',15:'Varicela',18:'DTP, OPV refuerzo'};
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let esperadas:string[]=[];
  for (const k of keys) if (k<=m) esperadas.push(`${k}m: ${cal[k]}`);
  const prox=keys.find(k=>k>m);
  const esperadasDetalle=esperadas.join('; ')||'Ninguna todavía';
  // Titular corto: conteo de controles con vacunas (el detalle completo queda en "esperadasDetalle")
  const n=esperadas.length;
  const titular = n===0 ? 'Sin vacunas esperadas aún' : n===1 ? '1 control con vacunas' : `${n} controles con vacunas`;
  const proxTxt = prox!==undefined ? `A los ${prox}m: ${cal[prox]}` : 'Calendario completo (edad escolar siguiente)';
  const _insight = {
    title: 'Cuántos controles deberían estar hechos',
    text: n===0
      ? `A los **${m} meses** todavía no corresponde ningún control con vacunas; el primero (BCG y Hepatitis B) es **al nacer**. Próximo: **${proxTxt}**.`
      : (prox!==undefined
          ? `A los **${m} meses**, tu bebé debería tener cubiertos **${n} control${n===1?'':'es'}** con vacunas. Si en el carnet falta alguno, pedí la **puesta al día**. Lo próximo: **${proxTxt}**.`
          : `A los **${m} meses** ya deberían estar los **${n} controles** del esquema 0-18 meses. Verificá el carnet y seguí con los refuerzos de los 5 y 11 años.`),
    tone: 'neutral' as const,
    icon: '💉',
  };
  return { esperadas:titular, esperadasDetalle, proximas:proxTxt, resumen:`A los ${m}m: ${n} grupos de vacunas esperados.`, _insight };
}
