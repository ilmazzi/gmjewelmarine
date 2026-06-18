import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function SidebarFilters({ categories, filters, onChange, totalCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ search: "", category: "", condition: "all", promoted: false, priceMin: "", priceMax: "" });

  const activeCount = [
    filters.search,
    filters.category,
    filters.condition !== "all",
    filters.promoted,
    filters.priceMin,
    filters.priceMax,
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Cerca</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Marca, modello..."
            value={filters.search}
            onChange={e => update("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Condizione</p>
        <div className="space-y-2">
          {[
            { value: "all", label: "Tutti" },
            { value: "new", label: "Nuovo" },
            { value: "used", label: "Usato" },
          ].map(c => (
            <label key={c.value} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => update("condition", c.value)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                  filters.condition === c.value ? "border-brand-600 bg-brand-600" : "border-gray-300 group-hover:border-brand-400"
                }`}
              >
                {filters.condition === c.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Categoria</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => update("category", "")}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  !filters.category ? "border-brand-600 bg-brand-600" : "border-gray-300 group-hover:border-brand-400"
                }`}
              >
                {!filters.category && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-gray-700">Tutte le categorie</span>
            </label>
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => update("category", filters.category === cat.id ? "" : cat.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    filters.category === cat.id ? "border-brand-600 bg-brand-600" : "border-gray-300 group-hover:border-brand-400"
                  }`}
                >
                  {filters.category === cat.id && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Prezzo (€)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={e => update("priceMin", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ""}
            onChange={e => update("priceMax", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Promo */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div
          onClick={() => update("promoted", !filters.promoted)}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
            filters.promoted ? "border-amber-500 bg-amber-500" : "border-gray-300 group-hover:border-amber-400"
          }`}
        >
          {filters.promoted && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-sm text-gray-700">Solo promozioni</span>
      </label>

      {/* Reset */}
      {activeCount > 0 && (
        <button onClick={reset} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors font-medium">
          <X className="w-3.5 h-3.5" />
          Azzera filtri ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtri
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">{activeCount}</span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-gray-900">Filtri</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-gray-900">Filtri</h3>
            {activeCount > 0 && (
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{activeCount}</span>
            )}
          </div>
          <FilterPanel />
        </div>
      </aside>
    </>
  );
}