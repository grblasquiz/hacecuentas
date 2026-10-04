export const TEXT_LIMITS = { characters: 30000, lines: 250, items: 2000 } as const;
export interface CompareOptions { trim: boolean; ignoreCase: boolean }
export type Delimiter = 'lines' | 'comma' | 'semicolon';
export const DEFAULT_OPTIONS: CompareOptions = { trim: false, ignoreCase: false };
const normalizeNewlines = (text: string) => text.replace(/\r\n?/g, '\n');
function checkLength(text: string) { if (text.length > TEXT_LIMITS.characters) throw new Error('Cada entrada admite hasta 30.000 caracteres.'); }
function key(text: string, options: CompareOptions) {
  let value = (options.trim ? text.trim() : text).normalize('NFC');
  if (options.ignoreCase) value = value.toLocaleLowerCase('es');
  return value;
}
function lines(text: string) {
  checkLength(text); const result = text === '' ? [] : normalizeNewlines(text).split('\n');
  if (result.length > TEXT_LIMITS.lines) throw new Error('La comparación de texto admite hasta 250 líneas por entrada.');
  return result;
}
export interface DiffLine { kind: 'same' | 'removed' | 'added'; text: string; aLine: number | null; bLine: number | null }
/** Bounded longest common subsequence by line. Equal lines keep relative order. */
export function compareLines(aText: string, bText: string, options = DEFAULT_OPTIONS) {
  const a = lines(aText), b = lines(bText), ak=a.map(x=>key(x,options)), bk=b.map(x=>key(x,options));
  const width=b.length+1, table=new Uint16Array((a.length+1)*width);
  for(let i=a.length-1;i>=0;i--) for(let j=b.length-1;j>=0;j--) table[i*width+j]=ak[i]===bk[j]?1+table[(i+1)*width+j+1]:Math.max(table[(i+1)*width+j],table[i*width+j+1]);
  const rows: DiffLine[]=[];let i=0,j=0;
  while(i<a.length || j<b.length) {
    if(i<a.length && j<b.length && ak[i]===bk[j]) { rows.push({kind:'same',text:a[i],aLine:i+1,bLine:j+1});i++;j++; }
    else if(i<a.length && (j===b.length || table[(i+1)*width+j]>=table[i*width+j+1])) { rows.push({kind:'removed',text:a[i],aLine:i+1,bLine:null});i++; }
    else { rows.push({kind:'added',text:b[j],aLine:null,bLine:j+1});j++; }
  }
  const counts={same:rows.filter(r=>r.kind==='same').length,removed:rows.filter(r=>r.kind==='removed').length,added:rows.filter(r=>r.kind==='added').length,a:a.length,b:b.length};
  return {rows,counts,text:rows.map(r=>`${r.kind==='same'?'=':r.kind==='removed'?'−':'+'} [A:${r.aLine??'—'} B:${r.bLine??'—'}] ${r.text}`).join('\n')};
}
export function analyzeList(text: string, delimiter: Delimiter = 'lines', options = DEFAULT_OPTIONS) {
  checkLength(text);
  if(!['lines','comma','semicolon'].includes(delimiter)) throw new Error('Elegí un delimitador válido.');
  const parts=normalizeNewlines(text).split(delimiter==='lines'?'\n':delimiter==='comma'?',':';');
  if(parts.length>TEXT_LIMITS.items) throw new Error('Cada lista admite hasta 2.000 elementos antes de quitar vacíos.');
  const unique=new Map<string,string>();let occurrences=0;
  for(const part of parts) {
    const value=options.trim?part.trim():part;
    if(value==='')continue;
    occurrences++;const normalized=key(value,options);if(!unique.has(normalized)) unique.set(normalized,value);
  }
  return {unique,occurrences,duplicates:occurrences-unique.size,values:[...unique.values()]};
}
export function compareLists(aText: string,bText: string,delimiter: Delimiter='lines',options=DEFAULT_OPTIONS) {
  const a=analyzeList(aText,delimiter,options),b=analyzeList(bText,delimiter,options);
  const onlyA=[...a.unique].filter(([k])=>!b.unique.has(k)).map(([,v])=>v);
  const onlyB=[...b.unique].filter(([k])=>!a.unique.has(k)).map(([,v])=>v);
  const common=[...a.unique].filter(([k])=>b.unique.has(k)).map(([,v])=>v);
  return {a,b,onlyA,onlyB,common,union:[...a.values,...onlyB]};
}
