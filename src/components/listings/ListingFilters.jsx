import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ListingFilters({ categories, filters, onChange }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const activeCount = [
    filters.category,
    filters.condition !== "all",
    filters.search,
    filters.promoted,
  ].filter(Boolean).length;

  const reset = () => onChange({ search: "", category: "", condition: "all", promoted: false });

  return (
    <div className="mb-8">
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca barche, gommoni, motori..."
            value={filters.search}
            onChange={e => update("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-brand-300 transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtri
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">{activeCount}</span>
          )}
        </button>
      </div>

      <div className={`${showMobileFilters ? "flex" : "hidden"} lg:flex flex-col lg:flex-row gap-3 flex-wrap items-center`}>
        {/* Condition */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {["all", "new", "used"].map(c => (
            <button
              key={c}
              onClick={() => update("condition", c)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                filters.condition === c
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {c === "all" ? "Tutti" : c === "new" ? "Nuovo" : "Usato"}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => update("category", "")}
            className={`px-3.5 py-2 text-sm rounded-xl border font-medium transition-all shadow-sm ${
              !filters.category
                ? "bg-brand-600 border-brand-600 text-white shadow-brand-200"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            Tutte
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => update("category", filters.category === cat.id ? "" : cat.id)}
              className={`px-3.5 py-2 text-sm rounded-xl border font-medium transition-all shadow-sm ${
                filters.category === cat.id
                  ? "bg-brand-600 border-brand-600 text-white shadow-brand-200"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Promo */}
        <button
          onClick={() => update("promoted", !filters.promoted)}
          className={`px-3.5 py-2 text-sm rounded-xl border font-medium transition-all shadow-sm ${
            filters.promoted
              ? "bg-amber-400 border-amber-400 text-amber-900"
              : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
          }`}
        >
          Solo promozioni
        </button>

        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
            Azzera filtri
          </button>
        )}
      </div>
    </div>
  );
}