import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkDeployHead } from '../scripts/check-deploy-head.mjs';
let dirs: string[] = [];
afterEach(() => { for (const dir of dirs) rmSync(dir, {recursive:true,force:true}); dirs=[]; });
function repo() {
 const dir=mkdtempSync(join(tmpdir(),'hc-release-'));dirs.push(dir);
 const git=(...args:string[])=>execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();
 git('init','-q');git('config','user.email','test@example.com');git('config','user.name','Test');
 writeFileSync(join(dir,'app.js'),'initial');git('add','.');git('commit','-qm','initial');
 const before=git('rev-parse','HEAD');
 const commit=(file:string,text:string)=>{writeFileSync(join(dir,file),text);git('add','.');git('commit','-qm','change');return git('rev-parse','HEAD');};
 return {dir,git,before,commit};
}
describe('production release freshness',()=>{
 it('permits the current revision',()=>{const r=repo();expect(checkDeployHead(r.dir,r.before,r.before).allowed).toBe(true);});
 it('rejects a queued build after new production code arrives',()=>{const r=repo();const next=r.commit('app.js','fixed');expect(checkDeployHead(r.dir,r.before,next).allowed).toBe(false);});
 it('allows documentation-only successors that do not trigger a replacement deploy',()=>{const r=repo();mkdirSync(join(r.dir,'docs'));const next=r.commit('docs/note.md','notes');expect(checkDeployHead(r.dir,r.before,next).allowed).toBe(true);});
 it('rejects a built revision outside the current main history',()=>{const r=repo();const next=r.commit('app.js','unpublished');expect(checkDeployHead(r.dir,next,r.before).allowed).toBe(false);});
});
