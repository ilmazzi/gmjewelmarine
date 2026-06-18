import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Save, X } from "lucide-react";

const emptyForm = { title: "", excerpt: "", content: "", cover_image: "", is_published: true, published_date: new Date().toISOString().split("T")[0], sort_order: 0 };

function NewsForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const uploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    set("cover_image", file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-bold text-lg text-gray-900">{initial?.id ? "Modifica articolo" : "Nuovo articolo"}</h2>
        <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Titolo *</label>
        <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Titolo articolo" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data pubblicazione</label>
          <input type="date" className={inputClass} value={form.published_date || ""} onChange={e => set("published_date", e.target.value)} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => set("is_published", !form.is_published)}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.is_published ? "bg-brand-600" : "bg-gray-300"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-600">{form.is_published ? "Pubblicato" : "Bozza"}</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Immagine di copertina</label>
        <div className="flex gap-2 items-center">
          <label className={`inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 hover:border-brand-400 rounded-lg cursor-pointer text-sm text-gray-500 hover:text-brand-600 transition-all ${uploading ? "opacity-50" : ""}`}>
            <Upload className="w-4 h-4" />
            {uploading ? "Caricamento..." : "Carica immagine"}
            <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploading} />
          </label>
          <input type="url" className={`${inputClass} flex-1`} value={form.cover_image || ""} onChange={e => set("cover_image", e.target.value)} placeholder="oppure incolla URL..." />
        </div>
        {form.cover_image && <img src={form.cover_image} alt="" className="mt-2 h-24 rounded-lg object-cover border border-gray-200" />}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estratto / Anteprima</label>
        <textarea className={`${inputClass} resize-none`} rows={2} value={form.excerpt || ""} onChange={e => set("excerpt", e.target.value)} placeholder="Breve descrizione visibile nella lista..." />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contenuto</label>
        <textarea className={`${inputClass} resize-none`} rows={8} value={form.content || ""} onChange={e => set("content", e.target.value)} placeholder="Testo completo dell'articolo (HTML supportato)..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm">
          <Save className="w-4 h-4" />
          {saving ? "Salvataggio..." : "Salva"}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          Annulla
        </button>
      </div>
    </div>
  );
}

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | article object

  const load = () => {
    setLoading(true);
    api.entities.News.list("-published_date", 100)
      .then(setNews).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (form.id) {
      await api.entities.News.update(form.id, form);
    } else {
      await api.entities.News.create(form);
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare questo articolo?")) return;
    await api.entities.News.delete(id);
    load();
  };

  const togglePublish = async (article) => {
    await api.entities.News.update(article.id, { is_published: !article.is_published });
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900">News</h1>
        {editing === null && (
          <button onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nuovo articolo
          </button>
        )}
      </div>

      {(editing === "new") && (
        <NewsForm onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {editing && editing !== "new" && (
        <NewsForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nessun articolo. Creane uno!</div>
      ) : (
        <div className="space-y-3">
          {news.map(article => (
            <div key={article.id} className="bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-4 p-4">
              {article.cover_image ? (
                <img src={article.cover_image} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0 text-xl">📰</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{article.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{article.published_date || "—"}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${article.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {article.is_published ? "Pubblicato" : "Bozza"}
                </span>
                <button onClick={() => togglePublish(article)} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100 transition-colors" title="Pubblica/Nascondi">
                  {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(article)} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(article.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}