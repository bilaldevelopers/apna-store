import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { STORE } from './api.js';
import { WaIcon, waGeneral } from './ui.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Admin from './pages/Admin.jsx';

const links = [['Home', '/'], ['Shop', '/#shop'], ['Categories', '/#categories'], ['About Us', '/#about'], ['Contact', '/#contact']];

export default function App() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 80);
    else window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname, hash]);
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-cream/80 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg text-white">🛏️</span>
            <span className="font-display text-xl font-bold text-brand">{STORE}</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            {links.map(([l, to]) => <Link key={l} to={to} className="transition hover:text-brand">{l}</Link>)}
            <a href={waGeneral()} target="_blank" rel="noreferrer" className="btn btn-wa !py-2 text-sm"><WaIcon className="h-4 w-4" />Chat</a>
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            <div className="space-y-1.5"><i className="block h-0.5 w-6 bg-ink" /><i className="block h-0.5 w-6 bg-ink" /><i className="block h-0.5 w-4 bg-ink" /></div>
          </button>
        </nav>
        {open && <div className="fade-up space-y-1 border-t bg-cream px-4 pb-4 md:hidden">{links.map(([l, to]) => <Link key={l} to={to} className="block rounded-lg px-3 py-3 font-medium hover:bg-leaf">{l}</Link>)}</div>}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/product/:slug" element={<div className="mx-auto max-w-6xl p-4"><Product /></div>} />
          <Route path="/admin" element={<div className="mx-auto max-w-6xl p-4"><Admin /></div>} />
        </Routes>
      </main>
      <footer className="mt-16 border-t border-white/10 bg-[#08090b] text-stone-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          <div><p className="font-display text-2xl font-bold">{STORE}</p><p className="mt-2 text-sm text-stone-400">Quality home essentials, based in Lahore, Pakistan.</p></div>
          <div><p className="font-semibold">Delivery</p><p className="mt-2 text-sm text-stone-400">Delivery charges and availability are confirmed directly with the seller on WhatsApp before your order is final.</p></div>
          <div className="text-sm"><p className="font-semibold">Quick links</p><div className="mt-2 space-y-1 text-stone-400">{links.slice(1).map(([l, to]) => <Link key={l} to={to} className="block hover:text-white">{l}</Link>)}</div></div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-stone-500">© {new Date().getFullYear()} {STORE} · <Link to="/admin">Admin</Link></p>
      </footer>
      <a href={waGeneral()} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand text-black shadow-2xl transition hover:scale-110"><WaIcon className="h-7 w-7" /></a>
    </>
  );
}
