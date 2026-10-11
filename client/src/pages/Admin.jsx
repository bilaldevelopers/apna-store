import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { api, auth, pkr } from '../api.js';

const blank = { name: '', slug: '', category: 'Blankets', sellingPrice: '', purchaseCost: '', stockQuantity: 0, description: '', sizes: '', colours: '', specsText: '', images: [], isActive: true, availabilityStatus: 'in_stock' };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, pw); } catch { setErr('Invalid email or password'); } };
  return (
    <div className="mx-auto mt-10 max-w-sm space-y-3 rounded-2xl border bg-surface p-6">
      <h1 className="text-xl font-bold">Admin login</h1>
      <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button onClick={go} className="btn btn-primary w-full">Sign in</button>
    </div>
  );
}

async function uploadImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Only JPG, PNG or WebP images');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5 MB');
  const s = await api('/admin/uploads/signature', { method: 'POST', admin: true });
  const f = new FormData();
  f.append('file', file); f.append('api_key', s.apiKey); f.append('timestamp', s.timestamp);
  f.append('signature', s.signature); f.append('folder', s.folder); f.append('allowed_formats', s.allowed_formats);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: f });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Upload failed');
  return { url: j.secure_url, publicId: j.public_id };
}

function Form({ initial, onSaved, onCancel, setMsg }) {
  const [f, setF] = useState(initial); const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const addFiles = async (files) => {
    setBusy(true);
    try { const up = []; for (const file of files) up.push(await uploadImage(file)); set('images', [...f.images, ...up]); }
    catch (e) { setMsg({ err: e.message }); }
    setBusy(false);
  };
  const save = async () => {
    const list = (t) => t.split(',').map((x) => x.trim()).filter(Boolean);
    const variants = [['Size', f.sizes], ['Colour', f.colours]].filter(([, v]) => v.trim()).map(([name, v]) => ({ name, values: list(v) }));
    const specs = f.specsText.split('\n').map((l) => l.split(':')).filter((a) => a.length > 1).map(([label, ...v]) => ({ label: label.trim(), value: v.join(':').trim() }));
    const body = { name: f.name.trim(), slug: f.slug || slugify(f.name), category: f.category, description: f.description, sellingPrice: Number(f.sellingPrice), stockQuantity: Number(f.stockQuantity), images: f.images, variants, specs, isActive: f.isActive, availabilityStatus: f.availabilityStatus };
    if (f.purchaseCost !== '') body.purchaseCost = Number(f.purchaseCost);
    setBusy(true);
    try { await api(f._id ? `/admin/products/${f._id}` : '/admin/products', { method: f._id ? 'PUT' : 'POST', body, admin: true }); setMsg({ ok: 'Saved' }); onSaved(); }
    catch (e) { setMsg({ err: e.message }); }
    setBusy(false);
  };
  return (
    <div className="space-y-3 rounded-2xl border bg-surface p-4">
      <h2 className="font-bold">{f._id ? 'Edit product' : 'Add product'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Name" value={f.name} onChange={(e) => { set('name', e.target.value); if (!f._id) set('slug', slugify(e.target.value)); }} />
        <input className="input" placeholder="Slug (unique)" value={f.slug} onChange={(e) => set('slug', e.target.value)} />
        <input className="input" placeholder="Category" value={f.category} onChange={(e) => set('category', e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Selling price (PKR)" value={f.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Purchase cost (private)" value={f.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Stock quantity" value={f.stockQuantity} onChange={(e) => set('stockQuantity', e.target.value)} />
        <input className="input" placeholder="Sizes (comma separated)" value={f.sizes} onChange={(e) => set('sizes', e.target.value)} />
        <input className="input" placeholder="Colours (comma separated)" value={f.colours} onChange={(e) => set('colours', e.target.value)} />
      </div>
      <textarea className="input" rows="3" placeholder="Description" value={f.description} onChange={(e) => set('description', e.target.value)} />
      <textarea className="input" rows="2" placeholder={'Specifications, one per line\nMaterial: ...'} value={f.specsText} onChange={(e) => set('specsText', e.target.value)} />
      <div className="flex flex-wrap gap-4 text-sm">
        <label><input type="checkbox" checked={f.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Visible to customers</label>
        <label><input type="checkbox" checked={f.availabilityStatus === 'in_stock'} onChange={(e) => set('availabilityStatus', e.target.checked ? 'in_stock' : 'out_of_stock')} /> In stock</label>
      </div>
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => addFiles([...e.target.files])} />
      <div className="flex flex-wrap gap-2">{f.images.map((i) => (
        <div key={i.publicId} className="relative"><img src={i.url} className="h-20 w-20 rounded-lg object-cover" alt="" />
          <button className="absolute right-0 top-0 rounded-full bg-black/70 px-1.5 text-xs text-white" onClick={() => set('images', f.images.filter((x) => x !== i))}>×</button></div>))}</div>
      <div className="flex gap-2"><button disabled={busy} onClick={save} className="btn btn-primary">{busy ? 'Please wait…' : 'Save'}</button><button onClick={onCancel} className="btn btn-ghost">Cancel</button></div>
    </div>
  );
}

function Dashboard() {
  const [items, setItems] = useState(null); const [edit, setEdit] = useState(null); const [q, setQ] = useState(''); const [msg, setMsg] = useState(null);
  const load = useCallback(() => api('/admin/products', { admin: true }).then(setItems).catch((e) => setMsg({ err: e.message })), []);
  useEffect(() => { load(); }, [load]);
  const patch = async (p, body) => { try { await api(`/admin/products/${p._id}/status`, { method: 'PATCH', body, admin: true }); load(); } catch (e) { setMsg({ err: e.message }); } };
  const del = async (p) => { if (!confirm(`Delete "${p.name}" permanently?`)) return; try { await api(`/admin/products/${p._id}`, { method: 'DELETE', admin: true }); setMsg({ ok: 'Deleted' }); load(); } catch (e) { setMsg({ err: e.message }); } };
  const toForm = (p) => ({ ...blank, ...p, purchaseCost: p.purchaseCost ?? '', sizes: p.variants?.find((v) => v.name === 'Size')?.values.join(', ') || '', colours: p.variants?.find((v) => v.name === 'Colour')?.values.join(', ') || '', specsText: (p.specs || []).map((s) => `${s.label}: ${s.value}`).join('\n') });
  const shown = (items || []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Admin dashboard</h1><button className="btn btn-ghost" onClick={() => signOut(auth)}>Log out</button></div>
      {msg && <p className={`rounded p-2 text-sm ${msg.err ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-400'}`}>{msg.err || msg.ok}</p>}
      {items && <div className="grid grid-cols-3 gap-3 text-center">{[['Total', items.length], ['Active', items.filter((p) => p.isActive).length], ['Out of stock', items.filter((p) => p.availabilityStatus === 'out_of_stock').length]].map(([l, n]) => <div key={l} className="rounded-xl border bg-surface p-3"><p className="text-2xl font-bold">{n}</p><p className="text-xs text-stone-500">{l}</p></div>)}</div>}
      {edit ? <Form initial={edit} setMsg={setMsg} onCancel={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /> : (
        <>
          <div className="flex gap-2"><input className="input" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-primary" onClick={() => setEdit(blank)}>Add product</button></div>
          {!items && <p>Loading…</p>}
          {items && !shown.length && <p className="text-stone-500">No products yet.</p>}
          <div className="space-y-2">{shown.map((p) => (
            <div key={p._id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-surface p-3">
              {p.images[0] && <img src={p.images[0].url} className="h-12 w-12 rounded object-cover" alt="" />}
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name}</p><p className="text-sm text-stone-500">{pkr(p.sellingPrice)} · {p.isActive ? 'Visible' : 'Hidden'} · {p.availabilityStatus === 'in_stock' ? 'In stock' : 'Sold out'}</p></div>
              <button className="btn btn-ghost" onClick={() => patch(p, { isActive: !p.isActive })}>{p.isActive ? 'Hide' : 'Show'}</button>
              <button className="btn btn-ghost" onClick={() => patch(p, { availabilityStatus: p.availabilityStatus === 'in_stock' ? 'out_of_stock' : 'in_stock' })}>Toggle stock</button>
              <button className="btn btn-ghost" onClick={() => setEdit(toForm(p))}>Edit</button>
              <button className="btn btn-ghost text-red-400" onClick={() => del(p)}>Delete</button>
            </div>))}</div>
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <p>Loading…</p>;
  return user ? <Dashboard /> : <Login />;
}
