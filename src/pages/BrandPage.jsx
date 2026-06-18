import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import ListingCard from "@/components/listings/ListingCard";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Più recenti", value: "-created_date" },
  { label: "Prezzo crescente", value: "price" },
  { label: "Prezzo decrescente", value: "-price" },
];

export default function BrandPage() {
  const { section, brand: brandSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("-created_date");

  const modelFilter = searchParams.get("model") || "";

  useEffect(() => {
    setLoading(true);
    // Find the brand by slug (name slugified)
    api.entities.Brand.filter({ section, is_active: true }, "sort_order")
      .then(brands => {
        const found = brands.find(b =>
          b.name.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-") === brandSlug ||
          encodeURIComponent(b.name.toLowerCase().replace(/\s+/g, "-")) === brandSlug
        );
        setBrandData(found || null);

        if (found) {
          return api.entities.Listing.filter({ is_published: true, section, brand: found.name }, sort, 200);
        }
        return [];
      })
      .then(data => {
        let results = data;
        if (modelFilter) {
          results = data.filter(l =>
            l.model?.toLowerCase().includes(modelFilter.toLowerCase()) ||
            l.title?.toLowerCase().includes(modelFilter.toLowerCase())
          );
        }
        setListings(results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [section, brandSlug, sort, modelFilter]);

  const brandName = brandData?.name || decodeURIComponent(brandSlug).replace(/-/g, " ").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link to={`/sezione/${section}`} className="hover:text-brand-600 capitalize">{section}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{brandName}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2 capitalize">{section}</p>
            <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-gray-900">{brandName}</h1>
            <p className="text-gray-500 mt-2">
              {modelFilter ? `${brandName} — ${modelFilter}` : `Tutti gli annunci del marchio ${brandName}`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={`/sezione/${section}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Torna a <span className="capitalize">{section}</span>
            </Link>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500"><span className="text-gray-900 font-bold">{listings.length}</span> annunci trovati</p>
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-sm text-gray-600 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Model filters if brand has models */}
        {brandData?.models?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link to={`/sezione/${section}/${brandSlug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!modelFilter ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
              Tutti
            </Link>
            {brandData.models.map(m => (
              <Link key={m} to={`/sezione/${section}/${brandSlug}?model=${encodeURIComponent(m)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${modelFilter === m ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
                {m}
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white overflow-hidden animate-pulse border border-gray-100">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-heading font-semibold text-xl text-gray-400 mb-2">Nessun annuncio trovato</p>
            <p className="text-gray-400 text-sm mb-6">Non ci sono annunci per questo marchio.</p>
            <Link to={`/sezione/${section}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Vedi tutti gli annunci
            </Link>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}