import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Check, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const EMPTY_CAT = { name: "", icon: "", description: "", sort_order: 0, is_active: true };

const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newCat, setNewCat] = useState(EMPTY_CAT);

  const load = () => {
    setLoading(true);
    api.entities.Category.list("sort_order").then(setCategories).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (cat) => {
    if (cat.id) {
      await api.entities.Category.update(cat.id, cat);
    } else {
      await api.entities.Category.create(cat);
    }
    setEditing(null);
    setShowNew(false);
    setNewCat(EMPTY_CAT);
    load();
  };

  const del = async (id) => {
    if (!confirm("Eliminare questa categoria?")) return;
    await api.entities.Category.delete(id);
    load();
  };

  const toggleActive = async (cat) => {
    await api.entities.Category.update(cat.id, { is_active: !cat.is_active });
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Categorie</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuova categoria
        </button>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white border border-brand-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-heading font-semibold text-gray-800 text-sm">Nuova categoria</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="Nome *" className={inputClass} />
            <input value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} placeholder="Icona (opzionale)" className={inputClass} />
          </div>
          <input value={newCat.description} onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} placeholder="Descrizione" className={inputClass} />
          <input type="number" value={newCat.sort_order} onChange={e => setNewCat(p => ({ ...p, sort_order: parseInt(e.target.value) }))} placeholder="Ordine visualizzazione" className={inputClass} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => save(newCat)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Check className="w-4 h-4" /> Salva
            </button>
            <button onClick={() => { setShowNew(false); setNewCat(EMPTY_CAT); }} className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-lg text-sm transition-colors">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
            Nessuna categoria. Creane una!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map(cat => (
              <div key={cat.id}>
                {editing?.id === cat.id ? (
                  <div className="p-4 space-y-3 bg-brand-50/50 border-l-2 border-brand-400">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                      <input value={editing.icon || ""} onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))} placeholder="Icona" className={inputClass} />
                    </div>
                    <input value={editing.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Descrizione" className={inputClass} />
                    <input type="number" value={editing.sort_order || 0} onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) }))} placeholder="Ordine" className={inputClass} />
                    <div className="flex gap-2">
                      <button onClick={() => save(editing)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Check className="w-3.5 h-3.5" /> Salva
                      </button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-lg text-sm transition-colors">
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={cat.is_active} onCheckedChange={() => toggleActive(cat)} />
                      <button onClick={() => setEditing({ ...cat })} className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => del(cat.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}