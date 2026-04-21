/** Ángel guardián por fecha de nacimiento (72 ángeles de la Kabbalah) */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { angel: string; virtud: string; periodo: string; mensaje: string; }

const ANGELES: {n:string;v:string;desde:[number,number];hasta:[number,number]}[] = [
  {n:'Vehuiah',v:'Voluntad y nuevos comienzos',desde:[3,21],hasta:[3,25]},
  {n:'Jeliel',v:'Amor y sabiduría',desde:[3,26],hasta:[3,30]},
  {n:'Sitael',v:'Construcción y superación',desde:[3,31],hasta:[4,4]},
  {n:'Elemiah',v:'Poder divino y viajes',desde:[4,5],hasta:[4,9]},
  {n:'Mahasiah',v:'Armonía y rectificación',desde:[4,10],hasta:[4,14]},
  {n:'Lelahel',v:'Luz y curación',desde:[4,15],hasta:[4,20]},
  {n:'Achaiah',v:'Paciencia y descubrimiento',desde:[4,21],hasta:[4,25]},
  {n:'Cahethel',v:'Bendición y cosechas',desde:[4,26],hasta:[4,30]},
  {n:'Haziel',v:'Misericordia y amistad',desde:[5,1],hasta:[5,5]},
  {n:'Aladiah',v:'Gracia divina y perdón',desde:[5,6],hasta:[5,10]},
  {n:'Lauviah',v:'Victoria y revelación',desde:[5,11],hasta:[5,15]},
  {n:'Hahaiah',v:'Refugio y protección',desde:[5,16],hasta:[5,20]},
  {n:'Yezalel',v:'Fidelidad y reconciliación',desde:[5,21],hasta:[5,25]},
  {n:'Mebahel',v:'Verdad y justicia',desde:[5,26],hasta:[5,31]},
  {n:'Hariel',v:'Purificación y fe',desde:[6,1],hasta:[6,5]},
  {n:'Hekamiah',v:'Lealtad y honor',desde:[6,6],hasta:[6,10]},
  {n:'Lauviah II',v:'Revelación y alegría',desde:[6,11],hasta:[6,15]},
  {n:'Caliel',v:'Justicia divina',desde:[6,16],hasta:[6,21]},
  {n:'Leuviah',v:'Memoria y inteligencia',desde:[6,22],hasta:[6,26]},
  {n:'Pahaliah',v:'Redención y moralidad',desde:[6,27],hasta:[7,1]},
  {n:'Nelchael',v:'Aprendizaje y victoria',desde:[7,2],hasta:[7,6]},
  {n:'Yeiayel',v:'Fama y renombre',desde:[7,7],hasta:[7,11]},
  {n:'Melahel',v:'Curación y naturaleza',desde:[7,12],hasta:[7,16]},
  {n:'Haheuiah',v:'Protección y refugio',desde:[7,17],hasta:[7,22]},
  {n:'Nith-Haiah',v:'Sabiduría y magia',desde:[7,23],hasta:[7,27]},
  {n:'Haaiah',v:'Diplomacia y política',desde:[7,28],hasta:[8,1]},
  {n:'Yerathel',v:'Luz y liberación',desde:[8,2],hasta:[8,6]},
  {n:'Seheiah',v:'Longevidad y salud',desde:[8,7],hasta:[8,12]},
  {n:'Reiyel',v:'Liberación y verdad',desde:[8,13],hasta:[8,17]},
  {n:'Omael',v:'Multiplicación y paciencia',desde:[8,18],hasta:[8,22]},
  {n:'Lecabel',v:'Inspiración intelectual',desde:[8,23],hasta:[8,28]},
  {n:'Vasariah',v:'Justicia y generosidad',desde:[8,29],hasta:[9,2]},
  {n:'Yehuiah',v:'Subordinación y protección',desde:[9,3],hasta:[9,7]},
  {n:'Lehahiah',v:'Obediencia y calma',desde:[9,8],hasta:[9,12]},
  {n:'Khavaquiah',v:'Reconciliación y armonía',desde:[9,13],hasta:[9,17]},
  {n:'Menadel',v:'Trabajo y vocación',desde:[9,18],hasta:[9,23]},
  {n:'Aniel',v:'Unidad y coraje',desde:[9,24],hasta:[9,28]},
  {n:'Haamiah',v:'Ritual y verdad',desde:[9,29],hasta:[10,3]},
  {n:'Rehael',v:'Salud y curación paternal',desde:[10,4],hasta:[10,8]},
  {n:'Ieiazel',v:'Consolación y liberación',desde:[10,9],hasta:[10,13]},
  {n:'Hahahel',v:'Misión y sacerdocio',desde:[10,14],hasta:[10,18]},
  {n:'Mikhael',v:'Autoridad y clarividencia',desde:[10,19],hasta:[10,23]},
  {n:'Veuliah',v:'Prosperidad y elevación',desde:[10,24],hasta:[10,28]},
  {n:'Yelahiah',v:'Valentía militar',desde:[10,29],hasta:[11,2]},
  {n:'Sealiah',v:'Motor y voluntad',desde:[11,3],hasta:[11,7]},
  {n:'Ariel',v:'Percepción y revelación',desde:[11,8],hasta:[11,12]},
  {n:'Asaliah',v:'Contemplación y verdad',desde:[11,13],hasta:[11,17]},
  {n:'Mihael',v:'Fertilidad y amor conyugal',desde:[11,18],hasta:[11,22]},
  {n:'Vehuel',v:'Elevación y grandeza',desde:[11,23],hasta:[11,27]},
  {n:'Daniel',v:'Elocuencia y gracia',desde:[11,28],hasta:[12,2]},
  {n:'Hahasiah',v:'Medicina y sabiduría',desde:[12,3],hasta:[12,7]},
  {n:'Imamiah',v:'Viajes y expiación',desde:[12,8],hasta:[12,12]},
  {n:'Nanael',v:'Comunicación espiritual',desde:[12,13],hasta:[12,16]},
  {n:'Nithael',v:'Legitimidad y herencia',desde:[12,17],hasta:[12,21]},
  {n:'Mebahiah',v:'Lucidez y moralidad',desde:[12,22],hasta:[12,26]},
  {n:'Poyel',v:'Fortuna y talento',desde:[12,27],hasta:[12,31]},
  {n:'Nemamiah',v:'Discernimiento y liberación',desde:[1,1],hasta:[1,5]},
  {n:'Yeialel',v:'Fuerza mental y curación',desde:[1,6],hasta:[1,10]},
  {n:'Harahel',v:'Riqueza intelectual',desde:[1,11],hasta:[1,15]},
  {n:'Mitzrael',v:'Reparación y obediencia',desde:[1,16],hasta:[1,20]},
  {n:'Umabel',v:'Afinidad y amistad',desde:[1,21],hasta:[1,25]},
  {n:'Iah-Hel',v:'Sabiduría y conocimiento',desde:[1,26],hasta:[1,30]},
  {n:'Anauel',v:'Unidad y comunicación',desde:[1,31],hasta:[2,4]},
  {n:'Mehiel',v:'Vivificación e inspiración',desde:[2,5],hasta:[2,9]},
  {n:'Damabiah',v:'Sabiduría y fuentes',desde:[2,10],hasta:[2,14]},
  {n:'Manakel',v:'Conocimiento del bien y mal',desde:[2,15],hasta:[2,19]},
  {n:'Eyael',v:'Transformación y sublimación',desde:[2,20],hasta:[2,24]},
  {n:'Habuhiah',v:'Curación y fertilidad',desde:[2,25],hasta:[2,29]},
  {n:'Rochel',v:'Restitución y hallazgo',desde:[3,1],hasta:[3,5]},
  {n:'Jabamiah',v:'Alquimia y regeneración',desde:[3,6],hasta:[3,10]},
  {n:'Haiaiel',v:'Armas divinas y protección',desde:[3,11],hasta:[3,15]},
  {n:'Mumiah',v:'Renacimiento y finalización',desde:[3,16],hasta:[3,20]},
];

export function angelGuardianFecha(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd0] = parts;
  const d = new Date(yy, mm - 1, dd0);
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  const m = d.getMonth() + 1;
  const day = d.getDate();

  for (const a of ANGELES) {
    const [dm, dd] = a.desde;
    const [hm, hd] = a.hasta;
    if (dm === hm) {
      if (m === dm && day >= dd && day <= hd) return { angel: a.n, virtud: a.v, periodo: `${dd}/${dm} al ${hd}/${hm}`, mensaje: `Tu ángel guardián es ${a.n}. Su virtud es: ${a.v}. Invocalo cuando necesites su protección.` };
    } else {
      if ((m === dm && day >= dd) || (m === hm && day <= hd)) return { angel: a.n, virtud: a.v, periodo: `${dd}/${dm} al ${hd}/${hm}`, mensaje: `Tu ángel guardián es ${a.n}. Su virtud es: ${a.v}. Invocalo cuando necesites su protección.` };
    }
  }
  return { angel: 'Mumiah', virtud: 'Renacimiento y finalización', periodo: '16/3 al 20/3', mensaje: 'Tu ángel guardián es Mumiah. Su virtud es: renacimiento y finalización.' };
}
