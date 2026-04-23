/** Recuperación fractura de tibia/peroné en futbolistas */
export interface Inputs {
  hueso: string;
  tipoFractura: string;
  tratamiento: string;
  edad: number;
  nivelCompetencia: string;
}
export interface Outputs {
  consolidacionOsea: string;
  retornoCarrera: string;
  retornoCompeticion: string;
  protocolo: string;
  mensaje: string;
}

export function recuperacionFracturaTibiaPerone(i: Inputs): Outputs {
  const hueso = String(i.hueso || 'tibia');
  const tipo = String(i.tipoFractura || 'cerrada');
  const trat = String(i.tratamiento || 'quirurgico-clavo-endomedular');
  const edad = Number(i.edad) || 25;
  const nivel = String(i.nivelCompetencia || 'amateur');

  let consMin = 0, consMax = 0;
  let compMin = 0, compMax = 0;

  if (hueso === 'perone-aislado') {
    consMin = 6; consMax = 10; // semanas
    compMin = 3; compMax = 4.5; // meses
  } else if (hueso === 'tibia' || hueso === 'tibia-y-perone') {
    consMin = 12; consMax = 20; // semanas
    compMin = 6; compMax = 9; // meses
  }

  // Ajustes
  if (tipo === 'expuesta') { consMax *= 1.4; compMax *= 1.3; }
  if (tipo === 'conminuta') { consMax *= 1.25; compMax *= 1.2; }
  if (trat === 'conservador-yeso') { consMax *= 1.1; compMax *= 1.15; }
  if (edad > 35) { consMax *= 1.15; compMax *= 1.15; }
  if (nivel === 'profesional') { compMax *= 0.9; }

  consMin = Math.round(consMin);
  consMax = Math.round(consMax);
  compMin = Math.round(compMin * 10) / 10;
  compMax = Math.round(compMax * 10) / 10;

  const retCarrera = hueso === 'perone-aislado'
    ? `${Math.round(compMin * 0.5)}-${Math.round(compMax * 0.6)} meses (carrera recta controlada).`
    : `${Math.round(compMin * 0.55)}-${Math.round(compMax * 0.65)} meses (carrera progresiva tras consolidación radiológica).`;

  const protocolo = [
    'Fase 1 (0-6 sem): inmovilización / descarga protegida según fijación.',
    'Fase 2 (6-12 sem): carga parcial progresiva, movilidad tobillo/rodilla.',
    'Fase 3 (3-4 meses): fuerza, propiocepción, bicicleta, natación.',
    'Fase 4 (4-6 meses): carrera recta, fortalecimiento específico.',
    'Fase 5 (6-9 meses): pivoteos, saltos, contacto progresivo hasta competencia.'
  ].join(' | ');

  return {
    consolidacionOsea: `${consMin}-${consMax} semanas para consolidación ósea radiológica.`,
    retornoCarrera: retCarrera,
    retornoCompeticion: `${compMin}-${compMax} meses para competencia oficial con contacto.`,
    protocolo,
    mensaje: `${hueso} · ${tipo} · ${trat}: retorno competencia ${compMin}-${compMax} meses. No reemplaza evaluación de traumatólogo/médico deportólogo.`
  };
}
