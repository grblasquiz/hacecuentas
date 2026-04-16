/** Signo del zodíaco chino por año */
export interface Inputs { anioNacimiento: number; }
export interface Outputs { animal: string; elemento: string; caracteristicas: string; compatibles: string; }

const ANIMALES = ['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo'];
const ELEMENTOS_CHINOS = ['Metal','Metal','Agua','Agua','Madera','Madera','Fuego','Fuego','Tierra','Tierra'];
const CARACT: Record<string, string> = {
  Rata:'Inteligente, astuta, adaptable, encantadora.',
  Buey:'Trabajador, confiable, paciente, determinado.',
  Tigre:'Valiente, competitivo, impredecible, carismático.',
  Conejo:'Elegante, amable, cauteloso, diplomático.',
  Dragón:'Poderoso, ambicioso, afortunado, apasionado.',
  Serpiente:'Sabia, intuitiva, misteriosa, sofisticada.',
  Caballo:'Enérgico, libre, social, impaciente.',
  Cabra:'Artística, gentil, compasiva, creativa.',
  Mono:'Ingenioso, versátil, travieso, curioso.',
  Gallo:'Observador, trabajador, valiente, honesto.',
  Perro:'Leal, honesto, amigable, justo.',
  Cerdo:'Generoso, compasivo, diligente, sincero.'
};
const COMPAT: Record<string, string> = {
  Rata:'Dragón, Mono, Buey', Buey:'Serpiente, Gallo, Rata', Tigre:'Caballo, Perro, Cerdo',
  Conejo:'Cabra, Cerdo, Perro', Dragón:'Rata, Mono, Gallo', Serpiente:'Buey, Gallo, Mono',
  Caballo:'Tigre, Perro, Cabra', Cabra:'Conejo, Cerdo, Caballo', Mono:'Rata, Dragón, Serpiente',
  Gallo:'Buey, Serpiente, Dragón', Perro:'Tigre, Caballo, Conejo', Cerdo:'Conejo, Cabra, Tigre'
};

export function signoChino(i: Inputs): Outputs {
  const anio = Math.round(Number(i.anioNacimiento));
  if (!anio || anio < 1900) throw new Error('Ingresá un año válido');

  const idx = ((anio - 4) % 12 + 12) % 12;
  const animal = ANIMALES[idx];
  const elemIdx = anio % 10;
  const elemento = ELEMENTOS_CHINOS[elemIdx];

  return {
    animal: `${animal} de ${elemento}`,
    elemento,
    caracteristicas: CARACT[animal],
    compatibles: COMPAT[animal]
  };
}
