import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, pkr, soldOut, waLink } from '../api.js';
import { WaIcon } from '../ui.jsx';

export default function Product() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [img, setImg] = useState(0);
  useEffect(() => { setP(null); setErr(''); api(`/products/${slug}`).then(setP).catch((e) => setErr(e.message)); }, [slug]);
  if (err) return <div className="py-20 text-center"><p className="text-xl">😕 {err}</p><Link to="/" className="btn btn-primary mt-4">Back to shop</Link></div>;
  if (!p) return <div className="grid gap-8 md:grid-cols-2"><div className="skeleton aspect-square rounded-3xl" /><div className="skeleton h-80 rounded-3xl" /></div>;
  const out = soldOut(p);
  return (
    <div className="pb-24 md:pb-0">
      <nav className="text-sm text-stone-500"><Link to="/" className="hover:text-brand">Home</Link> / <span>{p.category}</span> / <span className="text-ink">{p.name}</span></nav>
      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div className="fade-up">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-leaf shadow-lg">
            {p.images[img] ? <img src={p.images[img].url} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-8xl">🛏️</div>}
            {out && <span className="absolute left-4 top-4 rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-white">Sold out</span>}
          </div>
          {p.images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto">{p.images.map((i, k) => <img key={k} src={i.url} onClick={() => setImg(k)} alt="" className={`h-20 w-20 shrink-0 cursor-pointer rounded-xl object-cover ring-2 transition ${k === img ? 'ring-brand' : 'ring-transparent opacity-70 hover:opacity-100'}`} />)}</div>}
        </div>
        <div className="fade-up space-y-5" style={{ animationDelay: '120ms' }}>
          <span className="rounded-full bg-leaf px-3 py-1 text-xs font-semibold text-brand">{p.category}</span>
          <h1 className="text-3xl font-bold sm:text-4xl">{p.name}</h1>
          <div className="flex items-center gap-3">
            <p className="font-display text-4xl font-bold text-brand">{pkr(p.sellingPrice)}</p>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${out ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{out ? 'Sold out' : '● In stock'}</span>
          </div>
          <p className="whitespace-pre-line leading-relaxed text-stone-600">{p.description}</p>
          {p.variants.map((v) => <div key={v.name}><p className="mb-2 text-sm font-semibold">{v.name}</p><div className="flex flex-wrap gap-2">{v.values.map((x) => <span key={x} className="chip">{x}</span>)}</div></div>)}
          {p.specs.length > 0 && <div className="divide-y rounded-2xl border bg-white">{p.specs.map((s) => <div key={s.label} className="flex justify-between gap-4 px-4 py-3 text-sm"><span className="text-stone-500">{s.label}</span><span className="font-medium">{s.value}</span></div>)}</div>}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">🚚 Availability, delivery charges and the final order are confirmed directly with the seller on WhatsApp.</div>
          <a href={waLink(p)} target="_blank" rel="noreferrer" className="btn btn-wa hidden w-full !py-4 text-lg md:flex"><WaIcon />Order on WhatsApp</a>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur md:hidden">
        <a href={waLink(p)} target="_blank" rel="noreferrer" className="btn btn-wa w-full !py-3.5 text-base"><WaIcon />Order · {pkr(p.sellingPrice)}</a>
      </div>
    </div>
  );
}
