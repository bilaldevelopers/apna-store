import { useEffect, useMemo, useState } from 'react';
import { api, STORE } from '../api.js';
import { ProductCard, WaIcon, waGeneral } from '../ui.jsx';

const why = [
  ['✨', 'Carefully chosen', 'Products picked for everyday comfort and lasting use.'],
  ['💰', 'Fair, clear prices', 'The price you see is the price on the product page, in PKR.'],
  ['💬', 'Easy ordering', 'Tap a button, send us a WhatsApp message, and we confirm everything with you.'],
];

export default function Shop() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState('');
  useEffect(() => { api('/products').then(setItems).catch((e) => setErr(e.message)); }, []);
  const cats = useMemo(() => [...new Set((items || []).map((p) => p.category))], [items]);
  const list = useMemo(() => {
    let l = (items || []).filter((p) => (!cat || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort) l = [...l].sort((a, b) => (sort === 'asc' ? a.sellingPrice - b.sellingPrice : b.sellingPrice - a.sellingPrice));
    return l;
  }, [items, q, cat, sort]);
  const hero = (items || []).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1d1810] via-cream to-cream">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:py-24">
          <div className="fade-up">
            <span className="inline-block rounded-full border border-brand/20 bg-white/5 px-3 py-1 text-xs font-semibold text-brand sm:text-sm">📍 Based in Lahore · Order on WhatsApp</span>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.15] sm:text-5xl lg:text-6xl">Quality Home Essentials at <span className="text-brand underline decoration-amber-200/40 decoration-4 underline-offset-4">Fair Prices</span></h1>
            <p className="mt-4 max-w-lg text-base text-stone-600 sm:text-lg">Soft, warm and dependable products from Lahore. Pick what you like and order in one tap on WhatsApp. No account needed.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
              <a href="#shop" className="btn btn-primary !px-4 !py-3 text-sm sm:!px-7 sm:text-base">Explore Products</a>
              <a href={waGeneral()} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4 !py-3 text-sm sm:!px-7 sm:text-base"><WaIcon className="h-4 w-4 text-[#25D366]" />Chat with us</a>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-stone-700 sm:text-xs">
              {[['📍', 'Lahore based'], ['💬', 'WhatsApp orders'], ['💰', 'Clear PKR prices']].map(([e, t]) => <div key={t} className="rounded-xl bg-white/5 px-1 py-2.5 shadow-sm"><div className="text-lg">{e}</div>{t}</div>)}
            </div>
          </div>
          <div className="relative mx-auto hidden h-[26rem] w-full max-w-md md:block">
            {(hero.length ? hero : [0, 1, 2]).map((p, i) => (
              <div key={i} className="float absolute overflow-hidden rounded-3xl border-4 border-white bg-leaf shadow-2xl" style={{ width: '58%', aspectRatio: '4/5', left: `${i * 20}%`, top: `${(i % 2) * 16}%`, rotate: `${(i - 1) * 7}deg`, zIndex: i, animationDelay: `${i * 1.2}s` }}>
                {p.images?.[0] ? <img src={p.images[0].url.replace('/upload/', '/upload/f_auto,q_auto,w_500/')} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-6xl">🛏️</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl px-3 pt-8 sm:px-4 sm:pt-14">
        <h2 className="px-1 text-2xl font-bold sm:text-3xl">Our products</h2>
        <div id="categories" className="sticky top-[57px] z-20 -mx-3 mt-3 grid grid-cols-[1fr_auto] gap-2 bg-cream/95 px-3 py-2.5 backdrop-blur sm:-mx-4 sm:px-4">
          <input className="input !py-2.5 text-sm" placeholder="🔍 Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input !w-auto !py-2.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Sort</option><option value="asc">Price ↑</option><option value="desc">Price ↓</option></select>
          <div className="col-span-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button className={`chip whitespace-nowrap ${!cat ? 'chip-on' : ''}`} onClick={() => setCat('')}>All</button>
            {cats.map((c) => <button key={c} className={`chip whitespace-nowrap ${cat === c ? 'chip-on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>
        {err && <p className="mt-3 rounded-xl bg-red-50 p-4 text-red-300">Could not load products. Please try again shortly.</p>}
        {!items && !err && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}</div>}
        {items && !list.length && <p className="py-16 text-center text-stone-500">😕 No products found.</p>}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{list.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 pt-14 sm:pt-20">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Why shop with {STORE}?</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-5">
          {why.map(([e, t, d]) => (
            <div key={t} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-surface p-4 shadow-sm md:block md:p-7 md:text-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-leaf text-2xl md:mx-auto md:h-14 md:w-14">{e}</div>
              <div><h3 className="text-lg font-bold md:mt-4 md:text-xl">{t}</h3><p className="mt-1 text-sm text-stone-600 md:text-base">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-4 pt-14 sm:pt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b2113] to-[#121318] border border-brand/30 p-6 text-center text-white sm:p-14">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <h2 className="relative text-2xl font-bold sm:text-4xl">Questions? Chat on WhatsApp</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-stone-300 sm:text-base">Ask about a product, availability, or delivery. We reply directly and confirm your order with you.</p>
          <a href={waGeneral()} target="_blank" rel="noreferrer" className="btn btn-wa relative mt-6 !px-7 !py-3 text-base"><WaIcon />Message us now</a>
        </div>
      </section>
    </>
  );
}
