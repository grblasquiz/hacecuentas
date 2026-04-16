/** Signo zodiacal por fecha de nacimiento */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { signo: string; elemento: string; modalidad: string; planetaRegente: string; caracteristicas: string; }

const SIGNOS = [
  { nombre:'Capricornio', inicio:[1,1], fin:[1,19], elem:'Tierra', mod:'Cardinal', planeta:'Saturno', desc:'Ambicioso/a, disciplinado/a, responsable, paciente.' },
  { nombre:'Acuario', inicio:[1,20], fin:[2,18], elem:'Aire', mod:'Fijo', planeta:'Urano', desc:'Original, independiente, humanitario/a, visionario/a.' },
  { nombre:'Piscis', inicio:[2,19], fin:[3,20], elem:'Agua', mod:'Mutable', planeta:'Neptuno', desc:'Intuitivo/a, compasivo/a, artístico/a, soñador/a.' },
  { nombre:'Aries', inicio:[3,21], fin:[4,19], elem:'Fuego', mod:'Cardinal', planeta:'Marte', desc:'Valiente, enérgico/a, directo/a, competitivo/a.' },
  { nombre:'Tauro', inicio:[4,20], fin:[5,20], elem:'Tierra', mod:'Fijo', planeta:'Venus', desc:'Estable, sensual, leal, terco/a, materialista.' },
  { nombre:'Géminis', inicio:[5,21], fin:[6,20], elem:'Aire', mod:'Mutable', planeta:'Mercurio', desc:'Comunicativo/a, curioso/a, versátil, ingenioso/a.' },
  { nombre:'Cáncer', inicio:[6,21], fin:[7,22], elem:'Agua', mod:'Cardinal', planeta:'Luna', desc:'Protector/a, emocional, hogareño/a, intuitivo/a.' },
  { nombre:'Leo', inicio:[7,23], fin:[8,22], elem:'Fuego', mod:'Fijo', planeta:'Sol', desc:'Generoso/a, carismático/a, líder natural, orgulloso/a.' },
  { nombre:'Virgo', inicio:[8,23], fin:[9,22], elem:'Tierra', mod:'Mutable', planeta:'Mercurio', desc:'Perfeccionista, analítico/a, servicial, metódico/a.' },
  { nombre:'Libra', inicio:[9,23], fin:[10,22], elem:'Aire', mod:'Cardinal', planeta:'Venus', desc:'Equilibrado/a, diplomático/a, estético/a, indeciso/a.' },
  { nombre:'Escorpio', inicio:[10,23], fin:[11,21], elem:'Agua', mod:'Fijo', planeta:'Plutón', desc:'Intenso/a, apasionado/a, misterioso/a, leal.' },
  { nombre:'Sagitario', inicio:[11,22], fin:[12,21], elem:'Fuego', mod:'Mutable', planeta:'Júpiter', desc:'Aventurero/a, optimista, filosófico/a, libre.' },
  { nombre:'Capricornio', inicio:[12,22], fin:[12,31], elem:'Tierra', mod:'Cardinal', planeta:'Saturno', desc:'Ambicioso/a, disciplinado/a, responsable, paciente.' },
];

export function signoZodiacal(i: Inputs): Outputs {
  const d = new Date(i.fechaNacimiento + 'T00:00:00');
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  const m = d.getMonth() + 1;
  const day = d.getDate();

  for (const s of SIGNOS) {
    const [mi, di] = s.inicio;
    const [mf, df] = s.fin;
    if ((m === mi && day >= di) || (m === mf && day <= df)) {
      return { signo: s.nombre, elemento: s.elem, modalidad: s.mod, planetaRegente: s.planeta, caracteristicas: s.desc };
    }
  }
  return { signo: 'Capricornio', elemento: 'Tierra', modalidad: 'Cardinal', planetaRegente: 'Saturno', caracteristicas: 'Ambicioso/a, disciplinado/a, responsable, paciente.' };
}
