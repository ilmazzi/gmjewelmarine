import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

// --- Brand Form ---
function BrandForm({ brand, onSave, onCancel }) {
  const [form, setForm] = useState(brand || { name: "", section: "", is_active: true, sort_order: 0 });

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome marchio *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="es. HONDA MARINE" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sezione *</label>
          <input value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value.toLowerCase().trim() }))} placeholder="es. barche, motori, gommoni..." className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Usa una parola sola minuscola. Es: barche, motori, gommoni, carrelli, usato</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span className="text-sm text-gray-500">Visibile nel menu</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(form)} disabled={!form.name || !form.section}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
            <Check className="w-4 h-4" /> Salva
          </button>
          <button onClick={onCancel} className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-lg text-sm transition-colors">
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Model Manager per un singolo brand ---
function BrandModels({ brandId }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = () => {
    api.entities.Model.filter({ brand_id: brandId, is_active: true }, "sort_order")
      .then(setModels).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [brandId]);

  const add = async () => {
    if (!newName.trim()) return;
    await api.entities.Model.create({ brand_id: brandId, name: newName.trim(), is_active: true, sort_order: models.length });
    setNewName("");
    load();
  };

  const remove = async (id) => {
    await api.entities.Model.delete(id);
    load();
  };

  const startEdit = (m) => { setEditingId(m.id); setEditName(m.name); };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    await api.entities.Model.update(id, { name: editName.trim() });
    setEditingId(null);
    load();
  };

  if (loading) return <div className="ml-7 mt-2 text-xs text-gray-400">Caricamento...</div>;

  return (
    <div className="ml-7 mt-3 mb-2 space-y-1.5">
      {models.map(m => (
        <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg group">
          {editingId === m.id ? (
            <>
              <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === "Enter") saveEdit(m.id); if (e.key === "Escape") setEditingId(null); }}
                className="flex-1 text-sm border-0 outline-none bg-transparent text-gray-900" />
              <button onClick={() => saveEdit(m.id)} className="text-brand-600 hover:text-brand-700"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditingId(null)} className="text-gray-300 hover:text-gray-500"><X className="w-3.5 h-3.5" /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm text-gray-700">{m.name}</span>
              <button onClick={() => startEdit(m)} className="text-gray-300 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(m.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Aggiungi modello..." className={`${inputClass} text-xs py-2`} />
        <button onClick={add} className="px-3 py-2 bg-brand-100 text-brand-600 hover:bg-brand-200 rounded-lg transition-colors shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Main ---
export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState({});

  const load = () => {
    setLoading(true);
    api.entities.Brand.list("sort_order").then(setBrands).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (data) => {
    if (data.id) {
      await api.entities.Brand.update(data.id, data);
    } else {
      await api.entities.Brand.create(data);
    }
    setEditing(null);
    setShowNew(false);
    load();
  };

  const del = async (id) => {
    if (!confirm("Eliminare questo marchio? Gli annunci esistenti non vengono eliminati.")) return;
    await api.entities.Brand.delete(id);
    load();
  };

  const toggleActive = async (brand) => {
    await api.entities.Brand.update(brand.id, { is_active: !brand.is_active });
    load();
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // Group by section dynamically
  const sectionKeys = [...new Set(brands.map(b => b.section))].sort();
  const grouped = sectionKeys.map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    brands: brands.filter(b => b.section === key),
  }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Marchi & Modelli</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestisci marchi e modelli. Appaiono automaticamente nel menu e nel form annunci.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nuovo marchio
        </button>
      </div>

      {showNew && <BrandForm onSave={save} onCancel={() => setShowNew(false)} />}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2 font-medium">Nessun marchio ancora.</p>
          <button onClick={() => setShowNew(true)} className="text-brand-600 hover:underline text-sm">Aggiungi il primo marchio</button>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(section => (
            <div key={section.key} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide">{section.label}</h3>
                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  {section.brands.filter(b => b.is_active).length} attivi
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {section.brands.map(brand => (
                  <div key={brand.id}>
                    {editing?.id === brand.id ? (
                      <div className="p-4">
                        <BrandForm brand={editing} onSave={save} onCancel={() => setEditing(null)} />
                      </div>
                    ) : (
                      <div className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleExpand(brand.id)} className="text-gray-300 hover:text-gray-600 transition-colors">
                            {expanded[brand.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${brand.is_active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                              {brand.name}
                            </p>
                            <p className="text-xs text-gray-400">Clicca ▶ per gestire i modelli</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={brand.is_active} onCheckedChange={() => toggleActive(brand)} />
                            <button onClick={() => setEditing({ ...brand })} className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => del(brand.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {expanded[brand.id] && <BrandModels brandId={brand.id} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}