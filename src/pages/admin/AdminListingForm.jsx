import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { ArrowLeft, Plus, Upload, X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const EMPTY = {
  title: "", section: "", brand_id: "", brand: "", model: "", category_id: "",
  condition: "new", price: "", price_on_request: false, description: "",
  short_description: "", images: [], featured_image: "", is_promoted: false,
  is_published: true, specs: [], year: "", length_m: "", engine_hp: "", sort_order: 0,
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

export default function AdminListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "nuovo";

  const [form, setForm] = useState(EMPTY);
  const [brands, setBrands] = useState([]); // all active brands
  const [sections, setSections] = useState([]); // unique sections
  const [sectionBrands, setSectionBrands] = useState([]); // brands filtered by chosen section
  const [availableModels, setAvailableModels] = useState([]); // models from DB for selected brand
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSpec, setNewSpec] = useState({ label: "", value: "" });

  useEffect(() => {
    Promise.all([
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
      isNew ? Promise.resolve(null) : api.entities.Listing.filter({ id }).then(ls => ls[0] || null),
    ]).then(async ([brandData, listingData]) => {
      setBrands(brandData);
      // Unique sections
      const seen = new Set();
      const secList = [];
      brandData.forEach(b => { if (!seen.has(b.section)) { seen.add(b.section); secList.push(b.section); } });
      setSections(secList);

      if (listingData) {
        setForm({ ...EMPTY, ...listingData });
        const filteredBrands = brandData.filter(b => b.section === listingData.section);
        setSectionBrands(filteredBrands);
        // Load models for existing brand
        if (listingData.brand_id) {
          const mods = await api.entities.Model.filter({ brand_id: listingData.brand_id, is_active: true }, "sort_order");
          setAvailableModels(mods.map(m => m.name));
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // When section changes, re-filter brands and reset brand fields
  const handleSectionChange = (sec) => {
    setForm(p => ({ ...p, section: sec, brand_id: "", brand: "", model: "" }));
    setSectionBrands(brands.filter(b => b.section === sec));
  };

  // When brand changes, store both id and name + load models
  const handleBrandChange = async (brandId) => {
    const found = brands.find(b => b.id === brandId);
    setForm(p => ({ ...p, brand_id: brandId, brand: found?.name || "", model: "" }));
    if (brandId) {
      const mods = await api.entities.Model.filter({ brand_id: brandId, is_active: true }, "sort_order");
      setAvailableModels(mods.map(m => m.name));
    } else {
      setAvailableModels([]);
    }
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));



  const uploadImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setForm(p => ({
        ...p,
        featured_image: p.featured_image || file_url,
        images: [...(p.images || []), file_url],
      }));
    }
    setUploading(false);
  };

  const removeImage = (url) => {
    setForm(p => ({
      ...p,
      images: (p.images || []).filter(i => i !== url),
      featured_image: p.featured_image === url ? ((p.images || []).filter(i => i !== url)[0] || "") : p.featured_image,
    }));
  };

  const addSpec = () => {
    if (!newSpec.label || !newSpec.value) return;
    setForm(p => ({ ...p, specs: [...(p.specs || []), { ...newSpec }] }));
    setNewSpec({ label: "", value: "" });
  };

  const removeSpec = (i) => setForm(p => ({ ...p, specs: p.specs.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    const data = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      year: form.year ? parseInt(form.year) : null,
      length_m: form.length_m ? parseFloat(form.length_m) : null,
      engine_hp: form.engine_hp ? parseFloat(form.engine_hp) : null,
      sort_order: form.sort_order ? parseInt(form.sort_order) : 0,
    };
    if (isNew) {
      await api.entities.Listing.create(data);
    } else {
      await api.entities.Listing.update(id, data);
    }
    setSaving(false);
    navigate("/admin/annunci");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  const allImages = form.images || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/annunci" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-gray-900">
          {isNew ? "Nuovo annuncio" : "Modifica annuncio"}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">

          {/* Sezione e Marchio — THE CORE */}
          <div className="bg-white border border-brand-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">
              Sezione & Marchio <span className="text-red-400">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sezione *">
                <select value={form.section} onChange={e => handleSectionChange(e.target.value)} className={inputClass}>
                  <option value="">Seleziona sezione</option>
                  {sections.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Marchio *">
                <select value={form.brand_id} onChange={e => handleBrandChange(e.target.value)} disabled={!form.section} className={inputClass}>
                  <option value="">Seleziona marchio</option>
                  {sectionBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Modello">
              {availableModels.length > 0 ? (
                <select value={form.model} onChange={e => set("model", e.target.value)} className={inputClass}>
                  <option value="">Seleziona modello</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="__altro__">Altro (scrivi manualmente)</option>
                </select>
              ) : (
                <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="es. BF115" className={inputClass} />
              )}
              {form.model === "__altro__" && (
                <input value={form._customModel || ""} onChange={e => { set("_customModel", e.target.value); set("model", e.target.value); }}
                  placeholder="Nome modello" className={`${inputClass} mt-2`} />
              )}
            </Field>
          </div>

          {/* Informazioni principali */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">Informazioni principali</h3>
            <Field label="Titolo *">
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="es. Barca a motore 5.5m" className={inputClass} />
            </Field>
            <Field label="Breve descrizione">
              <input value={form.short_description} onChange={e => set("short_description", e.target.value)} placeholder="Descrizione breve per le card" className={inputClass} />
            </Field>
            <Field label="Descrizione completa">
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Descrizione dettagliata..." className={`${inputClass} resize-none`} />
            </Field>
          </div>

          {/* Dettagli tecnici */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">Dettagli tecnici</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Anno">
                <input type="number" value={form.year} onChange={e => set("year", e.target.value)} placeholder="2024" className={inputClass} />
              </Field>
              <Field label="Lunghezza (m)">
                <input type="number" step="0.1" value={form.length_m} onChange={e => set("length_m", e.target.value)} placeholder="5.5" className={inputClass} />
              </Field>
              <Field label="Potenza (CV)">
                <input type="number" value={form.engine_hp} onChange={e => set("engine_hp", e.target.value)} placeholder="115" className={inputClass} />
              </Field>
              <Field label="Ordine visualizzazione">
                <input type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Specifiche tecniche */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">Specifiche tecniche</h3>
            {(form.specs || []).map((spec, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                <span className="text-sm text-gray-500 flex-1">{spec.label}</span>
                <span className="text-sm font-medium text-gray-800">{spec.value}</span>
                <button onClick={() => removeSpec(i)} className="text-gray-300 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={newSpec.label} onChange={e => setNewSpec(p => ({ ...p, label: e.target.value }))} placeholder="Etichetta (es. Materiale scafo)" className={inputClass} />
              <input value={newSpec.value} onChange={e => setNewSpec(p => ({ ...p, value: e.target.value }))} placeholder="Valore" className={`${inputClass} max-w-[140px]`} />
              <button onClick={addSpec} className="px-3 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors shrink-0"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Foto */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">Foto</h3>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${uploading ? "border-brand-200 bg-brand-50/50" : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/30"}`}>
              <Upload className="w-7 h-7 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">{uploading ? "Caricamento in corso..." : "Clicca o trascina per caricare"}</p>
              <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP</p>
              <input type="file" accept="image/*" multiple onChange={uploadImage} className="hidden" disabled={uploading} />
            </label>

            {allImages.length > 0 && (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {allImages.map((url, i) => (
                    <div key={i} onClick={() => set("featured_image", url)}
                      className={`relative group rounded-lg overflow-hidden aspect-square border-2 cursor-pointer transition-all ${url === form.featured_image ? "border-brand-500 shadow-md" : "border-transparent hover:border-gray-300"}`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {url === form.featured_image && (
                        <div className="absolute inset-0 bg-brand-500/10 flex items-end justify-start p-1">
                          <span className="text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded">Cover</span>
                        </div>
                      )}
                      <button onClick={e => { e.stopPropagation(); removeImage(url); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Clicca su un'immagine per impostarla come copertina.</p>
              </>
            )}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide">Pubblicazione</h3>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Pubblicato</Label>
              <Switch checked={form.is_published} onCheckedChange={v => set("is_published", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> In promozione
              </Label>
              <Switch checked={form.is_promoted} onCheckedChange={v => set("is_promoted", v)} />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <Field label="Condizione">
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {["new", "used"].map(c => (
                  <button key={c} onClick={() => set("condition", c)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${form.condition === c ? "bg-brand-600 text-white" : "bg-white text-gray-500 hover:text-gray-800"}`}>
                    {c === "new" ? "Nuovo" : "Usato"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide">Prezzo</h3>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Su richiesta</Label>
              <Switch checked={form.price_on_request} onCheckedChange={v => set("price_on_request", v)} />
            </div>
            {!form.price_on_request && (
              <Field label="Importo (€)">
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
            )}
          </div>

          <div className="space-y-2">
            <button onClick={save} disabled={saving || !form.title || !form.section}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">
              {saving ? "Salvataggio..." : isNew ? "Pubblica annuncio" : "Salva modifiche"}
            </button>
            <Link to="/admin/annunci" className="block">
              <button className="w-full py-3 border border-gray-200 text-gray-500 hover:text-gray-700 bg-white rounded-xl text-sm transition-colors">
                Annulla
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}