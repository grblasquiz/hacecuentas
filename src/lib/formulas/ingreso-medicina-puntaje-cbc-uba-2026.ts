export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ingresoMedicinaPuntajeCbcUba2026(i: Inputs): Outputs {
  const p=Number(i.promedioCbc)||0;
  let pos='', cons='';
  if(p>=9){pos='Casi garantizado';cons='Felicitaciones. Preparate para 2do año.'}
  else if(p>=8){pos='Altamente probable';cons='Mantener nivel.'}
  else if(p>=7){pos='Posible, pero con cupo ajustado';cons='Considerá mejorar el promedio.'}
  else if(p>=6){pos='Difícil con cupo actual';cons='Evaluá recursar materias específicas.'}
  else {pos='Poco probable';cons='Fortalecé bases antes de continuar.'}
  return { posibilidadIngreso:pos, referenciaCorte:'~7.5 histórico (varía por cuatrimestre)', consejo:cons };
}
