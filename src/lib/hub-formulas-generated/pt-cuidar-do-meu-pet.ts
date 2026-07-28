import { peceraLitrosPecesCantidadM2 as f1 } from '../formulas/pecera-litros-peces-cantidad-m2';
import { cobayoVitaminaCDosisDiaria as f2 } from '../formulas/cobayo-vitamina-c-dosis-diaria';
import { conejoComidaHenoPesoEdad as f3 } from '../formulas/conejo-comida-heno-peso-edad';
import { envejecerMascotaHumanoTablaRazaTamano as f4 } from '../formulas/envejecer-mascota-humano-tabla-raza-tamano';
import { huronFerretDietaProteinaAnimal as f5 } from '../formulas/huron-ferret-dieta-proteina-animal';
import { paseosPerroMinutosRazaEnergia as f6 } from '../formulas/paseos-perro-minutos-raza-energia';
import { tortugaAguaDietaPesoEdad as f7 } from '../formulas/tortuga-agua-dieta-peso-edad';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
};
