export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function tamanoRepoGitCommitsBranches(i: Inputs): Outputs {
  const c=Number(i.commits)||0; const a=Number(i.archivos)||0; const kb=Number(i.kbProm)||5;
  // Working tree: archivos × KB promedio (estado actual, sin comprimir)
  const workingTreeKb = a * kb;
  // .git/ objects: working tree comprimido (factor 0.6 para código típico) + overhead por commit (~2 KB)
  const gitObjectsKb = workingTreeKb * 0.6 + c * 2;
  // Tamaño total = working tree + .git/
  const totalKb = workingTreeKb + gitObjectsKb;
  const mb = totalKb / 1024;
  const gitMb = gitObjectsKb / 1024;
  let cons='OK'; if (mb>500) cons='Considera LFS o split'; else if (mb>100) cons='Empieza a pesar';
  const pesado = mb > 500; const medio = mb > 100 && mb <= 500;
  const lastMax = Math.max(800, Math.ceil(mb / 100) * 100 + 100);
  return {
    estimado:`${mb.toFixed(1)} MB`, consejo:cons, resumen:`Working tree: ${(workingTreeKb/1024).toFixed(1)} MB | .git/: ${gitMb.toFixed(1)} MB | Total: ${mb.toFixed(0)} MB. ${cons}.`,
    _insight: {
      title: pesado ? 'Repo pesado' : medio ? 'Empieza a pesar' : 'Tamaño saludable',
      text: pesado
        ? `Con **${a.toLocaleString('es-AR')} archivos** y **${c.toLocaleString('es-AR')} commits** el repo ronda los **${mb.toFixed(0)} MB** (working tree: ${(workingTreeKb/1024).toFixed(1)} MB + .git/: ${gitMb.toFixed(1)} MB). A este tamaño los \`clone\` y \`fetch\` se vuelven lentos: mové binarios y archivos grandes a **Git LFS** o partí el monorepo.`
        : medio
          ? `Tu repo estimado en **${mb.toFixed(0)} MB** (${a.toLocaleString('es-AR')} archivos, ${c.toLocaleString('es-AR')} commits) ya no es liviano. Todavía es manejable, pero vigilá que no entren binarios al historial y revisá el \`.gitignore\`.`
          : `Con **${mb.toFixed(1)} MB** (${a.toLocaleString('es-AR')} archivos, ${c.toLocaleString('es-AR')} commits) el repo es liviano y rápido de clonar. Sin problemas a la vista.`,
      tone: pesado ? 'warn' : medio ? 'neutral' : 'good',
      icon: pesado ? '🐘' : '📦',
    },
    _chart: {
      type: 'scale',
      marker: Number(mb.toFixed(1)),
      markerLabel: `${mb.toFixed(0)} MB`,
      min: 0,
      segments: [
        { nombre: 'Saludable', max: 100, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Empieza a pesar', max: 500, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: 'Usá LFS o split', max: lastMax, color: '#f87171', colorDark: '#ef4444' },
      ],
      ariaLabel: `Tamaño estimado del repo de ${mb.toFixed(0)} MB`,
    },
  };
}
