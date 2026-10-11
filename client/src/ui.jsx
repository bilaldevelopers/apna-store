import { Link } from 'react-router-dom';
import { pkr, soldOut, waLink } from './api.js';

export const WaIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.5 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3Z" />
  </svg>
);

export const waGeneral = (text = 'Hello, I would like to ask about your products.') =>
  `https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export function ProductCard({ p, i = 0 }) {
  const out = soldOut(p);
  const sizes = p.variants?.find((v) => v.name === 'Size')?.values || [];
  return (
    <article className="fade-up group flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-surface shadow-sm transition hover:shadow-xl" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
      <Link to={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-leaf">
        {p.images[0] ? <img src={p.images[0].url.replace('/upload/', '/upload/f_auto,q_auto,w_600/')} alt={p.name} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${out ? 'grayscale' : ''}`} /> : <div className="grid h-full place-items-center text-5xl">🛏️</div>}
        <span className="absolute left-2 top-2 max-w-[80%] truncate rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand backdrop-blur">{p.category}</span>
        {out && <div className="absolute inset-0 grid place-items-center bg-black/40"><span className="rounded-full bg-surface px-3 py-1 text-xs font-bold">Sold out</span></div>}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to={`/product/${p.slug}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug sm:text-base">{p.name}</Link>
        {sizes.length > 0 && <p className="mt-1 line-clamp-1 text-[11px] text-stone-500 sm:text-xs">Sizes: {sizes.join(' · ')}</p>}
        <p className="mt-1 hidden line-clamp-2 text-xs text-stone-500 sm:block">{p.description}</p>
        <p className="mt-2 font-display text-xl font-bold leading-none text-brand sm:text-2xl">{pkr(p.sellingPrice)}</p>
        <p className={`mt-1 text-[11px] font-semibold sm:text-xs ${out ? 'text-red-400' : 'text-emerald-400'}`}>● {out ? 'Sold out' : 'In stock'}</p>
        <div className="mt-auto grid gap-2 pt-3">
          <a href={waLink(p)} target="_blank" rel="noreferrer" className="btn btn-wa !px-2 !py-2.5 text-xs sm:text-sm"><WaIcon className="h-4 w-4" />Order on WhatsApp</a>
          <Link to={`/product/${p.slug}`} className="btn btn-ghost !px-2 !py-2 text-xs sm:text-sm">View Details</Link>
        </div>
      </div>
    </article>
  );
}
