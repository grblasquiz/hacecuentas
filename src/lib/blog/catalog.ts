import { PRUNING_REDIRECTS } from '../pruning-redirects';
import { GONE_410_URLS } from '../gone-410';

const modules = import.meta.glob<any>('../../content/blog/*.json', { eager: true });
export const BLOG_POSTS = Object.values(modules).map((mod: any) => mod.default ?? mod)
  .map((p: any) => ({...p, title:p.title?.replace(/\s*\|\s*Hac[eé] Cuentas$/i, "")}))
  .filter((p: any) => p.slug && !p.noindex && !p.canonicalUrl && !p.canonicalSlug
    && !PRUNING_REDIRECTS[`/blog/${p.slug}`] && !GONE_410_URLS.has(`/blog/${p.slug}`))
  .sort((a: any, b: any) => String(b.datePublished ?? b.date ?? '').localeCompare(String(a.datePublished ?? a.date ?? '')) || a.slug.localeCompare(b.slug));
export const BLOG_PAGE_SIZE = 24;
export const BLOG_PAGE_COUNT = Math.ceil(BLOG_POSTS.length / BLOG_PAGE_SIZE);
export const blogPageUrl = (page: number) => page === 1 ? '/blog' : `/blog/pagina/${page}`;

const ptModules = import.meta.glob<any>('../../content/blog-pt/*.json', {eager:true});
export const PORTUGUESE_POSTS = Object.values(ptModules).map((m:any)=>m.default??m)
 .filter((p:any)=>p.slug&&!p.noindex&&!PRUNING_REDIRECTS[`/pt/blog/${p.slug}`]&&!GONE_410_URLS.has(`/pt/blog/${p.slug}`));
