import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { api } from "@/api/client";

const EMPTY_SLIDE = { image: "", title: "", subtitle: "", tag: "" };

const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

export default function HeroSlidesEditor({ value, onChange }) {
  const [uploading, setUploading] = useState(null);

  let slides = [];
  try { slides = value ? JSON.parse(value) : []; } catch {}
  if (!Array.isArray(slides)) slides = [];

  const emit = (newSlides) => onChange(JSON.stringify(newSlides));

  const addSlide = () => emit([...slides, { ...EMPTY_SLIDE }]);

  const updateSlide = (i, key, val) => {
    const updated = slides.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    emit(updated);
  };

  const removeSlide = (i) => emit(slides.filter((_, idx) => idx !== i));

  const uploadImage = async (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(i);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      updateSlide(i, "image", file_url);
    } catch (error) {
      alert(error.message || "Errore durante il caricamento dell'immagine.");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {slides.map((slide, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Slide {i + 1}</span>
            <button onClick={() => removeSlide(i)}
              className="text-gray-300 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Immagine</label>
            <div className="flex gap-2 items-start">
              {slide.image && (
                <img src={slide.image} alt="" className="h-14 w-20 object-cover rounded-lg border border-gray-200 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <label className={`inline-flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 hover:border-brand-400 rounded-lg cursor-pointer text-xs text-gray-500 hover:text-brand-600 transition-all ${uploading === i ? "opacity-50" : ""}`}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading === i ? "Caricamento..." : "Carica"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e, i)} disabled={uploading === i} />
                </label>
                <input type="url" value={slide.image} onChange={e => updateSlide(i, "image", e.target.value)}
                  placeholder="oppure incolla URL..." className={inputClass} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Titolo</label>
              <input value={slide.title} onChange={e => updateSlide(i, "title", e.target.value)}
                placeholder="es. La tua barca ideale" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tag (opzionale)</label>
              <input value={slide.tag || ""} onChange={e => updateSlide(i, "tag", e.target.value)}
                placeholder="es. Novità 2025" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sottotitolo</label>
            <input value={slide.subtitle || ""} onChange={e => updateSlide(i, "subtitle", e.target.value)}
              placeholder="Breve descrizione..." className={inputClass} />
          </div>
        </div>
      ))}

      <button onClick={addSlide}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-brand-400 hover:text-brand-600 rounded-xl text-sm text-gray-500 transition-all w-full justify-center">
        <Plus className="w-4 h-4" /> Aggiungi slide
      </button>
    </div>
  );
}