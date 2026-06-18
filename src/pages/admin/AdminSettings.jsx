import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Save, Upload, CheckCircle } from "lucide-react";
import HeroSlidesEditor from "@/components/admin/HeroSlidesEditor";

const SETTINGS_SCHEMA = [
  {
    group: "company", label: "Dati Aziendali",
    fields: [
      { key: "company_name", label: "Nome azienda", type: "text" },
      { key: "vat", label: "Partita IVA", type: "text" },
      { key: "phone", label: "Telefono", type: "text" },
      { key: "email", label: "Email", type: "email" },
      { key: "address", label: "Indirizzo completo", type: "text" },
      { key: "orari", label: "Orari di apertura", type: "textarea" },
    ]
  },
  {
    group: "brand", label: "Logo & Brand",
    fields: [
      { key: "logo_url", label: "Logo (carica o incolla URL)", type: "upload_image" },
      { key: "footer_tagline", label: "Tagline footer", type: "text" },
    ]
  },
  {
    group: "social", label: "Social & Web",
    fields: [
      { key: "website", label: "Sito web", type: "url" },
      { key: "instagram", label: "Instagram URL", type: "url" },
      { key: "facebook", label: "Facebook URL", type: "url" },
      { key: "whatsapp", label: "Numero WhatsApp", type: "text" },
    ]
  },
  {
    group: "nav", label: "Menu — Ordine Sezioni",
    fields: [
      { key: "sections_order", label: "Ordine sezioni nel menu (separate da virgola)", type: "text", placeholder: "barche, gommoni, motori, carrelli, usato" },
    ]
  },
  {
    group: "section_images", label: "Homepage — Immagini Sezioni",
    fields: [
      { key: "section_img_barche", label: "Immagine sezione Barche", type: "upload_image" },
      { key: "section_img_gommoni", label: "Immagine sezione Gommoni", type: "upload_image" },
      { key: "section_img_motori", label: "Immagine sezione Motori", type: "upload_image" },
      { key: "section_img_carrelli", label: "Immagine sezione Carrelli", type: "upload_image" },
      { key: "section_img_usato", label: "Immagine sezione Usato", type: "upload_image" },
    ]
  },
  {
    group: "hero", label: "Homepage — Carosello Hero",
    fields: [
      { key: "hero_slides", label: "Slide del carosello", type: "hero_slides" },
    ]
  },
  {
    group: "about", label: "Chi Siamo",
    fields: [
      { key: "about_title", label: "Titolo sezione", type: "text" },
      { key: "about_subtitle", label: "Sottotitolo", type: "text" },
      { key: "about_text", label: "Testo breve (homepage)", type: "textarea" },
      { key: "about_content", label: "Testo completo (HTML consentito)", type: "textarea" },
      { key: "about_feat1", label: "Punto di forza 1", type: "text" },
      { key: "about_feat2", label: "Punto di forza 2", type: "text" },
      { key: "about_feat3", label: "Punto di forza 3", type: "text" },
    ]
  },
  {
    group: "menu", label: "Menu Navigazione (JSON)",
    fields: [
      { key: "menu_barche", label: "Vendita Barche — marchi e modelli", type: "textarea", placeholder: '[{"brand":"4XC HONDA","models":["Open Line","Sundeck Line"]}]' },
      { key: "menu_gommoni", label: "Vendita Gommoni — marchi e modelli", type: "textarea", placeholder: '[{"brand":"ZAR","models":["Classic","Sport Luxury"]}]' },
      { key: "menu_motori", label: "Motori — marchi e modelli", type: "textarea", placeholder: '[{"brand":"HONDA MARINE","models":["Fuoribordo"]}]' },
      { key: "menu_usato", label: "Usato — categorie", type: "textarea", placeholder: '[{"brand":"BARCHE USATE","models":[]},{"brand":"GOMMONI USATI","models":[]}]' },
    ]
  },
];

const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

export default function AdminSettings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    api.entities.SiteSettings.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setValues(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setValues(p => ({ ...p, [key]: val }));

  const uploadFile = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(p => ({ ...p, [key]: true }));
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      set(key, file_url);
    } catch (error) {
      alert(error.message || "Errore durante il caricamento dell'immagine.");
    } finally {
      setUploading(p => ({ ...p, [key]: false }));
      e.target.value = "";
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const existing = await api.entities.SiteSettings.list();
      const existingMap = {};
      existing.forEach(s => { existingMap[s.key] = s.id; });

      for (const [key, value] of Object.entries(values)) {
        if (!value && value !== false) continue;
        if (existingMap[key]) {
          await api.entities.SiteSettings.update(existingMap[key], { value: String(value) });
        } else {
          await api.entities.SiteSettings.create({ key, value: String(value), group: "custom" });
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(error.message || "Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Impostazioni Sito</h1>
        <button
          onClick={saveAll}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm ${saved ? "bg-green-600 hover:bg-green-700" : "bg-brand-600 hover:bg-brand-700"} disabled:opacity-50`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Salvato!" : saving ? "Salvataggio..." : "Salva tutto"}
        </button>
      </div>

      {SETTINGS_SCHEMA.map(section => (
        <div key={section.group + section.label} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-heading font-semibold text-gray-800 text-sm uppercase tracking-wide">{section.label}</h3>
          </div>
          <div className="p-6 space-y-5">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>

                {field.type === "hero_slides" ? (
                  <HeroSlidesEditor
                    value={values[field.key] || ""}
                    onChange={val => set(field.key, val)}
                  />
                ) : field.type === "upload_image" ? (
                  <div className="space-y-2">
                    {values[field.key] && (
                      <div className="relative inline-block">
                        <img
                          src={values[field.key]}
                          alt=""
                          className="h-16 w-auto object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                        />
                        <button
                          onClick={() => set(field.key, "")}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-xs">×</span>
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <label className={`inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 hover:border-brand-400 rounded-lg cursor-pointer text-sm text-gray-500 hover:text-brand-600 transition-all ${uploading[field.key] ? "opacity-50" : ""}`}>
                        <Upload className="w-4 h-4" />
                        {uploading[field.key] ? "Caricamento..." : "Carica immagine"}
                        <input type="file" accept="image/*" className="hidden" onChange={e => uploadFile(e, field.key)} disabled={uploading[field.key]} />
                      </label>
                      <span className="text-xs text-gray-400">oppure</span>
                      <input
                        type="url"
                        value={values[field.key] || ""}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder="Incolla URL..."
                        className={`${inputClass} flex-1`}
                      />
                    </div>
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.key] || ""}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder || ""}
                    rows={field.group === "menu" ? 5 : 3}
                    className={`${inputClass} resize-none`}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    value={values[field.key] || ""}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder || ""}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4">
        <button
          onClick={saveAll}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl shadow-lg transition-colors ${saved ? "bg-green-600 hover:bg-green-700" : "bg-brand-600 hover:bg-brand-700"} text-white disabled:opacity-50`}
        >
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Salvato con successo!" : saving ? "Salvataggio in corso..." : "Salva tutte le impostazioni"}
        </button>
      </div>
    </div>
  );
}