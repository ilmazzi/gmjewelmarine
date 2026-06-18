import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import ListingCard from "@/components/listings/ListingCard";
import { ChevronDown, SlidersHorizontal, X, Search } from "lucide-react";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Più recenti", value: "-created_date" },
  { label: "Prezzo crescente", value: "price" },
  { label: "Prezzo decrescente", value: "-price" },
];

export default function SectionPage() {
  const { section } = useParams();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [sectionBrands, setSectionBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("-created_date");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);

  // Section label comes from Brand records
  const [sectionLabel, setSectionLabel] = useState(section);

  useEffect(() => {
    const urlBrand = searchParams.get("brand") || "";
    const urlModel = searchParams.get("model") || "";
    setBrandFilter(urlBrand);
    setSearch(urlModel);
  }, [searchParams.toString()]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.entities.Listing.filter({ is_published: true, section }, sort, 300),
      api.entities.Brand.filter({ section, is_active: true }, "sort_order"),
    ]).then(([listData, brandData]) => {
      setListings(listData);
      setSectionBrands(brandData);
      // Use section from first brand to get label (or fallback)
      if (brandData.length > 0) setSectionLabel(section);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [section, sort]);

  const filtered = listings.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.title?.toLowerCase().includes(q) && !l.brand?.toLowerCase().includes(q) && !l.model?.toLowerCase().includes(q)) return false;
    }
    if (brandFilter && l.brand?.toLowerCase() !== brandFilter.toLowerCase()) return false;
    if (conditionFilter !== "all" && l.condition !== conditionFilter) return false;
    if (priceMin && l.price < Number(priceMin)) return false;
    if (priceMax && l.price > Number(priceMax)) return false;
    return true;
  });

  const activeFilterCount = [search, brandFilter, conditionFilter !== "all", priceMin, priceMax].filter(Boolean).length;

  const resetFilters = () => { setSearch(""); setBrandFilter(""); setConditionFilter("all"); setPriceMin(""); setPriceMax(""); };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Cerca</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Modello, parola chiave..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
      </div>

      {sectionBrands.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Marchio</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer" onClick={() => setBrandFilter("")}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!brandFilter ? "border-brand-600 bg-brand-600" : "border-gray-300"}`}>
                {!brandFilter && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">Tutti i marchi</span>
            </label>
            {sectionBrands.map(b => (
              <label key={b.id} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setBrandFilter(brandFilter === b.name ? "" : b.name)}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${brandFilter === b.name ? "border-brand-600 bg-brand-600" : "border-gray-300"}`}>
                  {brandFilter === b.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-gray-700">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Condizione</p>
        <div className="space-y-1.5">
          {[{ value: "all", label: "Tutti" }, { value: "new", label: "Nuovo" }, { value: "used", label: "Usato" }].map(c => (
            <label key={c.value} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setConditionFilter(c.value)}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${conditionFilter === c.value ? "border-brand-600 bg-brand-600" : "border-gray-300"}`}>
                {conditionFilter === c.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Prezzo (€)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
          <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium">
          <X className="w-3.5 h-3.5" /> Azzera filtri ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium capitalize">{sectionLabel}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-gray-900 capitalize">{sectionLabel}</h1>
            <p className="text-gray-500 mt-2">{listings.length} annunci disponibili</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setMobileFilters(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filtri
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>}
          </button>
        </div>

        {mobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-lg">Filtri</h3>
                <button onClick={() => setMobileFilters(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-gray-900">Filtri</h3>
                {activeFilterCount > 0 && <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
              </div>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500"><span className="text-gray-900 font-bold">{filtered.length}</span> annunci</p>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-sm text-gray-600 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white overflow-hidden animate-pulse border border-gray-100">
                    <div className="aspect-[4/3] bg-gray-100" />
                    <div className="p-4 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-heading font-semibold text-xl text-gray-400 mb-2">Nessun annuncio trovato</p>
                <p className="text-gray-400 text-sm">Prova a modificare i filtri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((listing, i) => (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}>
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}