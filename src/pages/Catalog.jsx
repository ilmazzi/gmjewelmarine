import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import ListingCard from "@/components/listings/ListingCard";
import SidebarFilters from "@/components/listings/SidebarFilters";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Più recenti", value: "-created_date" },
  { label: "Prezzo crescente", value: "price" },
  { label: "Prezzo decrescente", value: "-price" },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("-created_date");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    condition: "all",
    promoted: false,
    priceMin: "",
    priceMax: "",
  });

  useEffect(() => {
    setFilters(f => ({
      ...f,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      condition: searchParams.get("condition") || "all",
      promoted: searchParams.get("promoted") === "true",
    }));
  }, [searchParams.toString()]);

  useEffect(() => {
    api.entities.Category.filter({ is_active: true }, "sort_order").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.entities.Listing.filter({ is_published: true }, sort, 200)
      .then(setListings).catch(() => {}).finally(() => setLoading(false));
  }, [sort]);

  const filtered = listings.filter(l => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!l.title?.toLowerCase().includes(q) && !l.brand?.toLowerCase().includes(q) && !l.model?.toLowerCase().includes(q) && !l.short_description?.toLowerCase().includes(q)) return false;
    }
    if (filters.category && l.category_id !== filters.category) return false;
    if (filters.condition !== "all" && l.condition !== filters.condition) return false;
    if (filters.promoted && !l.is_promoted) return false;
    if (filters.priceMin && l.price < Number(filters.priceMin)) return false;
    if (filters.priceMax && l.price > Number(filters.priceMax)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Catalogo</p>
            <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-gray-900">Tutti gli annunci</h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filters */}
        <div className="lg:hidden">
          <SidebarFilters categories={categories} filters={filters} onChange={setFilters} />
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <SidebarFilters categories={categories} filters={filters} onChange={setFilters} />

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-bold">{filtered.length}</span> annunci trovati
              </p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-sm text-gray-600 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white overflow-hidden animate-pulse border border-gray-100">
                    <div className="aspect-[4/3] bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-heading font-semibold text-xl text-gray-400 mb-2">Nessun annuncio trovato</p>
                <p className="text-gray-400 text-sm">Prova a modificare i filtri di ricerca.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filtered.map((listing, i) => (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}>
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}