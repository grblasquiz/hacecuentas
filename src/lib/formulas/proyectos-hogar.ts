/**
 * Planificador de proyectos para el hogar (Fase Etapa 5).
 * Según el tipo de proyecto y los metros cuadrados, estima materiales, desperdicio,
 * tiempo, un cronograma de tareas y una nota "hacerlo uno mismo vs. contratar".
 * Referencias: rendimientos estándar de materiales de construcción/pinturería AR.
 */
export interface Inputs {
  tipo_proyecto: string; // pintar|piso_ceramico|piso_flotante|empapelar|limpieza_profunda|mudanza|cesped
  metros2: number;
  manos?: number; // manos de pintura (solo pintar)
  experiencia?: string; // principiante|intermedio|experto
}
export interface Outputs {
  material_principal: string;
  desperdicio_pct: number;
  tiempo_horas: number;
  cronograma: string;
  diy_vs_contratar: string;
  lista_compras: string;
  resumen: string;
  _insight?: any;
}

export function proyectosHogar(i: Inputs): Outputs {
  const m2 = Math.max(0, Number(i.metros2) || 0);
  const manos = Math.max(1, Math.floor(Number(i.manos) || 2));
  const EXP: Record<string, number> = { principiante: 1.4, intermedio: 1, experto: 0.75 };
  const expFactor = EXP[i.experiencia ?? "intermedio"] ?? 1;

  if (m2 === 0) {
    return { material_principal: "Ingresá los metros cuadrados.", desperdicio_pct: 0, tiempo_horas: 0, cronograma: "", diy_vs_contratar: "", lista_compras: "", resumen: "Ingresá los metros cuadrados." };
  }

  let material = "", desperdicio = 10, tiempoBase = 0, cronograma = "", diy = "", extras: string[] = [];

  switch (i.tipo_proyecto) {
    case "pintar": {
      desperdicio = 10;
      const litros = parseFloat(((m2 * manos) / 10 * 1.1).toFixed(1)); // 10 m²/L por mano + 10%
      const latas = Math.ceil(litros / 4);
      material = `${litros} L de pintura (${latas} lata${latas !== 1 ? "s" : ""} de 4 L) para ${manos} mano${manos !== 1 ? "s" : ""}`;
      tiempoBase = m2 * 0.12 * manos;
      extras = ["Rodillo + bandeja", "Pincel para bordes", "Cinta de papel", "Lija fina", "Enduido (si hay imperfecciones)"];
      cronograma = "1) Limpiar y lijar paredes · 2) Encintar zócalos y aberturas · 3) Enduir y lijar imperfecciones · 4) Primera mano · 5) Secado 4-6 h · 6) Segunda mano.";
      diy = "Pintar es el proyecto DIY más accesible: con dedicación lo hace cualquiera. Contratar cuesta la mano de obra (~50% del total). Conviene contratar si son techos altos o mucha superficie.";
      break;
    }
    case "piso_ceramico": {
      desperdicio = 10;
      const cajas = Math.ceil((m2 * 1.1) / 1.44); // ~1,44 m²/caja
      const bolsas = Math.ceil(m2 / 5); // pegamento: ~5 m²/bolsa 25 kg
      material = `${cajas} cajas de cerámico (~1,44 m²/caja) + ${bolsas} bolsa${bolsas !== 1 ? "s" : ""} de pegamento`;
      tiempoBase = m2 * 0.6;
      extras = ["Pastina", "Crucetas separadoras", "Llana dentada", "Nivel", "Cortadora de cerámica"];
      cronograma = "1) Nivelar y limpiar la carpeta · 2) Replantear desde el centro · 3) Pegar con llana dentada · 4) Colocar crucetas · 5) Secado 24 h · 6) Pastinar juntas.";
      diy = "Requiere prolijidad y herramienta (cortadora, nivel). Un principiante puede en ambientes chicos; para superficies grandes o pisos con desnivel conviene un colocador.";
      break;
    }
    case "piso_flotante": {
      desperdicio = 8;
      const cajas = Math.ceil((m2 * 1.08) / 2.5); // ~2,5 m²/caja
      material = `${cajas} cajas de piso flotante (~2,5 m²/caja) + manta niveladora`;
      tiempoBase = m2 * 0.35;
      extras = ["Manta niveladora (foam)", "Cuñas separadoras", "Zócalos", "Serrucho o ingletadora"];
      cronograma = "1) Aclimatar las cajas 48 h en el ambiente · 2) Colocar la manta · 3) Encastrar tablas dejando 8-10 mm de junta perimetral · 4) Colocar zócalos.";
      diy = "El flotante es DIY por excelencia: encastra sin pegamento. Un fin de semana alcanza para un ambiente. No necesitás contratar salvo que haya que nivelar el contrapiso.";
      break;
    }
    case "empapelar": {
      desperdicio = 12;
      const rollos = Math.ceil((m2 * 1.12) / 5); // ~5 m² útiles por rollo
      material = `${rollos} rollo${rollos !== 1 ? "s" : ""} de papel (~5 m²/rollo útil)`;
      tiempoBase = m2 * 0.4;
      extras = ["Adhesivo para empapelar", "Plomada", "Espátula", "Cutter", "Esponja"];
      cronograma = "1) Preparar la pared (lisa y seca) · 2) Marcar la vertical con plomada · 3) Cortar paños con 5 cm extra · 4) Aplicar adhesivo · 5) Colocar y quitar burbujas · 6) Recortar sobrantes.";
      diy = "Se puede hacer solo, pero de a dos es mucho más fácil (uno sostiene, otro alinea). El papel autoadhesivo es el más amigable para principiantes.";
      break;
    }
    case "limpieza_profunda": {
      desperdicio = 0;
      material = "Productos: desengrasante, limpiavidrios, lavandina, multiuso, esponjas y trapos";
      tiempoBase = m2 * 0.22;
      extras = ["Guantes", "Bolsas de residuo", "Balde y trapo de piso", "Cepillo", "Aspiradora"];
      cronograma = "1) Ordenar y descartar · 2) Quitar polvo de arriba hacia abajo · 3) Vidrios y espejos · 4) Cocina y baño a fondo · 5) Pisos al final · 6) Ventilar.";
      diy = "Totalmente DIY. Un servicio de limpieza profunda contratado cuesta por hora; hacerlo vos toma más tiempo pero es gratis. Dividí por ambientes en varios días si es mucho.";
      break;
    }
    case "mudanza": {
      desperdicio = 0;
      const cajas = Math.ceil(m2 * 0.8); // ~0,8 cajas por m² de vivienda
      material = `${cajas} cajas de cartón aprox. (${Math.ceil(cajas / 2)} medianas + ${Math.floor(cajas / 2)} grandes)`;
      tiempoBase = m2 * 0.3;
      extras = ["Cinta de embalar", "Papel de diario / burbuja", "Marcador", "Film stretch", "Bolsas de residuo"];
      cronograma = "1) Descartar lo que no usás · 2) Embalar por ambiente empezando por lo que menos usás · 3) Rotular cada caja · 4) Desarmar muebles · 5) Cargar los pesados primero.";
      diy = "Embalar es DIY; para el traslado de muebles pesados conviene fletero con ayudantes. Rotular por ambiente ahorra horas al desembalar.";
      break;
    }
    case "cesped": {
      desperdicio = 5;
      const kg = parseFloat((m2 * 0.035).toFixed(2)); // 35 g/m²
      material = `${kg} kg de semilla de césped (~35 g/m²) + tierra/mantillo`;
      tiempoBase = m2 * 0.06;
      extras = ["Rastrillo", "Tierra o mantillo", "Fertilizante de arranque", "Rolo o tabla para compactar"];
      cronograma = "1) Nivelar y aflojar la tierra · 2) Sembrar al voleo · 3) Cubrir con mantillo fino · 4) Compactar suave · 5) Regar en lluvia fina 2 veces/día hasta germinar (7-14 días).";
      diy = "Sembrar es DIY simple. El secreto es el riego constante las primeras 2 semanas. El pan de césped (rollos) es más caro pero da resultado inmediato.";
      break;
    }
    default: {
      material = "Elegí un tipo de proyecto.";
      tiempoBase = 0;
    }
  }

  const tiempo_horas = parseFloat((tiempoBase * expFactor).toFixed(1));
  const lista_compras = [material, ...extras].join(" · ");
  const jornadas = Math.max(1, Math.ceil(tiempo_horas / 6));
  const resumen = `Proyecto de ${m2} m²: ${material}. Tiempo estimado ${tiempo_horas} h (~${jornadas} jornada${jornadas !== 1 ? "s" : ""} de trabajo), con ${desperdicio}% de desperdicio contemplado.`;

  const _insight = {
    title: "Qué necesitás",
    text: `Para ${m2} m² vas a necesitar **${material}**. Calculá **${tiempo_horas} horas** de trabajo (~**${jornadas} jornada${jornadas !== 1 ? "s" : ""}**). Ya está contemplado un **${desperdicio}%** de material de más por cortes y errores.`,
    tone: "neutral",
    icon: "🔨",
  };

  return { material_principal: material, desperdicio_pct: desperdicio, tiempo_horas, cronograma, diy_vs_contratar: diy, lista_compras, resumen, _insight };
}
